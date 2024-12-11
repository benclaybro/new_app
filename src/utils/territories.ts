import { supabase } from '../config/supabase';
import type { Database } from '../types/supabase';

type Territory = Database['public']['Tables']['territories']['Row'];
type NewTerritory = Database['public']['Tables']['territories']['Insert'];

export async function createTerritory(territory: NewTerritory) {
  const { data, error } = await supabase
    .from('territories')
    .insert([territory])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateTerritory(id: string, updates: Partial<Territory>) {
  const { data, error } = await supabase
    .from('territories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getTerritories(assignedTo?: string) {
  let query = supabase.from('territories').select('*');

  if (assignedTo) {
    query = query.eq('assigned_to', assignedTo);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getTerritory(id: string) {
  const { data, error } = await supabase
    .from('territories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}