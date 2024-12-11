// import React from 'react';
import { Callback } from '../components/auth/NylasCallback';
import { useAuthStore } from '../store/authStore';


export const CallbackPage = () => {
  const { profile } = useAuthStore();

  if (!profile) return null;

  const renderDashboard = () => {
    return <Callback />
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboard()}
      </div>
    </div>
  );
};