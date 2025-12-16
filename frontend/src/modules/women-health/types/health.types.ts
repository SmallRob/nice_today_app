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
  notificationTime: string; // HH:mm
  theme: 'light' | 'dark' | 'auto';
  showFertilityWindow: boolean;
  showOvulationPrediction: boolean;
}

export interface CalendarEvent {
  id: string;
  date: Date;
  type: 'period_start' | 'period_end' | 'ovulation' | 'fertile_window_start' | 'fertile_window_end';
  title: string;
  description?: string;
  color: string;
  isPrediction: boolean;
}

export interface AnalyticsData {
  cycleStats: CycleStatistics;
  moodTrend: number[]; // 最近30天的情绪评分
  symptomFrequency: { [symptomId: string]: number };
  cycleLengthTrend: number[]; // 最近6个周期的长度
  periodLengthTrend: number[]; // 最近6个周期的经期长度
}

// 周期阶段配置
export const CYCLE_PHASES = {
  menstrual: {
    name: '经期',
    color: '#FF6B9D',
    description: '月经来潮期',
    icon: '💖'
  },
  follicular: {
    name: '卵泡期',
    color: '#8A2BE2',
    description: '卵泡发育期',
    icon: '🌸'
  },
  ovulation: {
    name: '排卵期',
    color: '#FFD700',
    description: '排卵期',
    icon: '🥚'
  },
  luteal: {
    name: '黄体期',
    color: '#FFA500',
    description: '黄体形成期',
    icon: '🍊'
  }
} as const;

// 症状分类配置
export const SYMPTOM_CATEGORIES: SymptomCategory[] = [
  {
    id: 'physical',
    name: '身体症状',
    icon: '🩺',
    color: '#FF6B6B',
    symptoms: [
      { id: 'headache', name: '头痛', emoji: '🤕' },
      { id: 'back_pain', name: '腰痛', emoji: '💪' },
      { id: 'abdominal_cramps', name: '腹痛', emoji: '🤰' },
      { id: 'breast_tenderness', name: '乳房胀痛', emoji: '👙' },
      { id: 'fatigue', name: '疲劳', emoji: '😴' },
      { id: 'bloating', name: '腹胀', emoji: '🤰' },
      { id: 'acne', name: '痘痘', emoji: '🤕' },
      { id: 'constipation', name: '便秘', emoji: '💩' },
      { id: 'diarrhea', name: '腹泻', emoji: '💩' }
    ]
  },
  {
    id: 'emotional',
    name: '情绪症状',
    icon: '💖',
    color: '#E8B4E1',
    symptoms: [
      { id: 'mood_swings', name: '情绪波动', emoji: '😵' },
      { id: 'irritability', name: '易怒', emoji: '😠' },
      { id: 'anxiety', name: '焦虑', emoji: '😰' },
      { id: 'depression', name: '抑郁', emoji: '😔' },
      { id: 'crying', name: '想哭', emoji: '😢' },
      { id: 'happiness', name: '开心', emoji: '😊' },
      { id: 'energy', name: '精力充沛', emoji: '⚡' },
      { id: 'libido', name: '性欲增强', emoji: '💕' }
    ]
  },
  {
    id: 'other',
    name: '其他症状',
    icon: '📝',
    color: '#4ECDC4',
    symptoms: [
      { id: 'food_cravings', name: '食欲变化', emoji: '🍫' },
      { id: 'sleep_changes', name: '睡眠变化', emoji: '🛌' },
      { id: 'water_retention', name: '水肿', emoji: '💧' },
      { id: 'hot_flashes', name: '潮热', emoji: '🔥' },
      { id: 'dizziness', name: '头晕', emoji: '💫' }
    ]
  }
];