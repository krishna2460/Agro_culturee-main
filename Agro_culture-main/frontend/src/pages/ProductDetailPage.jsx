import { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { API_BASE_URL } from '../lib/api';
import { AuthContext } from '../context/AuthContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [reviewForm, setReviewForm] = useState({ rating: '5', comment: '' });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/products/${id}`);
        setProduct(response.data);
      } catch (fetchError) {
        setMessage(fetchError.response?.data?.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!token || user?.role !== 'buyer') {
      navigate('/');
      return;
    }

    try {
      await api.post('/api/cart', { productId: id, quantity: 1 });
      navigate('/cart');
    } catch (addError) {
      setMessage(addError.response?.data?.message || 'Failed to add product to cart');
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();

    if (!token) {
      setMessage('Please log in to write a review.');
      return;
    }

    try {
      await api.post(`/api/products/${id}/reviews`, reviewForm);
      setReviewForm({ rating: '5', comment: '' });
      const response = await api.get(`/api/products/${id}`);
      setProduct(response.data);
      setMessage('Review submitted successfully.');
    } catch (submitError) {
      setMessage(submitError.response?.data?.message || 'Failed to submit review');
    }
  };

  if (loading) {
    return <section className="page-shell"><div className="notice-card">Loading product details...</div></section>;
  }

  if (!product) {
    return <section className="page-shell"><div className="notice-card error">{message || 'Product not found'}</div></section>;
  }

  const imageUrl = product.image && product.image !== 'blank.png'
    ? `${API_BASE_URL}/uploads/${product.image}`
    : 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=900';

  return (
    <section className="page-shell animate-fade-in detail-layout">
      <div className="detail-hero card">
        <div className="card-img-container detail-image-wrap">
          <img
            src={imageUrl}
            alt={product.name}
            className="card-img detail-image"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&q=80&w=900';
            }}
          />
        </div>

        <div className="card-body detail-copy">
          <span className="eyebrow">{product.category}</span>
          <h1>{product.name}</h1>
          <p className="detail-text">{product.info || 'Fresh farm produce listed directly by the producer.'}</p>
          <div className="detail-meta">
            <span>Seller: {product.farmerId?.profile?.name || product.farmerId?.username || 'Local Farmer'}</span>
            <span>Price: ₹{product.price}</span>
          </div>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary" onClick={handleAddToCart}>Add to Cart</button>
            <Link to="/cart" className="btn btn-outline">Go to Cart</Link>
          </div>
          {message && <div className="notice-card">{message}</div>}
        </div>
      </div>

      <div className="content-grid">
        <div className="card content-panel">
          <div className="card-body">
            <h2>Reviews</h2>
            <div className="stack">
              {product.reviews?.length ? product.reviews.map((review) => (
                <article key={`${review._id || review.createdAt}-${review.name}`} className="mini-card">
                  <strong>{review.name}</strong>
                  <span>Rating: {review.rating}/5</span>
                  <p>{review.comment}</p>
                </article>
              )) : <div className="notice-card">No reviews yet.</div>}
            </div>
          </div>
        </div>

        <div className="card content-panel">
          <div className="card-body">
            <h2>Write a review</h2>
            <form className="stack" onSubmit={handleReviewSubmit}>
              <div className="form-group">
                <label className="form-label">Rating</label>
                <select
                  className="form-control"
                  value={reviewForm.rating}
                  onChange={(event) => setReviewForm({ ...reviewForm, rating: event.target.value })}
                >
                  {['5', '4', '3', '2', '1'].map((rating) => (
                    <option key={rating} value={rating}>{rating}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Comment</label>
                <textarea
                  className="form-control"
                  rows="5"
                  value={reviewForm.comment}
                  onChange={(event) => setReviewForm({ ...reviewForm, comment: event.target.value })}
                />
              </div>
              <button type="submit" className="btn btn-secondary">Submit Review</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}