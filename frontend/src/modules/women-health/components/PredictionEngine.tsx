// 经期预测引擎组件
import React, { useState, useEffect } from 'react';
import { CycleData, CyclePrediction, CycleStatistics, CYCLE_PHASES } from '../types/health.types';
import { PredictionEngine } from '../utils/predictionAlgorithm';
import { useCycleData } from '../hooks/useCycleData';

interface PredictionEngineProps {
  className?: string;
}

const PredictionEngineComponent: React.FC<PredictionEngineProps> = ({ className = '' }) => {
  const { cycles, prediction, statistics, loading, error } = useCycleData();
  const [currentPhase, setCurrentPhase] = useState<string | null>(null);

  // 计算当前周期阶段
  useEffect(() => {
    if (cycles.length > 0 && prediction) {
      const lastCycle = cycles[cycles.length - 1];
      const currentDate = new Date();
      
      const phase = PredictionEngine.getCurrentCyclePhase(
        currentDate,
        new Date(lastCycle.startDate),
        statistics.averageCycleLength || 28
      );
      
      setCurrentPhase(phase);
    }
  }, [cycles, prediction, statistics]);

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-800 rounded-lg p-6 ${className}`}>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center mr-3">
            <span className="text-red-600 dark:text-red-400 text-sm">⚠️</span>
          </div>
          <div>
            <h3 className="text-red-800 dark:text-red-200 font-medium">预测引擎错误</h3>
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (cycles.length === 0) {
    return (
      <div className={`bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 ${className}`}>
        <div className="flex items-center">
          <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mr-3">
            <span className="text-blue-600 dark:text-blue-400 text-sm">💡</span>
          </div>
          <div>
            <h3 className="text-blue-800 dark:text-blue-200 font-medium">开始记录周期</h3>
            <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">
              请记录至少一个完整的月经周期，系统将开始为您提供预测服务
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 ${className}`}>
      {/* 预测引擎标题 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">经期预测引擎</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">基于科学算法的智能预测</p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white text-lg">🔮</span>
        </div>
      </div>

      {/* 当前状态 */}
      {currentPhase && (
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">当前周期阶段</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              置信度: {prediction ? Math.round(prediction.confidence * 100) : 0}%
            </span>
          </div>
          <div className="mt-2">
            <div 
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
              style={{ 
                backgroundColor: `${CYCLE_PHASES[currentPhase as keyof typeof CYCLE_PHASES].color}20`,
                color: CYCLE_PHASES[currentPhase as keyof typeof CYCLE_PHASES].color
              }}
            >
              <span className="mr-2">{CYCLE_PHASES[currentPhase as keyof typeof CYCLE_PHASES].icon}</span>
              {CYCLE_PHASES[currentPhase as keyof typeof CYCLE_PHASES].name}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {CYCLE_PHASES[currentPhase as keyof typeof CYCLE_PHASES].description}
            </p>
          </div>
        </div>
      )}

      {/* 预测结果 */}
      {prediction && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 下次经期预测 */}
            <div className="bg-pink-50 dark:bg-pink-900 dark:bg-opacity-20 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-pink-600 dark:text-pink-400 mr-2">💖</span>
                <span className="text-sm font-medium text-pink-800 dark:text-pink-200">下次经期</span>
              </div>
              <div className="text-lg font-bold text-pink-700 dark:text-pink-300">
                {formatDate(prediction.nextPeriodStart)}
              </div>
              <div className="text-xs text-pink-600 dark:text-pink-400 mt-1">
                预计持续 {Math.round((prediction.nextPeriodEnd.getTime() - prediction.nextPeriodStart.getTime()) / (1000 * 60 * 60 * 24))} 天
              </div>
            </div>

            {/* 排卵期预测 */}
            <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <span className="text-yellow-600 dark:text-yellow-400 mr-2">🥚</span>
                <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">排卵期</span>
              </div>
              <div className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
                {formatDate(prediction.ovulationDate)}
              </div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                受孕期: {formatDate(prediction.fertileWindowStart)} - {formatDate(prediction.fertileWindowEnd)}
              </div>
            </div>
          </div>

          {/* 周期统计 */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">周期统计</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500 dark:text-gray-400">平均周期:</span>
                <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">
                  {statistics.averageCycleLength} 天
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">平均经期:</span>
                <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">
                  {statistics.averagePeriodLength} 天
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">规律性:</span>
                <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">
                  {getRegularityText(statistics.cycleRegularity)}
                </span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">总记录:</span>
                <span className="ml-2 font-medium text-gray-700 dark:text-gray-300">
                  {statistics.totalCycles} 次
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 数据提示 */}
      {statistics.totalCycles < 3 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg">
          <p className="text-xs text-blue-600 dark:text-blue-400">
            💡 记录更多周期数据将提高预测的准确性。建议连续记录3个周期以上。
          </p>
        </div>
      )}
    </div>
  );
};

// 辅助函数
function formatDate(date: Date): string {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return '今天';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return '明天';
  } else {
    const daysDiff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 0 && daysDiff <= 7) {
      return `${daysDiff}天后`;
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  }
}

function getRegularityText(regularity: 'very_regular' | 'regular' | 'irregular'): string {
  switch (regularity) {
    case 'very_regular':
      return '非常规律';
    case 'regular':
      return '规律';
    case 'irregular':
      return '不规律';
    default:
      return '未知';
  }
}

export default PredictionEngineComponent;