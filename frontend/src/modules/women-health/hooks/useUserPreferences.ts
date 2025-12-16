// 用户偏好设置管理Hook
import { useState, useEffect, useCallback } from 'react';
import { UserPreferences } from '../types/health.types';
import { DataStorageManager } from '../utils/dataStorage';

interface UseUserPreferencesReturn {
  // 偏好设置状态
  preferences: UserPreferences;
  loading: boolean;
  error: string | null;
  
  // 更新方法
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  
  // 特定设置的操作方法
  toggleNotifications: () => Promise<void>;
  setTheme: (theme: UserPreferences['theme']) => Promise<void>;
  setCycleLength: (length: number) => Promise<void>;
  setPeriodLength: (length: number) => Promise<void>;
  
  // 验证方法
  validateCycleLength: (length: number) => boolean;
  validatePeriodLength: (length: number) => boolean;
  validateNotificationTime: (time: string) => boolean;
}

export const useUserPreferences = (): UseUserPreferencesReturn => {
  const [preferences, setPreferences] = useState<UserPreferences>(getDefaultPreferences());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载偏好设置
  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 初始化存储系统
      await DataStorageManager.initialize();
      
      // 获取偏好设置
      const userPreferences = await DataStorageManager.getUserPreferences();
      setPreferences(userPreferences);
      
    } catch (err) {
      console.error('加载用户偏好设置失败:', err);
      setError(err instanceof Error ? err.message : '加载偏好设置失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 更新偏好设置
  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    try {
      setError(null);
      
      // 验证更新数据
      if (!validatePreferencesUpdates(updates)) {
        throw new Error('偏好设置数据无效');
      }
      
      // 更新本地状态
      const newPreferences = { ...preferences, ...updates, updatedAt: new Date() };
      setPreferences(newPreferences);
      
      // 保存到存储
      await DataStorageManager.saveUserPreferences(newPreferences);
      
    } catch (err) {
      console.error('更新偏好设置失败:', err);
      setError(err instanceof Error ? err.message : '更新偏好设置失败');
      
      // 恢复原始状态
      await loadPreferences();
      throw err;
    }
  }, [preferences, loadPreferences]);

  // 重置为默认设置
  const resetToDefaults = useCallback(async () => {
    try {
      setError(null);
      
      const defaultPreferences = getDefaultPreferences();
      setPreferences(defaultPreferences);
      
      await DataStorageManager.saveUserPreferences(defaultPreferences);
      
    } catch (err) {
      console.error('重置偏好设置失败:', err);
      setError(err instanceof Error ? err.message : '重置偏好设置失败');
      throw err;
    }
  }, []);

  // 切换通知开关
  const toggleNotifications = useCallback(async () => {
    await updatePreferences({
      enableNotifications: !preferences.enableNotifications
    });
  }, [preferences.enableNotifications, updatePreferences]);

  // 设置主题
  const setTheme = useCallback(async (theme: UserPreferences['theme']) => {
    await updatePreferences({ theme });
  }, [updatePreferences]);

  // 设置周期长度
  const setCycleLength = useCallback(async (length: number) => {
    if (!validateCycleLength(length)) {
      throw new Error('周期长度无效');
    }
    await updatePreferences({ cycleLength: length });
  }, [updatePreferences]);

  // 设置经期长度
  const setPeriodLength = useCallback(async (length: number) => {
    if (!validatePeriodLength(length)) {
      throw new Error('经期长度无效');
    }
    await updatePreferences({ periodLength: length });
  }, [updatePreferences]);

  // 验证方法
  const validateCycleLength = useCallback((length: number): boolean => {
    return length >= 21 && length <= 35;
  }, []);

  const validatePeriodLength = useCallback((length: number): boolean => {
    return length >= 2 && length <= 10;
  }, []);

  const validateNotificationTime = useCallback((time: string): boolean => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }, []);

  // 初始化加载偏好设置
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    resetToDefaults,
    toggleNotifications,
    setTheme,
    setCycleLength,
    setPeriodLength,
    validateCycleLength,
    validatePeriodLength,
    validateNotificationTime
  };
};

// 获取默认偏好设置
function getDefaultPreferences(): UserPreferences {
  return {
    cycleLength: 28,
    periodLength: 5,
    enableNotifications: true,
    notificationTime: '09:00',
    theme: 'auto',
    showFertilityWindow: true,
    showOvulationPrediction: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

// 验证偏好设置更新数据
function validatePreferencesUpdates(updates: Partial<UserPreferences>): boolean {
  if (updates.cycleLength !== undefined && (updates.cycleLength < 21 || updates.cycleLength > 35)) {
    return false;
  }
  
  if (updates.periodLength !== undefined && (updates.periodLength < 2 || updates.periodLength > 10)) {
    return false;
  }
  
  if (updates.notificationTime !== undefined && !/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(updates.notificationTime)) {
    return false;
  }
  
  if (updates.theme !== undefined && !['light', 'dark', 'auto'].includes(updates.theme)) {
    return false;
  }
  
  return true;
}

// 导出主题相关的辅助函数
export const useThemePreference = () => {
  const { preferences, setTheme } = useUserPreferences();
  
  const getCurrentTheme = useCallback((): 'light' | 'dark' => {
    if (preferences.theme === 'auto') {
      // 根据系统偏好自动选择
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return preferences.theme;
  }, [preferences.theme]);

  return {
    currentTheme: getCurrentTheme(),
    setTheme,
    themePreference: preferences.theme
  };
};

// 导出通知相关的辅助函数
export const useNotificationPreference = () => {
  const { preferences, toggleNotifications, updatePreferences } = useUserPreferences();
  
  const setNotificationTime = useCallback(async (time: string) => {
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
      throw new Error('通知时间格式无效');
    }
    await updatePreferences({ notificationTime: time });
  }, [updatePreferences]);

  return {
    notificationsEnabled: preferences.enableNotifications,
    notificationTime: preferences.notificationTime,
    toggleNotifications,
    setNotificationTime
  };
};