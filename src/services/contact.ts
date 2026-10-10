/**
 * Contact form and newsletter.
 * BACKEND: insert into Supabase tables (`contact_messages`,
 * `newsletter_subscribers`) and send a notification email. For now entries
 * are kept in this browser's localStorage so the forms behave realistically.
 */
import { fakeLatency, readStore, writeStore } from '@/lib/utils';

export interface ContactMessage {
  name: string;
  email: string;
  topic: string;
  message: string;
}

const MESSAGES_KEY = 'globyx.contactMessages';
const NEWSLETTER_KEY = 'globyx.newsletter';

export async function sendContactMessage(message: ContactMessage): Promise<void> {
  await fakeLatency();
  const saved = readStore<Array<ContactMessage & { sentAt: string }>>(MESSAGES_KEY, []);
  writeStore(MESSAGES_KEY, [...saved, { ...message, sentAt: new Date().toISOString() }]);
}

/** Returns false when the address was already subscribed. */
export async function subscribeToNewsletter(email: string): Promise<boolean> {
  await fakeLatency();
  const saved = readStore<string[]>(NEWSLETTER_KEY, []);
  const address = email.trim().toLowerCase();
  if (saved.includes(address)) return false;
  writeStore(NEWSLETTER_KEY, [...saved, address]);
  return true;
}
