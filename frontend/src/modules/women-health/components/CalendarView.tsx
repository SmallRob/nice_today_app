// 可视化日历组件 - 女性健康管理专用
import React, { useState, useEffect } from 'react';
import { 
  CycleData, 
  HealthRecord, 
  CalendarEvent, 
  CYCLE_PHASES,
  CyclePrediction 
} from '../types/health.types';
import { PredictionEngine } from '../utils/predictionAlgorithm';
import { useCycleData } from '../hooks/useCycleData';
import { useHealthRecords } from '../hooks/useHealthRecords';

interface CalendarViewProps {
  className?: string;
  onDateClick?: (date: Date) => void;
  selectedDate?: Date;
  onAddCycle?: (date: Date) => void;
  onViewRecord?: (date: Date) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  className = '', 
  onDateClick,
  selectedDate,
  onAddCycle,
  onViewRecord
}) => {
  const { cycles, prediction, addCycle } = useCycleData();
  const { records, saveRecord, getRecordByDate } = useHealthRecords();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  // 生成日历事件
  useEffect(() => {
    const events: CalendarEvent[] = [];

    // 添加历史周期事件
    cycles.forEach((cycle, index) => {
      const startDate = new Date(cycle.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + cycle.periodLength);

      events.push({
        id: `period_${cycle.id}`,
        date: startDate,
        type: 'period_start',
        title: '经期开始',
        color: '#FF6B9D',
        isPrediction: false
      });

      events.push({
        id: `period_end_${cycle.id}`,
        date: endDate,
        type: 'period_end',
        title: '经期结束',
        color: '#FF6B9D',
        isPrediction: false
      });
    });

    // 添加预测事件
    if (prediction) {
      const predictionEvents = PredictionEngine.generateCalendarEvents(prediction);
      events.push(...predictionEvents.map(event => ({
        ...event,
        id: `prediction_${event.type}`,
        isPrediction: true
      })));
    }

    setCalendarEvents(events);
  }, [cycles, prediction]);

  // 获取月份数据
  const getMonthData = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // 获取月份第一天和最后一天
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // 获取月份第一天是星期几（0-6，0是周日）
    const firstDayOfWeek = firstDay.getDay();
    
    // 生成日历数据
    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      events: CalendarEvent[];
      healthRecord?: HealthRecord;
      cyclePhase?: string;
    }> = [];

    // 添加上个月的最后几天
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        events: getEventsForDate(date)
      });
    }

    // 添加当前月的所有天
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        events: getEventsForDate(date),
        healthRecord: getHealthRecordForDate(date),
        cyclePhase: getCyclePhaseForDate(date)
      });
    }

    // 添加下个月的前几天
    const nextMonthDays = 42 - days.length; // 6行 * 7天 = 42天
    for (let i = 1; i <= nextMonthDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        isCurrentMonth: false,
        events: getEventsForDate(date)
      });
    }

    return days;
  };

  // 获取指定日期的事件
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return calendarEvents.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  // 获取指定日期的健康记录
  const getHealthRecordForDate = (date: Date): HealthRecord | undefined => {
    return records.find(record => 
      new Date(record.date).toDateString() === date.toDateString()
    );
  };

  // 获取指定日期的周期阶段
  const getCyclePhaseForDate = (date: Date): string | undefined => {
    if (cycles.length === 0 || !prediction) return undefined;

    const lastCycle = cycles[cycles.length - 1];
    return PredictionEngine.getCurrentCyclePhase(
      date,
      new Date(lastCycle.startDate),
      prediction.cycleLength
    );
  };

  // 月份导航
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // 日期点击处理
  const handleDateClick = (date: Date) => {
    if (onDateClick) {
      onDateClick(date);
    }
    
    // 检查是否已有记录，提供快速操作
    const hasRecord = records.find(record => 
      new Date(record.date).toDateString() === date.toDateString()
    );
    
    if (hasRecord && onViewRecord) {
      onViewRecord(date);
    }
  };

  // 添加快捷操作：添加经期开始
  const handleAddPeriodStart = (date: Date) => {
    const cycleData = {
      startDate: date,
      cycleLength: 28,
      periodLength: 5,
      symptoms: [],
      notes: ''
    };
    
    addCycle(cycleData);
  };

  const monthData = getMonthData(currentDate);
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className={`bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-pink-200 dark:border-purple-700 ${className}`}>
      {/* 日历头部 - 月份导航 */}
      <div className="flex items-center justify-between p-6 border-b border-pink-200 dark:border-purple-700">
        <button
          onClick={goToPreviousMonth}
          className="p-3 rounded-xl hover:bg-pink-50 dark:hover:bg-purple-900/20 transition-all duration-200 shadow-sm"
          title="上个月"
        >
          <span className="text-pink-600 dark:text-pink-400 text-lg">←</span>
        </button>
        
        <div className="flex items-center space-x-6">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-medium"
          >
            📅 今天
          </button>
        </div>
        
        <button
          onClick={goToNextMonth}
          className="p-3 rounded-xl hover:bg-pink-50 dark:hover:bg-purple-900/20 transition-all duration-200 shadow-sm"
          title="下个月"
        >
          <span className="text-pink-600 dark:text-pink-400 text-lg">→</span>
        </button>
      </div>

      {/* 星期头部 */}
      <div className="grid grid-cols-7 border-b border-pink-200 dark:border-purple-700">
        {dayNames.map((day, index) => (
          <div 
            key={day}
            className={`p-4 text-center font-semibold text-sm ${
              index === 0 || index === 6 
                ? 'text-pink-500 dark:text-pink-400' 
                : 'text-purple-600 dark:text-purple-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日历网格 */}
      <div className="grid grid-cols-7">
        {monthData.map((day, index) => {
          const isToday = day.date.toDateString() === new Date().toDateString();
          const isSelected = selectedDate && day.date.toDateString() === selectedDate.toDateString();
          const hasEvents = day.events.length > 0;
          const hasRecord = !!day.healthRecord;
          
          return (
            <div
              key={index}
              onClick={() => handleDateClick(day.date)}
              className={`
                min-h-[100px] p-3 border-b border-r border-pink-100 dark:border-purple-800 cursor-pointer transition-all duration-200
                ${day.isCurrentMonth ? 'bg-white/50 dark:bg-gray-800/50' : 'bg-pink-50/30 dark:bg-purple-900/20 text-gray-400'}
                ${isToday ? 'ring-2 ring-pink-500 shadow-lg transform scale-105' : ''}
                ${isSelected ? 'bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20' : ''}
                hover:bg-pink-50/70 dark:hover:bg-purple-900/30 hover:shadow-md
              `}
            >
              {/* 日期数字 */}
              <div className={`text-base font-bold mb-2 ${
                day.isCurrentMonth 
                  ? (isToday ? 'text-pink-600' : 'text-purple-700 dark:text-purple-300')
                  : 'text-gray-400'
              }`}>
                {day.date.getDate()}
              </div>

              {/* 周期阶段指示器 */}
              {day.cyclePhase && (
                <div 
                  className="w-3 h-3 rounded-full mb-2 shadow-sm"
                  style={{ 
                    backgroundColor: CYCLE_PHASES[day.cyclePhase as keyof typeof CYCLE_PHASES].color 
                  }}
                  title={CYCLE_PHASES[day.cyclePhase as keyof typeof CYCLE_PHASES].name}
                />
              )}

              {/* 事件标记 */}
              <div className="space-y-1">
                {day.events.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    className={`text-xs px-2 py-1 rounded-lg truncate font-medium shadow-sm ${
                      event.isPrediction 
                        ? 'bg-opacity-30 border border-dashed' 
                        : 'bg-opacity-60'
                    }`}
                    style={{ 
                      backgroundColor: `${event.color}20`,
                      borderColor: event.color,
                      color: event.color
                    }}
                    title={event.title}
                  >
                    {event.isPrediction ? '📅 ' : ''}{event.title}
                  </div>
                ))}
                
                {day.events.length > 2 && (
                  <div className="text-xs text-pink-500 dark:text-pink-400 font-medium">
                    +{day.events.length - 2} 更多
                  </div>
                )}
              </div>

              {/* 健康记录标记和操作按钮 */}
              {hasRecord && (
                <div className="mt-2">
                  <div className="flex space-x-1 mb-1">
                    {day.healthRecord!.symptoms.slice(0, 2).map(symptomId => (
                      <span key={symptomId} className="text-xs text-pink-500">💊</span>
                    ))}
                    {day.healthRecord!.symptoms.length > 0 && (
                      <span className="text-xs text-purple-500 font-medium">
                        {day.healthRecord!.mood}⭐
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onViewRecord) onViewRecord(day.date);
                    }}
                    className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                  >
                    查看记录
                  </button>
                </div>
              )}
              
              {/* 无记录时的快速操作 */}
              {!hasRecord && day.isCurrentMonth && (
                <div className="mt-2">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddPeriodStart(day.date);
                    }}
                    className="text-xs bg-pink-500 text-white px-2 py-1 rounded hover:bg-pink-600 transition-colors"
                  >
                    标记经期
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 图例说明 */}
      <div className="p-6 border-t border-pink-200 dark:border-purple-700 bg-gradient-to-r from-pink-50/50 to-purple-50/50 dark:from-pink-900/10 dark:to-purple-900/10">
        <div className="flex flex-wrap gap-6 text-sm text-purple-700 dark:text-purple-300">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-pink-500 rounded-full shadow-sm"></div>
            <span className="font-medium">经期</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-purple-500 rounded-full shadow-sm"></div>
            <span className="font-medium">卵泡期</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-yellow-400 rounded-full shadow-sm"></div>
            <span className="font-medium">排卵期</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-orange-400 rounded-full shadow-sm"></div>
            <span className="font-medium">黄体期</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 border-2 border-dashed border-blue-400 rounded-full"></div>
            <span className="font-medium">预测事件</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;