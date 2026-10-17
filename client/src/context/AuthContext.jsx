import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check current session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.auth.getMe();
        if (res && res.user) {
          setUser(res.user);
        }
      } catch (err) {
        // Not authenticated
        setUser(null);
        localStorage.removeItem('kho_kho_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username, password, selectedTeam) => {
    setAuthError(null);
    try {
      const res = await api.auth.login({ username, password, selectedTeam });
      if (res && res.user) {
        setUser(res.user);
        if (res.token) {
          localStorage.setItem('kho_kho_token', res.token);
        }
        return { success: true, user: res.user };
      }
      throw new Error('Invalid login response');
    } catch (err) {
      const message = err.data?.message || err.message || 'Login failed. Please check your credentials.';
      setAuthError(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.warn('Logout API call failed:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('kho_kho_token');
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.auth.getMe();
      if (res && res.user) setUser(res.user);
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const isBoysAdmin = user?.role === 'BOYS_ADMIN';
  const isGirlsAdmin = user?.role === 'GIRLS_ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isPlayer = user?.role === 'PLAYER';
  const isAdmin = isBoysAdmin || isGirlsAdmin || isSuperAdmin;
  const currentTeam = user?.team || 'ALL';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        authError,
        isBoysAdmin,
        isGirlsAdmin,
        isSuperAdmin,
        isPlayer,
        isAdmin,
        currentTeam,
        login,
        logout,
        refreshUser,
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
