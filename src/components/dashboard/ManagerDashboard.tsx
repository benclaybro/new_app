import React, { useEffect, useState } from 'react';
import { Users, TrendingUp, MapPin, DollarSign } from 'lucide-react';
import { getLeads } from '../../utils/leads';
import { getTerritories } from '../../utils/territories';
import { LeadsList } from './LeadsList';
import { TeamPerformance } from './TeamPerformance';
import type { Database } from '../../types/supabase';

type Lead = Database['public']['Tables']['leads']['Row'];
type Territory = Database['public']['Tables']['territories']['Row'];

export const ManagerDashboard = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadsData, territoriesData] = await Promise.all([
          getLeads(),
          getTerritories()
        ]);
        setLeads(leadsData);
        setTerritories(territoriesData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      label: 'Total Leads',
      value: leads.length,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      label: 'Close Rate',
      value: `${Math.round((leads.filter(lead => lead.status === 'closed').length / leads.length) * 100)}%`,
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      label: 'Active Territories',
      value: territories.length,
      icon: MapPin,
      color: 'bg-purple-500'
    },
    {
      label: 'Revenue',
      value: `$${Math.round(leads.filter(lead => lead.status === 'closed').length * 12000).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Team Dashboard</h1>

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

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#CF7128]"></div>
        </div>
      ) : (
        <>
          <TeamPerformance leads={leads} />
          <LeadsList leads={leads} showAssignee />
        </>
      )}
    </div>
  );
};