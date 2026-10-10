/**
 * The one Supabase client the app uses.
 *
 * The URL and publishable key below are safe to ship in the browser: the
 * publishable key only identifies the project, and every table is protected
 * by row level security (see supabase/migrations). NEVER put a secret key or
 * the service_role key in this file or anywhere else in the front end.
 *
 * To point the site at another Supabase project, set VITE_SUPABASE_URL and
 * VITE_SUPABASE_PUBLISHABLE_KEY in the hosting provider's environment
 * variables (or in a local .env file). See .env.example.
 */
import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? 'https://ffajpehcqdqqbmpxcnjt.supabase.co';
export const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? 'sb_publishable_KHlXuijIQt2m4E_LL1wj9A_C9j0tLh1';

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    // Email confirmation and password reset links come back with the session in the URL.
    detectSessionInUrl: true,
  },
});

/** Converts whole US cents from the database into dollars for display. */
export function centsToUsd(cents: number | string): number {
  return Number(cents) / 100;
}
