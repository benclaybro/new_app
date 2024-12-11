import React from 'react';
import { format } from 'date-fns';
import { Calendar, Clock } from 'lucide-react';
import type { Database } from '../../types/supabase';

type Consultation = Database['public']['Tables']['consultations']['Row'];

interface AppointmentsListProps {
  appointments: Consultation[];
}

const statusColors = {
  'scheduled': 'bg-blue-100 text-blue-800',
  'completed': 'bg-green-100 text-green-800',
  'cancelled': 'bg-red-100 text-red-800',
  'no_show': 'bg-yellow-100 text-yellow-800'
} as const;

export const AppointmentsList = ({ appointments }: AppointmentsListProps) => {
  React.useEffect(() => {
    console.log('Rendering appointments:', appointments?.length || 0);
  }, [appointments]);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
      </div>

      {appointments.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No upcoming appointments
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {appointment.type === 'consultation' ? (
                    <Calendar className="h-5 w-5 text-[#CF7128] mt-1" />
                  ) : (
                    <Clock className="h-5 w-5 text-[#CF7128] mt-1" />
                  )}
                  <div>
                    <div className="font-medium text-gray-900">
                      {appointment.type === 'consultation' ? 'Consultation' : 'Follow Up'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {format(new Date(appointment.scheduled_time), 'MMM d, yyyy h:mm a')}
                    </div>
                    {appointment.lead_id && (
                      <div className="text-sm text-gray-500 mt-1">
                        Lead ID: {appointment.lead_id}
                      </div>
                    )}
                    {appointment.contact_info && typeof appointment.contact_info === 'object' && 
                     (appointment.contact_info as any).firstName && (
                      <div className="text-sm text-gray-600 mt-1">
                        {(appointment.contact_info as any).firstName} {(appointment.contact_info as any).lastName}
                      </div>
                    )}
                    {appointment.type === 'follow_up' && (
                      <div className="text-sm text-gray-500 mt-1">
                        Follow-up by: {appointment.consultant_id}
                      </div>
                    )}
                    {appointment.notes && (
                      <div className="text-sm text-gray-500 mt-1 italic">
                        {appointment.notes}
                      </div>
                    )}
                  </div>
                </div>
                <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[appointment.status]}`}>
                  {appointment.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};