// 基于ZenCalendar风格的现代化日历组件
import React, { useState, useEffect } from 'react';
import './ZenCalendar.styles.css';
import { 
  CycleData, 
  HealthRecord, 
  CalendarEvent, 
  CYCLE_PHASES
} from '../../types/health.types';
import { PredictionEngine } from '../../utils/predictionAlgorithm';

interface ZenCalendarProps {
  cycles: CycleData[];
  records: HealthRecord[];
  prediction: ReturnType<typeof PredictionEngine.predictNextCycle>;
  onDateSelect?: (date: Date) => void;
  onAddCycle?: (date: Date) => void;
  onViewRecord?: (date: Date) => void;
  className?: string;
}

const ZenCalendar: React.FC<ZenCalendarProps> = ({
  cycles,
  records,
  prediction,
  onDateSelect,
  onAddCycle,
  onViewRecord,
  className = ''
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  // 生成日历事件
  useEffect(() => {
    const events: CalendarEvent[] = [];

    // 添加历史周期事件
    cycles.forEach((cycle) => {
      const startDate = new Date(cycle.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + cycle.periodLength);

      events.push({
        id: `period_start_${cycle.id}`,
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
        id: `prediction_${event.type}_${event.date.getTime()}`,
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
      isWeekend: boolean;
      events: CalendarEvent[];
      healthRecord?: HealthRecord;
      cyclePhase?: keyof typeof CYCLE_PHASES;
    }> = [];

    // 添加上个月的最后几天
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        isCurrentMonth: false,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        events: getEventsForDate(date),
        healthRecord: getHealthRecordForDate(date)
      });
    }

    // 添加当前月的所有天
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
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
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        events: getEventsForDate(date),
        healthRecord: getHealthRecordForDate(date)
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
  const getCyclePhaseForDate = (date: Date): keyof typeof CYCLE_PHASES | undefined => {
    if (cycles.length === 0) return undefined;

    const lastCycle = cycles[cycles.length - 1];
    return PredictionEngine.getCurrentCyclePhase(
      date,
      new Date(lastCycle.startDate),
      lastCycle.cycleLength
    ) as keyof typeof CYCLE_PHASES;
  };

  // 月份导航
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
    if (onDateSelect) onDateSelect(today);
  };

  // 日期点击处理
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (onDateSelect) onDateSelect(date);
    
    // 检查是否已有记录，提供快速操作
    const hasRecord = records.find(record => 
      new Date(record.date).toDateString() === date.toDateString()
    );
    
    if (hasRecord && onViewRecord) {
      onViewRecord(date);
    }
  };

  const monthData = getMonthData(currentDate);
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className={`zen-calendar-container ${className}`}>
      {/* 日历头部 - 月份导航 */}
      <div className="zen-calendar-header">
        <button
          onClick={goToPreviousMonth}
          className="zen-calendar-nav-btn"
          title="上个月"
        >
          ←
        </button>
        
        <div className="flex items-center space-x-4">
          <h2 className="zen-calendar-title">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={goToToday}
            className="zen-calendar-today-btn"
          >
            今天
          </button>
        </div>
        
        <button
          onClick={goToNextMonth}
          className="zen-calendar-nav-btn"
          title="下个月"
        >
          →
        </button>
      </div>

      {/* 星期头部 */}
      <div className="zen-calendar-weekdays">
        {dayNames.map((day, index) => (
          <div 
            key={day}
            className={`zen-calendar-weekday ${index === 0 || index === 6 ? 'weekend' : ''}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 日历网格 */}
      <div className="zen-calendar-grid">
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
                zen-calendar-day
                ${!day.isCurrentMonth ? 'other-month' : ''}
                ${isToday ? 'today' : ''}
                ${isSelected ? 'selected' : ''}
                ${day.isWeekend ? 'weekend' : ''}
              `}
            >
              {/* 日期数字 */}
              <div className="zen-calendar-day-number">
                {day.date.getDate()}
              </div>

              {/* 周期阶段指示器 */}
              {day.cyclePhase && (
                <div 
                  className="zen-calendar-phase-indicator"
                  style={{ 
                    backgroundColor: CYCLE_PHASES[day.cyclePhase].color 
                  }}
                  title={CYCLE_PHASES[day.cyclePhase].name}
                />
              )}

              {/* 事件标记 */}
              <div className="zen-calendar-events">
                {day.events.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className="zen-calendar-event"
                    style={{ 
                      borderLeftColor: event.color
                    }}
                    title={event.title}
                  >
                    {event.isPrediction ? '🔮 ' : ''}{event.title}
                  </div>
                ))}
                
                {day.events.length > 3 && (
                  <div className="zen-calendar-event">
                    +{day.events.length - 3} 更多
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ZenCalendar;