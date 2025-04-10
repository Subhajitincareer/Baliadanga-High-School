
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://swvzstcmzoelxmbobkna.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN3dnpzdGNtem9lbHhtYm9ia25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMDQyMDMsImV4cCI6MjA1OTY4MDIwM30.RpG2W29T9euB7alYKnMkjfkREOivURhCpIzuTUwdZ70";

// Create a custom enhanced type that includes the admissions table
type EnhancedDatabase = Database & {
  public: {
    Tables: Database['public']['Tables'] & {
      // Add admissions table definition
      admissions: {
        Row: {
          id: string;
          student_name: string;
          gender: string;
          date_of_birth: string;
          father_name: string;
          mother_name: string;
          guardian_phone: string;
          guardian_email: string | null;
          address: string;
          class_applying_for: string;
          previous_school: string | null;
          previous_class: string | null;
          previous_marks: number | null;
          documents_url: string[] | null;
          status: string;
          remarks: string | null;
          access_code: string;
          roll_number: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_name: string;
          gender: string;
          date_of_birth: string;
          father_name: string;
          mother_name: string;
          guardian_phone: string;
          guardian_email?: string | null;
          address: string;
          class_applying_for: string;
          previous_school?: string | null;
          previous_class?: string | null;
          previous_marks?: number | null;
          documents_url?: string[] | null;
          status?: string;
          remarks?: string | null;
          access_code?: string;
          roll_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_name?: string;
          gender?: string;
          date_of_birth?: string;
          father_name?: string;
          mother_name?: string;
          guardian_phone?: string;
          guardian_email?: string | null;
          address?: string;
          class_applying_for?: string;
          previous_school?: string | null;
          previous_class?: string | null;
          previous_marks?: number | null;
          documents_url?: string[] | null;
          status?: string;
          remarks?: string | null;
          access_code?: string;
          roll_number?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      // Add user_roles table definition
      user_roles: {
        Row: {
          id: string;
          user_id: string;
          role: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
  };
};

// Export the supabase client with enhanced types
export const supabase = createClient<EnhancedDatabase>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
