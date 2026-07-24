'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import {
  setTokens,
  clearTokens,
  getAccessToken,
  getStoredUser,
  setStoredUser,
} from '@/lib/auth';
import type { AuthResponse } from '@/types';

export function useAuth() {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      return;
    }
    const stored = getStoredUser();
    setUser(stored);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.post<AuthResponse>('/api/auth/login', { email, password });
      setTokens(data.accessToken, data.refreshToken);
      setStoredUser(data.user);
      setUser(data.user);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.post<AuthResponse>('/api/auth/register', { email, password });
      setTokens(data.accessToken, data.refreshToken);
      setStoredUser(data.user);
      setUser(data.user);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout', {});
    } catch {
      // ignore logout errors
    }
    clearTokens();
    setUser(null);
  }, []);

  return { user, loading, error, login, register, logout };
}
