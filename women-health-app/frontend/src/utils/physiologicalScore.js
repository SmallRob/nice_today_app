// 生理状态评分工具类
export class PhysiologicalScoreCalculator {
  /**
   * 计算综合生理分数
   * @param {string} phase - 当前周期阶段
   * @param {number} cycleDay - 当前周期天数
   * @param {Object} healthRecord - 健康记录
   * @returns {Object} 包含综合分数和各维度分数的对象
   */
  static calculateOverallScore(phase, cycleDay, healthRecord = null) {
    // 基础分数根据周期阶段
    let baseScore = this.getBaseScoreByPhase(phase);
    
    // 根据周期天数调整分数
    const dayAdjustment = this.getDayAdjustment(cycleDay, phase);
    baseScore += dayAdjustment;
    
    // 根据健康记录调整分数
    if (healthRecord) {
      const recordAdjustment = this.getRecordAdjustment(healthRecord);
      baseScore += recordAdjustment;
    }
    
    // 确保分数在合理范围内
    baseScore = Math.max(0, Math.min(100, baseScore));
    
    // 计算各个维度的分数
    const emotionScore = this.calculateEmotionScore(phase, cycleDay, healthRecord);
    const physicalScore = this.calculatePhysicalScore(phase, cycleDay, healthRecord);
    const intellectualScore = this.calculateIntellectualScore(phase, cycleDay, healthRecord);
    
    return {
      overall: Math.round(baseScore),
      emotion: Math.round(emotionScore),
      physical: Math.round(physicalScore),
      intellectual: Math.round(intellectualScore)
    };
  }
  
  /**
   * 根据周期阶段获取基础分数
   */
  static getBaseScoreByPhase(phase) {
    const baseScores = {
      'menstrual': 40,    // 经期 - 基础分数较低
      'follicular': 60,   // 卵泡期 - 分数逐渐上升
      'ovulation': 80,    // 排卵期 - 分数最高
      'luteal': 60        // 黄体期 - 分数下降
    };
    
    return baseScores[phase] || 50;
  }
  
  /**
   * 根据周期天数调整分数
   */
  static getDayAdjustment(cycleDay, phase) {
    // 在每个阶段内的波动调整
    switch (phase) {
      case 'menstrual':
        // 经期第1-2天分数最低，之后逐渐回升
        if (cycleDay <= 2) return -10;
        if (cycleDay <= 5) return -5;
        return 0;
        
      case 'follicular':
        // 卵泡期稳步上升
        return Math.min(10, (cycleDay - 5) * 1.5);
        
      case 'ovulation':
        // 排卵期保持高位
        return 5;
        
      case 'luteal':
        // 黄体期逐渐下降
        return Math.max(-15, (28 - cycleDay) * -0.8);
        
      default:
        return 0;
    }
  }
  
  /**
   * 根据健康记录调整分数
   */
  static getRecordAdjustment(healthRecord) {
    if (!healthRecord) return 0;
    
    let adjustment = 0;
    
    // 根据症状调整
    if (healthRecord.symptoms && healthRecord.symptoms.length > 0) {
      // 每个症状扣分
      adjustment -= healthRecord.symptoms.length * 3;
      
      // 特别严重的症状额外扣分
      const severeSymptoms = ['cramps', 'headache', 'nausea'];
      healthRecord.symptoms.forEach(symptom => {
        if (severeSymptoms.includes(symptom)) {
          adjustment -= 5;
        }
      });
    }
    
    // 根据情绪状态调整 (-2到+2)
    if (healthRecord.mood) {
      adjustment += (healthRecord.mood - 3) * 2;
    }
    
    return adjustment;
  }
  
