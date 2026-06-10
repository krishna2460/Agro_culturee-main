import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: 'var(--primary-color)'
      }}>
        Loading user data...
      </div>
    );
  }

  if (!user) {
    // Redirect to home if not logged in
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to home if role is not authorized
    return <Navigate to="/" replace />;
  }

  return children;
}
