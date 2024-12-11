import React from 'react';
import { Search } from 'lucide-react';
import type { Database } from '../../types/supabase';

type LeadStatus = Database['public']['Tables']['leads']['Row']['status'];

interface LeadFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedStatus: LeadStatus | 'all';
  setSelectedStatus: (status: LeadStatus | 'all') => void;
}

export const LeadFilters: React.FC<LeadFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedStatus,
  setSelectedStatus
}) => {
  const statuses: Array<LeadStatus | 'all'> = [
    'all',
    'new',
    'go back',
    'scheduled',
    'no show',
    'cancelled',
    'disqualified',
    'pitched',
    'failed credit',
    'closed'
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search leads..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CF7128]/20 focus:border-[#CF7128] outline-none"
        />
      </div>
      
      <div className="sm:w-48">
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as LeadStatus | 'all')}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CF7128]/20 focus:border-[#CF7128] outline-none"
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};