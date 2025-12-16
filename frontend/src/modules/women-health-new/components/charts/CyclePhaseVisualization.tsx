// 周期阶段可视化展示组件
import React from 'react';
import { CYCLE_PHASES } from '../../types/health.types';

interface CyclePhaseVisualizationProps {
  currentPhase: keyof typeof CYCLE_PHASES;
  cycleDay: number;
  cycleLength: number;
  className?: string;
}

const CyclePhaseVisualization: React.FC<CyclePhaseVisualizationProps> = ({
  currentPhase,
  cycleDay,
  cycleLength,
  className = ''
}) => {
  // 计算各阶段的天数范围（基于28天周期）
  const phaseRanges = {
    menstrual: { start: 1, end: 5, color: CYCLE_PHASES.menstrual.color },
    follicular: { start: 6, end: 13, color: CYCLE_PHASES.follicular.color },
    ovulation: { start: 14, end: 15, color: CYCLE_PHASES.ovulation.color },
    luteal: { start: 16, end: 28, color: CYCLE_PHASES.luteal.color }
  };

  // 计算当前阶段的进度
  const currentPhaseRange = phaseRanges[currentPhase];
  const phaseProgress = currentPhaseRange 
    ? ((cycleDay - currentPhaseRange.start + 1) / (currentPhaseRange.end - currentPhaseRange.start + 1)) * 100
    : 0;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">周期阶段可视化</h3>
      
      {/* 当前阶段信息 */}
      <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {CYCLE_PHASES[currentPhase]?.name || '未知阶段'}
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {CYCLE_PHASES[currentPhase]?.description || ''}
            </p>
          </div>
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: CYCLE_PHASES[currentPhase]?.color || '#6b7280' }}
          >
            {cycleDay}
          </div>
        </div>
        <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="h-2 rounded-full"
            style={{ 
              width: `${phaseProgress}%`,
              backgroundColor: CYCLE_PHASES[currentPhase]?.color || '#6b7280'
            }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          第 {cycleDay} 天 / 共 {cycleLength} 天
        </p>
      </div>

      {/* 阶段进度条 */}
      <div className="space-y-4">
        {Object.entries(phaseRanges).map(([phaseKey, phase]) => {
          const isActive = phaseKey === currentPhase;
          const isCompleted = cycleDay > phase.end;
          
          return (
            <div key={phaseKey} className="flex items-center">
              <div className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300">
                {CYCLE_PHASES[phaseKey as keyof typeof CYCLE_PHASES].name}
              </div>
              <div className="flex-1 ml-3">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${isActive ? 'animate-pulse' : ''}`}
                    style={{ 
                      width: isCompleted ? '100%' : (isActive ? `${phaseProgress}%` : '0%'),
                      backgroundColor: phase.color
                    }}
                  ></div>
                </div>
              </div>
              <div className="w-16 text-right text-sm text-gray-500 dark:text-gray-400">
                {phase.start}-{phase.end}天
              </div>
            </div>
          );
        })}
      </div>

      {/* 阶段说明 */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">阶段说明</h4>
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(CYCLE_PHASES).map(([phaseKey, phase]) => (
            <div key={phaseKey} className="flex items-start">
              <div 
                className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0"
                style={{ backgroundColor: phase.color }}
              ></div>
              <div className="ml-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{phase.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{phase.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CyclePhaseVisualization;