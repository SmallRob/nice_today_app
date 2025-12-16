// 本地数据存储管理工具
import { CycleData, HealthRecord, UserPreferences } from '../types/health.types';

const STORAGE_KEYS = {
  CYCLE_DATA: 'women_health_cycle_data',
  HEALTH_RECORDS: 'women_health_records',
  USER_PREFERENCES: 'women_health_preferences',
  APP_VERSION: 'women_health_app_version'
} as const;

const CURRENT_VERSION = '1.0.0';

export class DataStorageManager {
  /**
   * 初始化数据存储系统
   */
  static async initialize(): Promise<void> {
    // 检查版本兼容性
    await this.checkVersionCompatibility();
    
    // 初始化默认数据
    await this.initializeDefaultData();
  }

  /**
   * 保存周期数据
   */
  static async saveCycleData(cycleData: CycleData): Promise<void> {
    const existingData = await this.getCycleData();
    
    // 检查是否已存在相同日期的记录
    const existingIndex = existingData.findIndex(data => 
      new Date(data.startDate).toDateString() === new Date(cycleData.startDate).toDateString()
    );

    if (existingIndex >= 0) {
      // 更新现有记录
      existingData[existingIndex] = {
        ...cycleData,
        updatedAt: new Date()
      };
    } else {
      // 添加新记录
      existingData.push({
        ...cycleData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await this.setStorage(STORAGE_KEYS.CYCLE_DATA, existingData);
  }

  /**
   * 获取所有周期数据（按时间倒序）
   */
  static async getCycleData(): Promise<CycleData[]> {
    const data = await this.getStorage<CycleData[]>(STORAGE_KEYS.CYCLE_DATA);
    
    // 按开始日期倒序排序
    return (data || []).sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );
  }

  /**
   * 删除周期数据
   */
  static async deleteCycleData(cycleId: string): Promise<void> {
    const existingData = await this.getCycleData();
    const filteredData = existingData.filter(data => data.id !== cycleId);
    
    await this.setStorage(STORAGE_KEYS.CYCLE_DATA, filteredData);
  }

  /**
   * 保存健康记录
   */
  static async saveHealthRecord(record: HealthRecord): Promise<void> {
    const existingRecords = await this.getHealthRecords();
    
    // 检查是否已存在相同日期的记录
    const existingIndex = existingRecords.findIndex(r => 
      new Date(r.date).toDateString() === new Date(record.date).toDateString()
    );

    if (existingIndex >= 0) {
      // 更新现有记录
      existingRecords[existingIndex] = {
        ...record,
        updatedAt: new Date()
      };
    } else {
      // 添加新记录
      existingRecords.push({
        ...record,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await this.setStorage(STORAGE_KEYS.HEALTH_RECORDS, existingRecords);
  }

  /**
   * 获取健康记录
   */
  static async getHealthRecords(): Promise<HealthRecord[]> {
    const data = await this.getStorage<HealthRecord[]>(STORAGE_KEYS.HEALTH_RECORDS);
    
    // 按日期倒序排序
    return (data || []).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  /**
   * 获取指定日期的健康记录
   */
  static async getHealthRecordByDate(date: Date): Promise<HealthRecord | null> {
    const records = await this.getHealthRecords();
    const targetDate = new Date(date).toDateString();
    
    return records.find(record => 
      new Date(record.date).toDateString() === targetDate
    ) || null;
  }

  /**
   * 删除健康记录
   */
  static async deleteHealthRecord(recordId: string): Promise<void> {
    const existingRecords = await this.getHealthRecords();
    const filteredRecords = existingRecords.filter(record => record.id !== recordId);
    
    await this.setStorage(STORAGE_KEYS.HEALTH_RECORDS, filteredRecords);
  }

  /**
   * 保存用户偏好设置
   */
  static async saveUserPreferences(preferences: Partial<UserPreferences>): Promise<void> {
    const existingPrefs = await this.getUserPreferences();
    const updatedPrefs = { ...existingPrefs, ...preferences, updatedAt: new Date() };
    
    await this.setStorage(STORAGE_KEYS.USER_PREFERENCES, updatedPrefs);
  }

  /**
   * 获取用户偏好设置
   */
  static async getUserPreferences(): Promise<UserPreferences> {
    const data = await this.getStorage<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES);
    
    // 返回默认设置
    return data || {
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

  /**
   * 导出所有数据
   */
  static async exportData(): Promise<{
    cycles: CycleData[];
    records: HealthRecord[];
    preferences: UserPreferences;
    exportDate: string;
    version: string;
  }> {
    const [cycles, records, preferences] = await Promise.all([
      this.getCycleData(),
      this.getHealthRecords(),
      this.getUserPreferences()
    ]);

    return {
      cycles,
      records,
      preferences,
      exportDate: new Date().toISOString(),
      version: CURRENT_VERSION
    };
  }

  /**
   * 导入数据
   */
  static async importData(data: {
    cycles: CycleData[];
    records: HealthRecord[];
    preferences: UserPreferences;
  }): Promise<void> {
    // 验证数据格式
    if (!this.validateImportData(data)) {
      throw new Error('导入数据格式无效');
    }

    // 备份当前数据
    const backup = await this.exportData();
    
    try {
      // 导入新数据
      await Promise.all([
        this.setStorage(STORAGE_KEYS.CYCLE_DATA, data.cycles),
        this.setStorage(STORAGE_KEYS.HEALTH_RECORDS, data.records),
        this.setStorage(STORAGE_KEYS.USER_PREFERENCES, data.preferences)
      ]);
    } catch (error) {
      // 恢复备份
      await this.restoreFromBackup(backup);
      throw new Error('导入失败，已恢复原始数据');
    }
  }

  /**
   * 清除所有数据
   */
  static async clearAllData(): Promise<void> {
    await Promise.all([
      this.setStorage(STORAGE_KEYS.CYCLE_DATA, []),
      this.setStorage(STORAGE_KEYS.HEALTH_RECORDS, []),
      this.setStorage(STORAGE_KEYS.USER_PREFERENCES, null)
    ]);
  }

  /**
   * 检查存储空间使用情况
   */
  static async checkStorageUsage(): Promise<{
    totalSize: number;
    cyclesSize: number;
    recordsSize: number;
    preferencesSize: number;
  }> {
    const [cycles, records, preferences] = await Promise.all([
      this.getCycleData(),
      this.getHealthRecords(),
      this.getUserPreferences()
    ]);

    const cyclesSize = JSON.stringify(cycles).length;
    const recordsSize = JSON.stringify(records).length;
    const preferencesSize = JSON.stringify(preferences).length;
    const totalSize = cyclesSize + recordsSize + preferencesSize;

    return {
      totalSize,
      cyclesSize,
      recordsSize,
      preferencesSize
    };
  }

  // 私有方法
  private static async getStorage<T>(key: string): Promise<T | null> {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`读取存储数据失败 (${key}):`, error);
      return null;
    }
  }

  private static async setStorage(key: string, data: any): Promise<void> {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`保存存储数据失败 (${key}):`, error);
      throw new Error('存储空间不足或数据过大');
    }
  }

  private static async checkVersionCompatibility(): Promise<void> {
    const storedVersion = localStorage.getItem(STORAGE_KEYS.APP_VERSION);
    
    if (storedVersion && storedVersion !== CURRENT_VERSION) {
      // 版本不兼容，可能需要数据迁移
      console.warn(`检测到版本变化: ${storedVersion} -> ${CURRENT_VERSION}`);
      // 这里可以添加数据迁移逻辑
    }

    // 更新存储的版本号
    localStorage.setItem(STORAGE_KEYS.APP_VERSION, CURRENT_VERSION);
  }

  private static async initializeDefaultData(): Promise<void> {
    const preferences = await this.getUserPreferences();
    if (!preferences.createdAt) {
      // 初始化默认偏好设置
      await this.saveUserPreferences({
        cycleLength: 28,
        periodLength: 5,
        enableNotifications: true,
        notificationTime: '09:00',
        theme: 'auto',
        showFertilityWindow: true,
        showOvulationPrediction: true
      });
    }
  }

  private static validateImportData(data: any): boolean {
    if (!data || typeof data !== 'object') return false;
    
    // 基本验证逻辑
    return Array.isArray(data.cycles) && 
           Array.isArray(data.records) && 
           typeof data.preferences === 'object';
  }

  private static async restoreFromBackup(backup: any): Promise<void> {
    await Promise.all([
      this.setStorage(STORAGE_KEYS.CYCLE_DATA, backup.cycles),
      this.setStorage(STORAGE_KEYS.HEALTH_RECORDS, backup.records),
      this.setStorage(STORAGE_KEYS.USER_PREFERENCES, backup.preferences)
    ]);
  }
}