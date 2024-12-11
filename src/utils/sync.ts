import { supabase } from '../config/supabase';
import { openDB, getAllFromStore, deleteFromStore } from './db';
import type { Database } from '../types/supabase';

type Lead = Database['public']['Tables']['leads']['Row'];

export async function syncPendingChanges() {
  const pendingChanges = await getAllFromStore('pendingChanges');
  
  // Sort by timestamp to maintain order
  pendingChanges.sort((a, b) => a.timestamp - b.timestamp);

  for (const change of pendingChanges) {
    try {
      switch (change.type) {
        case 'create':
          await supabase.from('leads').insert(change.data);
          break;
        case 'update':
          await supabase.from('leads').update(change.data).eq('id', change.data.id);
          break;
        case 'delete':
          await supabase.from('leads').delete().eq('id', change.data.id);
          break;
      }
      
      // Remove synced change
      await deleteFromStore('pendingChanges', change.id);
    } catch (error) {
      console.error('Error syncing change:', error);
      // Leave failed changes in the store to retry later
      break;
    }
  }
}

export async function initSync() {
  // Try to sync when coming online
  window.addEventListener('online', () => {
    syncPendingChanges();
  });

  // Initial sync if online
  if (navigator.onLine) {
    await syncPendingChanges();
  }
}

let syncInterval: number;

export function startPeriodicSync(intervalMs = 30000) {
  stopPeriodicSync();
  syncInterval = window.setInterval(() => {
    if (navigator.onLine) {
      syncPendingChanges();
    }
  }, intervalMs);
}

export function stopPeriodicSync() {
  if (syncInterval) {
    window.clearInterval(syncInterval);
  }
}