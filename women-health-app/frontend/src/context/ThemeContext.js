import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// 定义可用的主题
const THEMES = {
  PURPLE: 'purple',
  DARK: 'dark',
  PINK: 'pink'
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(THEMES.PURPLE);

  useEffect(() => {
    // Check for saved theme in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
      setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? THEMES.DARK : THEMES.PURPLE);
    }
  }, []);

  useEffect(() => {
    // Remove all theme classes
    document.documentElement.classList.remove(THEMES.PURPLE, THEMES.DARK, THEMES.PINK);
    
    // Apply current theme class
    document.documentElement.classList.add(theme);
    
    // Save theme preference
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    // 循环切换主题: purple -> dark -> pink -> purple
    setTheme(prevTheme => {
      if (prevTheme === THEMES.PURPLE) return THEMES.DARK;
      if (prevTheme === THEMES.DARK) return THEMES.PINK;
      return THEMES.PURPLE;
    });
  };

  const setThemeMode = (mode) => {
    if (Object.values(THEMES).includes(mode)) {
      setTheme(mode);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemeMode, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};