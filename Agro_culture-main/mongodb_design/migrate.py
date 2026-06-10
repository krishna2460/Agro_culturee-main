import re
import json
import hashlib
import os

# Helper to generate deterministic ObjectIds based on table name and source integer ID
def make_object_id(table_name, original_id):
    if original_id is None:
        return None
    val = f"{table_name}-{original_id}"
    hash_hex = hashlib.md5(val.encode('utf-8')).hexdigest()
    return hash_hex[:24]

def split_sql_statements(sql_content):
    # Splits the sql file by statements ending with semicolon, ignoring semicolons within quotes/backticks
    statements = []
    current = []
    in_string = False
    quote_char = None
    escaped = False
    
    i = 0
    n = len(sql_content)
    while i < n:
        char = sql_content[i]
        current.append(char)
        
        if escaped:
            escaped = False
            i += 1
            continue
            
        if char == '\\':
            escaped = True
            i += 1
            continue
            
        if in_string:
            if char == quote_char:
                in_string = False
                quote_char = None
        else:
            if char in ("'", '"', '`'):
                in_string = True
                quote_char = char
            elif char == ';':
                statements.append("".join(current))
                current = []
        i += 1
        
    if current:
        statements.append("".join(current))
        
    return statements

def parse_insert_statement(stmt):
    # Splits insertion command prefix from values portion
    stmt = stmt.strip()
    if not stmt.lower().startswith('insert'):
        return None
        
    i = 0
    n = len(stmt)
    in_string = False
    quote_char = None
    escaped = False
    
    values_idx = -1
    while i < n:
        char = stmt[i]
        if escaped:
            escaped = False
            i += 1
            continue
        if char == '\\':
            escaped = True
            i += 1
            continue
        if in_string:
            if char == quote_char:
                in_string = False
                quote_char = None
        else:
            if char in ("'", '"', '`'):
                in_string = True
                quote_char = char
            elif char.isalpha():
                if stmt[i:i+6].lower() == 'values':
                    if i + 6 < n and (stmt[i+6].isspace() or stmt[i+6] == '('):
                        values_idx = i
                        break
        i += 1
        
    if values_idx == -1:
        return None
        
    prefix = stmt[:values_idx].strip()
    values_part = stmt[values_idx + 6:].strip()
    if values_part.endswith(';'):
        values_part = values_part[:-1].strip()
        
    match = re.search(r'insert\s+into\s+`?(\w+)`?', prefix, re.IGNORECASE)
    if not match:
        return None
    table_name = match.group(1).lower()
    
    return table_name, values_part

def parse_sql_values(values_str):
    # Lexer to parse SQL multi-row insert statements properly handling strings, escaped quotes, and newlines
    rows = []
    i = 0
    n = len(values_str)
    
    while i < n:
        # Find start of a tuple
        while i < n and values_str[i] != '(':
            i += 1
        if i >= n:
            break
        i += 1  # Skip '('
        
        row = []
        current_val = []
        in_string = False
        quote_char = None
        escaped = False
        
        while i < n:
            char = values_str[i]
            if escaped:
                if char == 'r':
                    current_val.append('\r')
                elif char == 'n':
                    current_val.append('\n')
                elif char == 't':
                    current_val.append('\t')
                else:
                    current_val.append(char)
                escaped = False
                i += 1
                continue
                
            if char == '\\':
                escaped = True
                i += 1
                continue
                
            if in_string:
                if char == quote_char:
                    # Check for escaped quote (SQL uses '' inside Single Quotes)
                    if i + 1 < n and values_str[i+1] == quote_char:
                        current_val.append(quote_char)
                        i += 2
                        continue
                    else:
                        in_string = False
                        quote_char = None
                else:
                    current_val.append(char)
            else:
                if char in ("'", '"'):
                    in_string = True
                    quote_char = char
                elif char == ',':
                    row.append("".join(current_val))
                    current_val = []
                elif char == ')':
                    row.append("".join(current_val))
                    rows.append(row)
                    break
                else:
                    current_val.append(char)
            i += 1
        i += 1
        
    # Standardize values
    processed_rows = []
    for r in rows:
        proc_row = []
        for val in r:
            val_clean = val.strip()
            # Remove start/end single quotes if they weren't stripped
            if val_clean.startswith("'") and val_clean.endswith("'"):
                val_clean = val_clean[1:-1]
            elif val_clean.startswith('"') and val_clean.endswith('"'):
                val_clean = val_clean[1:-1]
                
            if val_clean.lower() == 'null':
                proc_row.append(None)
            else:
                # Try parsing as numbers
                try:
                    if '.' in val_clean:
                        proc_row.append(float(val_clean))
                    else:
                        proc_row.append(int(val_clean))
                except ValueError:
                    proc_row.append(val_clean)
        processed_rows.append(proc_row)
    return processed_rows

