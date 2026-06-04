/**
 * ProtectedRoute — FakeProof Labs
 * Route protection component that redirects unauthenticated users to login
 */

import { Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    // Context not ready, redirect to login
    return <Navigate to="/login" replace />;
  }

  const { isAuthenticated, isLoading } = authContext;

  if (isLoading) {
    // Show loading state while checking authentication
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#03030d]">
        <div className="text-center">
          <div className="inline-block animate-spin">
            <div className="w-8 h-8 border-t-2 border-cyan-500 rounded-full"></div>
          </div>
          <p className="text-[#8888bb] mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
