import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('dayflow_token') || null);
  const [loading, setLoading] = useState(true);
  const [perspectiveUser, setPerspectiveUser] = useState(null); // For Admin switcher

  // Check current session on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await authAPI.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Session restore failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.success && res.token) {
      localStorage.setItem('dayflow_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setPerspectiveUser(null);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res.success && res.token) {
      localStorage.setItem('dayflow_token', res.token);
      setToken(res.token);
      setUser(res.user);
      setPerspectiveUser(null);
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const quickDemoLogin = async (type = 'admin') => {
    const creds = {
      admin: { email: 'admin@dayflow.com', password: 'Admin@123' },
      hr: { email: 'hr@dayflow.com', password: 'Hr@123' },
      alex: { email: 'alex.morgan@dayflow.com', password: 'User@123' },
      sarah: { email: 'sarah.chen@dayflow.com', password: 'User@123' },
      david: { email: 'david.kim@dayflow.com', password: 'User@123' },
    };

    const target = creds[type] || creds.admin;
    return await login(target.email, target.password);
  };

  const logout = () => {
    localStorage.removeItem('dayflow_token');
    setToken(null);
    setUser(null);
    setPerspectiveUser(null);
  };

  const updateUserProfile = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  // Active view: either actual logged-in user or switched employee perspective for Admin
  const activeUser = perspectiveUser || user;
  const isStaff = user?.role === 'admin' || user?.role === 'hr';

  return (
    <AuthContext.Provider
      value={{
        user,
        activeUser,
        perspectiveUser,
        setPerspectiveUser,
        token,
        loading,
        isStaff,
        login,
        register,
        logout,
        quickDemoLogin,
        updateUserProfile,
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
