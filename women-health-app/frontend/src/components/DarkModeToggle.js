import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme, THEMES } = useTheme();

  // 根据当前主题渲染不同的图标
  const renderThemeIcon = () => {
    switch (theme) {
      case THEMES.PURPLE:
        return (
          // 紫色主题图标 - 淡紫色主题
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        );
      case THEMES.DARK:
        return (
          // 月亮图标 - 暗色主题
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        );
      case THEMES.PINK:
        return (
          // 花朵图标 - 粉色主题
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  // 根据当前主题获取按钮样式
  const getButtonStyle = () => {
    switch (theme) {
      case THEMES.PURPLE:
        return "bg-purple-100 border-2 border-purple-300 text-purple-700 hover:bg-purple-200";
      case THEMES.DARK:
        return "bg-gray-800 border-2 border-gray-600 text-gray-200 hover:bg-gray-700";
      case THEMES.PINK:
        return "bg-pink-100 border-2 border-pink-300 text-pink-700 hover:bg-pink-200";
      default:
        return "bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50";
    }
  };

  // 获取工具提示文本
  const getTooltipText = () => {
    switch (theme) {
      case THEMES.PURPLE:
        return "切换至暗色模式";
      case THEMES.DARK:
        return "切换至粉色模式";
      case THEMES.PINK:
        return "切换至淡紫色模式";
      default:
        return "切换主题";
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-full ${getButtonStyle()} transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50`}
        aria-label={getTooltipText()}
      >
        {renderThemeIcon()}
      </button>
      
      {/* 工具提示 */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        {getTooltipText()}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
      </div>
      
      {/* 主题指示器 */}
                <div className="flex justify-center mt-1 space-x-1">
                  <div className={`w-1 h-1 rounded-full ${theme === THEMES.PURPLE ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                  <div className={`w-1 h-1 rounded-full ${theme === THEMES.DARK ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                  <div className={`w-1 h-1 rounded-full ${theme === THEMES.PINK ? 'bg-purple-500' : 'bg-gray-300'}`}></div>
                </div>
    </div>
  );
};

export default ThemeToggle;