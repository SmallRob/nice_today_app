// 经期预测算法工具函数
import { CycleData, CyclePrediction, CycleStatistics } from '../types/health.types';

export class PredictionEngine {
  /**
   * 基于历史数据预测下一个周期
   */
  static predictNextCycle(history: CycleData[]): CyclePrediction | null {
    if (history.length < 1) return null;

    // 按时间排序
    const sortedHistory = [...history].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    // 计算平均周期长度（加权平均，最近的数据权重更高）
    const cycleLengths = sortedHistory.map(cycle => cycle.cycleLength);
    const avgCycleLength = this.calculateWeightedAverage(cycleLengths);

    // 计算平均经期长度
    const periodLengths = sortedHistory.map(cycle => cycle.periodLength);
    const avgPeriodLength = this.calculateWeightedAverage(periodLengths);

    // 获取最近一个周期的开始日期
    const lastCycle = sortedHistory[sortedHistory.length - 1];
    const lastStartDate = new Date(lastCycle.startDate);

    // 预测下一个周期的开始日期
    const nextPeriodStart = new Date(lastStartDate);
    nextPeriodStart.setDate(nextPeriodStart.getDate() + Math.round(avgCycleLength));

    // 预测排卵期（通常在下一次经期前14天）
    const ovulationDate = new Date(nextPeriodStart);
    ovulationDate.setDate(ovulationDate.getDate() - 14);

    // 预测受孕期（排卵期前后5天）
    const fertileWindowStart = new Date(ovulationDate);
    fertileWindowStart.setDate(fertileWindowStart.getDate() - 5);
    
    const fertileWindowEnd = new Date(ovulationDate);
    fertileWindowEnd.setDate(fertileWindowEnd.getDate() + 4);

    // 预测经期结束日期
    const nextPeriodEnd = new Date(nextPeriodStart);
    nextPeriodEnd.setDate(nextPeriodEnd.getDate() + Math.round(avgPeriodLength));

    // 计算置信度（基于数据量和规律性）
    const confidence = this.calculatePredictionConfidence(sortedHistory);

    return {
      nextPeriodStart,
      ovulationDate,
      fertileWindowStart,
      fertileWindowEnd,
      nextPeriodEnd,
      cycleLength: Math.round(avgCycleLength),
      confidence
    };
  }

  /**
   * 计算周期统计数据
   */
  static calculateCycleStatistics(history: CycleData[]): CycleStatistics {
    if (history.length === 0) {
      return {
        averageCycleLength: 0,
        averagePeriodLength: 0,
        cycleRegularity: 'irregular',
        longestCycle: 0,
        shortestCycle: 0,
        totalCycles: 0
      };
    }

    const cycleLengths = history.map(cycle => cycle.cycleLength);
    const periodLengths = history.map(cycle => cycle.periodLength);

    const avgCycleLength = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
    const avgPeriodLength = periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length;
    
    const longestCycle = Math.max(...cycleLengths);
    const shortestCycle = Math.min(...cycleLengths);

    // 计算规律性（标准差）
    const cycleRegularity = this.calculateCycleRegularity(cycleLengths);

    const lastCycleLength = cycleLengths[cycleLengths.length - 1];

    return {
      averageCycleLength: Math.round(avgCycleLength * 10) / 10,
      averagePeriodLength: Math.round(avgPeriodLength * 10) / 10,
      cycleRegularity,
      longestCycle,
      shortestCycle,
      totalCycles: history.length,
      lastCycleLength
    };
  }

  /**
   * 计算加权平均值（最近的数据权重更高）
   */
  private static calculateWeightedAverage(values: number[]): number {
    if (values.length === 0) return 0;
    if (values.length === 1) return values[0];

    const weights = values.map((_, index) => {
      // 指数衰减权重，最近的数据权重更高
      return Math.pow(0.8, values.length - index - 1);
    });

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const weightedSum = values.reduce((sum, value, index) => 
      sum + value * weights[index], 0
    );

    return weightedSum / totalWeight;
  }

  /**
   * 计算周期规律性
   */
  private static calculateCycleRegularity(cycleLengths: number[]): 'very_regular' | 'regular' | 'irregular' {
    if (cycleLengths.length < 3) return 'irregular';

    const mean = cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length;
    const variance = cycleLengths.reduce((sum, length) => 
      sum + Math.pow(length - mean, 2), 0
    ) / cycleLengths.length;
    
    const standardDeviation = Math.sqrt(variance);

    if (standardDeviation <= 2) return 'very_regular';
    if (standardDeviation <= 4) return 'regular';
    return 'irregular';
  }

  /**
   * 计算预测置信度
   */
  private static calculatePredictionConfidence(history: CycleData[]): number {
    if (history.length < 3) return 0.3; // 数据不足，置信度低

    const cycleLengths = history.map(cycle => cycle.cycleLength);
    const regularity = this.calculateCycleRegularity(cycleLengths);
    
    let confidence = 0.5; // 基础置信度
    
    // 基于数据量调整
    if (history.length >= 6) confidence += 0.2;
    if (history.length >= 12) confidence += 0.1;
    
    // 基于规律性调整
    if (regularity === 'very_regular') confidence += 0.15;
    else if (regularity === 'regular') confidence += 0.1;
    
    return Math.min(confidence, 0.95); // 最大置信度95%
  }

  /**
   * 根据当前日期判断周期阶段
   */
  static getCurrentCyclePhase(
    currentDate: Date,
    lastPeriodStart: Date,
    cycleLength: number
  ): 'menstrual' | 'follicular' | 'ovulation' | 'luteal' {
    const daysSincePeriod = Math.floor(
      (currentDate.getTime() - new Date(lastPeriodStart).getTime()) / (1000 * 60 * 60 * 24)
    );

    // 假设经期长度平均为5天
    const periodLength = 5;
    const ovulationDay = Math.round(cycleLength / 2); // 排卵期大约在周期中间

    if (daysSincePeriod < periodLength) return 'menstrual';
    if (daysSincePeriod < ovulationDay - 1) return 'follicular';
    if (daysSincePeriod < ovulationDay + 1) return 'ovulation';
    return 'luteal';
  }

  /**
   * 生成日历事件
   */
  static generateCalendarEvents(prediction: CyclePrediction): Array<{
    date: Date;
    type: 'period_start' | 'period_end' | 'ovulation' | 'fertile_window_start' | 'fertile_window_end';
    title: string;
    color: string;
  }> {
    const events = [
      {
        date: prediction.fertileWindowStart,
        type: 'fertile_window_start' as const,
        title: '受孕期开始',
        color: '#FFD700'
      },
      {
        date: prediction.ovulationDate,
        type: 'ovulation' as const,
        title: '排卵期',
        color: '#FFA500'
      },
      {
        date: prediction.fertileWindowEnd,
        type: 'fertile_window_end' as const,
        title: '受孕期结束',
        color: '#FFD700'
      },
      {
        date: prediction.nextPeriodStart,
        type: 'period_start' as const,
        title: '经期开始',
        color: '#FF6B9D'
      },
      {
        date: prediction.nextPeriodEnd,
        type: 'period_end' as const,
        title: '经期结束',
        color: '#FF6B9D'
      }
    ];

    return events;
  }
}