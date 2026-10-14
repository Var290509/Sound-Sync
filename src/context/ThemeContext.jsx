import React, { createContext, useContext, useState, useEffect } from 'react';

export const THEMES = {
  IVORY: 'ivory',
  GOLD: 'gold',
  NAVY: 'deep-atlas-navy',
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('sound_sync_theme');
    return saved || THEMES.NAVY; // Default to Deep Atlas Navy
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('sound_sync_theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
