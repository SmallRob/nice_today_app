// 女性健康管理模块类型定义

export interface CycleData {
  id: string;
  startDate: Date;
  cycleLength: number;
  periodLength: number;
  symptoms: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthRecord {
  id: string;
  date: Date;
  cyclePhase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  symptoms: string[];
  mood: number; // 1-5评分
  medication: string[];
  notes: string;
  temperature?: number; // 基础体温
  weight?: number; // 体重
  createdAt: Date;
  updatedAt: Date;
}

export interface CyclePrediction {
  nextPeriodStart: Date;
  ovulationDate: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  nextPeriodEnd: Date;
  cycleLength: number;
  confidence: number; // 0-1 置信度
}

export interface CycleStatistics {
  averageCycleLength: number;
  averagePeriodLength: number;
  cycleRegularity: 'very_regular' | 'regular' | 'irregular';
  longestCycle: number;
  shortestCycle: number;
  totalCycles: number;
  lastCycleLength?: number;
}

export interface SymptomCategory {
  id: string;
  name: string;
  symptoms: Symptom[];
  icon: string;
  color: string;
}

export interface Symptom {
  id: string;
  name: string;
  emoji: string;
  description?: string;
}

export interface UserPreferences {
  cycleLength: number;
  periodLength: number;
  enableNotifications: boolean;
  notificationTime: string;
  theme: 'light' | 'dark' | 'auto';
  showFertilityWindow: boolean;
  showOvulationPrediction: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CalendarEvent {
  id: string;
  date: Date;
  type: 'period_start' | 'period_end' | 'ovulation' | 'fertile_window_start' | 'fertile_window_end';
  title: string;
  color: string;
  isPrediction: boolean;
}

// 周期阶段定义
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
} as const;