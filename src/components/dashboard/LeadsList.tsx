import React from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import type { Database } from '../../types/supabase';

type Lead = Database['public']['Tables']['leads']['Row'];

interface LeadsListProps {
  leads: Lead[];
  showAssignee?: boolean;
}

const statusColors = {
  'new': 'bg-blue-100 text-blue-800',
  'go back': 'bg-yellow-100 text-yellow-800',
  'scheduled': 'bg-green-100 text-green-800',
  'no show': 'bg-red-100 text-red-800',
  'cancelled': 'bg-gray-100 text-gray-800',
  'disqualified': 'bg-red-100 text-red-800',
  'pitched': 'bg-purple-100 text-purple-800',
  'failed credit': 'bg-orange-100 text-orange-800',
  'closed': 'bg-green-100 text-green-800'
} as const;

export const LeadsList = ({ leads, showAssignee = false }: LeadsListProps) => {
  const navigate = useNavigate();
  
  React.useEffect(() => {
    console.log('LeadsList received leads:', leads?.length || 0);
  }, [leads]);

  // Mobile view for each lead
  const renderMobileLeadCard = (lead: Lead) => (
    <div
      key={lead.id}
      onClick={() => navigate(`/leads/${lead.id}`)}
      className="p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="font-medium text-gray-900 truncate">
          {lead.contact_info && typeof lead.contact_info === 'object' && 
           (lead.contact_info as any).firstName && (lead.contact_info as any).lastName ? 
            `${(lead.contact_info as any).firstName} ${(lead.contact_info as any).lastName}` : 
            'New Lead'}
        </div>
        <Badge variant={lead.status} className={statusColors[lead.status]}>
          {lead.status}
        </Badge>
      </div>
      <div className="text-sm text-gray-600 mb-2">{lead.address}</div>
      {showAssignee && (
        <div className="text-sm text-gray-500 mb-2">
          Assigned to: {lead.assigned_to || 'Unassigned'}
        </div>
      )}
      <div className="text-xs text-gray-500">
        Created: {format(new Date(lead.created_at), 'MMM d, yyyy')}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Mobile view */}
      <div className="md:hidden">
        {leads.map(renderMobileLeadCard)}
      </div>

      {/* Desktop view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Address
              </th>
              {showAssignee && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr 
                key={lead.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/leads/${lead.id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {lead.contact_info && typeof lead.contact_info === 'object' && 
                     (lead.contact_info as any).firstName && (lead.contact_info as any).lastName ? 
                      `${(lead.contact_info as any).firstName} ${(lead.contact_info as any).lastName}` : 
                      'New Lead'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{lead.address}</div>
                </td>
                {showAssignee && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {lead.assigned_to || 'Unassigned'}
                    </div>
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge variant={lead.status} className={statusColors[lead.status]}>
                    {lead.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(lead.created_at), 'MMM d, yyyy')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};