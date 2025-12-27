// Supabase generated types
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
      profiles: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'member' | 'viewer'
          organization_id: string | null
          organization_name: string | null
          first_name: string | null
          last_name: string | null
          phone: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          last_login_at: string | null
        }
        Insert: {
          id: string
          email: string
          role: 'admin' | 'member' | 'viewer'
          organization_id?: string | null
          organization_name?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'member' | 'viewer'
          organization_id?: string | null
          organization_name?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
      }
      records: {
        Row: {
          id: string
          organization_id: string
          created_by: string
          title: string
          description: string | null
          data: Json | null
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          created_by: string
          title: string
          description?: string | null
          data?: Json | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          created_by?: string
          title?: string
          description?: string | null
          data?: Json | null
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}