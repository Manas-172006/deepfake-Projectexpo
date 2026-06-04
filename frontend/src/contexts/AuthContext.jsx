/**
 * AuthContext — FakeProof Labs
 * Frontend-only demo authentication using localStorage
 */

import { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth from localStorage on mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = localStorage.getItem('authenticated');
      if (authenticated === 'true') {
        const userData = {
          name: localStorage.getItem('userName') || 'Guest User',
          email: localStorage.getItem('userEmail') || 'guest@fakeproof.labs',
          isGuest: localStorage.getItem('isGuest') === 'true',
        };
        setUser(userData);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = useCallback((email, password) => {
    // Demo validation
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const userName = email.split('@')[0];
    localStorage.setItem('authenticated', 'true');
    localStorage.setItem('userName', userName);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('isGuest', 'false');

    const userData = {
      name: userName,
      email,
      isGuest: false,
    };

    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  }, []);

  const signup = useCallback((name, email, password) => {
    // Demo validation
    if (!name || !email || !password) {
      throw new Error('All fields are required');
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Invalid email format');
    }

    // Password validation (minimum 6 characters)
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    localStorage.setItem('authenticated', 'true');
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('isGuest', 'false');

    const userData = {
      name,
      email,
      isGuest: false,
    };

    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  }, []);

  const loginAsGuest = useCallback(() => {
    const guestName = `Guest_${Math.random().toString(36).substr(2, 9)}`;
    const guestEmail = `${guestName}@guest.fakeproof.labs`;

    localStorage.setItem('authenticated', 'true');
    localStorage.setItem('userName', guestName);
    localStorage.setItem('userEmail', guestEmail);
    localStorage.setItem('isGuest', 'true');

    const userData = {
      name: guestName,
      email: guestEmail,
      isGuest: true,
    };

    setUser(userData);
    setIsAuthenticated(true);
    return userData;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authenticated');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('isGuest');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    loginAsGuest,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = window.authContext || {};
  return context;
};
