import React, { useState } from 'react';
import { useCycleData } from '../hooks/useCycleData';
import { useHealthRecords } from '../hooks/useHealthRecords';
import { useUserPreferences } from '../hooks/useUserPreferences';
import CalendarView from '../components/CalendarView';
import HealthRecord from '../components/HealthRecord';
import AnalyticsView from '../components/AnalyticsView';
import PredictionEngine from '../components/PredictionEngine';

interface WomenHealthPageProps {
  appInfo: {
    isDesktop: boolean;
    version: string;
    status: string;
  };
  onBackToDashboard?: () => void;
}

const WomenHealthPage: React.FC<WomenHealthPageProps> = ({ appInfo, onBackToDashboard }) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'records' | 'analytics' | 'prediction'>('calendar');

  // 标签配置
  const tabs = [
    { id: 'calendar', label: '健康日历', icon: '📅', description: '查看周期预测和健康记录' },
    { id: 'records', label: '健康记录', icon: '📝', description: '记录每日健康状况和症状' },
    { id: 'analytics', label: '数据分析', icon: '📊', description: '查看健康趋势和统计信息' },
    { id: 'prediction', label: '周期预测', icon: '🔮', description: '经期预测和周期分析' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 transition-all duration-300">
      {/* 顶部导航栏 - Banner区域 */}
      <nav className="bg-gradient-to-r from-pink-500 via-purple-600 to-pink-500 dark:from-pink-600 dark:via-purple-700 dark:to-pink-600 shadow-lg transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBackToDashboard}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-all duration-300 border border-white/20"
              >
                <span className="text-lg">←</span>
                <span className="font-medium">返回主应用</span>
              </button>
              
              <div className="flex-shrink-0 flex items-center space-x-4">
                {/* Banner图标 */}
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <span className="text-white font-bold text-2xl">♀</span>
                </div>
                
                {/* Banner标题 */}
                <div className="text-left">
                  <h1 className="text-2xl font-bold text-white tracking-tight">
                    Nice Today
                  </h1>
                  <p className="text-pink-100 text-sm font-medium">
                    女性健康管理
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {appInfo.status === 'web' && (
                <div className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full border border-white/30">
                  Web版本
                </div>
              )}
              <div className="text-sm text-pink-100 dark:text-pink-200">
                版本 {appInfo.version}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 标签导航 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex space-x-1 bg-white/60 dark:bg-gray-800/60 rounded-lg p-1 backdrop-blur-sm border border-pink-100 dark:border-purple-600 shadow-sm transition-all duration-300 hover:shadow-md">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-pink-50 hover:to-purple-50 dark:hover:from-gray-700 dark:hover:to-gray-600'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-pink-200 dark:border-purple-700 p-6">
          {activeTab === 'calendar' && (
            <CalendarView />
          )}
          
          {activeTab === 'records' && (
            <HealthRecord />
          )}
          
          {activeTab === 'analytics' && (
            <AnalyticsView />
          )}
          
          {activeTab === 'prediction' && (
            <PredictionEngine />
          )}
        </div>
      </main>

      {/* 底部信息 */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
        <div className="bg-gradient-to-r from-transparent via-pink-50/50 to-transparent dark:via-gray-800/50 rounded-lg p-4 backdrop-blur-sm border border-pink-100/50 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            Nice Today | 女性健康管理 - 贴心关怀您的健康周期
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            经期日历 • 健康记录 • 数据分析 • 周期预测
          </p>
        </div>
      </footer>
    </div>
  );
};

export default WomenHealthPage;