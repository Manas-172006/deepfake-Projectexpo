/**
 * ThemeContext — FakeProof Labs
 * Theme system for dark/light mode with localStorage persistence
 */

import { createContext, useState, useEffect, useCallback } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    let initialTheme = 'dark'; // Default to dark

    if (savedTheme) {
      initialTheme = savedTheme;
    } else if (prefersDark) {
      initialTheme = 'dark';
    }

    setTheme(initialTheme);
    applyTheme(initialTheme);
    setIsLoading(false);
  }, []);

  const applyTheme = useCallback((newTheme) => {
    const root = document.documentElement;

    if (newTheme === 'dark') {
      root.classList.remove('light-theme');
      root.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark');
    } else if (newTheme === 'light') {
      root.classList.remove('dark-theme');
      root.classList.add('light-theme');
      localStorage.setItem('theme', 'light');
    }

    setTheme(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  }, [theme, applyTheme]);

  const value = {
    theme,
    isLoading,
    toggleTheme,
    applyTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = window.themeContext || {};
  return context;
};
