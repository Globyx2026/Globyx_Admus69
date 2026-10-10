/**
 * Contact form and newsletter, stored in Supabase.
 * Messages land in the `contact_messages` table and subscribers in
 * `newsletter_subscribers`. Read both in the Supabase table editor: the
 * website itself can write to them but never read them back.
 * BACKEND: add a notification email (a Supabase database webhook or edge
 * function) so new messages reach your inbox.
 */
import { supabase } from '@/lib/supabase';

export interface ContactMessage {
  name: string;
  email: string;
  topic: string;
  message: string;
}

export async function sendContactMessage(message: ContactMessage): Promise<void> {
  const { error } = await supabase.from('contact_messages').insert({
    name: message.name.trim(),
    email: message.email.trim(),
    topic: message.topic,
    message: message.message.trim(),
  });
  if (error) throw error;
}

/** Subscribing an address that is already on the list is harmless. */
export async function subscribeToNewsletter(email: string): Promise<void> {
  const { error } = await supabase.rpc('subscribe_newsletter', { p_email: email });
  if (error) throw error;
}
