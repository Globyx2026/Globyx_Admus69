/**
 * Sign-in service, backed by Supabase Auth. Passwords go straight to
 * Supabase over HTTPS and are never stored by this app.
 */
import { supabase, supabasePublishableKey, supabaseUrl } from '@/lib/supabase';

/** Where Supabase should send people back to after they click an email link. */
function returnUrl(path: string): string {
  return `${window.location.origin}${path}`;
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
}

/**
 * Creates an account. When the project requires email confirmation (the
 * default) there is no session yet and `needsConfirmation` is true.
 */
export async function signUp(name: string, email: string, password: string): Promise<{ needsConfirmation: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { full_name: name.trim() }, emailRedirectTo: returnUrl('/app') },
  });
  if (error) throw error;
  // Supabase answers a sign-up for an existing address with a user that has no identities.
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    throw { code: 'user_already_exists' };
  }
  return { needsConfirmation: !data.session };
}

export async function resendConfirmation(email: string): Promise<void> {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email.trim(),
    options: { emailRedirectTo: returnUrl('/app') },
  });
  if (error) throw error;
}

/**
 * A throwaway account for looking around, with its own empty wallet.
 * Works only when "Allow anonymous sign-ins" is switched on in Supabase.
 */
export async function signInAsDemo(): Promise<void> {
  const { error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
}

let demoCheck: Promise<boolean> | null = null;

/** Whether the Supabase project allows demo (anonymous) accounts. */
export function isDemoAvailable(): Promise<boolean> {
  if (!demoCheck) {
    demoCheck = fetch(`${supabaseUrl}/auth/v1/settings`, { headers: { apikey: supabasePublishableKey } })
      .then((response) => (response.ok ? response.json() : null))
      .then((settings) => Boolean(settings?.external?.anonymous_users))
      .catch(() => false);
  }
  return demoCheck;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function requestPasswordReset(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: returnUrl('/reset-password'),
  });
  if (error) throw error;
}

export async function updatePassword(password: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw error;
}
