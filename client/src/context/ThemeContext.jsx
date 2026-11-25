import React, { createContext, useContext, useLayoutEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Permanently enforce light mode across the site
  useLayoutEffect(() => {
    try {
      const root = document.documentElement;
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
      localStorage.removeItem('khokho_theme');
    } catch (e) {
      console.warn('Theme enforcement notice:', e);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: 'light', isDark: false, toggleTheme: () => {}, setTheme: () => {} }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    return { theme: 'light', isDark: false, toggleTheme: () => {}, setTheme: () => {} };
  }
  return context;
}

