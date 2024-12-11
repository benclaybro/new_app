import { useState, useEffect } from 'react';
import { initializeGoogleCalendar, authenticateCalendar, getAvailableSlots } from '../utils/calendar';
import { openDB } from '../utils/db';

export function useGoogleCalendar(calendarId?: string) {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        console.log('Starting calendar initialization...');
        await initializeGoogleCalendar();
        await authenticateCalendar();
        if (mounted) {
          console.log('Calendar initialized successfully');
          setInitialized(true);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown initialization error';
          setError(`Failed to initialize Google Calendar: ${errorMessage}`);
          console.error('Calendar initialization error:', err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const fetchAvailableSlots = async (date: Date) => {
    if (!initialized) {
      return [];
    }

    try {
      const slots = await getAvailableSlots(date);
      setAvailableSlots(slots);
      return slots;
    } catch (err) {
      console.error('Error fetching available slots:', err);
      return [];
    }
  };

  return {
    initialized,
    loading,
    error,
    availableSlots,
    fetchAvailableSlots
  };
}