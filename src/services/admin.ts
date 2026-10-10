/**
 * Reporting for the admin dashboard (/admin).
 *
 * Every call goes to a database function that first checks the signed-in
 * account is listed in the `admins` table and refuses anyone else, so these
 * are safe to ship in the browser. They are read-only. See
 * supabase/migrations/0003_admin.sql, which also explains how to make an
 * account an admin.
 */
import type { CountryCode, NumberType } from '@/data/countries';
import type { ProxyKind } from '@/data/pricing';
import { centsToUsd, supabase } from '@/lib/supabase';
import type { PaymentMethod, TransactionKind } from './account';

async function call<T>(name: string, args?: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data as T;
}

export interface Page<T> {
  /** How many rows match in total, not just the ones returned. */
  total: number;
  items: T[];
}

/** Whether the signed-in account may use the admin dashboard. */
export async function checkIsAdmin(): Promise<boolean> {
  return Boolean(await call<boolean>('is_admin'));
}

/* ------------------------------ Overview ------------------------------ */

export interface DailyMoney {
  /** UTC day, YYYY-MM-DD. */
  day: string;
  topups: number;
  spend: number;
}

export interface AdminOverview {
  customers: number;
  customersThisWeek: number;
  demoAccounts: number;
  /** USD held across all wallets. */
  walletTotal: number;
  topups: number;
  spend: number;
  spendNumbers: number;
  spendProxies: number;
  transactions: number;
  numbersActive: number;
  numbersDue: number;
  numbersInStock: number;
  proxyPlansActive: number;
  proxyGbActive: number;
  proxyGbUsed: number;
  proxyIpsActive: number;
  contactMessages: number;
  contactMessagesThisWeek: number;
  subscribers: number;
  daily: DailyMoney[];
}

interface OverviewRow {
  customers: number;
  customers_7d: number;
  demo_accounts: number;
  wallet_total_cents: number;
  topups_cents: number;
  spend_cents: number;
  spend_numbers_cents: number;
  spend_proxies_cents: number;
  transactions: number;
  numbers_active: number;
  numbers_due: number;
  numbers_in_stock: number;
  proxy_plans_active: number;
  proxy_gb_active: number;
  proxy_gb_used: number;
  proxy_ips_active: number;
  contact_messages: number;
  contact_messages_7d: number;
  subscribers: number;
  daily: Array<{ day: string; topups_cents: number; spend_cents: number }>;
}

export async function getOverview(): Promise<AdminOverview> {
  const row = await call<OverviewRow>('admin_overview');
  return {
    customers: row.customers,
    customersThisWeek: row.customers_7d,
    demoAccounts: row.demo_accounts,
    walletTotal: centsToUsd(row.wallet_total_cents),
    topups: centsToUsd(row.topups_cents),
    spend: centsToUsd(row.spend_cents),
    spendNumbers: centsToUsd(row.spend_numbers_cents),
    spendProxies: centsToUsd(row.spend_proxies_cents),
    transactions: row.transactions,
    numbersActive: row.numbers_active,
    numbersDue: row.numbers_due,
    numbersInStock: row.numbers_in_stock,
    proxyPlansActive: row.proxy_plans_active,
    proxyGbActive: Number(row.proxy_gb_active),
    proxyGbUsed: Number(row.proxy_gb_used),
    proxyIpsActive: Number(row.proxy_ips_active),
    contactMessages: row.contact_messages,
    contactMessagesThisWeek: row.contact_messages_7d,
    subscribers: row.subscribers,
    daily: (row.daily ?? []).map((d) => ({
      day: d.day,
      topups: centsToUsd(d.topups_cents),
      spend: centsToUsd(d.spend_cents),
    })),
  };
}

/* ------------------------------ Customers ------------------------------ */

export interface AdminCustomer {
  id: string;
  email: string | null;
  isDemo: boolean;
  isAdmin: boolean;
  fullName: string;
  company: string;
  createdAt: string;
  lastSignInAt: string | null;
  balance: number;
  numbers: number;
  proxyPlans: number;
  topups: number;
  spend: number;
}

interface CustomerRow {
  id: string;
  email: string | null;
  is_demo: boolean;
  is_admin: boolean;
  full_name: string;
  company: string;
  created_at: string;
  last_sign_in_at: string | null;
  balance_cents: number;
  numbers: number;
  proxy_plans: number;
  topups_cents: number;
  spend_cents: number;
}

export async function listCustomers(search: string, limit: number): Promise<Page<AdminCustomer>> {
  const page = await call<Page<CustomerRow>>('admin_list_customers', { p_search: search, p_limit: limit });
  return {
    total: page.total,
    items: page.items.map((row) => ({
      id: row.id,
      email: row.email,
      isDemo: row.is_demo,
      isAdmin: row.is_admin,
      fullName: row.full_name,
      company: row.company,
      createdAt: row.created_at,
      lastSignInAt: row.last_sign_in_at,
      balance: centsToUsd(row.balance_cents),
      numbers: row.numbers,
      proxyPlans: row.proxy_plans,
      topups: centsToUsd(row.topups_cents),
      spend: centsToUsd(row.spend_cents),
    })),
  };
}

/* ------------------------------ Transactions ------------------------------ */

/** Who a row belongs to. Demo accounts have no email address. */
export interface Owner {
  userId: string;
  email: string | null;
  fullName: string;
}

