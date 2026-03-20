import { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from 'react';
import { type SupabaseClient, type User } from '@supabase/supabase-js';
import { useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { Database } from '../config/database.types';
import type { DashboardData } from '../services/data';
import type { Profile } from '../types';
import { getSupabaseClient } from '../config';
import { useDashboardData, useProfile, queryKeys } from '../hooks/queries';

const INACTIVITY_LIMIT = 10 * 60 * 1000;

interface AuthContextValue {
  supabase: SupabaseClient<Database> | null;
  user: User | null;
  data: DashboardData | null;
  profile: Profile | null;
  loading: boolean;
  isConfigured: boolean;
  isPasswordResetInProgress: boolean;
  updateData: (data: DashboardData | null) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }: Readonly<{ children: ReactNode }>) => {
  const location = useLocation();
  const queryClient = useQueryClient();

  const supabase = useMemo(() => getSupabaseClient(), []);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordResetInProgress, setIsPasswordResetInProgress] = useState(false);
  const isConfigured = supabase !== null;

  const shouldFetchData = !!user && !isPasswordResetInProgress;
  const { data: dashboardData, isLoading: isDashboardLoading } = useDashboardData(supabase, shouldFetchData);
  const { data: profileData, isLoading: isProfileLoading } = useProfile(supabase, user?.id ?? null, shouldFetchData);

  const updateData = useCallback(
    (newData: DashboardData | null) => {
      queryClient.setQueryData(queryKeys.dashboard, newData);
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    queryClient.clear();
    setUser(null);
  }, [supabase, queryClient]);

  useEffect(() => {
    if (!user || !supabase) return;
    let timeout: ReturnType<typeof setTimeout>;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(logout, INACTIVITY_LIMIT);
    };
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => document.addEventListener(event, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(timeout);
      events.forEach((event) => document.removeEventListener(event, resetTimer));
    };
  }, [user, supabase, logout]);

  const handlePasswordResetPage = useCallback((cancelled: { current: boolean }) => {
    if (cancelled.current) return;
    setIsPasswordResetInProgress(true);
    setLoading(false);
  }, []);

  const handleNormalSession = useCallback((cancelled: { current: boolean }) => {
    if (cancelled.current) return;
    setIsPasswordResetInProgress(false);
    setLoading(false);
  }, []);

  const handleNoSession = useCallback((cancelled: { current: boolean }) => {
    if (cancelled.current) return;
    setUser(null);
    setIsPasswordResetInProgress(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const cancelledRef = { current: false };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session) => {
      const isOnPasswordResetPage = location.pathname === '/change-password';

      if (session?.user) {
        if (!cancelledRef.current) setUser(session.user);
        if (isOnPasswordResetPage) {
          handlePasswordResetPage(cancelledRef);
        } else {
          handleNormalSession(cancelledRef);
        }
      } else {
        handleNoSession(cancelledRef);
      }
    });

    return () => {
      cancelledRef.current = true;
      subscription.unsubscribe();
    };
  }, [supabase, location.pathname, handlePasswordResetPage, handleNormalSession, handleNoSession]);

  const isDataLoading = shouldFetchData && (isDashboardLoading || isProfileLoading);
  const combinedLoading = loading || isDataLoading;

  const value = useMemo(
    () => ({
      supabase,
      user,
      data: dashboardData ?? null,
      profile: profileData ?? null,
      loading: combinedLoading,
      isConfigured,
      isPasswordResetInProgress,
      updateData,
      logout,
    }),
    [
      supabase,
      user,
      dashboardData,
      profileData,
      combinedLoading,
      isConfigured,
      isPasswordResetInProgress,
      updateData,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
