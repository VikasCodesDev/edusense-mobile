'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { clearAuthSession, readSessionValue, writeSessionValue } from '@/lib/sessionStorage';

export interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  studentId?: string;
  department?: string;
}

interface AuthContextType {
  user: User | null;
  studentData: any | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string, role?: 'student' | 'faculty' | 'admin', rememberMe?: boolean) => Promise<{ success: boolean; role?: string; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [studentData, setStudentData] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const persistSessionRef = useRef(true);

  const refreshUser = useCallback(async () => {
    let savedToken: string | null = null;
    try {
      savedToken = await readSessionValue('edusense_token');
      if (!savedToken) {
        setUser(null);
        setStudentData(null);
        setToken(null);
        return;
      }

      setToken(savedToken);
      const response = await api.get('/auth/me');
      if (response.data?.success) {
        const verifiedUser = response.data.user as User;
        setUser(verifiedUser);
        setStudentData(response.data.student || null);
        await writeSessionValue('edusense_user', JSON.stringify(verifiedUser), persistSessionRef.current);
      }
    } catch (error: any) {
      // A network/configuration error is not proof that a token is invalid.
      // Keep the credential securely stored, but do not grant a verified role
      // until the backend confirms it again. A 401 handler clears the session.
      if (error?.response?.status === 401) {
        await clearAuthSession().catch(() => undefined);
        setToken(null);
      }
      setUser(null);
      setStudentData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
      setStudentData(null);
      setToken(null);
      navigate('/login', { replace: true });
    };
    const onApiChanged = () => {
      setUser(null);
      setStudentData(null);
      setToken(null);
      void refreshUser();
    };
    window.addEventListener('edusense:unauthorized', onUnauthorized);
    window.addEventListener('edusense:api-config-changed', onApiChanged);
    return () => {
      window.removeEventListener('edusense:unauthorized', onUnauthorized);
      window.removeEventListener('edusense:api-config-changed', onApiChanged);
    };
  }, [navigate, refreshUser]);

  const login = async (
    email: string,
    pass: string,
    role?: 'student' | 'faculty' | 'admin',
    rememberMe = true,
  ) => {
    try {
      const response = await api.post('/auth/login', { email, password: pass, role });
      if (!response.data?.success || !response.data?.token || !response.data?.user) {
        return { success: false, error: 'Login failed. The backend returned an incomplete response.' };
      }

      const receivedToken = String(response.data.token);
      const receivedUser = response.data.user as User;
      persistSessionRef.current = rememberMe;
      await writeSessionValue('edusense_token', receivedToken, rememberMe);
      await writeSessionValue('edusense_user', JSON.stringify(receivedUser), rememberMe);
      setToken(receivedToken);
      setUser(receivedUser);
      await refreshUser();
      return { success: true, role: receivedUser.role };
    } catch (error: any) {
      if (error?.response?.data?.error) return { success: false, error: error.response.data.error };
      if (error?.name === 'ApiConfigurationError') return { success: false, error: error.message };
      if (error?.message && error.message.includes('SecureStorage')) {
        return { success: false, error: 'Secure session storage is unavailable. Update the app or device and try again; the token was not saved in plaintext.' };
      }
      return {
        success: false,
        error: !error?.response
          ? error?.message || 'The EduSense server is unavailable. Check your connection and try again.'
          : 'Invalid credentials. Please try again.',
      };
    }
  };

  const logout = async () => {
    await clearAuthSession().catch(() => undefined);
    setUser(null);
    setStudentData(null);
    setToken(null);
    navigate('/login', { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, studentData, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
