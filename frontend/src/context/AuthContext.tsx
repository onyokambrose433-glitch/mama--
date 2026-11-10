import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../api/client';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: Record<string, string>) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isStaff: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('mama_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('mama_access_token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await apiClient.get<User>('/auth/me/');
      setUser(res.data);
      localStorage.setItem('mama_user', JSON.stringify(res.data));
    } catch {
      setUser(null);
      localStorage.removeItem('mama_user');
      localStorage.removeItem('mama_access_token');
      localStorage.removeItem('mama_refresh_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();

    const handleLogout = () => {
      setUser(null);
    };
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await apiClient.post('/auth/login/', { email, password });
      const { user: userData, tokens } = res.data;
      localStorage.setItem('mama_access_token', tokens.access);
      localStorage.setItem('mama_refresh_token', tokens.refresh);
      localStorage.setItem('mama_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid email or password.';
      return { success: false, error: msg };
    }
  };

  const register = async (data: Record<string, string>) => {
    try {
      const res = await apiClient.post('/auth/register/', data);
      const { user: userData, tokens } = res.data;
      localStorage.setItem('mama_access_token', tokens.access);
      localStorage.setItem('mama_refresh_token', tokens.refresh);
      localStorage.setItem('mama_user', JSON.stringify(userData));
      setUser(userData);
      return { success: true };
    } catch (err: any) {
      const errors = err.response?.data;
      let msg = 'Registration failed. Please check your information.';
      if (typeof errors === 'object' && errors !== null) {
        const firstKey = Object.keys(errors)[0];
        msg = Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey];
      }
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('mama_access_token');
    localStorage.removeItem('mama_refresh_token');
    localStorage.removeItem('mama_user');
    setUser(null);
    window.location.href = '/';
  };

  const isStaff = Boolean(
    user && (user.is_superuser || user.is_staff || user.role !== 'customer')
  );

  const isSuperAdmin = Boolean(
    user && (user.is_superuser || user.role === 'super_admin')
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isStaff,
        isSuperAdmin,
      }}
    >
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
