import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getProfile, type Profile } from '@/services/account';
import { checkIsAdmin } from '@/services/admin';
import { useCurrency } from './CurrencyContext';

interface AuthValue {
  /** True until the saved session has been read on first load. */
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  /** A demo account: signed in without an email address. */
  isDemo: boolean;
  /** May use the admin dashboard at /admin. Null while it is being checked. */
  isAdmin: boolean | null;
  /** Set after someone opens a password reset link. */
  recovering: boolean;
  /** Name to greet the customer with. */
  displayName: string;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setCurrency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [recovering, setRecovering] = useState(false);
  const currencyAppliedFor = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });
    // Keep this callback synchronous: Supabase warns against awaiting its own
    // methods inside it. The profile is loaded by the effect below instead.
    const { data: listener } = supabase.auth.onAuthStateChange((event, next) => {
      if (!active) return;
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
      if (event === 'USER_UPDATED' || event === 'SIGNED_OUT') setRecovering(false);
      setSession(next);
      setLoading(false);
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user.id ?? null;

  const refreshProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setIsAdmin(null);
      return;
    }
    // The database decides who is an admin; this flag only chooses what to show.
    checkIsAdmin().then(setIsAdmin, () => setIsAdmin(false));
    try {
      const loaded = await getProfile(userId);
      setProfile(loaded);
      // Apply the saved currency once per sign-in, so the footer toggle still works afterwards.
      if (loaded && currencyAppliedFor.current !== userId) {
        currencyAppliedFor.current = userId;
        setCurrency(loaded.currency);
      }
    } catch {
      setProfile(null);
    }
  }, [userId, setCurrency]);

  useEffect(() => {
    if (!userId) currencyAppliedFor.current = null;
    setIsAdmin(null);
    void refreshProfile();
  }, [userId, refreshProfile]);

  const value = useMemo<AuthValue>(() => {
    const user = session?.user ?? null;
    const isDemo = Boolean(user?.is_anonymous);
    const fromEmail = user?.email ? user.email.split('@')[0] : '';
    const displayName = profile?.fullName || (isDemo ? 'Demo user' : fromEmail) || 'there';
    return { loading, session, user, profile, isDemo, isAdmin, recovering, displayName, refreshProfile };
  }, [loading, session, profile, isAdmin, recovering, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
