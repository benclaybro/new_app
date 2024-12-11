import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { User, Loader } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { getAllSalesUsers } from '../../../utils/users';
import type { Database } from '../../../types/supabase';
import { useLocation } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';

interface CloserSelectionProps {
  onSelect: (closerId: string, closerName: string) => void;
}

type SalesUser = {
  id: string;
  name: string;
  email: string;
  role: Database['public']['Tables']['users']['Row']['role'];
  nylas_grant_email: string
};

export const CloserSelection: React.FC<CloserSelectionProps> = ({ onSelect }) => {
  const { profile } = useAuthStore();
  const [salesUsers, setSalesUsers] = useState<SalesUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();
  const isFollowUp = location.state?.isFollowUp;
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const fetchSalesUsers = async () => {
      try {
        const users = await getAllSalesUsers();
        console.log(users)
        // Sort users: current user first, then by role (Sales Rep before Setter)
        const sortedUsers = users.sort((a, b) => {
          if (a.id === profile?.id) return -1;
          if (b.id === profile?.id) return 1;
          if (a.role === 'Sales Rep' && b.role === 'Setter') return -1;
          if (a.role === 'Setter' && b.role === 'Sales Rep') return 1;
          return a.name.localeCompare(b.name);
        });
        
        setSalesUsers(sortedUsers);
      } catch (err) {
        setError('Failed to load sales team members');
        console.error('Error fetching sales users:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesUsers();
  }, [profile?.id]);

  const handleUserSelect = (userId: string, userName: string, nylas_grant_email: string) => {
    searchParams.set('email', nylas_grant_email);
    setSearchParams(searchParams); // Update the URL param
    onSelect(userId, userName); // Pass the selected user's name to the parent
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-[50vh] sm:min-h-0"
    >
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
        {isFollowUp ? 'Schedule Your Follow Up' : 'Select Your Solar Consultant'}
      </h2>
      <p className="text-gray-600 mb-6">
        {profile?.role === 'Setter' ? 'Schedule a follow-up or select another consultant' : 'Choose a consultant to guide you through your solar journey'}
      </p>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="h-8 w-8 text-[#CF7128] animate-spin" />
        </div>
      ) : error ? (
        <div className="text-red-600 text-center py-8">
          {error}
        </div>
      ) : (
      <div className="space-y-4">
        {salesUsers.map((user) => (
          <button
            key={user.id}
            onClick={() => handleUserSelect(user.id,user.name, user.nylas_grant_email)}
            className={`w-full flex items-center p-3 sm:p-4 border rounded-lg hover:border-[#CF7128] hover:bg-[#CF7128]/5 transition-colors group ${
              user.id === profile?.id ? 'border-[#CF7128] bg-[#CF7128]/5' : ''
            }`}
          >
            <div className="h-10 w-10 sm:h-12 sm:w-12 bg-[#CF7128]/10 rounded-full flex items-center justify-center mr-3 sm:mr-4">
              <User className="h-6 w-6 text-[#CF7128]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-medium text-gray-900 group-hover:text-[#CF7128]">
                {user.name}
              </span>
              <span className="text-sm text-gray-500">
                {user.id === profile?.id ? `${user.role} (You)` : user.role}
              </span>
            </div>
          </button>
        ))}
      </div>
      )}
    </motion.div>
  );
};