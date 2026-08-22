import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem('dayflow_theme') || 'dark');

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-dark', 'theme-slate', 'theme-light', 'dark');

    if (theme === 'dark') {
      root.classList.add('dark', 'theme-dark');
    } else if (theme === 'slate') {
      root.classList.add('dark', 'theme-slate');
    } else if (theme === 'light') {
      root.classList.add('theme-light');
    }

    localStorage.setItem('dayflow_theme', theme);
  }, [theme]);

  const toggleTheme = (newTheme) => {
    if (newTheme) {
      setTheme(newTheme);
    } else {
      setTheme((prev) => (prev === 'dark' ? 'slate' : prev === 'slate' ? 'light' : 'dark'));
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
