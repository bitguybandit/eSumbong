import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

export default function ProtectedRoute({ role, children }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!profile) return <Navigate to="/login" replace />;

  if (role && profile.role_type !== role) {
    return <Navigate to={profile.role_type === 'officer' ? '/officer' : '/resident'} replace />;
  }

  return children;
}
