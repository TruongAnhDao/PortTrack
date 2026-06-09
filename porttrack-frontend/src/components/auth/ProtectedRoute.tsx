import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { clearSession, getStoredRole, getStoredToken, isTokenValid } from '../../utils/auth';

export const ProtectedRoute: React.FC = () => {
  const location = useLocation();
  const token = getStoredToken();
  const role = getStoredRole();

  if (!token || !role) {
    if (token) clearSession();
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isTokenValid(token)) {
    clearSession();
    return <Navigate to="/login?reason=session-expired" replace />;
  }

  return <Outlet />;
};
