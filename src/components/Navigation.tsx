import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, LogOut, User } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { signOut } from '../utils/auth';

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { profile, clearAuth } = useAuthStore();

  const handleSignOut = async () => {
    try {
      await signOut();
      clearAuth();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="fixed w-full bg-white/95 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={profile ? '/dashboard' : '/'} className="flex items-center">
            <img 
              src="https://storage.googleapis.com/msgsndr/sjd4bf5bes06rTHJugY5/media/674da388395665de3dcb5505.png" 
              alt="SolarDirect Logo" 
              className="h-8 w-auto sm:h-10" 
            />
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            {profile ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/profile"
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-gray-600 hover:text-gray-900">Sign In</Link>
            )}
          </div>
          
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-lg animate-fade-in">
            <div className="px-4 py-3 space-y-3">
              {profile && (
                <>
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 w-full"
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 w-full"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
                </>
              )}
              {!profile && (
                <Link to="/login" className="block text-gray-600 hover:text-gray-900">Sign In</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};