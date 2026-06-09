import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getStoredRole, type UserRole } from '../../utils/auth';

interface RoleRouteProps {
  allowedRole: UserRole;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRole }) => {
  return getStoredRole() === allowedRole
    ? <Outlet />
    : <Navigate to="/dashboard" replace />;
};
