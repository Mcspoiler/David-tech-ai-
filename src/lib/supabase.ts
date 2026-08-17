import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Default Supabase project credentials for the deployment
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://kbfokyqxuqzypaasfvoj.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiZm9reXF4dXF6eXBhYXNmdm9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxNzE1MDAsImV4cCI6MjA1NTc0NzUwMH0.placeholder';

export const HYPER_SERVICE_FUNCTION_URL =
  import.meta.env.VITE_SUPABASE_FUNCTION_URL ||
  `${SUPABASE_URL}/functions/v1/hyper-service`;

// Create Supabase client singleton
export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface SupabaseConversationRow {
  id: string;
  user_id?: string | null;
  title: string;
  model: string;
  persona_id: string;
  is_pinned?: boolean;
  enable_search_grounding?: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupabaseMessageRow {
  id: string;
  conversation_id: string;
  user_id?: string | null;
  role: 'user' | 'assistant' | 'system';
  content: string;
  model?: string | null;
  tokens?: number | null;
  search_queries?: any;
  grounding_sources?: any;
  created_at: string;
}
