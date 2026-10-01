// Day 4: Supabase Auth and Role-Based Access Control (RBAC)
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (currentSession) => {
    try {
      const res = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${currentSession.access_token}` },
      });
      setProfile(res.data.profile);
    } catch (err) {
      setProfile(null);
      // A 401 here means the stored session is invalid/expired. Sign out so the
      // app doesn't keep re-requesting /auth/me with a dead token on every load.
      if (err?.status === 401) {
        await supabase.auth.signOut().catch(() => {});
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    if (data?.session) await fetchProfile(data.session);
  }, [fetchProfile]);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session) {
        fetchProfile(data.session);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!active) return;
      setSession(newSession);
      if (newSession) {
        fetchProfile(newSession);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      sub?.subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async ({ email, password, fullName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role_type: 'resident' } },
    });
    if (error) throw error;
    return data;
  };

  const signOut = () => supabase.auth.signOut();

  const value = { session, profile, loading, signIn, signUp, signOut, refreshProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
