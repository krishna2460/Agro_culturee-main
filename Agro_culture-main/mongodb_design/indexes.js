// MongoDB Database Setup and Index Creation Script for Agroculture
// Usage: mongosh agroculture indexes.js

print("Initializing Agroculture MongoDB Collections and Indexes...");

// Helper to check and create collection with schema validator
function createCollectionWithValidator(name, schemaPath) {
    db.getCollection(name).drop(); // Reset collection for setup
    
    // We inline the JSON schemas to make the setup script self-contained and run-ready
    var schemas = {
        users: {
            bsonType: "object",
            required: ["role", "username", "email", "password", "mobile", "status", "profile"],
            properties: {
                _id: { bsonType: "objectId" },
                role: { enum: ["farmer", "buyer"] },
                username: { bsonType: "string" },
                email: { bsonType: "string", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" },
                password: { bsonType: "string" },
                mobile: { bsonType: "string" },
                status: {
                    bsonType: "object",
                    required: ["active", "hash"],
                    properties: {
                        active: { bsonType: "bool" },
                        hash: { bsonType: "string" }
                    }
                },
                profile: {
                    bsonType: "object",
                    required: ["name", "address"],
                    properties: {
                        name: { bsonType: "string" },
                        address: { bsonType: "string" },
                        rating: { bsonType: ["int", "double"], minimum: 0, maximum: 5 },
                        picExt: { bsonType: "string" },
                        picStatus: { bsonType: "int" }
                    }
                },
                createdAt: { bsonType: "date" }
            }
        },
        products: {
            bsonType: "object",
            required: ["farmerId", "name", "category", "price", "image", "reviews"],
            properties: {
                _id: { bsonType: "objectId" },
                farmerId: { bsonType: "objectId" },
                name: { bsonType: "string" },
                category: { bsonType: "string" },
                info: { bsonType: "string" },
                price: { bsonType: ["int", "double", "decimal"], minimum: 0 },
                image: { bsonType: "string" },
                picStatus: { bsonType: "int" },
                reviews: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        required: ["_id", "name", "rating", "comment"],
                        properties: {
                            _id: { bsonType: "objectId" },
                            name: { bsonType: "string" },
                            rating: { bsonType: "int", minimum: 1, maximum: 5 },
                            comment: { bsonType: "string" },
                            createdAt: { bsonType: "date" }
                        }
                    }
                }
            }
        },
        blogs: {
            bsonType: "object",
            required: ["authorId", "authorUsername", "title", "content", "likes", "comments", "createdAt"],
            properties: {
                _id: { bsonType: "objectId" },
                authorId: { bsonType: "objectId" },
                authorUsername: { bsonType: "string" },
                title: { bsonType: "string" },
                content: { bsonType: "string" },
                likes: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        required: ["userId", "username"],
                        properties: {
                            userId: { bsonType: "objectId" },
                            username: { bsonType: "string" }
                        }
                    }
                },
                comments: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        required: ["_id", "username", "profilePic", "comment", "createdAt"],
                        properties: {
                            _id: { bsonType: "objectId" },
                            username: { bsonType: "string" },
                            profilePic: { bsonType: "string" },
                            comment: { bsonType: "string" },
                            createdAt: { bsonType: "date" }
                        }
                    }
                },
                createdAt: { bsonType: "date" }
            }
        },
        carts: {
            bsonType: "object",
            required: ["buyerId", "products"],
            properties: {
                _id: { bsonType: "objectId" },
                buyerId: { bsonType: "objectId" },
                products: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        required: ["productId", "name", "price", "quantity", "addedAt"],
                        properties: {
                            productId: { bsonType: "objectId" },
                            name: { bsonType: "string" },
                            price: { bsonType: ["int", "double", "decimal"], minimum: 0 },
                            quantity: { bsonType: "int", minimum: 1 },
                            addedAt: { bsonType: "date" }
                        }
                    }
                }
            }
        },
        orders: {
            bsonType: "object",
            required: ["buyerId", "shippingAddress", "products", "status", "createdAt"],
            properties: {
                _id: { bsonType: "objectId" },
                buyerId: { bsonType: "objectId" },
                shippingAddress: {
                    bsonType: "object",
                    required: ["name", "addr", "city", "pincode", "mobile", "email"],
                    properties: {
                        name: { bsonType: "string" },
                        addr: { bsonType: "string" },
                        city: { bsonType: "string" },
                        pincode: { bsonType: "string" },
                        mobile: { bsonType: "string" },
                        email: { bsonType: "string", pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$" }
                    }
                },
                products: {
                    bsonType: "array",
                    items: {
                        bsonType: "object",
                        required: ["productId", "name", "price", "category", "quantity"],
                        properties: {
                            productId: { bsonType: "objectId" },
                            name: { bsonType: "string" },
                            price: { bsonType: ["int", "double", "decimal"], minimum: 0 },
                            category: { bsonType: "string" },
                            quantity: { bsonType: "int", minimum: 1 }
                        }
                    }
                },
                status: { enum: ["pending", "processing", "shipped", "delivered", "cancelled"] },
                createdAt: { bsonType: "date" }
            }
        }
    };

    db.createCollection(name, {
        validator: { $jsonSchema: schemas[name] }
    });
    print("Created collection '" + name + "' with JSON Schema validation.");
}

// 1. Create collections
createCollectionWithValidator("users");
createCollectionWithValidator("products");
createCollectionWithValidator("blogs");
createCollectionWithValidator("carts");
createCollectionWithValidator("orders");

// 2. Create Indexes

print("\nCreating indexes...");

// users Indexes
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
print("Created unique indexes on users(username, email) and single index on users(role).");

// products Indexes
db.products.createIndex({ category: 1 });
db.products.createIndex({ farmerId: 1 });
db.products.createIndex({ price: 1 });
print("Created indexes on products(category, farmerId, price).");

// blogs Indexes
db.blogs.createIndex({ authorId: 1 });
db.blogs.createIndex({ createdAt: -1 });
print("Created indexes on blogs(authorId, createdAt DESC).");

// carts Indexes
db.carts.createIndex({ buyerId: 1 }, { unique: true });
print("Created unique index on carts(buyerId).");

// orders Indexes
db.orders.createIndex({ buyerId: 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ createdAt: -1 });
print("Created indexes on orders(buyerId, status, createdAt DESC).");

print("\nDatabase setup completed successfully!");
