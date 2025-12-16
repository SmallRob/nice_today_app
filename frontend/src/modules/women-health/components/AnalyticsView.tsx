// 统计分析视图组件
import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { CycleData, HealthRecord, CycleStatistics, SYMPTOM_CATEGORIES } from '../types/health.types';
import { useCycleData } from '../hooks/useCycleData';
import { useHealthRecords } from '../hooks/useHealthRecords';

interface AnalyticsViewProps {
  className?: string;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ className = '' }) => {
  const { cycles, statistics } = useCycleData();
  const { records, symptomFrequency, recentMoodAverage } = useHealthRecords();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'cycles' | 'symptoms' | 'mood'>('overview');

  // 周期长度趋势数据
  const cycleTrendData = cycles.slice(-6).map((cycle, index) => ({
    name: `周期${index + 1}`,
    周期长度: cycle.cycleLength,
    经期长度: cycle.periodLength
  }));

  // 症状频率数据
  const symptomData = Object.entries(symptomFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([symptomId, count]) => {
      const symptom = SYMPTOM_CATEGORIES
        .flatMap(cat => cat.symptoms)
        .find(s => s.id === symptomId);
      
      return {
        name: symptom?.name || symptomId,
        出现次数: count,
        percentage: Math.round((count / records.length) * 100)
      };
    });

  // 情绪趋势数据（最近30天）
  const moodTrendData = (() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRecords = records
      .filter(record => new Date(record.date) >= thirtyDaysAgo)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return recentRecords.map(record => ({
      date: new Date(record.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      情绪评分: record.mood,
      周期阶段: record.cyclePhase
    }));
  })();

  // 周期阶段分布数据
  const cyclePhaseData = (() => {
    const phaseCounts: { [key: string]: number } = {};
    records.forEach(record => {
      phaseCounts[record.cyclePhase] = (phaseCounts[record.cyclePhase] || 0) + 1;
    });
    
    return Object.entries(phaseCounts).map(([phase, count]) => ({
      name: getPhaseName(phase),
      value: count,
      color: getPhaseColor(phase)
    }));
  })();

  // 统计卡片数据
  const statCards = [
    {
      title: '总周期记录',
      value: statistics.totalCycles,
      change: '+2',
      icon: '📅',
      color: 'blue'
    },
    {
      title: '平均周期长度',
      value: `${statistics.averageCycleLength}天`,
      change: statistics.cycleRegularity === 'very_regular' ? '规律' : '需关注',
      icon: '📊',
      color: 'green'
    },
    {
      title: '平均情绪评分',
      value: recentMoodAverage.toFixed(1),
      change: recentMoodAverage > 3 ? '良好' : '需关注',
      icon: '😊',
      color: 'yellow'
    },
    {
      title: '症状记录',
      value: Object.keys(symptomFrequency).length,
      change: '+5',
      icon: '💊',
      color: 'purple'
    }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 ${className}`}>
      {/* 头部 */}
      <div className="p-6 border-b dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">健康数据分析</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              基于您的记录数据，提供全面的健康洞察
            </p>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl">📈</span>
          </div>
        </div>

        {/* 标签导航 */}
        <div className="flex space-x-4 mt-4">
          {[
            { id: 'overview', label: '概览', icon: '📊' },
            { id: 'cycles', label: '周期分析', icon: '🔄' },
            { id: 'symptoms', label: '症状统计', icon: '💊' },
            { id: 'mood', label: '情绪趋势', icon: '😊' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{card.icon}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  card.change.includes('+') || card.change === '良好' || card.change === '规律'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {card.change}
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{card.title}</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</div>
            </div>
          ))}
        </div>

        {/* 图表内容 */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* 周期阶段分布 */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                周期阶段分布
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={cyclePhaseData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percentage }) => `${name}: ${value}次`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {cyclePhaseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}次`, '记录次数']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 最近周期趋势 */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                最近周期趋势
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cycleTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip 
                      formatter={(value) => [`${value}天`, '天数']}
                      labelFormatter={(label) => `周期: ${label}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="周期长度" 
                      stroke="#8B5CF6" 
                      strokeWidth={2}
                      dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="经期长度" 
                      stroke="#EC4899" 
                      strokeWidth={2}
                      dot={{ fill: '#EC4899', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cycles' && (
          <div className="space-y-8">
            {/* 详细周期分析 */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                周期长度分析
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cycleTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip formatter={(value) => [`${value}天`, '天数']} />
                    <Legend />
                    <Bar dataKey="周期长度" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="经期长度" fill="#EC4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 周期统计摘要 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-600 rounded-lg p-4 border dark:border-gray-500">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">周期规律性</h4>
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {getRegularityText(statistics.cycleRegularity)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  最长周期: {statistics.longestCycle}天 | 最短周期: {statistics.shortestCycle}天
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-600 rounded-lg p-4 border dark:border-gray-500">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">数据完整性</h4>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {Math.round((statistics.totalCycles / 3) * 100)}%
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  建议记录至少3个完整周期以获得更准确的预测
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'symptoms' && (
          <div className="space-y-8">
            {/* 症状频率排行 */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                症状频率排行
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={symptomData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" stroke="#6B7280" />
                    <YAxis type="category" dataKey="name" stroke="#6B7280" width={80} />
                    <Tooltip 
                      formatter={(value, name) => [`${value}次`, name === '出现次数' ? '出现次数' : '占比']}
                      labelFormatter={(label) => `症状: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="出现次数" fill="#EC4899" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 症状分类统计 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {SYMPTOM_CATEGORIES.map(category => {
                const categorySymptoms = category.symptoms.map(s => s.id);
                const categoryCount = categorySymptoms.reduce((sum, symptomId) => 
                  sum + (symptomFrequency[symptomId] || 0), 0
                );
                
                return (
                  <div key={category.id} className="bg-white dark:bg-gray-600 rounded-lg p-4 border dark:border-gray-500">
                    <div className="flex items-center mb-2">
                      <span className="text-xl mr-2">{category.icon}</span>
                      <h4 className="font-medium text-gray-900 dark:text-white">{category.name}</h4>
                    </div>
                    <div className="text-2xl font-bold" style={{ color: category.color }}>
                      {categoryCount}次
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {category.symptoms.length} 种症状类型
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'mood' && (
          <div className="space-y-8">
            {/* 情绪趋势图 */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                情绪变化趋势（最近30天）
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={moodTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#6B7280" />
                    <YAxis 
                      stroke="#6B7280" 
                      domain={[1, 5]}
                      ticks={[1, 2, 3, 4, 5]}
                    />
                    <Tooltip 
                      formatter={(value) => [`${value}分`, '情绪评分']}
                      labelFormatter={(label) => `日期: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="情绪评分" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 情绪统计 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-600 rounded-lg p-4 border dark:border-gray-500">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">平均情绪评分</h4>
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {recentMoodAverage.toFixed(1)}
                </div>
                <div className="flex mt-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span 
                      key={star}
                      className={`text-lg ${star <= Math.round(recentMoodAverage) ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-600 rounded-lg p-4 border dark:border-gray-500">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">情绪稳定性</h4>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {getMoodStability(moodTrendData)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  基于最近30天的情绪波动计算
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 数据提示 */}
        {records.length === 0 && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              暂无数据分析
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              开始记录您的健康数据，系统将为您生成详细的分析报告
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// 辅助函数
function getPhaseName(phase: string): string {
  const phases: { [key: string]: string } = {
    menstrual: '经期',
    follicular: '卵泡期',
    ovulation: '排卵期',
    luteal: '黄体期'
  };
  return phases[phase] || phase;
}

function getPhaseColor(phase: string): string {
  const colors: { [key: string]: string } = {
    menstrual: '#FF6B9D',
    follicular: '#8A2BE2',
    ovulation: '#FFD700',
    luteal: '#FFA500'
  };
  return colors[phase] || '#6B7280';
}

function getRegularityText(regularity: 'very_regular' | 'regular' | 'irregular'): string {
  switch (regularity) {
    case 'very_regular':
      return '非常规律';
    case 'regular':
      return '规律';
    case 'irregular':
      return '不规律';
    default:
      return '未知';
  }
}

function getMoodStability(moodData: any[]): string {
  if (moodData.length < 2) return '数据不足';
  
  const moods = moodData.map(d => d.情绪评分);
  const avg = moods.reduce((a, b) => a + b, 0) / moods.length;
  const variance = moods.reduce((sum, mood) => sum + Math.pow(mood - avg, 2), 0) / moods.length;
  const stdDev = Math.sqrt(variance);
  
  if (stdDev < 0.5) return '非常稳定';
  if (stdDev < 1.0) return '稳定';
  if (stdDev < 1.5) return '一般';
  return '波动较大';
}

export default AnalyticsView;