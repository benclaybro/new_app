import { supabase } from '../config/supabase';
import type { Database } from '../types/supabase';

type Consultation = Database['public']['Tables']['consultations']['Row'];
type NewConsultation = Database['public']['Tables']['consultations']['Insert'];

export async function createConsultation(consultation: NewConsultation) {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .insert([consultation])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating consultation:', error);
    throw error;
  }
}

export async function getConsultations(filters?: {
  lead_id?: string;
  consultant_id?: string;
  type?: 'consultation' | 'follow_up';
}) {
  try {
    let query = supabase.from('consultations').select('*');

    if (filters?.lead_id) {
      query = query.eq('lead_id', filters.lead_id);
    }
    if (filters?.consultant_id) {
      query = query.or(`consultant_id.eq.${filters.consultant_id},assigned_to.eq.${filters.consultant_id}`);
    }
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    // Only show future appointments
    query = query.gte('scheduled_time', new Date().toISOString())
                 .order('scheduled_time', { ascending: true });

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching consultations:', error);
    throw error;
  }
}