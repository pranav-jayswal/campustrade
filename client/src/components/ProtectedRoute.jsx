import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Guards a nested route (used with react-router's <Outlet /> pattern).
// Wrap any route that needs a signed-in user; pass `adminOnly` for
// routes that additionally require role: 'admin'.
export default function ProtectedRoute({ adminOnly = false }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  // Wait for AuthContext to finish checking localStorage before deciding
  // — otherwise a signed-in user gets bounced to /login for a flash on
  // every page refresh.
  if (isLoading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