export interface AdminTransaction extends Owner {
  id: string;
  createdAt: string;
  kind: TransactionKind;
  /** USD. Positive for money in, negative for money out. */
  amount: number;
  balanceAfter: number;
  method: PaymentMethod | null;
  description: string;
}

interface OwnerRow {
  user_id: string;
  email: string | null;
  full_name: string;
}

interface TransactionRow extends OwnerRow {
  id: string;
  created_at: string;
  kind: string;
  amount_cents: number;
  balance_after_cents: number;
  method: string | null;
  description: string;
}

function owner(row: OwnerRow): Owner {
  return { userId: row.user_id, email: row.email, fullName: row.full_name };
}

export async function listAllTransactions(
  search: string,
  kind: TransactionKind | '',
  limit: number,
): Promise<Page<AdminTransaction> & { sum: number }> {
  const page = await call<Page<TransactionRow> & { sum_cents: number }>('admin_list_transactions', {
    p_search: search,
    p_kind: kind,
    p_limit: limit,
  });
  return {
    total: page.total,
    sum: centsToUsd(page.sum_cents),
    items: page.items.map((row) => ({
      ...owner(row),
      id: row.id,
      createdAt: row.created_at,
      kind: row.kind as TransactionKind,
      amount: centsToUsd(row.amount_cents),
      balanceAfter: centsToUsd(row.balance_after_cents),
      method: row.method as PaymentMethod | null,
      description: row.description,
    })),
  };
}

/* ------------------------------ Numbers ------------------------------ */

export interface AdminNumber extends Owner {
  id: string;
  number: string;
  country: CountryCode;
  city: string;
  type: NumberType;
  monthly: number;
  label: string;
  status: 'active' | 'released';
  purchasedAt: string;
  renewsAt: string;
  releasedAt: string | null;
  messages: number;
}

interface NumberRow extends OwnerRow {
  id: string;
  number: string;
  country_code: string;
  city: string;
  type: string;
  monthly_cents: number;
  label: string;
  status: string;
  purchased_at: string;
  renews_at: string;
  released_at: string | null;
  messages: number;
}

export async function listAllNumbers(
  search: string,
  status: 'active' | 'released' | '',
  limit: number,
): Promise<Page<AdminNumber> & { monthly: number }> {
  const page = await call<Page<NumberRow> & { monthly_cents: number }>('admin_list_numbers', {
    p_search: search,
    p_status: status,
    p_limit: limit,
  });
  return {
    total: page.total,
    monthly: centsToUsd(page.monthly_cents),
    items: page.items.map((row) => ({
      ...owner(row),
      id: row.id,
      number: row.number,
      country: row.country_code as CountryCode,
      city: row.city,
      type: row.type as NumberType,
      monthly: centsToUsd(row.monthly_cents),
      label: row.label,
      status: row.status as 'active' | 'released',
      purchasedAt: row.purchased_at,
      renewsAt: row.renews_at,
      releasedAt: row.released_at,
      messages: row.messages,
    })),
  };
}

/* ------------------------------ Proxies ------------------------------ */

export interface AdminProxyPlan extends Owner {
  id: string;
  kind: ProxyKind;
  unit: 'gb' | 'ip';
  quantity: number;
  usedMb: number;
  price: number;
  username: string;
  purchasedAt: string;
  expiresAt: string;
  active: boolean;
}

interface ProxyRow extends OwnerRow {
  id: string;
  kind: string;
  unit: string;
  quantity: number;
  used_mb: number;
  price_cents: number;
  username: string;
  purchased_at: string;
  expires_at: string;
  active: boolean;
}

export async function listAllProxyPlans(
  search: string,
  state: 'active' | 'expired' | '',
  limit: number,
): Promise<Page<AdminProxyPlan>> {
  const page = await call<Page<ProxyRow>>('admin_list_proxy_plans', {
    p_search: search,
    p_state: state,
    p_limit: limit,
  });
  return {
    total: page.total,
    items: page.items.map((row) => ({
      ...owner(row),
      id: row.id,
      kind: row.kind as ProxyKind,
      unit: row.unit as 'gb' | 'ip',
      quantity: row.quantity,
      usedMb: Number(row.used_mb),
      price: centsToUsd(row.price_cents),
      username: row.username,
      purchasedAt: row.purchased_at,
      expiresAt: row.expires_at,
      active: row.active,
    })),
  };
}

/* ------------------------------ Messages ------------------------------ */

export interface AdminContactMessage {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  topic: string;
  message: string;
}

export async function listContactMessages(search: string, limit: number): Promise<Page<AdminContactMessage>> {
  const page = await call<Page<{ id: string; created_at: string; name: string; email: string; topic: string; message: string }>>(
    'admin_list_contact_messages',
    { p_search: search, p_limit: limit },
  );
  return {
    total: page.total,
    items: page.items.map((row) => ({
      id: row.id,
      createdAt: row.created_at,
      name: row.name,
      email: row.email,
      topic: row.topic,
      message: row.message,
    })),
  };
}

export interface AdminSubscriber {
  email: string;
  createdAt: string;
}

export async function listSubscribers(search: string, limit: number): Promise<Page<AdminSubscriber>> {
  const page = await call<Page<{ email: string; created_at: string }>>('admin_list_subscribers', {
    p_search: search,
    p_limit: limit,
  });
  return { total: page.total, items: page.items.map((row) => ({ email: row.email, createdAt: row.created_at })) };
}
