import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseCredentials } from '@/types/game';

/**
 * Retrieves Supabase configuration credentials from LocalStorage or environment variables.
 */
export function getSupabaseCredentials(): SupabaseCredentials {
  const customUrl = localStorage.getItem('PW_SUPABASE_URL');
  const customKey = localStorage.getItem('PW_SUPABASE_KEY');

  const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  const url = customUrl || envUrl || '';
  const key = customKey || envKey || '';

  return {
    url,
    key,
    isConfigured: Boolean(url && key && url.startsWith('http'))
  };
}

/**
 * Saves custom Supabase credentials to LocalStorage and triggers a reload.
 */
export function saveSupabaseCredentials(url: string, key: string): void {
  if (url) localStorage.setItem('PW_SUPABASE_URL', url.trim());
  else localStorage.removeItem('PW_SUPABASE_URL');

  if (key) localStorage.setItem('PW_SUPABASE_KEY', key.trim());
  else localStorage.removeItem('PW_SUPABASE_KEY');

  window.location.reload();
}

let supabaseInstance: SupabaseClient | null = null;

/**
 * Returns the singleton Supabase client instance if configured.
 */
export function getSupabase(): SupabaseClient | null {
  const { url, key, isConfigured } = getSupabaseCredentials();

  if (!isConfigured) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }

  return supabaseInstance;
}
