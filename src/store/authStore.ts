import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

type UserRole = Database['public']['Tables']['users']['Row']['role'];

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string;
  nylas_grant_email: string;
}

interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  setUser: (user: User | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      profile: null,
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      clearAuth: () => set({ user: null, profile: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);