import { useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Navbar({ onOpenLogin, onOpenRegister }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">
        🌱 AgroCulture
      </Link>

      <ul className="nav-links">
        <li>
          <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/market" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Market
          </NavLink>
        </li>
        <li>
          <NavLink to="/blog" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            Agro-Blog
          </NavLink>
        </li>
        {user && (
          <li>
            <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              Profile
            </NavLink>
          </li>
        )}
        {user && user.role === 'buyer' && (
          <li>
            <NavLink to="/cart" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              My Cart 🛒
            </NavLink>
          </li>
        )}
        {user && user.role === 'buyer' && (
          <li>
            <NavLink to="/orders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              My Orders
            </NavLink>
          </li>
        )}
        {user && user.role === 'farmer' && (
          <li>
            <NavLink to="/upload-product" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              Upload Product
            </NavLink>
          </li>
        )}
      </ul>

      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>
              Hello, {user.profile?.name || user.username} ({user.role})
            </span>
            <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '8px 16px' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-outline" onClick={onOpenLogin} style={{ padding: '8px 16px' }}>
              Login
            </button>
            <button className="btn btn-primary" onClick={onOpenRegister} style={{ padding: '8px 16px' }}>
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
