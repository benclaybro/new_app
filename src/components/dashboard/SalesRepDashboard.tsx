import React, { useEffect, useState } from 'react';
import { Calendar, DollarSign, Users, Percent } from 'lucide-react';
import { getLeads } from '../../utils/leads';
import { LeadsList } from './LeadsList';
import { AppointmentsList } from './AppointmentsList';
import { useAppointments } from '../../hooks/useAppointments';
import { useAuthStore } from '../../store/authStore';
import type { Database } from '../../types/supabase';

type Lead = Database['public']['Tables']['leads']['Row'];

export const SalesRepDashboard = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuthStore();
  const { appointments, loading: loadingAppointments } = useAppointments(profile?.id);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const data = await getLeads({ status: 'scheduled' });
        setLeads(data);
      } catch (error) {
        console.error('Error fetching leads:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const stats = [
    {
      label: 'Appointments',
      value: leads.length,
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      label: 'Closed Deals',
      value: leads.filter(lead => lead.status === 'closed').length,
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      label: 'Close Rate',
      value: `${Math.round((leads.filter(lead => lead.status === 'closed').length / leads.length) * 100)}%`,
      icon: Percent,
      color: 'bg-purple-500'
    },
    {
      label: 'Active Leads',
      value: leads.filter(lead => !['closed', 'disqualified'].includes(lead.status)).length,
      icon: Users,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
        <div className="space-y-6">
          <AppointmentsList appointments={appointments} />
          <LeadsList leads={leads} />
        </div>
      )}
    </div>
  );
};