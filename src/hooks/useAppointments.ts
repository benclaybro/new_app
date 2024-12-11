import { useState, useEffect } from 'react';
import { getConsultations } from '../utils/consultations';
import type { Database } from '../types/supabase';

type Consultation = Database['public']['Tables']['consultations']['Row'];

export function useAppointments(consultantId?: string) {
  const [appointments, setAppointments] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!consultantId) return;

      try {
        setLoading(true);
        const data = await getConsultations({ consultant_id: consultantId });
        
        // Sort appointments by scheduled time
        const sortedAppointments = data.sort((a, b) => 
          new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime()
        );
        
        setAppointments(sortedAppointments);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [consultantId]);

  return { appointments, loading, error };
}