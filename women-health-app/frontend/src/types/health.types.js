// 女性健康管理模块类型定义

export const CYCLE_PHASES = {
  menstrual: {
    name: '经期',
    color: '#FF6B9D',
    description: '子宫内膜脱落，月经来潮'
  },
  follicular: {
    name: '卵泡期',
    color: '#8A6DE9',
    description: '卵泡发育，雌激素上升'
  },
  ovulation: {
    name: '排卵期',
    color: '#FFD700',
    description: '卵子排出，受孕最佳时机'
  },
  luteal: {
    name: '黄体期',
    color: '#FFA500',
    description: '黄体形成，孕激素分泌'
  }
};

// CycleData 类型定义
export class CycleData {
  constructor(data) {
    this.id = data.id || '';
    this.startDate = data.startDate || new Date();
    this.cycleLength = data.cycleLength || 28;
    this.periodLength = data.periodLength || 5;
    this.symptoms = data.symptoms || [];
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}

// HealthRecord 类型定义
export class HealthRecord {
  constructor(data) {
    this.id = data.id || '';
    this.date = data.date || new Date();
    this.cyclePhase = data.cyclePhase || 'menstrual';
    this.symptoms = data.symptoms || [];
    this.mood = data.mood || 3; // 1-5评分
    this.medication = data.medication || [];
    this.notes = data.notes || '';
    this.temperature = data.temperature || null; // 基础体温
    this.weight = data.weight || null; // 体重
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}

// CyclePrediction 类型定义
export class CyclePrediction {
  constructor(data) {
    this.nextPeriodStart = data.nextPeriodStart || new Date();
    this.ovulationDate = data.ovulationDate || new Date();
    this.fertileWindowStart = data.fertileWindowStart || new Date();
    this.fertileWindowEnd = data.fertileWindowEnd || new Date();
    this.nextPeriodEnd = data.nextPeriodEnd || new Date();
    this.cycleLength = data.cycleLength || 28;
    this.confidence = data.confidence || 0; // 0-1 置信度
  }
}

// CycleStatistics 类型定义
export class CycleStatistics {
  constructor(data) {
    this.averageCycleLength = data.averageCycleLength || 0;
    this.averagePeriodLength = data.averagePeriodLength || 0;
    this.cycleRegularity = data.cycleRegularity || 'irregular';
    this.longestCycle = data.longestCycle || 0;
    this.shortestCycle = data.shortestCycle || 0;
    this.totalCycles = data.totalCycles || 0;
    this.lastCycleLength = data.lastCycleLength || 0;
  }
}

// SymptomCategory 类型定义
export class SymptomCategory {
  constructor(data) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.symptoms = data.symptoms || [];
    this.icon = data.icon || '';
    this.color = data.color || '';
  }
}

// Symptom 类型定义
export class Symptom {
  constructor(data) {
    this.id = data.id || '';
    this.name = data.name || '';
    this.emoji = data.emoji || '';
    this.description = data.description || '';
  }
}

// UserPreferences 类型定义
export class UserPreferences {
  constructor(data) {
    this.cycleLength = data.cycleLength || 28;
    this.periodLength = data.periodLength || 5;
    this.enableNotifications = data.enableNotifications || true;
    this.notificationTime = data.notificationTime || '09:00';
    this.theme = data.theme || 'auto';
    this.showFertilityWindow = data.showFertilityWindow || true;
    this.showOvulationPrediction = data.showOvulationPrediction || true;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }
}

// CalendarEvent 类型定义
export class CalendarEvent {
  constructor(data) {
    this.id = data.id || '';
    this.date = data.date || new Date();
    this.type = data.type || 'period_start';
    this.title = data.title || '';
    this.color = data.color || '';
    this.isPrediction = data.isPrediction || false;
  }
}