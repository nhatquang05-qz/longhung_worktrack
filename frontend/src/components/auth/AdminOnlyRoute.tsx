import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const AdminOnlyRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};