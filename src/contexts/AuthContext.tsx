import { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef, type ReactNode } from 'react';
import { type SupabaseClient, type User } from '@supabase/supabase-js';
import { useLocation } from 'react-router-dom';
import type { Database } from '../lib/database.types';
import type { DashboardData } from '../lib/data';
import type { Profile } from '../types/profile';
import { getSupabaseClient } from '../lib/supabase';

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
  const dataFetchedRef = useRef(false);

  const supabase = useMemo(() => getSupabaseClient(), []);

  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordResetInProgress, setIsPasswordResetInProgress] = useState(false);
  const isConfigured = supabase !== null;

  const updateData = useCallback((newData: DashboardData | null) => {
    setData(newData);
  }, []);

  const logout = useCallback(async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setData(null);
    setProfile(null);
    setUser(null);
    dataFetchedRef.current = false;
  }, [supabase]);

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

  const fetchProfile = useCallback(
    async (userId: string, cancelled: { current: boolean }) => {
      if (!supabase) return;
      const { data: profileData, error }: { data: any; error: any } = await supabase
        .from('profiles')
        .select('id, full_name, role, access_level, created_at')
        .eq('id', userId)
        .single();

      if (cancelled.current) return;
      if (error) {
        console.error('Failed to fetch profile:', error);
        setProfile(null);
        return;
      }
      if (!profileData) {
        setProfile(null);
        return;
      }
      setProfile({
        id: profileData.id,
        fullName: profileData.full_name ?? '',
        role: profileData.role ?? '',
        accessLevel: profileData.access_level ?? '',
        createdAt: profileData.created_at ?? '',
      });
    },
    [supabase],
  );

  const fetchDashboardData = useCallback(
    async (cancelled: { current: boolean }) => {
      if (!supabase || dataFetchedRef.current) return;
      if (!cancelled.current) setLoading(true);
      dataFetchedRef.current = true;
      const { data: dbData } = await supabase.from('dashboards').select('content').eq('id', 'latest').single();
      if (cancelled.current) return;
      if (dbData?.content) setData(dbData.content);
      setLoading(false);
    },
    [supabase],
  );

  const handlePasswordResetPage = useCallback((cancelled: { current: boolean }) => {
    if (cancelled.current) return;
    setIsPasswordResetInProgress(true);
    setLoading(false);
  }, []);

  const handleNormalSession = useCallback(
    (userId: string, cancelled: { current: boolean }) => {
      if (cancelled.current) return;
      setIsPasswordResetInProgress(false);
      fetchProfile(userId, cancelled);
      fetchDashboardData(cancelled);
    },
    [fetchProfile, fetchDashboardData],
  );

  const handleNoSession = useCallback((cancelled: { current: boolean }) => {
    if (cancelled.current) return;
    setUser(null);
    setProfile(null);
    setIsPasswordResetInProgress(false);
    setLoading(false);
    dataFetchedRef.current = false;
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
          handleNormalSession(session.user.id, cancelledRef);
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

  const value = useMemo(
    () => ({
      supabase,
      user,
      data,
      profile,
      loading,
      isConfigured,
      isPasswordResetInProgress,
      updateData,
      logout,
    }),
    [supabase, user, data, profile, loading, isConfigured, isPasswordResetInProgress, updateData, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
