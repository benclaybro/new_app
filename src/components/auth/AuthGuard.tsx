import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { Database } from '../../types/supabase';

type UserRole = Database['public']['Tables']['users']['Row']['role'];

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children, allowedRoles }) => {
  const { user, profile } = useAuthStore();
  const location = useLocation();

  if (!user || !profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};