  /**
   * 计算情绪分数
   */
  static calculateEmotionScore(phase, cycleDay, healthRecord) {
    let score = 50;
    
    // 基于周期阶段的情绪基准
    const emotionBase = {
      'menstrual': 45,
      'follicular': 60,
      'ovulation': 75,
      'luteal': 55
    };
    
    score = emotionBase[phase] || 50;
    
    // 周期内波动
    switch (phase) {
      case 'menstrual':
        if (cycleDay <= 2) score -= 10;
        else if (cycleDay <= 5) score -= 5;
        break;
      case 'luteal':
        if (cycleDay >= 24) score -= 8;
        break;
    }
    
    // 健康记录影响
    if (healthRecord && healthRecord.mood) {
      score += (healthRecord.mood - 3) * 5;
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * 计算身体分数
   */
  static calculatePhysicalScore(phase, cycleDay, healthRecord) {
    let score = 50;
    
    // 基于周期阶段的身体基准
    const physicalBase = {
      'menstrual': 40,
      'follicular': 65,
      'ovulation': 80,
      'luteal': 60
    };
    
    score = physicalBase[phase] || 50;
    
    // 周期内波动
    switch (phase) {
      case 'menstrual':
        if (cycleDay <= 2) score -= 15;
        else if (cycleDay <= 5) score -= 10;
        break;
      case 'luteal':
        if (cycleDay >= 25) score -= 10;
        break;
    }
    
    // 健康记录影响
    if (healthRecord) {
      // 症状影响
      if (healthRecord.symptoms && healthRecord.symptoms.length > 0) {
        score -= healthRecord.symptoms.length * 4;
        
        // 严重影响身体的症状
        const physicalSymptoms = ['cramps', 'fatigue', 'bloating', 'nausea'];
        healthRecord.symptoms.forEach(symptom => {
          if (physicalSymptoms.includes(symptom)) {
            score -= 6;
          }
        });
      }
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * 计算智力分数
   */
  static calculateIntellectualScore(phase, cycleDay, healthRecord) {
    let score = 50;
    
    // 基于周期阶段的智力基准
    const intellectualBase = {
      'menstrual': 55,
      'follicular': 65,
      'ovulation': 75,
      'luteal': 60
    };
    
    score = intellectualBase[phase] || 50;
    
    // 周期内波动
    switch (phase) {
      case 'menstrual':
        // 经期后期智力可能提升
        if (cycleDay >= 4) score += 5;
        break;
      case 'ovulation':
        // 排卵期智力最高
        score += 10;
        break;
      case 'luteal':
        // 黄体期智力略有下降
        if (cycleDay >= 24) score -= 5;
        break;
    }
    
    // 健康记录影响
    if (healthRecord) {
      // 疲劳会影响智力表现
      if (healthRecord.symptoms && healthRecord.symptoms.includes('fatigue')) {
        score -= 10;
      }
      
      if (healthRecord.symptoms && healthRecord.symptoms.includes('headache')) {
        score -= 8;
      }
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * 获取生活建议
   */
  static getLifeAdvice(scores, phase, healthRecord = null) {
    const advice = {
      work: '',
      exercise: '',
      diet: '',
      emotion: ''
    };
    
    // 工作建议
    if (scores.overall >= 75) {
      advice.work = '今日精力充沛，适合处理复杂任务和重要决策。';
    } else if (scores.overall >= 50) {
      advice.work = '今日状态平稳，适合常规工作和学习。';
    } else {
      advice.work = '今日精力稍弱，建议处理简单任务，避免重大决策。';
    }
    
    // 运动建议
    if (scores.physical >= 70) {
      advice.exercise = '身体状态良好，适合进行中高强度运动。';
    } else if (scores.physical >= 40) {
      advice.exercise = '适合进行轻度到中度运动，如散步、瑜伽。';
    } else {
      advice.exercise = '身体较为疲惫，建议以休息为主，可进行轻柔拉伸。';
    }
    
    // 饮食建议
    if (scores.physical >= 60) {
      advice.diet = '食欲较好，可正常饮食，注意营养均衡。';
    } else {
      advice.diet = '可能食欲不佳，建议选择清淡易消化的食物。';
    }
    
    // 情绪建议
    if (scores.emotion >= 70) {
      advice.emotion = '情绪状态良好，适合社交和表达自己。';
    } else if (scores.emotion >= 40) {
      advice.emotion = '情绪平稳，保持日常作息即可。';
    } else {
      advice.emotion = '情绪可能波动较大，建议多休息，可尝试冥想或听音乐放松。';
    }
    
    // 根据周期阶段调整建议
    switch (phase) {
      case 'menstrual':
        advice.diet = '经期应注意补铁，可多食用红枣、菠菜等富含铁质的食物。';
        advice.exercise = '经期适合进行轻柔运动，如瑜伽、散步，避免剧烈运动。';
        break;
      case 'follicular':
        advice.work = '卵泡期精力逐渐恢复，适合制定计划和开始新项目。';
        break;
      case 'ovulation':
        advice.emotion = '排卵期情绪高涨，适合社交活动和创造性工作。';
        break;
      case 'luteal':
        advice.diet = '黄体期可能容易水肿，建议减少盐分摄入，多吃利尿食物。';
        advice.emotion = '黄体期情绪可能波动，要注意调节压力，保证充足睡眠。';
        break;
    }
    
    // 根据健康记录进一步调整
    if (healthRecord) {
      if (healthRecord.symptoms && healthRecord.symptoms.includes('cramps')) {
        advice.diet += ' 有痛经症状，可饮用温开水或红糖水缓解。';
        advice.exercise = '有痛经症状，建议以休息为主，可进行轻柔的腹部按摩。';
      }
      
      if (healthRecord.symptoms && healthRecord.symptoms.includes('fatigue')) {
        advice.work = '感到疲劳，建议优先处理重要任务，适当休息。';
      }
    }
    
    return advice;
  }
  
  /**
   * 获取健康提示信息
   */
  static getHealthTips(phase, scores, healthRecord = null) {
    const tips = [];
    
    // 根据周期阶段的通用提示
    switch (phase) {
      case 'menstrual':
        tips.push({
          title: '经期关怀',
          content: '注意保暖，避免生冷食物，保持充足休息。',
          type: 'info'
        });
        break;
      case 'follicular':
        tips.push({
          title: '卵泡期养护',
          content: '这是身体恢复和能量积累的时期，注意营养补充。',
          type: 'info'
        });
        break;
      case 'ovulation':
        tips.push({
          title: '排卵期提醒',
          content: '排卵期是受孕最佳时机，如有备孕计划请注意。',
          type: 'info'
        });
        break;
      case 'luteal':
        tips.push({
          title: '黄体期调节',
          content: '可能会出现经前综合症，注意情绪管理和饮食调节。',
          type: 'info'
        });
        break;
    }
    
    // 根据分数的提示
    if (scores.overall < 40) {
      tips.push({
        title: '低能量提醒',
        content: '今日整体状态较弱，建议以休息为主，避免过度劳累。',
        type: 'warning'
      });
    }
    
    if (scores.emotion < 30) {
      tips.push({
        title: '情绪关注',
        content: '情绪状态较低落，建议寻找放松方式，必要时寻求支持。',
        type: 'warning'
      });
    }
    
    if (scores.physical < 30) {
      tips.push({
        title: '身体疲劳',
        content: '身体较为疲惫，请注意休息，避免剧烈运动。',
        type: 'warning'
      });
    }
    
    // 根据健康记录的提示
    if (healthRecord && healthRecord.symptoms) {
      if (healthRecord.symptoms.includes('cramps')) {
        tips.push({
          title: '痛经缓解',
          content: '可尝试热敷腹部或饮用姜茶缓解痛经。',
          type: 'tip'
        });
      }
      
      if (healthRecord.symptoms.includes('bloating')) {
        tips.push({
          title: '腹胀改善',
          content: '避免食用易产气食物，可适量饮用薄荷茶帮助消化。',
          type: 'tip'
        });
      }
      
      if (healthRecord.symptoms.includes('headache')) {
        tips.push({
          title: '头痛舒缓',
          content: '保持充足水分摄入，适当休息，避免强光刺激。',
          type: 'tip'
        });
      }
    }
    
    return tips;
  }
  
  /**
   * 获取分数等级描述
   */
  static getScoreLevel(score) {
    if (score >= 80) return { level: '优秀', description: '状态极佳' };
    if (score >= 60) return { level: '良好', description: '状态不错' };
    if (score >= 40) return { level: '一般', description: '状态普通' };
    return { level: '较差', description: '需要注意' };
  }
}