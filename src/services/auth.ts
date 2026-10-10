/**
 * Sign-in service.
 * BACKEND: this is a stand-in until Supabase Auth is connected in the next
 * build stage. It keeps only a display name and email in localStorage and
 * NEVER stores or sends the password.
 */
import { fakeLatency, readStore, removeStore, writeStore } from '@/lib/utils';

export interface Session {
  name: string;
  email: string;
  demo: boolean;
}

const SESSION_KEY = 'globyx.session';

export function getSession(): Session | null {
  return readStore<Session | null>(SESSION_KEY, null);
}

export async function signIn(email: string): Promise<Session> {
  await fakeLatency();
  const name = email.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const session: Session = { name, email: email.trim().toLowerCase(), demo: false };
  writeStore(SESSION_KEY, session);
  return session;
}

export async function signUp(name: string, email: string): Promise<Session> {
  await fakeLatency();
  const session: Session = { name: name.trim(), email: email.trim().toLowerCase(), demo: false };
  writeStore(SESSION_KEY, session);
  return session;
}

export async function signInAsDemo(): Promise<Session> {
  const session: Session = { name: 'Alex', email: 'alex@demo.globyx.com', demo: true };
  writeStore(SESSION_KEY, session);
  return session;
}

export function signOut(): void {
  removeStore(SESSION_KEY);
}
