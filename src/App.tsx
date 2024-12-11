import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { DesignPage } from './pages/DesignPage';
import { ConsultationPage } from './pages/ConsultationPage';
import { LeadDetailsPage } from './pages/LeadDetailsPage';
import { ResultsPage } from './pages/ResultsPage';
import { AuthGuard } from './components/auth/AuthGuard';
import { useAuthStore } from './store/authStore';
import { CallbackPage } from './pages/CallbackPage';

function App() {
  const { profile } = useAuthStore();

  const getDefaultRoute = () => {
    if (!profile) return '/login';
    return '/dashboard';
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white">
        <Navigation />
        <Routes>
          <Route path="/" element={<Navigate to={getDefaultRoute()} replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={
            <AuthGuard>
              <DashboardPage />
            </AuthGuard>
          } />
          <Route path="/profile" element={
            <AuthGuard>
              <ProfilePage />
            </AuthGuard>
          } />
          <Route path="/design" element={
            <AuthGuard>
              <DesignPage />
            </AuthGuard>
          } />
          <Route path="/results" element={
            <AuthGuard>
              <ResultsPage />
            </AuthGuard>
          } />
          <Route path="/schedule" element={
            <AuthGuard>
              <ConsultationPage />
            </AuthGuard>
          } />
          <Route path="/leads/:id" element={
            <AuthGuard>
              <LeadDetailsPage />
            </AuthGuard>
          } />
          <Route path="/callback" element={
            <AuthGuard>
              <CallbackPage />
            </AuthGuard>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;