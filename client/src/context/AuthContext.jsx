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

  const login = async (username, password, selectedTeam, portalMode) => {
    setAuthError(null);
    try {
      const res = await api.auth.login({ username, password, selectedTeam, portalMode });
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

  const [isImpersonated, setIsImpersonated] = useState(
    () => typeof window !== 'undefined' && !!sessionStorage.getItem('kho_kho_superadmin_backup_token')
  );

  const impersonateUser = async (targetUserId) => {
    try {
      const currentToken = localStorage.getItem('kho_kho_token');
      if (!sessionStorage.getItem('kho_kho_superadmin_backup_token')) {
        sessionStorage.setItem('kho_kho_superadmin_backup_token', currentToken || '');
      }

      const res = await api.auth.impersonate(targetUserId);
      if (res && res.user) {
        if (res.token) {
          localStorage.setItem('kho_kho_token', res.token);
        }
        setUser(res.user);
        setIsImpersonated(true);
        return { success: true, user: res.user };
      }
      throw new Error(res.message || 'Failed to access user account');
    } catch (err) {
      return { success: false, message: err.message || 'Failed to switch user view' };
    }
  };

  const exitImpersonation = async () => {
    try {
      const backupToken = sessionStorage.getItem('kho_kho_superadmin_backup_token');
      if (backupToken) {
        localStorage.setItem('kho_kho_token', backupToken);
      }
      sessionStorage.removeItem('kho_kho_superadmin_backup_token');
      setIsImpersonated(false);

      const res = await api.auth.getMe();
      if (res && res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.error('Failed to exit impersonation:', err);
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
      sessionStorage.removeItem('kho_kho_superadmin_backup_token');
      setIsImpersonated(false);
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
        isImpersonated,
        currentTeam,
        login,
        logout,
        impersonateUser,
        exitImpersonation,
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
