import { supabase } from '../config/supabase';
import { getFromStore, putInStore, getAllFromStore } from './db';
import type { Database } from '../types/supabase';

type UserRole = Database['public']['Tables']['users']['Row']['role'];

async function cacheUsers(users: any[]) {
  for (const user of users) {
    await putInStore('users', user);
  }
}

export async function getUsersByRole(role: UserRole) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role')
    .eq('role', role);

  if (error) throw error;
  return data;
}

export async function getAllSalesUsers() {
  try {
    // Try to get from cache first
    const cachedUsers = await getAllFromStore('users');
    if (cachedUsers.length > 0) {
      return cachedUsers.filter(user => 
        user.role === 'Sales Rep' || user.role === 'Setter'
      );
    }

    // If online, fetch from API
    if (navigator.onLine) {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role, nylas_grant_email')
        .in('role', ['Sales Rep', 'Setter']);

      if (error) throw error;
      if (data) {
        await cacheUsers(data);
        return data;
      }
    }

    return [];
  } catch (error) {
    console.error('Error fetching sales users:', error);
    // Return cached data if available
    const cachedUsers = await getAllFromStore('users');
    return cachedUsers.filter(user => 
      user.role === 'Sales Rep' || user.role === 'Setter'
    );
  }
}


export async function getUsersById(userId: any) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, nylas_grant_email')
    .eq('id', userId);

  if (error) throw error;
  return data;
}