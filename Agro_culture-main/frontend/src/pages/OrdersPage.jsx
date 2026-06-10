import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/api/orders/myorders')
      .then((response) => setOrders(response.data))
      .catch((error) => setMessage(error.response?.data?.message || 'Failed to load orders'));
  }, []);

  return (
    <section className="page-shell animate-fade-in">
      <div className="page-header">
        <div>
          <span className="eyebrow">Orders</span>
          <h1>Order history</h1>
          <p>View purchase records from the Node backend.</p>
        </div>
      </div>

      {message && <div className="notice-card">{message}</div>}

      <div className="stack">
        {orders.map((order) => (
          <article key={order._id} className="card">
            <div className="card-body stack">
              <strong>Order #{order._id.slice(-6)}</strong>
              <span>Status: {order.status}</span>
              <span>Ship to: {order.shippingAddress?.name}, {order.shippingAddress?.city}</span>
              <span>Items: {order.products?.length || 0}</span>
            </div>
          </article>
        ))}
        {!orders.length && !message && <div className="notice-card">No orders found.</div>}
      </div>
    </section>
  );
}