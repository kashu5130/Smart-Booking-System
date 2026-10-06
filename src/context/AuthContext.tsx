import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types.ts';
import { api } from '../lib/api.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; role?: 'customer' | 'provider'; phone?: string }) => Promise<void>;
  logout: () => void;
  switchPersona: (personaId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    try {
      const token = api.getToken();
      if (token) {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          setLoading(false);
          return;
        }
      }

      // Default initial persona for instant seamless evaluation
      const demoRes = await api.switchPersona('customer1');
      if (demoRes.success && demoRes.user) {
        setUser(demoRes.user);
      }
    } catch (err) {
      console.warn('Auth init fallback to demo persona:', err);
      try {
        const demoRes = await api.switchPersona('customer1');
        if (demoRes.success && demoRes.user) {
          setUser(demoRes.user);
        }
      } catch (innerErr) {
        console.error('Failed to init fallback persona:', innerErr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    if (res.user) {
      setUser(res.user);
    }
  };

  const register = async (data: { name: string; email: string; password: string; role?: 'customer' | 'provider'; phone?: string }) => {
    const res = await api.register(data);
    if (res.user) {
      setUser(res.user);
    }
  };

  const logout = () => {
    api.clearToken();
    setUser(null);
  };

  const switchPersona = async (personaId: string) => {
    setLoading(true);
    try {
      const res = await api.switchPersona(personaId);
      if (res.user) {
        setUser(res.user);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.getMe();
      if (res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, switchPersona, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
