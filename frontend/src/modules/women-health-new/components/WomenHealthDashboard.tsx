// 女性健康管理模块主界面
import React, { useState, useEffect } from 'react';
import { DataStorageManager } from '../utils/dataStorage';
import { PredictionEngine } from '../utils/predictionAlgorithm';
import { CycleData, HealthRecord } from '../types/health.types';
import ZenCalendar from './calendar/ZenCalendar';
import CyclePhaseVisualization from './charts/CyclePhaseVisualization';
import EventMarkers from './calendar/EventMarkers';

const WomenHealthDashboard: React.FC = () => {
  const [cycles, setCycles] = useState<CycleData[]>([]);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [prediction, setPrediction] = useState<ReturnType<typeof PredictionEngine.predictNextCycle>>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // 初始化数据
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        await DataStorageManager.initialize();
        
        // 获取周期数据
        const cycleData = await DataStorageManager.getCycleData();
        setCycles(cycleData);
        
        // 获取健康记录
        const healthRecords = await DataStorageManager.getHealthRecords();
        setRecords(healthRecords);
        
        // 计算预测
        if (cycleData.length > 0) {
          const pred = PredictionEngine.predictNextCycle(cycleData);
          setPrediction(pred);
        }
      } catch (error) {
        console.error('初始化数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // 当周期数据变化时重新计算预测
  useEffect(() => {
    if (cycles.length > 0) {
      const pred = PredictionEngine.predictNextCycle(cycles);
      setPrediction(pred);
    } else {
      setPrediction(null);
    }
  }, [cycles]);

  // 获取选定日期的健康记录
  const getHealthRecordForDate = (date: Date): HealthRecord | undefined => {
    return records.find(record => 
      new Date(record.date).toDateString() === date.toDateString()
    );
  };

  // 获取选定日期的事件
  const getEventsForDate = (date: Date) => {
    // 这里应该从完整的事件列表中筛选出指定日期的事件
    // 为简化示例，我们返回空数组
    return [];
  };

  // 获取当前周期阶段
  const getCurrentCyclePhase = () => {
    if (cycles.length === 0) return 'unknown';
    
    const lastCycle = cycles[cycles.length - 1];
    return PredictionEngine.getCurrentCyclePhase(
      selectedDate,
      new Date(lastCycle.startDate),
      lastCycle.cycleLength
    );
  };

  // 计算当前周期天数
  const getCurrentCycleDay = () => {
    if (cycles.length === 0) return 0;
    
    const lastCycle = cycles[cycles.length - 1];
    const startDate = new Date(lastCycle.startDate);
    const diffTime = selectedDate.getTime() - startDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* 头部标题 */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            女性健康管理
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            科学预测，贴心关怀，助力女性健康生活
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 主要日历区域 */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <ZenCalendar
                cycles={cycles}
                records={records}
                prediction={prediction}
                onDateSelect={setSelectedDate}
              />
            </div>
          </div>

          {/* 侧边栏信息 */}
          <div className="space-y-6">
            {/* 周期阶段可视化 */}
            <CyclePhaseVisualization
              currentPhase={getCurrentCyclePhase() as any}
              cycleDay={getCurrentCycleDay()}
              cycleLength={cycles.length > 0 ? cycles[cycles.length - 1].cycleLength : 28}
            />

            {/* 事件和记录详情 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {selectedDate.toLocaleDateString('zh-CN', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'long'
                })}
              </h3>
              <EventMarkers
                events={getEventsForDate(selectedDate)}
                healthRecord={getHealthRecordForDate(selectedDate)}
              />
            </div>

            {/* 统计信息 */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">统计信息</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">记录周期数</span>
                  <span className="font-medium text-gray-900 dark:text-white">{cycles.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">健康记录数</span>
                  <span className="font-medium text-gray-900 dark:text-white">{records.length}</span>
                </div>
                {prediction && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">预测准确度</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {Math.round(prediction.confidence * 100)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WomenHealthDashboard;