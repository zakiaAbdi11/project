import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('pos_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('pos_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate token on mount
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('pos_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('pos_user', JSON.stringify(res.user));
          } else {
            logout();
          }
        } catch (err) {
          console.warn('[Offline Auth] Session verification failed, local fallback kept if offline:', err.message);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (username, password) => {
    const res = await api.login(username, password);
    if (res.success && res.token && res.user) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('pos_token', res.token);
      localStorage.setItem('pos_user', JSON.stringify(res.user));
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
  };

  const isAdmin = user && user.role === 'admin';
  const isCashier = user && user.role === 'cashier';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAdmin,
        isCashier,
        isAuthenticated: !!token && !!user,
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
