/**
 * Everything the dashboard reads and writes for the signed-in customer.
 *
 * Reads go straight to the tables (row level security returns only the
 * customer's own rows). Anything that moves money goes through a database
 * function, which checks the price and the balance on the server.
 *
 * BACKEND (test mode): top-ups do not take a payment, and numbers, messages
 * and proxy credentials are simulated. See supabase/migrations/0001_schema.sql.
 */
import type { CountryCode, NumberType } from '@/data/countries';
import type { ProxyKind } from '@/data/pricing';
import type { Currency } from '@/context/CurrencyContext';
import { centsToUsd, supabase } from '@/lib/supabase';

/* ----------------------------- Profile ----------------------------- */

export interface Profile {
  id: string;
  fullName: string;
  company: string;
  currency: Currency;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, company, currency')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { id: data.id, fullName: data.full_name, company: data.company, currency: data.currency as Currency };
}

export async function updateProfile(
  userId: string,
  changes: { fullName: string; company: string; currency: Currency },
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ full_name: changes.fullName.trim(), company: changes.company.trim(), currency: changes.currency })
    .eq('id', userId);
  if (error) throw error;
}

/* ------------------------------ Wallet ------------------------------ */

export type PaymentMethod = 'card' | 'mpesa' | 'crypto';
export type TransactionKind = 'topup' | 'number' | 'renewal' | 'proxy' | 'refund';

export interface Transaction {
  id: string;
  kind: TransactionKind;
  /** USD. Positive for money in, negative for money out. */
  amount: number;
  balanceAfter: number;
  method: PaymentMethod | null;
  description: string;
  createdAt: string;
}

/** Wallet balance in USD. */
export async function getBalance(): Promise<number> {
  const { data, error } = await supabase.from('wallets').select('balance_cents').maybeSingle();
  if (error) throw error;
  return data ? centsToUsd(data.balance_cents) : 0;
}

export async function listTransactions(limit: number): Promise<{ items: Transaction[]; total: number }> {
  const { data, error, count } = await supabase
    .from('transactions')
    .select('id, kind, amount_cents, balance_after_cents, method, description, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .order('id')
    .limit(limit);
  if (error) throw error;
  return {
    total: count ?? data.length,
    items: data.map((row) => ({
      id: row.id,
      kind: row.kind as TransactionKind,
      amount: centsToUsd(row.amount_cents),
      balanceAfter: centsToUsd(row.balance_after_cents),
      method: row.method as PaymentMethod | null,
      description: row.description,
      createdAt: row.created_at,
    })),
  };
}

/** TEST MODE: adds funds without taking a payment. Returns the new balance in USD. */
export async function topUpWallet(amountUsd: number, method: PaymentMethod): Promise<number> {
  const { data, error } = await supabase.rpc('top_up_wallet_test', {
    p_amount_cents: Math.round(amountUsd * 100),
    p_method: method,
  });
  if (error) throw error;
  return centsToUsd(data as number);
}

/* ------------------------------ Numbers ------------------------------ */

export interface RentedNumber {
  id: string;
  number: string;
  country: CountryCode;
  city: string;
  type: NumberType;
  sms: boolean;
  voice: boolean;
  mms: boolean;
  /** USD per month. */
  monthly: number;
  label: string;
  purchasedAt: string;
  renewsAt: string;
  unread: number;
}

export async function listMyNumbers(): Promise<RentedNumber[]> {
  const [numbers, unread] = await Promise.all([
    supabase
      .from('numbers')
      .select('id, number, country_code, city, type, sms, voice, mms, monthly_cents, label, purchased_at, renews_at')
      .eq('status', 'active')
      .order('purchased_at', { ascending: false }),
    supabase.from('messages').select('number_id').is('read_at', null),
  ]);
  if (numbers.error) throw numbers.error;
  if (unread.error) throw unread.error;

  const unreadByNumber = new Map<string, number>();
  unread.data.forEach((row) => unreadByNumber.set(row.number_id, (unreadByNumber.get(row.number_id) ?? 0) + 1));

  return numbers.data.map((row) => ({
    id: row.id,
    number: row.number,
    country: row.country_code as CountryCode,
    city: row.city,
    type: row.type as NumberType,
    sms: row.sms,
    voice: row.voice,
    mms: row.mms,
    monthly: centsToUsd(row.monthly_cents),
    label: row.label,
    purchasedAt: row.purchased_at,
    renewsAt: row.renews_at,
    unread: unreadByNumber.get(row.id) ?? 0,
  }));
}

/** Rents a number from the catalogue: first month plus any setup fee. */
export async function rentNumber(catalogId: string): Promise<void> {
  const { error } = await supabase.rpc('rent_number', { p_catalog_id: catalogId });
  if (error) throw error;
}

export async function renewNumber(numberId: string): Promise<void> {
  const { error } = await supabase.rpc('renew_number', { p_number_id: numberId });
  if (error) throw error;
}

export async function releaseNumber(numberId: string): Promise<void> {
  const { error } = await supabase.rpc('release_number', { p_number_id: numberId });
  if (error) throw error;
}

export async function renameNumber(numberId: string, label: string): Promise<void> {
  const { error } = await supabase.from('numbers').update({ label: label.trim().slice(0, 40) }).eq('id', numberId);
  if (error) throw error;
}

/* ------------------------------ Messages ------------------------------ */

export interface InboxMessage {
  id: string;
  sender: string;
  body: string;
  receivedAt: string;
  read: boolean;
}

export async function listMessages(numberId: string): Promise<InboxMessage[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('id, sender, body, received_at, read_at')
    .eq('number_id', numberId)
    .order('received_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    sender: row.sender,
    body: row.body,
    receivedAt: row.received_at,
    read: row.read_at !== null,
  }));
}

