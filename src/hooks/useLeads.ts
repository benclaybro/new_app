import { useState, useEffect } from 'react';
import { getLeads } from '../utils/leads';
import { getAllFromStore, putInStore } from '../utils/db';
import type { Database } from '../types/supabase';

type Lead = Database['public']['Tables']['leads']['Row'];

export function useLeads(userId?: string) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        // Try to get leads from IndexedDB first
        const cachedLeads = await getAllFromStore<Lead>('leads');
        if (cachedLeads.length > 0) {
          setLeads(cachedLeads);
          setLoading(false);
        }

        // Then fetch from API if online
        if (navigator.onLine) {
          const apiLeads = await getLeads({ assigned_to: userId });
          setLeads(apiLeads);
          
          // Update cache
          for (const lead of apiLeads) {
            await putInStore('leads', lead);
          }
        }
      } catch (err) {
        console.error('Error fetching leads:', err);
        setError('Failed to fetch leads. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [userId]);

  return { leads, loading, error };
}