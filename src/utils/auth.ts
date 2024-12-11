import { supabase } from '../config/supabase';
import { User } from '@supabase/supabase-js';

export async function signUp(
  email: string,
  password: string,
  name: string,
  phone: string,
  role: 'Setter' | 'Sales Rep' | 'Manager'
) {
  const { data: auth, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;

  if (auth.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: auth.user.id,
          email,
          name,
          phone,
          role,
          password_hash: '' // We don't store the actual password hash, Supabase handles that
        }
      ]);

    if (profileError) throw profileError;
  }

  return auth;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Store session in IndexedDB for offline access
export async function cacheUserSession(session: any) {
  try {
    const db = await openDatabase();
    const tx = db.transaction('sessions', 'readwrite');
    const store = tx.objectStore('sessions');
    await store.put(session, 'currentSession');
  } catch (error) {
    console.error('Error caching session:', error);
  }
}

// Initialize IndexedDB
async function openDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('SolarDirect', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('sessions')) {
        db.createObjectStore('sessions');
      }
    };
  });
}