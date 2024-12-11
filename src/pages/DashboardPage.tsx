import React from 'react';
import { useAuthStore } from '../store/authStore';
import { SetterDashboard } from '../components/dashboard/SetterDashboard';
import { SalesRepDashboard } from '../components/dashboard/SalesRepDashboard';
import { ManagerDashboard } from '../components/dashboard/ManagerDashboard';

export const DashboardPage = () => {
  const { profile } = useAuthStore();

  if (!profile) return null;

  const renderDashboard = () => {
    switch (profile.role) {
      case 'Setter':
        return <SetterDashboard />;
      case 'Sales Rep':
        return <SalesRepDashboard />;
      case 'Manager':
        return <ManagerDashboard />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboard()}
      </div>
    </div>
  );
};