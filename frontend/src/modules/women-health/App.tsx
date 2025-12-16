import React, { useState, useEffect } from 'react';
import WomenHealthPage from './pages/WomenHealthPage';
import { checkSystemHealth } from '../services/desktopService';

interface AppInfo {
  isDesktop: boolean;
  version: string;
  status: string;
  health?: any;
  error?: string;
  message?: string;
}

const WomenHealthApp: React.FC = () => {
  const [appInfo, setAppInfo] = useState<AppInfo>({
    isDesktop: false,
    version: 'v1.0.0',
    status: 'loading'
  });

  useEffect(() => {
    const checkEnvironment = async () => {
      const isDesktop = window.electronAPI !== undefined;
      
      if (isDesktop) {
        try {
          const healthResult = await checkSystemHealth();
          setAppInfo({
            isDesktop: true,
            version: window.electronAPI?.appInfo?.version || 'v1.0.0',
            status: healthResult.success ? 'ready' : 'error',
            health: healthResult.data
          });
        } catch (error) {
          setAppInfo({
            isDesktop: true,
            version: 'v1.0.0',
            status: 'error',
            error: error.message
          });
        }
      } else {
        setAppInfo({
          isDesktop: false,
          version: 'v1.0.0',
          status: 'web',
          message: 'Web版本功能受限，建议下载桌面应用以获得完整体验'
        });
      }
    };

    checkEnvironment();
  }, []);

  const handleBackToDashboard = () => {
    if (window.electronAPI) {
      // Electron环境下返回主应用
      window.electronAPI.navigateToDashboard?.();
    } else {
      // Web环境下返回首页
      window.location.href = '/';
    }
  };

  if (appInfo.status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">♀</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            加载中...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            正在初始化女性健康管理模块
          </p>
        </div>
      </div>
    );
  }

  return (
    <WomenHealthPage 
      appInfo={appInfo} 
      onBackToDashboard={handleBackToDashboard}
    />
  );
};

export default WomenHealthApp;