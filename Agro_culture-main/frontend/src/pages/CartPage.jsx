import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [message, setMessage] = useState('');
  const [checkout, setCheckout] = useState({ name: '', addr: '', city: '', pincode: '', mobile: '', email: '' });

  const loadCart = async () => {
    const response = await api.get('/api/cart');
    setCart(response.data);
  };

  useEffect(() => {
    loadCart().catch((error) => setMessage(error.response?.data?.message || 'Failed to load cart'));
  }, []);

  const removeItem = async (productId) => {
    try {
      await api.delete(`/api/cart/${productId}`);
      await loadCart();
    } catch (removeError) {
      setMessage(removeError.response?.data?.message || 'Failed to remove item');
    }
  };

  const handleCheckout = async (event) => {
    event.preventDefault();

    try {
      await api.post('/api/orders', { ...checkout, products: cart?.products || [] });
      setMessage('Order placed successfully.');
      setCheckout({ name: '', addr: '', city: '', pincode: '', mobile: '', email: '' });
      await loadCart();
    } catch (checkoutError) {
      setMessage(checkoutError.response?.data?.message || 'Failed to place order');
    }
  };

  const total = cart?.products?.reduce((sum, item) => sum + (item.price * item.quantity), 0) || 0;

  return (
    <section className="page-shell animate-fade-in">
      <div className="page-header">
        <div>
          <span className="eyebrow">Cart</span>
          <h1>Buy now and checkout</h1>
          <p>Review items, clear the cart, and place an order with shipping details.</p>
        </div>
      </div>

      {message && <div className="notice-card">{message}</div>}

      <div className="content-grid">
        <div className="card content-panel">
          <div className="card-body stack">
            <h2>Cart items</h2>
            {cart?.products?.length ? cart.products.map((item) => (
              <article key={item.productId} className="mini-card">
                <div>
                  <strong>{item.name}</strong>
                  <p>Qty: {item.quantity}</p>
                  <p>₹{item.price} each</p>
                </div>
                <button type="button" className="btn btn-outline" onClick={() => removeItem(item.productId)}>Remove</button>
              </article>
            )) : <div className="notice-card">Your cart is empty.</div>}
            <div className="mini-card total-row">
              <strong>Total</strong>
              <strong>₹{total}</strong>
            </div>
          </div>
        </div>

        <div className="card content-panel">
          <div className="card-body stack">
            <h2>Checkout</h2>
            <form className="stack" onSubmit={handleCheckout}>
              {['name', 'addr', 'city', 'pincode', 'mobile', 'email'].map((field) => (
                <div className="form-group" key={field}>
                  <label className="form-label">{field.toUpperCase()}</label>
                  <input
                    className="form-control"
                    value={checkout[field]}
                    onChange={(event) => setCheckout({ ...checkout, [field]: event.target.value })}
                  />
                </div>
              ))}
              <button type="submit" className="btn btn-secondary" disabled={!cart?.products?.length}>Place Order</button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}