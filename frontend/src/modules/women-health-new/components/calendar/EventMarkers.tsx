// 事件标记和健康记录显示组件
import React from 'react';
import { HealthRecord, CalendarEvent, CYCLE_PHASES } from '../../types/health.types';

interface EventMarkersProps {
  events: CalendarEvent[];
  healthRecord?: HealthRecord;
  onEditRecord?: (date: Date) => void;
  className?: string;
}

const EventMarkers: React.FC<EventMarkersProps> = ({
  events,
  healthRecord,
  onEditRecord,
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* 预测事件标记 */}
      {events.filter(event => event.isPrediction).length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 flex items-center">
            <span className="mr-2">🔮</span>
            预测事件
          </h4>
          <div className="mt-2 space-y-2">
            {events.filter(event => event.isPrediction).map(event => (
              <div 
                key={event.id}
                className="flex items-center text-sm"
              >
                <div 
                  className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: event.color }}
                ></div>
                <span className="text-gray-700 dark:text-gray-300">
                  {event.date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} - {event.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 历史事件标记 */}
      {events.filter(event => !event.isPrediction).length > 0 && (
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
          <h4 className="text-sm font-medium text-purple-800 dark:text-purple-200 flex items-center">
            <span className="mr-2">📅</span>
            历史记录
          </h4>
          <div className="mt-2 space-y-2">
            {events.filter(event => !event.isPrediction).map(event => (
              <div 
                key={event.id}
                className="flex items-center text-sm"
              >
                <div 
                  className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: event.color }}
                ></div>
                <span className="text-gray-700 dark:text-gray-300">
                  {event.date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })} - {event.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 健康记录显示 */}
      {healthRecord && (
        <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-3">
          <div className="flex justify-between items-start">
            <h4 className="text-sm font-medium text-pink-800 dark:text-pink-200 flex items-center">
              <span className="mr-2">📝</span>
              健康记录
            </h4>
            {onEditRecord && (
              <button
                onClick={() => onEditRecord(healthRecord.date)}
                className="text-xs text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-300"
              >
                编辑
              </button>
            )}
          </div>
          
          <div className="mt-2 space-y-2">
            {/* 周期阶段 */}
            {healthRecord.cyclePhase && (
              <div className="flex items-center text-sm">
                <div 
                  className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: CYCLE_PHASES[healthRecord.cyclePhase].color }}
                ></div>
                <span className="text-gray-700 dark:text-gray-300">
                  {CYCLE_PHASES[healthRecord.cyclePhase].name}
                </span>
              </div>
            )}

            {/* 情绪评分 */}
            {healthRecord.mood && (
              <div className="flex items-center text-sm">
                <span className="text-yellow-500 mr-2">⭐</span>
                <span className="text-gray-700 dark:text-gray-300">
                  情绪: {healthRecord.mood}/5
                </span>
              </div>
            )}

            {/* 症状 */}
            {healthRecord.symptoms.length > 0 && (
              <div className="text-sm">
                <span className="text-gray-700 dark:text-gray-300 mr-2">症状:</span>
                <div className="inline-flex flex-wrap gap-1">
                  {healthRecord.symptoms.map((symptom, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-white dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                    >
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 用药 */}
            {healthRecord.medication.length > 0 && (
              <div className="text-sm">
                <span className="text-gray-700 dark:text-gray-300 mr-2">用药:</span>
                <div className="inline-flex flex-wrap gap-1">
                  {healthRecord.medication.map((med, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-white dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                    >
                      {med}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 体温 */}
            {healthRecord.temperature && (
              <div className="flex items-center text-sm">
                <span className="text-red-500 mr-2">🌡️</span>
                <span className="text-gray-700 dark:text-gray-300">
                  体温: {healthRecord.temperature}°C
                </span>
              </div>
            )}

            {/* 体重 */}
            {healthRecord.weight && (
              <div className="flex items-center text-sm">
                <span className="text-green-500 mr-2">⚖️</span>
                <span className="text-gray-700 dark:text-gray-300">
                  体重: {healthRecord.weight}kg
                </span>
              </div>
            )}

            {/* 备注 */}
            {healthRecord.notes && (
              <div className="text-sm">
                <span className="text-gray-700 dark:text-gray-300">备注: {healthRecord.notes}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 无记录提示 */}
      {!healthRecord && onEditRecord && (
        <div className="bg-gray-50 dark:bg-gray-700/20 rounded-lg p-3 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            暂无健康记录
          </p>
          <button
            onClick={() => onEditRecord(new Date())}
            className="mt-2 text-sm text-pink-600 dark:text-pink-400 hover:text-pink-800 dark:hover:text-pink-300 font-medium"
          >
            + 添加记录
          </button>
        </div>
      )}
    </div>
  );
};

export default EventMarkers;