def clean_sql(content):
    # Remove single line comments and block comments
    content = re.sub(r'--.*?\n', '', content)
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    return content

def extract_inserts(sql_content):
    statements = split_sql_statements(sql_content)
    table_data = {}
    for stmt in statements:
        res = parse_insert_statement(stmt)
        if res:
            table_name, values_part = res
            rows = parse_sql_values(values_part)
            if table_name not in table_data:
                table_data[table_name] = []
            table_data[table_name].extend(rows)
    return table_data

def convert_mysql_datetime(dt_str):
    if not dt_str:
        return None
    dt_str = dt_str.strip()
    iso_str = dt_str.replace(' ', 'T') + '.000Z'
    return {"$date": iso_str}

def migrate():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    sql_path = os.path.join(os.path.dirname(script_dir), 'agroculture.sql')
    out_dir = os.path.join(script_dir, 'samples')
    
    os.makedirs(out_dir, exist_ok=True)
    
    with open(sql_path, 'r', encoding='utf-8', errors='ignore') as f:
        sql_content = f.read()
        
    sql_content = clean_sql(sql_content)
    table_data = extract_inserts(sql_content)
    
    farmers = table_data.get('farmer', [])
    buyers = table_data.get('buyer', [])
    fproducts = table_data.get('fproduct', [])
    mycart = table_data.get('mycart', [])
    transactions = table_data.get('transaction', [])
    reviews = table_data.get('review', [])
    blogdata = table_data.get('blogdata', [])
    blogfeedback = table_data.get('blogfeedback', [])
    likedata = table_data.get('likedata', [])
    
    print(f"Loaded records count:")
    print(f"  Farmers: {len(farmers)}")
    print(f"  Buyers: {len(buyers)}")
    print(f"  Products: {len(fproducts)}")
    print(f"  Cart entries: {len(mycart)}")
    print(f"  Transactions: {len(transactions)}")
    print(f"  Reviews: {len(reviews)}")
    print(f"  Blogs: {len(blogdata)}")
    print(f"  Blog Feedbacks: {len(blogfeedback)}")
    print(f"  Blog Likes: {len(likedata)}")

    # 1. Transform Users (Merge Farmers and Buyers)
    users_list = []
    username_to_id = {}
    
    for row in farmers:
        if len(row) < 12:
            continue
        fid, fname, fusername, fpassword, fhash, femail, fmobile, faddress, factive, frating, picExt, picStatus = row
        uid = make_object_id('users', f"farmer-{fid}")
        
        user_doc = {
            "_id": {"$oid": uid},
            "role": "farmer",
            "username": fusername,
            "email": femail,
            "password": fpassword,
            "mobile": str(fmobile),
            "status": {
                "active": bool(factive),
                "hash": fhash
            },
            "profile": {
                "name": fname,
                "address": faddress,
                "rating": float(frating),
                "picExt": picExt,
                "picStatus": int(picStatus)
            },
            "createdAt": convert_mysql_datetime("2018-02-25 00:00:00")
        }
        users_list.append(user_doc)
        username_to_id[fusername] = uid
        
    for row in buyers:
        if len(row) < 9:
            continue
        bid, bname, busername, bpassword, bhash, bemail, bmobile, baddress, bactive = row
        uid = make_object_id('users', f"buyer-{bid}")
        
        user_doc = {
            "_id": {"$oid": uid},
            "role": "buyer",
            "username": busername,
            "email": bemail,
            "password": bpassword,
            "mobile": str(bmobile),
            "status": {
                "active": bool(bactive),
                "hash": bhash
            },
            "profile": {
                "name": bname,
                "address": baddress
            },
            "createdAt": convert_mysql_datetime("2018-02-25 00:00:00")
        }
        users_list.append(user_doc)
        username_to_id[busername] = uid

    def get_user_oid(bid_or_fid, role_preference='buyer'):
        target_uid = make_object_id('users', f"{role_preference}-{bid_or_fid}")
        for u in users_list:
            if u["_id"]["$oid"] == target_uid:
                return target_uid
        alt_role = 'farmer' if role_preference == 'buyer' else 'buyer'
        alt_uid = make_object_id('users', f"{alt_role}-{bid_or_fid}")
        for u in users_list:
            if u["_id"]["$oid"] == alt_uid:
                return alt_uid
        fallback_uid = make_object_id('users', f"buyer-{bid_or_fid}")
        fallback_doc = {
            "_id": {"$oid": fallback_uid},
            "role": "buyer",
            "username": f"buyer_{bid_or_fid}",
            "email": f"buyer_{bid_or_fid}@example.com",
            "password": "hashed_password",
            "mobile": "0000000000",
            "status": {"active": True, "hash": "activation_hash"},
            "profile": {
                "name": f"Migrated Buyer {bid_or_fid}",
                "address": "Migrated Address"
            },
            "createdAt": convert_mysql_datetime("2018-02-25 00:00:00")
        }
        users_list.append(fallback_doc)
        return fallback_uid

    # 2. Transform Products (with Reviews embedded)
    products_list = []
    pid_to_doc = {}
    
    reviews_by_pid = {}
    for r_row in reviews:
        if len(r_row) < 4:
            continue
        r_pid, r_name, r_rating, r_comment = r_row
        review_doc = {
            "_id": {"$oid": make_object_id('reviews', f"{r_pid}-{r_name}-{r_rating}")[:24]},
            "name": r_name,
            "rating": int(r_rating),
            "comment": r_comment,
            "createdAt": convert_mysql_datetime("2018-02-25 12:00:00")
        }
        if r_pid not in reviews_by_pid:
            reviews_by_pid[r_pid] = []
        reviews_by_pid[r_pid].append(review_doc)

    for row in fproducts:
        if len(row) < 8:
            continue
        fid, pid, product, pcat, pinfo, price, pimage, picStatus = row
        p_oid = make_object_id('products', pid)
        farmer_oid = get_user_oid(fid, 'farmer')
        
        prod_doc = {
            "_id": {"$oid": p_oid},
            "farmerId": {"$oid": farmer_oid},
            "name": product,
            "category": pcat,
            "info": pinfo,
            "price": float(price),
            "image": pimage,
            "picStatus": int(picStatus),
            "reviews": reviews_by_pid.get(pid, [])
        }
        products_list.append(prod_doc)
        pid_to_doc[pid] = prod_doc

    # 3. Transform Blogs (with Comments & Likes embedded)
    blogs_list = []
    
    comments_by_blog = {}
    for c_row in blogfeedback:
        if len(c_row) < 5:
            continue
        c_blogId, c_comment, c_commentUser, c_commentPic, c_commentTime = c_row
        comment_oid = make_object_id('comments', f"{c_blogId}-{c_commentUser}-{len(comments_by_blog.get(c_blogId, []))}")
        comment_doc = {
            "_id": {"$oid": comment_oid},
            "username": c_commentUser,
            "profilePic": c_commentPic,
            "comment": c_comment,
            "createdAt": convert_mysql_datetime(c_commentTime)
        }
        if c_blogId not in comments_by_blog:
            comments_by_blog[c_blogId] = []
        comments_by_blog[c_blogId].append(comment_doc)
        
    likes_by_blog = {}
    for l_row in likedata:
        if len(l_row) < 2:
            continue
        l_blogId, l_blogUserId = l_row
        l_user_oid = get_user_oid(l_blogUserId, 'farmer')
        l_username = "Unknown"
        for u in users_list:
            if u["_id"]["$oid"] == l_user_oid:
                l_username = u["username"]
                break
        
        like_entry = {
            "userId": {"$oid": l_user_oid},
            "username": l_username
        }
        if l_blogId not in likes_by_blog:
            likes_by_blog[l_blogId] = []
        likes_by_blog[l_blogId].append(like_entry)

    for row in blogdata:
        if len(row) < 6:
            continue
        blogId, blogUser, blogTitle, blogContent, blogTime, likes_count = row
        blog_oid = make_object_id('blogs', blogId)
        
        author_oid = username_to_id.get(blogUser)
        if not author_oid:
            author_oid = get_user_oid(999, 'farmer')
            
        blog_doc = {
            "_id": {"$oid": blog_oid},
            "authorId": {"$oid": author_oid},
            "authorUsername": blogUser,
            "title": blogTitle,
            "content": blogContent,
            "likes": likes_by_blog.get(blogId, []),
            "comments": comments_by_blog.get(blogId, []),
            "createdAt": convert_mysql_datetime(blogTime)
        }
        blogs_list.append(blog_doc)

    # 4. Transform Carts
    carts_by_buyer = {}
    for row in mycart:
        if len(row) < 2:
            continue
        bid, pid = row
        buyer_oid = get_user_oid(bid, 'buyer')
        
        prod_name = "Unknown Product"
        prod_price = 0.0
        p_doc = pid_to_doc.get(pid)
        if p_doc:
            prod_name = p_doc["name"]
            prod_price = p_doc["price"]
            
        cart_item = {
            "productId": {"$oid": make_object_id('products', pid)},
            "name": prod_name,
            "price": prod_price,
            "quantity": 1,
            "addedAt": convert_mysql_datetime("2018-02-25 12:00:00")
        }
        if buyer_oid not in carts_by_buyer:
            carts_by_buyer[buyer_oid] = []
        carts_by_buyer[buyer_oid].append(cart_item)
        
    carts_list = []
    for buyer_oid, items in carts_by_buyer.items():
        cart_doc = {
            "_id": {"$oid": make_object_id('carts', buyer_oid)},
            "buyerId": {"$oid": buyer_oid},
            "products": items
        }
        carts_list.append(cart_doc)

    # 5. Transform Orders
    orders_list = []
    for row in transactions:
        if len(row) < 9:
            continue
        tid, bid, pid, name, city, mobile, email, pincode, addr = row
        order_oid = make_object_id('orders', tid)
        buyer_oid = get_user_oid(bid, 'buyer')
        
        prod_name = "Unknown Product"
        prod_price = 0.0
        prod_cat = "Unknown"
        p_doc = pid_to_doc.get(pid)
        if p_doc:
            prod_name = p_doc["name"]
            prod_price = p_doc["price"]
            prod_cat = p_doc["category"]
            
        order_doc = {
            "_id": {"$oid": order_oid},
            "buyerId": {"$oid": buyer_oid},
            "shippingAddress": {
                "name": name,
                "addr": addr,
                "city": city,
                "pincode": str(pincode),
                "mobile": str(mobile),
                "email": email
            },
            "products": [
                {
                    "productId": {"$oid": make_object_id('products', pid)},
                    "name": prod_name,
                    "price": prod_price,
                    "category": prod_cat,
                    "quantity": 1
                }
            ],
            "status": "delivered",
            "createdAt": convert_mysql_datetime("2018-02-25 14:00:00")
        }
        orders_list.append(order_doc)

    # Save to files
    def save_json(data, filename):
        path = os.path.join(out_dir, filename)
        with open(path, 'w', encoding='utf-8') as out_f:
            json.dump(data, out_f, indent=2)
        print(f"Saved {len(data)} documents to {filename}")

    save_json(users_list, 'users.json')
    save_json(products_list, 'products.json')
    save_json(blogs_list, 'blogs.json')
    save_json(carts_list, 'carts.json')
    save_json(orders_list, 'orders.json')
    print("Migration completed successfully!")

if __name__ == '__main__':
    migrate()
