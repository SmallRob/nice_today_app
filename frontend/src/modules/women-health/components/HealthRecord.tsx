// 健康记录管理组件
import React, { useState, useEffect } from 'react';
import { HealthRecord, SYMPTOM_CATEGORIES, CYCLE_PHASES } from '../types/health.types';
import { useHealthRecords } from '../hooks/useHealthRecords';
import { useCycleData } from '../hooks/useCycleData';

interface HealthRecordProps {
  selectedDate?: Date;
  className?: string;
  onRecordSaved?: () => void;
}

const HealthRecordComponent: React.FC<HealthRecordProps> = ({ 
  selectedDate = new Date(), 
  className = '',
  onRecordSaved 
}) => {
  const { saveRecord, getRecordByDate, getAllSymptoms, loading: recordsLoading } = useHealthRecords();
  const { cycles, prediction } = useCycleData();
  
  const [currentRecord, setCurrentRecord] = useState<Partial<HealthRecord> | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMedication, setSelectedMedication] = useState<string[]>([]);
  const [customMedication, setCustomMedication] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // 加载指定日期的记录
  useEffect(() => {
    const loadRecordForDate = async () => {
      const record = await getRecordByDate(selectedDate);
      if (record) {
        setCurrentRecord(record);
        setSelectedSymptoms(record.symptoms);
        setSelectedMedication(record.medication);
        setIsEditing(true);
      } else {
        // 创建新记录
        const cyclePhase = getCyclePhaseForDate(selectedDate);
        setCurrentRecord({
          date: selectedDate,
          cyclePhase: cyclePhase || 'follicular',
          mood: 3,
          symptoms: [],
          medication: [],
          notes: ''
        });
        setSelectedSymptoms([]);
        setSelectedMedication([]);
        setIsEditing(false);
      }
    };

    loadRecordForDate();
  }, [selectedDate, getRecordByDate]);

  // 根据日期获取周期阶段
  const getCyclePhaseForDate = (date: Date): string | null => {
    if (cycles.length === 0 || !prediction) return null;

    const lastCycle = cycles[cycles.length - 1];
    return PredictionEngine.getCurrentCyclePhase(
      date,
      new Date(lastCycle.startDate),
      prediction.cycleLength
    );
  };

  // 症状选择处理
  const toggleSymptom = (symptomId: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptomId) 
        ? prev.filter(id => id !== symptomId)
        : [...prev, symptomId]
    );
  };

  // 药物选择处理
  const toggleMedication = (medication: string) => {
    setSelectedMedication(prev => 
      prev.includes(medication) 
        ? prev.filter(m => m !== medication)
        : [...prev, medication]
    );
  };

  // 添加自定义药物
  const addCustomMedication = () => {
    if (customMedication.trim() && !selectedMedication.includes(customMedication.trim())) {
      setSelectedMedication(prev => [...prev, customMedication.trim()]);
      setCustomMedication('');
    }
  };

  // 保存记录
  const handleSave = async () => {
    if (!currentRecord) return;

    try {
      setSaving(true);
      
      const recordData: Omit<HealthRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        date: selectedDate,
        cyclePhase: currentRecord.cyclePhase!,
        mood: currentRecord.mood!,
        symptoms: selectedSymptoms,
        medication: selectedMedication,
        notes: currentRecord.notes || '',
        temperature: currentRecord.temperature,
        weight: currentRecord.weight
      };

      await saveRecord(recordData);
      
      if (onRecordSaved) {
        onRecordSaved();
      }
      
      setIsEditing(true);
    } catch (error) {
      console.error('保存记录失败:', error);
    } finally {
      setSaving(false);
    }
  };

  // 删除记录
  const handleDelete = async () => {
    if (currentRecord && currentRecord.id) {
      // 这里需要实现删除逻辑
      console.log('删除记录:', currentRecord.id);
    }
  };

  if (recordsLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700 p-6 ${className}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            健康记录 - {selectedDate.toLocaleDateString('zh-CN')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            记录您的身体状况和情绪变化
          </p>
        </div>
        
        {currentRecord?.cyclePhase && (
          <div 
            className="px-3 py-1 rounded-full text-sm font-medium"
            style={{ 
              backgroundColor: `${CYCLE_PHASES[currentRecord.cyclePhase as keyof typeof CYCLE_PHASES].color}20`,
              color: CYCLE_PHASES[currentRecord.cyclePhase as keyof typeof CYCLE_PHASES].color
            }}
          >
            {CYCLE_PHASES[currentRecord.cyclePhase as keyof typeof CYCLE_PHASES].icon} 
            {CYCLE_PHASES[currentRecord.cyclePhase as keyof typeof CYCLE_PHASES].name}
          </div>
        )}
      </div>

      {/* 情绪评分 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          今日情绪评分
        </label>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map(score => (
            <button
              key={score}
              onClick={() => setCurrentRecord(prev => prev ? { ...prev, mood: score } : null)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                currentRecord?.mood === score
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {score} ⭐
            </button>
          ))}
        </div>
      </div>

      {/* 症状记录 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          身体症状
        </label>
        
        {SYMPTOM_CATEGORIES.map(category => (
          <div key={category.id} className="mb-4 last:mb-0">
            <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2 flex items-center">
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {category.symptoms.map(symptom => (
                <button
                  key={symptom.id}
                  onClick={() => toggleSymptom(symptom.id)}
                  className={`p-2 rounded-lg text-sm transition-all ${
                    selectedSymptoms.includes(symptom.id)
                      ? 'bg-pink-100 dark:bg-pink-900 text-pink-700 dark:text-pink-300 border border-pink-300 dark:border-pink-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <span className="mr-1">{symptom.emoji}</span>
                  {symptom.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 药物记录 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          用药记录
        </label>
        
        <div className="space-y-3">
          {/* 常用药物 */}
          <div className="flex flex-wrap gap-2">
            {['止痛药', '维生素', '中药', '保健品'].map(med => (
              <button
                key={med}
                onClick={() => toggleMedication(med)}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  selectedMedication.includes(med)
                    ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {med}
              </button>
            ))}
          </div>

          {/* 自定义药物 */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={customMedication}
              onChange={(e) => setCustomMedication(e.target.value)}
              placeholder="输入其他药物名称"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && addCustomMedication()}
            />
            <button
              onClick={addCustomMedication}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
            >
              添加
            </button>
          </div>

          {/* 已选药物 */}
          {selectedMedication.length > 0 && (
            <div className="mt-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">已选择: </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {selectedMedication.map(med => (
                  <span 
                    key={med}
                    className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-xs"
                  >
                    {med}
                    <button 
                      onClick={() => toggleMedication(med)}
                      className="ml-1 text-purple-500 hover:text-purple-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 额外数据 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            基础体温 (°C)
          </label>
          <input
            type="number"
            step="0.1"
            min="35"
            max="38"
            value={currentRecord?.temperature || ''}
            onChange={(e) => setCurrentRecord(prev => prev ? { 
              ...prev, 
              temperature: e.target.value ? parseFloat(e.target.value) : undefined 
            } : null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="36.5"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            体重 (kg)
          </label>
          <input
            type="number"
            step="0.1"
            min="30"
            max="150"
            value={currentRecord?.weight || ''}
            onChange={(e) => setCurrentRecord(prev => prev ? { 
              ...prev, 
              weight: e.target.value ? parseFloat(e.target.value) : undefined 
            } : null)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="55.0"
          />
        </div>
      </div>

      {/* 备注 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          备注
        </label>
        <textarea
          value={currentRecord?.notes || ''}
          onChange={(e) => setCurrentRecord(prev => prev ? { ...prev, notes: e.target.value } : null)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
          placeholder="记录其他需要注意的事项..."
        />
      </div>

      {/* 操作按钮 */}
      <div className="flex space-x-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? '保存中...' : isEditing ? '更新记录' : '保存记录'}
        </button>
        
        {isEditing && (
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
          >
            删除
          </button>
        )}
      </div>
    </div>
  );
};

// 导入预测引擎（需要从实际文件导入）
const PredictionEngine = {
  getCurrentCyclePhase: (date: Date, lastPeriodStart: Date, cycleLength: number) => {
    const daysSincePeriod = Math.floor(
      (date.getTime() - lastPeriodStart.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    const periodLength = 5;
    const ovulationDay = Math.round(cycleLength / 2);

    if (daysSincePeriod < periodLength) return 'menstrual';
    if (daysSincePeriod < ovulationDay - 1) return 'follicular';
    if (daysSincePeriod < ovulationDay + 1) return 'ovulation';
    return 'luteal';
  }
};

export default HealthRecordComponent;