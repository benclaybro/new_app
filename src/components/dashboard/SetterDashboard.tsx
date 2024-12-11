import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, MapPin, Calendar } from 'lucide-react';
import { useLeads } from '../../hooks/useLeads';
import { useAppointments } from '../../hooks/useAppointments';
import { LeadFilters } from './LeadFilters';
import { LeadsList } from './LeadsList';
import { AppointmentsList } from './AppointmentsList';
import { useAuthStore } from '../../store/authStore';
import type { Database } from '../../types/supabase';

type Lead = Database['public']['Tables']['leads']['Row'];
type LeadStatus = Lead['status'];

export const SetterDashboard = () => {
  const { profile } = useAuthStore();
  const { leads, loading } = useLeads(profile?.id);
  const { appointments, loading: loadingAppointments } = useAppointments(profile?.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus | 'all'>('all');
  const navigate = useNavigate();

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || lead.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    {
      label: 'Total Leads',
      value: leads.length,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      label: 'Scheduled',
      value: leads.filter(lead => lead.status === 'scheduled').length,
      icon: Calendar,
      color: 'bg-green-500'
    },
    {
      label: 'Go Backs',
      value: leads.filter(lead => lead.status === 'go back').length,
      icon: MapPin,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Leads</h1>
        <button
          onClick={() => navigate('/design')}
          className="flex items-center gap-2 bg-[#CF7128] text-white px-4 py-2 rounded-lg hover:bg-[#B86422] transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>New Lead</span>
        </button>
      </div>

      <div className="mt-6">
        <LeadFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedStatus={selectedStatus}
          setSelectedStatus={setSelectedStatus}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading || loadingAppointments ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#CF7128]"></div>
        </div>
      ) : (
        <>
          <AppointmentsList appointments={appointments} />
          <LeadsList leads={filteredLeads} />
        </>
      )}
    </div>
  );
};