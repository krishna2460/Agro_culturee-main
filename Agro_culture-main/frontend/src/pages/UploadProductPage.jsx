import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';

export default function UploadProductPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', category: '', info: '', price: '', image: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      await api.post('/api/products', form);
      setMessage('Product created successfully.');
      navigate('/market');
    } catch (submitError) {
      setMessage(submitError.response?.data?.message || 'Failed to create product');
    }
  };

  return (
    <section className="page-shell animate-fade-in">
      <div className="page-header">
        <div>
          <span className="eyebrow">Upload</span>
          <h1>List a new product</h1>
          <p>Create a market listing for the Node API backend.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <form className="stack" onSubmit={handleSubmit}>
            <div className="field-grid">
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-control" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input className="form-control" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Price</label>
                <input className="form-control" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Image filename</label>
                <input className="form-control" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="optional.jpg" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows="6" value={form.info} onChange={(event) => setForm({ ...form, info: event.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary">Publish Product</button>
          </form>
          {message && <div className="notice-card">{message}</div>}
        </div>
      </div>
    </section>
  );
}