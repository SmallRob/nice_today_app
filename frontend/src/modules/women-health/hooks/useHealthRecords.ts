// 健康记录管理Hook
import { useState, useEffect, useCallback } from 'react';
import { HealthRecord, Symptom, SYMPTOM_CATEGORIES } from '../types/health.types';
import { DataStorageManager } from '../utils/dataStorage';

interface UseHealthRecordsReturn {
  // 数据状态
  records: HealthRecord[];
  loading: boolean;
  error: string | null;
  
  // 统计信息
  totalRecords: number;
  recentMoodAverage: number;
  symptomFrequency: { [symptomId: string]: number };
  
  // 操作方法
  saveRecord: (record: Omit<HealthRecord, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  getRecordByDate: (date: Date) => Promise<HealthRecord | null>;
  deleteRecord: (recordId: string) => Promise<void>;
  
  // 症状管理
  getAllSymptoms: () => Symptom[];
  getSymptomsByCategory: (categoryId: string) => Symptom[];
  
  // 数据操作
  refreshData: () => Promise<void>;
  exportData: () => Promise<string>;
}

export const useHealthRecords = (): UseHealthRecordsReturn => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 计算统计信息
  const totalRecords = records.length;
  
  // 计算最近30天的平均情绪评分
  const recentMoodAverage = useCallback(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRecords = records.filter(record => 
      new Date(record.date) >= thirtyDaysAgo
    );
    
    if (recentRecords.length === 0) return 0;
    
    const totalMood = recentRecords.reduce((sum, record) => sum + record.mood, 0);
    return Math.round((totalMood / recentRecords.length) * 10) / 10;
  }, [records]);

  // 计算症状频率
  const symptomFrequency = useCallback(() => {
    const frequency: { [symptomId: string]: number } = {};
    
    records.forEach(record => {
      record.symptoms.forEach(symptomId => {
        frequency[symptomId] = (frequency[symptomId] || 0) + 1;
      });
    });
    
    return frequency;
  }, [records]);

  // 加载数据
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 初始化存储系统
      await DataStorageManager.initialize();
      
      // 获取健康记录
      const healthRecords = await DataStorageManager.getHealthRecords();
      setRecords(healthRecords);
      
    } catch (err) {
      console.error('加载健康记录失败:', err);
      setError(err instanceof Error ? err.message : '加载数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存健康记录
  const saveRecord = useCallback(async (recordData: Omit<HealthRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      
      // 生成唯一ID
      const newRecord: HealthRecord = {
        ...recordData,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // 验证数据
      if (!validateHealthRecord(newRecord)) {
        throw new Error('健康记录数据无效');
      }
      
      // 保存到存储
      await DataStorageManager.saveHealthRecord(newRecord);
      
      // 重新加载数据
      await loadData();
      
    } catch (err) {
      console.error('保存健康记录失败:', err);
      setError(err instanceof Error ? err.message : '保存记录失败');
      throw err;
    }
  }, [loadData]);

  // 获取指定日期的记录
  const getRecordByDate = useCallback(async (date: Date): Promise<HealthRecord | null> => {
    try {
      return await DataStorageManager.getHealthRecordByDate(date);
    } catch (err) {
      console.error('获取健康记录失败:', err);
      return null;
    }
  }, []);

  // 删除记录
  const deleteRecord = useCallback(async (recordId: string) => {
    try {
      setError(null);
      
      await DataStorageManager.deleteHealthRecord(recordId);
      
      // 重新加载数据
      await loadData();
      
    } catch (err) {
      console.error('删除健康记录失败:', err);
      setError(err instanceof Error ? err.message : '删除记录失败');
      throw err;
    }
  }, [loadData]);

  // 获取所有症状
  const getAllSymptoms = useCallback((): Symptom[] => {
    return SYMPTOM_CATEGORIES.flatMap(category => category.symptoms);
  }, []);

  // 获取指定分类的症状
  const getSymptomsByCategory = useCallback((categoryId: string): Symptom[] => {
    const category = SYMPTOM_CATEGORIES.find(cat => cat.id === categoryId);
    return category ? category.symptoms : [];
  }, []);

  // 导出数据
  const exportData = useCallback(async (): Promise<string> => {
    try {
      const data = await DataStorageManager.exportData();
      return JSON.stringify(data, null, 2);
    } catch (err) {
      console.error('导出数据失败:', err);
      throw new Error('导出数据失败');
    }
  }, []);

  // 刷新数据
  const refreshData = useCallback(async () => {
    await loadData();
  }, [loadData]);

  // 初始化加载数据
  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    records,
    loading,
    error,
    totalRecords,
    recentMoodAverage: recentMoodAverage(),
    symptomFrequency: symptomFrequency(),
    saveRecord,
    getRecordByDate,
    deleteRecord,
    getAllSymptoms,
    getSymptomsByCategory,
    refreshData,
    exportData
  };
};

// 生成唯一ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// 验证健康记录数据
function validateHealthRecord(record: HealthRecord): boolean {
  if (!record.date) return false;
  if (record.mood < 1 || record.mood > 5) return false;
  if (!record.cyclePhase || !['menstrual', 'follicular', 'ovulation', 'luteal'].includes(record.cyclePhase)) {
    return false;
  }
  if (new Date(record.date) > new Date()) return false;
  
  // 验证症状ID是否有效
  const allSymptomIds = SYMPTOM_CATEGORIES.flatMap(cat => cat.symptoms.map(s => s.id));
  if (record.symptoms.some(symptomId => !allSymptomIds.includes(symptomId))) {
    return false;
  }
  
  return true;
}

// 导出辅助函数
export const useRecordStatistics = (records: HealthRecord[]) => {
  // 计算情绪趋势
  const moodTrend = useCallback(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRecords = records
      .filter(record => new Date(record.date) >= thirtyDaysAgo)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return recentRecords.map(record => record.mood);
  }, [records]);

  // 计算症状统计
  const symptomStats = useCallback(() => {
    const stats: { [symptomId: string]: { count: number; percentage: number } } = {};
    const totalRecords = records.length;
    
    if (totalRecords === 0) return stats;
    
    records.forEach(record => {
      record.symptoms.forEach(symptomId => {
        if (!stats[symptomId]) {
          stats[symptomId] = { count: 0, percentage: 0 };
        }
        stats[symptomId].count++;
      });
    });
    
    // 计算百分比
    Object.keys(stats).forEach(symptomId => {
      stats[symptomId].percentage = Math.round((stats[symptomId].count / totalRecords) * 100);
    });
    
    return stats;
  }, [records]);

  return {
    moodTrend: moodTrend(),
    symptomStats: symptomStats()
  };
};