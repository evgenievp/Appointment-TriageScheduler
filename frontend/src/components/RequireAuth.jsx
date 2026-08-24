import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/authContext';

// Guards are a courtesy, not security: the backend decides what a token may do.
// Their job is to send people to the login screen instead of an empty page.
export default function RequireAuth({ role, children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const from = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?from=${from}`} replace />;
  }

  if (role && user.role !== role) return <Navigate to="/" replace />;

  return children;
}
