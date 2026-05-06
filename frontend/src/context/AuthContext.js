import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    authAPI
      .profile()
      .then((res) => {
        if (!cancelled) setUser(res.data.user || res.data);
      })
      .catch(() => {
        localStorage.removeItem('token');
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (credentials) => {
    const res = await authAPI.login(credentials);
    const token = res.data.token || res.data.key || 'loggedin';
    localStorage.setItem('token', token);
    setUser(res.data.user || { phone: credentials.phone });
    return res;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (_) {
      // The local session is cleared even if the backend logout request fails.
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  const value = { user, login, logout, loading, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
