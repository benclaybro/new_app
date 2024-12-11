import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Database } from '../../types/supabase';

type Lead = Database['public']['Tables']['leads']['Row'];

interface TeamPerformanceProps {
  leads: Lead[];
}

export const TeamPerformance = ({ leads }: TeamPerformanceProps) => {
  const performanceData = useMemo(() => {
    const teamStats = leads.reduce((acc, lead) => {
      if (!lead.assigned_to) return acc;
      
      if (!acc[lead.assigned_to]) {
        acc[lead.assigned_to] = {
          name: lead.assigned_to,
          total: 0,
          closed: 0,
          scheduled: 0
        };
      }
      
      acc[lead.assigned_to].total++;
      if (lead.status === 'closed') acc[lead.assigned_to].closed++;
      if (lead.status === 'scheduled') acc[lead.assigned_to].scheduled++;
      
      return acc;
    }, {} as Record<string, { name: string; total: number; closed: number; scheduled: number }>);

    return Object.values(teamStats);
  }, [leads]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Team Performance</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={performanceData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="total" fill="#93C5FD" name="Total Leads" />
            <Bar dataKey="scheduled" fill="#34D399" name="Scheduled" />
            <Bar dataKey="closed" fill="#F59E0B" name="Closed" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};