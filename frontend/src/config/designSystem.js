/**
 * 统一设计系统配置
 * 为所有Tab页面提供一致的视觉设计语言
 */

export const designSystem = {
  // 颜色系统
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    },
    secondary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e'
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d'
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    }
  },
  
  // 间距系统
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem'    // 96px
  },
  
  // 字体系统
  typography: {
    fontSize: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem' // 36px
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75'
    }
  },
  
  // 圆角系统
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px'
  },
  
  // 阴影系统
  shadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  
  // 组件样式规范
  components: {
    // 卡片组件
    card: {
      base: 'bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700',
      padding: 'p-6',
      header: 'mb-4',
      title: 'text-xl font-semibold text-gray-900 dark:text-white',
      subtitle: 'text-sm text-gray-600 dark:text-gray-400'
    },
    
    // 按钮组件
    button: {
      base: 'inline-flex items-center justify-center rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
      sizes: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
      },
      variants: {
        primary: 'bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-500',
        secondary: 'bg-secondary-500 hover:bg-secondary-600 text-white focus:ring-secondary-500',
        success: 'bg-success-500 hover:bg-success-600 text-white focus:ring-success-500',
        warning: 'bg-warning-500 hover:bg-warning-600 text-white focus:ring-warning-500',
        error: 'bg-error-500 hover:bg-error-600 text-white focus:ring-error-500',
        outline: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
      }
    },
    
    // 标签页组件
    tabs: {
      container: 'flex border-b border-gray-200 dark:border-gray-700',
      tab: {
        base: 'flex-1 py-4 px-6 text-center font-medium text-sm transition-colors border-b-2',
        inactive: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 border-transparent',
        active: 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900 dark:bg-opacity-30 border-primary-500 dark:border-primary-400'
      }
    },
    
    // 输入框组件
    input: {
      base: 'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
      sizes: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
      }
    },
    
    // 徽章组件
    badge: {
      base: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variants: {
        primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300',
        secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-300',
        success: 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300',
        warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-300',
        error: 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-300',
        gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      }
    }
  }
};

/**
 * 获取组件类名工具函数
 */
export const getComponentClasses = {
  card: (config = {}) => {
    const { padding = true, className = '' } = config;
    return `${designSystem.components.card.base} ${padding ? designSystem.components.card.padding : ''} ${className}`;
  },
  
  button: (variant = 'primary', size = 'md', disabled = false, className = '') => {
    const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';
    return `${designSystem.components.button.base} ${designSystem.components.button.sizes[size]} ${designSystem.components.button.variants[variant]} ${disabledClass} ${className}`;
  },
  
  tabs: {
    container: designSystem.components.tabs.container,
    tab: (isActive) => {
      const base = designSystem.components.tabs.tab.base;
      const state = isActive ? designSystem.components.tabs.tab.active : designSystem.components.tabs.tab.inactive;
      return `${base} ${state}`;
    }
  },
  
  input: (size = 'md', className = '') => {
    return `${designSystem.components.input.base} ${designSystem.components.input.sizes[size]} ${className}`;
  },
  
  badge: (variant = 'primary', className = '') => {
    return `${designSystem.components.badge.base} ${designSystem.components.badge.variants[variant]} ${className}`;
  }
};

/**
 * 深色模式工具类
 */
export const darkMode = {
  text: {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-600 dark:text-gray-400',
    muted: 'text-gray-500 dark:text-gray-500'
  },
  
  bg: {
    primary: 'bg-white dark:bg-gray-800',
    secondary: 'bg-gray-50 dark:bg-gray-900',
    muted: 'bg-gray-100 dark:bg-gray-700'
  },
  
  border: {
    primary: 'border-gray-200 dark:border-gray-700',
    secondary: 'border-gray-300 dark:border-gray-600'
  }
};

/**
 * 响应式断点工具
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
};

export default designSystem;