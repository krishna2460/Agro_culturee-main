import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <section className="hero-section page-shell animate-fade-in">
      <div className="hero-copy">
        <span className="eyebrow">AgroCulture marketplace</span>
        <h1>Fresh market, blogs, and orders in one place.</h1>
        <p>Explore products, publish posts, manage your cart, and keep your profile up to date.</p>

        <div className="hero-actions">
          <Link to="/market" className="btn btn-primary">Browse Market</Link>
          <Link to="/blog" className="btn btn-outline">Read Blogs</Link>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <strong>Products</strong>
            <span>Market listings and product details</span>
          </div>
          <div className="stat-card">
            <strong>Blogs</strong>
            <span>Write, like, and comment on posts</span>
          </div>
          <div className="stat-card">
            <strong>Orders</strong>
            <span>Cart checkout and order history</span>
          </div>
        </div>
      </div>

      <div className="hero-panel">
        <div className="hero-panel-card accent-panel">
          <h2>What is covered now</h2>
          <ul>
            <li>Auth modal for login and registration</li>
            <li>Product browsing, reviews, and cart actions</li>
            <li>Blog feed, detail view, likes, and comments</li>
            <li>Profile editing, uploads, and buyer checkout</li>
          </ul>
        </div>
      </div>
    </section>
  );
}