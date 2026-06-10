import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  // Original PHP saved images to "images/productImages/..."
  // If there's an image, we can try to load it. For the new Node architecture, we fallback cleanly.
  // We can display the product image. Let's build a nice UI.
  const imageUrl = product.image && product.image !== 'blank.png'
    ? `http://localhost:5000/uploads/${product.image}`
    : 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400'; // Default farm crop photo

  return (
    <div className="card animate-fade-in">
      <div className="card-img-container">
        <span className="card-tag">{product.category}</span>
        <img
          src={imageUrl}
          alt={product.name}
          className="card-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=400';
          }}
        />
      </div>

      <div className="card-body">
        <h3 className="card-title">{product.name}</h3>
        <p className="card-desc" dangerouslySetInnerHTML={{ __html: product.info || 'Fresh farm produce listed directly by the producer.' }} />
        
        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Seller: 🌾 <strong>{product.farmerId?.profile?.name || product.farmerId?.username || 'Local Farmer'}</strong>
        </div>

        <div className="card-footer">
          <div className="card-price">₹{product.price} /-</div>
          <Link to={`/products/${product._id}`} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
