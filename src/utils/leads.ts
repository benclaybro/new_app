import { supabase } from '../config/supabase';
import type { Database } from '../types/supabase';
import { putInStore, getAllFromStore, getFromStore, deleteFromStore } from './db';

type Lead = Database['public']['Tables']['leads']['Row'];
type NewLead = Database['public']['Tables']['leads']['Insert'];

interface AddressCache {
  address: string;
  leadId: string;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getAddressCache(address: string): Promise<AddressCache | null> {
  return getFromStore<AddressCache>('addressCache', address);
}

async function updateAddressCache(address: string, leadId: string) {
  const cacheEntry = {
    address,
    leadId,
    timestamp: Date.now()
  };
  await putInStore('addressCache', cacheEntry);
}

async function checkAddressCache(address: string): Promise<string | null> {
  const entry = await getAddressCache(address);
  
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.leadId;
  }
  
  return null;
}

function createOfflineLead(lead: NewLead): Lead {
  return {
    id: `offline-${Date.now()}`,
    name: lead.name || 'New Lead',
    address: lead.address,
    contact_info: lead.contact_info || {},
    status: lead.status || 'new',
    notes: lead.notes || '',
    aurora_project_id: null,
    assigned_to: lead.assigned_to || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

async function findExistingLead(address: string): Promise<Lead | null> {
  try {
    // Check Supabase
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('address', address)
      .maybeSingle();

    return data;
  } catch (error: any) {
    console.error('Error finding existing lead:', error);
    return null;
  }
}

async function cleanupOfflineLeads(address: string) {
  try {
    const localLeads = await getAllFromStore<Lead>('leads');
    const offlineLeads = localLeads?.filter(lead => 
      lead.id.startsWith('offline-') && lead.address === address
    );
    
    if (offlineLeads?.length) {
      for (const lead of offlineLeads) {
        await deleteFromStore('leads', lead.id);
      }
    }
  } catch (error) {
    console.error('Error cleaning up offline leads:', error);
  }
}

export async function createLead(lead: NewLead) {
  try {
    // Validate required fields
    if (!lead.assigned_to || !lead.address || !lead.contact_info || typeof lead.contact_info !== 'object') {
      throw new Error('Missing required lead information');
    }

    // Check for existing lead with same address
    const existingLead = await findExistingLead(lead.address);
    
    // Update existing lead
    if (existingLead) {
      console.log('Updating existing lead:', existingLead.id);
      const updates = {
        ...lead,
        updated_at: new Date().toISOString()
      };

      const { data: updatedLead, error: updateError } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', existingLead.id)
        .select()
        .single();

      if (updateError) {
        throw new Error('Failed to update lead');
      }

      if (updatedLead) {
        await putInStore('leads', updatedLead);
        await updateAddressCache(lead.address, updatedLead.id);
        return updatedLead;
      }
      throw new Error('No data returned from lead update');
    }

    // Create new lead
    const { data, error: createError } = await supabase
      .from('leads')
      .insert([lead])
      .select()
      .single();

    if (createError) {
      throw new Error('Failed to create lead');
    }
    
    if (!data) {
      throw new Error('No data returned from lead creation');
    }

    await putInStore('leads', data);
    await updateAddressCache(lead.address, data.id);
    return data;

  } catch (error: any) {
    console.error('Error creating/updating lead:', error);
    if (!navigator.onLine) {
      // Handle offline case
      const offlineLead = createOfflineLead(lead);
      await putInStore('leads', offlineLead);
      await updateAddressCache(lead.address, offlineLead.id);
      return offlineLead;
    }
    throw error;
  }
}

export async function updateLead(id: string, updates: Partial<Lead>) {
  const { data, error } = await supabase
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getLeads(filters?: {
  status?: Lead['status'];
  assigned_to?: string;
}) {
  try {
    // If online, fetch from API
    if (navigator.onLine) {
      let query = supabase.from('leads').select('*');

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.assigned_to) {
        query = query.eq('assigned_to', filters.assigned_to);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Cache the results
      if (data) {
        // Clear existing cache first
        const cachedLeads = await getAllFromStore<Lead>('leads');
        for (const lead of cachedLeads) {
          await deleteFromStore('leads', lead.id);
        }

        // Store new leads
        for (const lead of data) {
          await putInStore('leads', lead);
        }
        return data;
      }
      return [];
    }

    // If offline, use cached data
    const cachedLeads = await getAllFromStore<Lead>('leads');
    return cachedLeads.filter(lead => {
      if (filters?.status && lead.status !== filters.status) return false;
      if (filters?.assigned_to && lead.assigned_to !== filters.assigned_to) return false;
      return true;
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    // Return cached data if available
    const cachedLeads = await getAllFromStore<Lead>('leads');
    return cachedLeads.filter(lead => {
      if (filters?.status && lead.status !== filters.status) return false;
      if (filters?.assigned_to && lead.assigned_to !== filters.assigned_to) return false;
      return true;
    });
  }
}

export async function getLead(id: string) {
  try {
    // Try to get from cache first
    const cachedLead = await getFromStore<Lead>('leads', id);
    if (cachedLead) {
      return cachedLead;
    }

    // If online, fetch from API
    if (navigator.onLine) {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Cache the result
      if (data) {
        await putInStore('leads', data);
        return data;
      }
    }

    throw new Error('Lead not found');
  } catch (error) {
    console.error('Error fetching lead:', error);
    // Try to get from cache as fallback
    const cachedLead = await getFromStore<Lead>('leads', id);
    if (cachedLead) {
      return cachedLead;
    }
    throw error;
  }
}

export async function deleteLead(id: string) {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  if (error) throw error;
}