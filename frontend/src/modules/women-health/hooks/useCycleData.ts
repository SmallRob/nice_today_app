// 周期数据管理Hook
import { useState, useEffect, useCallback } from 'react';
import { CycleData, CyclePrediction, CycleStatistics } from '../types/health.types';
import { DataStorageManager } from '../utils/dataStorage';
import { PredictionEngine } from '../utils/predictionAlgorithm';

interface UseCycleDataReturn {
  // 数据状态
  cycles: CycleData[];
  loading: boolean;
  error: string | null;
  
  // 预测数据
  prediction: CyclePrediction | null;
  statistics: CycleStatistics;
  
  // 操作方法
  addCycle: (cycle: Omit<CycleData, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCycle: (cycleId: string, updates: Partial<CycleData>) => Promise<void>;
  deleteCycle: (cycleId: string) => Promise<void>;
  
  // 刷新数据
  refreshData: () => Promise<void>;
}

export const useCycleData = (): UseCycleDataReturn => {
  const [cycles, setCycles] = useState<CycleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 计算预测和统计数据
  const prediction = cycles.length > 0 ? PredictionEngine.predictNextCycle(cycles) : null;
  const statistics = PredictionEngine.calculateCycleStatistics(cycles);

  // 加载数据
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 初始化存储系统
      await DataStorageManager.initialize();
      
      // 获取周期数据
      const cycleData = await DataStorageManager.getCycleData();
      setCycles(cycleData);
      
    } catch (err) {
      console.error('加载周期数据失败:', err);
      setError(err instanceof Error ? err.message : '加载数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 添加新周期
  const addCycle = useCallback(async (cycleData: Omit<CycleData, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      
      // 生成唯一ID
      const newCycle: CycleData = {
        ...cycleData,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // 验证数据
      if (!validateCycleData(newCycle)) {
        throw new Error('周期数据无效');
      }
      
      // 保存到存储
      await DataStorageManager.saveCycleData(newCycle);
      
      // 重新加载数据
      await loadData();
      
    } catch (err) {
      console.error('添加周期失败:', err);
      setError(err instanceof Error ? err.message : '添加周期失败');
      throw err;
    }
  }, [loadData]);

  // 更新周期
  const updateCycle = useCallback(async (cycleId: string, updates: Partial<CycleData>) => {
    try {
      setError(null);
      
      const cycleToUpdate = cycles.find(cycle => cycle.id === cycleId);
      if (!cycleToUpdate) {
        throw new Error('未找到指定的周期记录');
      }
      
      const updatedCycle: CycleData = {
        ...cycleToUpdate,
        ...updates,
        updatedAt: new Date()
      };
      
      // 验证数据
      if (!validateCycleData(updatedCycle)) {
        throw new Error('周期数据无效');
      }
      
      // 保存更新
      await DataStorageManager.saveCycleData(updatedCycle);
      
      // 重新加载数据
      await loadData();
      
    } catch (err) {
      console.error('更新周期失败:', err);
      setError(err instanceof Error ? err.message : '更新周期失败');
      throw err;
    }
  }, [cycles, loadData]);

  // 删除周期
  const deleteCycle = useCallback(async (cycleId: string) => {
    try {
      setError(null);
      
      await DataStorageManager.deleteCycleData(cycleId);
      
      // 重新加载数据
      await loadData();
      
    } catch (err) {
      console.error('删除周期失败:', err);
      setError(err instanceof Error ? err.message : '删除周期失败');
      throw err;
    }
  }, [loadData]);

  // 刷新数据
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // 初始化加载数据
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    cycles,
    loading,
    error,
    prediction,
    statistics,
    addCycle,
    updateCycle,
    deleteCycle,
    refreshData
  };
};

// 生成唯一ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 验证周期数据
function validateCycleData(cycle: CycleData): boolean {
  if (!cycle.startDate) return false;
  if (cycle.cycleLength <= 0 || cycle.cycleLength > 100) return false;
  if (cycle.periodLength <= 0 || cycle.periodLength > 20) return false;
  if (new Date(cycle.startDate) > new Date()) return false;
  
  return true;
}

// 导出辅助函数
export const useCyclePrediction = (cycles: CycleData[]) => {
  return PredictionEngine.predictNextCycle(cycles);
};

export const useCycleStatistics = (cycles: CycleData[]) => {
  return PredictionEngine.calculateCycleStatistics(cycles);
};

export const useCurrentCyclePhase = (
  currentDate: Date,
  lastPeriodStart: Date | null,
  cycleLength: number
) => {
  if (!lastPeriodStart) return null;
  
  return PredictionEngine.getCurrentCyclePhase(
    currentDate,
    lastPeriodStart,
    cycleLength
  );
};