export async function markMessagesRead(numberId: string): Promise<void> {
  const { error } = await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('number_id', numberId)
    .is('read_at', null);
  if (error) throw error;
}

export async function deleteMessage(messageId: string): Promise<void> {
  const { error } = await supabase.from('messages').delete().eq('id', messageId);
  if (error) throw error;
}

/** TEST MODE: drops a sample text message into the number's inbox. */
export async function sendTestMessage(numberId: string): Promise<void> {
  const { error } = await supabase.rpc('send_test_message', { p_number_id: numberId });
  if (error) throw error;
}

export async function countUnreadMessages(): Promise<number> {
  const { count, error } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .is('read_at', null);
  if (error) throw error;
  return count ?? 0;
}

/* ------------------------------ Proxies ------------------------------ */

export interface ProxyRate {
  kind: ProxyKind;
  /** The rate applies from this many GB (or IP addresses) upward. */
  minQuantity: number;
  /** USD per GB, or per IP address for 30 days. */
  unitPrice: number;
}

export interface ProxyPlan {
  id: string;
  kind: ProxyKind;
  unit: 'gb' | 'ip';
  quantity: number;
  usedMb: number;
  /** USD paid. */
  price: number;
  host: string;
  port: number;
  username: string;
  password: string;
  purchasedAt: string;
  expiresAt: string;
}

/** Residential and mobile are sold by the GB; ISP and datacenter by the IP address. */
export const PROXY_UNIT: Record<ProxyKind, 'gb' | 'ip'> = {
  residential: 'gb',
  mobile: 'gb',
  isp: 'ip',
  datacenter: 'ip',
};

export const PROXY_MAX: Record<'gb' | 'ip', number> = { gb: 1000, ip: 100 };

export async function listProxyRates(): Promise<ProxyRate[]> {
  const { data, error } = await supabase
    .from('proxy_rates')
    .select('kind, min_quantity, unit_cents')
    .order('kind')
    .order('min_quantity');
  if (error) throw error;
  return data.map((row) => ({
    kind: row.kind as ProxyKind,
    minQuantity: row.min_quantity,
    unitPrice: centsToUsd(row.unit_cents),
  }));
}

/** Works out the price the database will charge, for showing before purchase. */
export function quoteProxy(rates: ProxyRate[], kind: ProxyKind, quantity: number): { unitPrice: number; total: number } {
  const tiers = rates.filter((rate) => rate.kind === kind && rate.minQuantity <= quantity);
  const unitPrice = tiers.length > 0 ? tiers[tiers.length - 1].unitPrice : 0;
  return { unitPrice, total: Math.round(unitPrice * quantity * 100) / 100 };
}

export async function listProxyPlans(): Promise<ProxyPlan[]> {
  const { data, error } = await supabase
    .from('proxy_plans')
    .select('id, kind, unit, quantity, used_mb, price_cents, host, port, username, password, purchased_at, expires_at')
    .order('purchased_at', { ascending: false });
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    kind: row.kind as ProxyKind,
    unit: row.unit as 'gb' | 'ip',
    quantity: row.quantity,
    usedMb: Number(row.used_mb),
    price: centsToUsd(row.price_cents),
    host: row.host,
    port: row.port,
    username: row.username,
    password: row.password,
    purchasedAt: row.purchased_at,
    expiresAt: row.expires_at,
  }));
}

export async function buyProxyPlan(kind: ProxyKind, quantity: number): Promise<void> {
  const { error } = await supabase.rpc('buy_proxy_plan', { p_kind: kind, p_quantity: quantity });
  if (error) throw error;
}

/* ------------------------------ API keys ------------------------------ */

export interface ApiKey {
  id: string;
  name: string;
  /** The first characters of the key, enough to tell keys apart. */
  prefix: string;
  createdAt: string;
  revokedAt: string | null;
}

export async function listApiKeys(): Promise<ApiKey[]> {
  const { data, error } = await supabase
    .from('api_keys')
    .select('id, name, prefix, created_at, revoked_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    name: row.name,
    prefix: row.prefix,
    createdAt: row.created_at,
    revokedAt: row.revoked_at,
  }));
}

/** Returns the full key. It is shown once and cannot be read again. */
export async function createApiKey(name: string): Promise<string> {
  const { data, error } = await supabase.rpc('create_api_key', { p_name: name });
  if (error) throw error;
  return data as string;
}

export async function revokeApiKey(keyId: string): Promise<void> {
  const { error } = await supabase.rpc('revoke_api_key', { p_key_id: keyId });
  if (error) throw error;
}
