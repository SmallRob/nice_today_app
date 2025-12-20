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
  PINK: 'pink',
  SYSTEM: 'system' // 新增系统主题选项
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(THEMES.PURPLE);
  const [isSystemTheme, setIsSystemTheme] = useState(false);

  // 获取系统主题偏好
  const getSystemTheme = () => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.PURPLE;
  };

  // 应用主题到文档
  const applyTheme = (themeToApply) => {
    // Remove all theme classes
    document.documentElement.classList.remove(THEMES.PURPLE, THEMES.DARK, THEMES.PINK);
    
    // Apply current theme class
    document.documentElement.classList.add(themeToApply);
  };

  useEffect(() => {
    // 检查保存的主题
    const savedTheme = localStorage.getItem('theme');
    const savedIsSystemTheme = localStorage.getItem('isSystemTheme') === 'true';

    if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
      if (savedTheme === THEMES.SYSTEM || savedIsSystemTheme) {
        // 系统主题模式
        setIsSystemTheme(true);
        const systemTheme = getSystemTheme();
        setTheme(systemTheme);
        applyTheme(systemTheme);
      } else {
        // 手动选择主题
        setIsSystemTheme(false);
        setTheme(savedTheme);
        applyTheme(savedTheme);
      }
    } else {
      // 默认使用系统主题
      setIsSystemTheme(true);
      const systemTheme = getSystemTheme();
      setTheme(systemTheme);
      applyTheme(systemTheme);
      localStorage.setItem('theme', THEMES.SYSTEM);
      localStorage.setItem('isSystemTheme', 'true');
    }
  }, []);

  // 监听系统主题变化
  useEffect(() => {
    if (!isSystemTheme) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      const newSystemTheme = e.matches ? THEMES.DARK : THEMES.PURPLE;
      setTheme(newSystemTheme);
      applyTheme(newSystemTheme);
    };

    // 添加监听器
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [isSystemTheme]);

  // 保存主题设置
  useEffect(() => {
    if (isSystemTheme) {
      localStorage.setItem('theme', THEMES.SYSTEM);
      localStorage.setItem('isSystemTheme', 'true');
    } else {
      localStorage.setItem('theme', theme);
      localStorage.setItem('isSystemTheme', 'false');
    }
  }, [theme, isSystemTheme]);

  const toggleTheme = () => {
    if (isSystemTheme) {
      // 从系统主题切换到手动选择
      setIsSystemTheme(false);
      const currentSystemTheme = getSystemTheme();
      // 切换到下一个主题
      const nextTheme = currentSystemTheme === THEMES.PURPLE ? THEMES.DARK : 
                       currentSystemTheme === THEMES.DARK ? THEMES.PINK : THEMES.PURPLE;
      setTheme(nextTheme);
      applyTheme(nextTheme);
    } else {
      // 手动主题循环切换
      setTheme(prevTheme => {
        if (prevTheme === THEMES.PURPLE) return THEMES.DARK;
        if (prevTheme === THEMES.DARK) return THEMES.PINK;
        return THEMES.PURPLE;
      });
    }
  };

  const setThemeMode = (mode) => {
    if (Object.values(THEMES).includes(mode)) {
      if (mode === THEMES.SYSTEM) {
        setIsSystemTheme(true);
        const systemTheme = getSystemTheme();
        setTheme(systemTheme);
        applyTheme(systemTheme);
      } else {
        setIsSystemTheme(false);
        setTheme(mode);
        applyTheme(mode);
      }
    }
  };

  const enableSystemTheme = () => {
    setIsSystemTheme(true);
    const systemTheme = getSystemTheme();
    setTheme(systemTheme);
    applyTheme(systemTheme);
  };

  const disableSystemTheme = () => {
    setIsSystemTheme(false);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      setThemeMode, 
      THEMES,
      isSystemTheme,
      enableSystemTheme,
      disableSystemTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
};