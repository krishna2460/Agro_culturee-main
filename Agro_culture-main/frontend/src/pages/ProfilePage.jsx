import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateProfile } = useContext(AuthContext);
  const [form, setForm] = useState({ email: '', mobile: '', name: '', address: '', password: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        email: user.email || '',
        mobile: user.mobile || '',
        name: user.profile?.name || '',
        address: user.profile?.address || '',
        password: '',
      });
    }
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await updateProfile(form);
    setMessage(response.success ? 'Profile updated successfully.' : response.message);
  };

  return (
    <section className="page-shell animate-fade-in">
      <div className="page-header">
        <div>
          <span className="eyebrow">Profile</span>
          <h1>Account settings</h1>
          <p>Edit your identity, contact details, and password.</p>
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
                <label className="form-label">Email</label>
                <input className="form-control" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile</label>
                <input className="form-control" value={form.mobile} onChange={(event) => setForm({ ...form, mobile: event.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-control" value={form.address} onChange={(event) => setForm({ ...form, address: event.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary">Save Profile</button>
          </form>
          {message && <div className="notice-card">{message}</div>}
        </div>
      </div>
    </section>
  );
}