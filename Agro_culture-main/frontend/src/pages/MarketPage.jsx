import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import ProductCard from '../components/ProductCard';

const categories = ['All', 'Vegetables', 'Fruits', 'Grains', 'Dairy', 'Organic', 'Other'];

export default function MarketPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/products');
        setProducts(response.data);
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch = !term
        || product.name?.toLowerCase().includes(term)
        || product.category?.toLowerCase().includes(term)
        || product.info?.toLowerCase().includes(term);
      const matchesCategory = category === 'All' || product.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  return (
    <section className="page-shell animate-fade-in">
      <div className="page-header">
        <div>
          <span className="eyebrow">Market</span>
          <h1>Browse products</h1>
          <p>Search listings, filter by category, and open the full product page.</p>
        </div>
        <Link to="/upload-product" className="btn btn-secondary">Upload Product</Link>
      </div>

      <div className="filter-bar">
        <input
          className="form-control"
          placeholder="Search products, categories, or descriptions"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <select className="form-control" value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </div>

      {loading && <div className="notice-card">Loading market listings...</div>}
      {error && <div className="notice-card error">{error}</div>}

      {!loading && !error && (
        <>
          <div className="section-meta">Showing {filteredProducts.length} product(s)</div>
          <div className="grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
          {filteredProducts.length === 0 && <div className="notice-card">No products matched your search.</div>}
        </>
      )}
    </section>
  );
}