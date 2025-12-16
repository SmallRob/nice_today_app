// 女性健康管理主模块组件
import React, { useState } from 'react';
import CalendarView from './CalendarView';
import HealthRecordComponent from './HealthRecord';
import PredictionEngineComponent from './PredictionEngine';
import AnalyticsView from './AnalyticsView';

interface WomenHealthTabProps {
  serviceStatus?: boolean;
  isDesktop?: boolean;
}

const WomenHealthTab: React.FC<WomenHealthTabProps> = ({ 
  serviceStatus = true, 
  isDesktop = false 
}) => {
  const [activeView, setActiveView] = useState<'calendar' | 'record' | 'prediction' | 'analytics'>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // 视图配置
  const views = [
    { id: 'calendar', label: '日历视图', icon: '📅', description: '查看周期阶段和预测事件' },
    { id: 'record', label: '健康记录', icon: '📝', description: '记录身体状况和情绪变化' },
    { id: 'prediction', label: '预测引擎', icon: '🔮', description: '智能预测和周期分析' },
    { id: 'analytics', label: '数据分析', icon: '📊', description: '统计图表和健康洞察' }
  ];

  // 服务状态提示
  if (!serviceStatus && isDesktop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl">💖</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            女性健康管理
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            女性健康计算服务暂时不可用，建议检查系统环境或重启应用
          </p>
          <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
              💡 Web版本功能受限，建议下载桌面应用以获得完整体验
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 dark:from-gray-800 dark:to-gray-900">
      {/* 模块标题 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-white text-xl">💖</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">女性健康管理</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  科学预测，贴心关怀，助力女性健康生活
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isDesktop 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              }`}>
                {isDesktop ? '💻 桌面版' : '🌐 Web版'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 视图导航 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 mb-6">
          <div className="flex border-b dark:border-gray-700">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id as any)}
                className={`flex-1 py-4 px-6 text-center font-medium text-sm transition-colors ${
                  activeView === view.id
                    ? 'bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900 dark:to-purple-900 dark:bg-opacity-20 text-pink-600 dark:text-pink-400 border-b-2 border-pink-500 dark:border-pink-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-lg">{view.icon}</span>
                  <span>{view.label}</span>
                </div>
              </button>
            ))}
          </div>

          {/* 视图内容 */}
          <div className="p-6">
            {activeView === 'calendar' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {views.find(v => v.id === 'calendar')?.label}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {views.find(v => v.id === 'calendar')?.description}
                  </p>
                </div>
                <CalendarView 
                  selectedDate={selectedDate}
                  onDateClick={setSelectedDate}
                />
              </div>
            )}

            {activeView === 'record' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {views.find(v => v.id === 'record')?.label}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {views.find(v => v.id === 'record')?.description}
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <CalendarView 
                      selectedDate={selectedDate}
                      onDateClick={setSelectedDate}
                      className="h-full"
                    />
                  </div>
                  <div>
                    <HealthRecordComponent 
                      selectedDate={selectedDate}
                      onRecordSaved={() => {
                        // 可以在这里添加记录保存后的回调
                        console.log('记录已保存');
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeView === 'prediction' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {views.find(v => v.id === 'prediction')?.label}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {views.find(v => v.id === 'prediction')?.description}
                  </p>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <PredictionEngineComponent />
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-4">预测说明</h4>
                    <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-start">
                        <span className="text-pink-500 mr-2">•</span>
                        <span>基于您记录的历史周期数据，采用科学算法进行预测</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-pink-500 mr-2">•</span>
                        <span>记录越多周期数据，预测结果越准确</span>
                      </div>
                      <div className="flex items-start">
                        <span className="text-pink-500 mr-2">•</span>
                        <span>预测结果仅供参考，请结合自身实际情况</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeView === 'analytics' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {views.find(v => v.id === 'analytics')?.label}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {views.find(v => v.id === 'analytics')?.description}
                  </p>
                </div>
                <AnalyticsView />
              </div>
            )}
          </div>
        </div>

        {/* 功能说明卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {views.map((view) => (
            <div key={view.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 dark:bg-opacity-20 rounded-full flex items-center justify-center text-pink-600 dark:text-pink-400 mb-4">
                <span className="text-xl">{view.icon}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{view.label}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{view.description}</p>
            </div>
          ))}
        </div>

        {/* 应用优势说明 */}
        <div className="mt-8 bg-gradient-to-r from-pink-500 to-purple-600 dark:from-pink-600 dark:to-purple-700 rounded-lg shadow-lg text-white p-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
              <span className="text-xl">💝</span>
            </div>
            <h2 className="text-xl font-bold">女性健康管理优势</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <span className="text-green-300 mr-2 mt-0.5">✓</span>
              <div>
                <h4 className="font-semibold mb-1">科学预测算法</h4>
                <p className="text-pink-100 dark:text-pink-200 text-sm">
                  基于医学研究的经期预测算法，准确预测生理周期
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-green-300 mr-2 mt-0.5">✓</span>
              <div>
                <h4 className="font-semibold mb-1">隐私数据保护</h4>
                <p className="text-pink-100 dark:text-pink-200 text-sm">
                  所有数据本地存储，保护您的隐私安全
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-green-300 mr-2 mt-0.5">✓</span>
              <div>
                <h4 className="font-semibold mb-1">可视化分析</h4>
                <p className="text-pink-100 dark:text-pink-200 text-sm">
                  直观的图表展示，帮助您了解身体健康状况
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-green-300 mr-2 mt-0.5">✓</span>
              <div>
                <h4 className="font-semibold mb-1">贴心提醒</h4>
                <p className="text-pink-100 dark:text-pink-200 text-sm">
                  重要日期提醒，让您提前做好准备
                </p>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-pink-400 dark:border-pink-500">
            <p className="text-pink-100 dark:text-pink-200 text-sm italic">
              注意：本工具提供的预测和分析结果仅供参考，不能替代专业医疗建议。
              如有健康问题，请及时咨询专业医生。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WomenHealthTab;