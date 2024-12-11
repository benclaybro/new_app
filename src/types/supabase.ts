export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          role: 'Setter' | 'Sales Rep' | 'Manager'
          name: string
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          email: string
          password_hash: string
          role: 'Setter' | 'Sales Rep' | 'Manager'
          name: string
          phone?: string | null
        }
        Update: {
          email?: string
          password_hash?: string
          role?: 'Setter' | 'Sales Rep' | 'Manager'
          name?: string
          phone?: string | null
        }
      }
      leads: {
        Row: {
          id: string
          name: string
          address: string
          contact_info: Json
          status: 'new' | 'go back' | 'scheduled' | 'no show' | 'cancelled' | 'disqualified' | 'pitched' | 'failed credit' | 'closed'
          notes: string | null
          aurora_project_id: string | null
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          address: string
          contact_info: Json
          status: 'new' | 'go back' | 'scheduled' | 'no show' | 'cancelled' | 'disqualified' | 'pitched' | 'failed credit' | 'closed'
          notes?: string
          aurora_project_id?: string
          assigned_to?: string
        }
        Update: {
          name?: string
          address?: string
          contact_info?: Json
          status?: 'new' | 'go back' | 'scheduled' | 'no show' | 'cancelled' | 'disqualified' | 'pitched' | 'failed credit' | 'closed'
          notes?: string
          aurora_project_id?: string
          assigned_to?: string
        }
      }
      territories: {
        Row: {
          id: string
          name: string
          geometry: Json
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          geometry: Json
          assigned_to?: string
        }
        Update: {
          name?: string
          geometry?: Json
          assigned_to?: string
        }
      }
    }
  }
}