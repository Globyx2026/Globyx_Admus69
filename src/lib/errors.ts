/**
 * Turns errors from Supabase into sentences a customer can act on.
 * The database functions raise short codes (see supabase/migrations); the
 * sign-in service returns its own messages and codes.
 */
const MESSAGES: Record<string, string> = {
  // Database functions
  not_signed_in: 'Your session has ended. Log in again to continue.',
  insufficient_funds: 'Your wallet balance is too low for this. Add funds and try again.',
  invalid_amount: 'Top-ups must be between $5 and $500.',
  invalid_method: 'Choose a payment method.',
  balance_cap: 'Test wallets are limited to $2,000. Spend some of your balance first.',
  number_unavailable: 'That number has just been taken. Pick another one.',
  number_limit: 'You can hold up to 10 numbers. Release one to rent another.',
  number_not_found: 'We could not find that number on your account.',
  renewal_limit: 'This number is already paid for three months ahead.',
  sms_not_supported: 'This number cannot receive text messages.',
  inbox_full: 'This inbox is full. Delete some messages first.',
  invalid_product: 'That proxy product is not available.',
  invalid_quantity: 'Enter an amount within the allowed range.',
  plan_limit: 'You can hold up to 20 active proxy plans.',
  invalid_name: 'Give the key a name of 1 to 40 characters.',
  key_limit: 'You can have up to 10 active API keys. Revoke one first.',
  key_not_found: 'That key has already been revoked.',
  invalid_email: 'That email address does not look right.',

  // Sign-in
  invalid_credentials: 'That email and password do not match. Check them and try again.',
  email_not_confirmed: 'Confirm your email first. Open the link we sent you, then log in.',
  user_already_exists: 'An account with this email already exists. Log in instead.',
  email_exists: 'An account with this email already exists. Log in instead.',
  weak_password: 'Choose a stronger password: at least 8 characters.',
  same_password: 'Your new password must be different from the current one.',
  over_email_send_rate_limit: 'Too many emails were requested. Wait a few minutes and try again.',
  over_request_rate_limit: 'Too many attempts. Wait a minute and try again.',
  signup_disabled: 'New sign-ups are switched off at the moment.',
  anonymous_provider_disabled: 'The demo account is switched off. Create a free account instead.',
  email_address_invalid: 'That email address was not accepted. Use a real address you can open.',
  session_not_found: 'Your session has ended. Log in again to continue.',
};

interface ErrorLike {
  message?: string;
  code?: string;
  status?: number;
}

export function friendlyError(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!error) return fallback;
  const { message = '', code = '' } = error as ErrorLike;

  if (code && MESSAGES[code]) return MESSAGES[code];
  if (MESSAGES[message]) return MESSAGES[message];
  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return 'We could not reach the server. Check your connection and try again.';
  }
  if (/jwt expired|invalid jwt/i.test(message)) return MESSAGES.not_signed_in;
  if (/invalid login credentials/i.test(message)) return MESSAGES.invalid_credentials;
  if (/email not confirmed/i.test(message)) return MESSAGES.email_not_confirmed;
  if (/already registered/i.test(message)) return MESSAGES.user_already_exists;
  if (/rate limit/i.test(message)) return MESSAGES.over_request_rate_limit;
  return fallback;
}
