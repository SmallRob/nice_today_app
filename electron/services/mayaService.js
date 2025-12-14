const { configLoader } = require('./configLoader');

/**
 * 玛雅历法服务
 * 提供玛雅历法计算功能
 */
class MayaService {
    constructor() {
        // 获取玛雅配置
        this.mayaConfig = configLoader.getMayaConfig();
        
        // 存储用户历史查询的出生日期
        this.mayaHistoryDates = [];
        // 最大历史记录数量
        this.MAX_MAYA_HISTORY = 6;
        
        // 玛雅长历常量
        this.MAYA_TZOLKIN_CYCLE = 260;  // 玛雅神圣历周期（260天）
        this.MAYA_HAAB_CYCLE = 365;     // 玛雅太阳历周期（365天）
        this.MAYA_CALENDAR_ROUND = 18980;  // 玛雅历轮回（52年）
        
        // 玛雅历法参考点（与前端保持一致）
        this.MAYA_REFERENCE_DATE = new Date(2025, 8, 23);  // 2025年9月23日 = 磁性的蓝夜
        this.MAYA_REFERENCE_TONE_INDEX = 0;  // 磁性
        this.MAYA_REFERENCE_SEAL_INDEX = 2;  // 蓝夜
    }

    /**
     * 计算给定日期的玛雅历法信息（基于KIN 183校准）
     * @param {Date} dateObj - 日期对象
     * @returns {Object} 玛雅历法信息
     */
    calculateMayaDateInfo(dateObj) {
        // 13种调性（银河音调）
        const TONES = [
            '磁性', '月亮', '电力', '自我存在', '超频', '韵律', '共振',
            '银河', '太阳', '行星', '光谱', '水晶', '宇宙'
        ];
        
        // 20种图腾（太阳印记）
        const SEALS = [
            '红龙', '白风', '蓝夜', '黄种子', '红蛇', '白世界桥', '蓝手', '黄星星',
            '红月', '白狗', '蓝猴', '黄人', '红天行者', '白巫师', '蓝鹰', '黄战士',
            '红地球', '白镜', '蓝风暴', '黄太阳'
        ];
        
        // 使用已知正确的参考点：2025年9月23日 = KIN 183 磁性的蓝夜
        const REFERENCE_KIN = 183;
        
        // 计算从参考日期到目标日期的天数
        const daysDiff = Math.floor((dateObj - this.MAYA_REFERENCE_DATE) / (1000 * 60 * 60 * 24));
        
        // 计算KIN数（1-260的循环）
        let kin = REFERENCE_KIN + daysDiff;
        kin = ((kin - 1) % 260) + 1;
        
        // 从KIN数计算调性和图腾
        const toneIndex = (kin - 1) % 13;
        const sealIndex = (kin - 1) % 20;
        
        const toneName = TONES[toneIndex];
        const sealName = SEALS[sealIndex];
        
        return {
            kin: kin,
            tone_name: toneName,
            seal_name: sealName,
            tone_index: toneIndex,
            seal_index: sealIndex,
            full_name: `${toneName}的${sealName}`
        };
    }

    /**
     * 计算给定日期的KIN码
     * @param {Date} dateObj - 日期对象
     * @returns {number} KIN码
     */
    calculateKinNumber(dateObj) {
        const mayaInfo = this.calculateMayaDateInfo(dateObj);
        return mayaInfo.kin;
    }

    /**
     * 根据KIN码获取玛雅印记及其详细信息
     * @param {number} kin - KIN码
     * @returns {Object} 印记信息
     */
    getMayaSeal(kin) {
        // KIN码对应的印记索引（0-19循环）
        const sealIndex = (kin - 1) % 20;
        const sealName = this.mayaConfig.MAYA_SEAL_LIST[sealIndex];
        
        // 获取印记的详细信息
        const sealInfo = this.mayaConfig.MAYA_SEALS[sealName];
        
        return {
            name: sealName,
            details: sealInfo
        };
    }

    /**
     * 根据KIN码获取玛雅音调及其详细信息
     * @param {number} kin - KIN码
     * @returns {Object} 音调信息
     */
    getMayaTone(kin) {
        // KIN码对应的音调索引（0-12循环）
        const toneIndex = (kin - 1) % 13;
        const toneName = this.mayaConfig.MAYA_TONE_LIST[toneIndex];
        
        // 获取音调的详细信息
        const toneInfo = this.mayaConfig.MAYA_TONES[toneName];
        
        return {
            name: toneName,
            details: toneInfo
        };
    }

    /**
     * 计算玛雅月份和天数
     * @param {Date} dateObj - 日期对象
     * @returns {Object} 玛雅月份信息
     */
    calculateMayaMonth(dateObj) {
        // 玛雅13月历的起始日期（通常是7月26日）
        let mayaYearStart = new Date(dateObj.getFullYear(), 6, 26); // 月份从0开始，所以7月是6
        
        // 如果当前日期在今年7月26日之前，使用去年的起始日期
        if (dateObj < mayaYearStart) {
            mayaYearStart = new Date(dateObj.getFullYear() - 1, 6, 26);
        }
        
        // 计算从玛雅年开始的天数
        const daysSinceMayaYearStart = Math.floor((dateObj - mayaYearStart) / (1000 * 60 * 60 * 24));
        
        // 计算玛雅月份（每月28天）
        let mayaMonthIndex = Math.floor(daysSinceMayaYearStart / 28);
        let mayaDay = (daysSinceMayaYearStart % 28) + 1;
        
        // 处理超出13个月的情况（第13个月可能有29天）
        if (mayaMonthIndex >= 13) {
            mayaMonthIndex = 12;
            mayaDay += (daysSinceMayaYearStart - 12 * 28);
        }
        
        // 确保索引在有效范围内
        mayaMonthIndex = mayaMonthIndex % this.mayaConfig.MAYA_MONTHS.length;
        
        return {
            month: this.mayaConfig.MAYA_MONTHS[mayaMonthIndex],
            day: mayaDay,
            display: `${this.mayaConfig.MAYA_MONTHS[mayaMonthIndex]} | 第${mayaDay}天`
        };
    }

    /**
     * 获取个性化建议和禁忌
     * @param {Date} dateObj - 日期对象
     * @param {number} kin - KIN码
     * @returns {Object} 建议和禁忌
     */
    getPersonalizedSuggestions(dateObj, kin) {
        // 使用确定性算法替代随机选择
        const seedValue = dateObj.getFullYear() * 10000 + (dateObj.getMonth() + 1) * 100 + dateObj.getDate() + kin;
        
        // 获取印记和音调
        const seal = this.getMayaSeal(kin);
        const tone = this.getMayaTone(kin);
        
        // 根据印记和音调的特质选择更相关的建议
        const allSuggestions = this.mayaConfig.SUGGESTIONS["建议"];
        const allAvoidances = this.mayaConfig.SUGGESTIONS["避免"];
        
        // 使用确定性选择替代随机选择
        const suggestions = [];
        for (let i = 0; i < 4; i++) {
            const index = (seedValue + i * 17) % allSuggestions.length;
            if (!suggestions.includes(allSuggestions[index])) {
                suggestions.push(allSuggestions[index]);
            }
        }
        
        // 如果没有足够的建议，补充默认建议
        while (suggestions.length < 4) {
            suggestions.push("保持积极的心态，相信自己的能力");
        }
        
        const avoidances = [];
        for (let i = 0; i < 3; i++) {
            const index = (seedValue + i * 23 + 100) % allAvoidances.length;
            if (!avoidances.includes(allAvoidances[index])) {
                avoidances.push(allAvoidances[index]);
            }
        }
        
        // 如果没有足够的避免项，补充默认避免项
        while (avoidances.length < 3) {
            avoidances.push("避免过度焦虑和负面思考");
        }
        
        return {
            "建议": suggestions,
            "避免": avoidances
        };
    }

    /**
     * 获取个性化幸运物品
     * @param {Date} dateObj - 日期对象
     * @param {number} kin - KIN码
     * @returns {Object} 幸运物品
     */
    getPersonalizedLuckyItems(dateObj, kin) {
        // 使用确定性算法替代随机选择
        const seedValue = dateObj.getFullYear() * 10000 + (dateObj.getMonth() + 1) * 100 + dateObj.getDate() + kin;
        
        // 获取印记和音调
        const sealInfo = this.getMayaSeal(kin);
        const toneInfo = this.getMayaTone(kin);
        
        // 使用确定性选择替代随机选择
        const luckyColors = this.mayaConfig.LUCKY_ITEMS["幸运色"];
        const luckyNumbers = this.mayaConfig.LUCKY_ITEMS["幸运数字"];
        const luckyFoods = this.mayaConfig.LUCKY_ITEMS["幸运食物"];
        
        // 选择幸运色
        const colorIndex = seedValue % luckyColors.length;
        const luckyColor = luckyColors[colorIndex];
        
        // 选择幸运数字
        const numberIndex = (seedValue + 37) % luckyNumbers.length;
        const luckyNumber = luckyNumbers[numberIndex];
        
        // 选择幸运食物
        const foodIndex = (seedValue + 73) % luckyFoods.length;
        const luckyFood = luckyFoods[foodIndex];
        
        return {
            "幸运色": luckyColor["颜色"],
            "幸运数字": luckyNumber["数字"],
            "幸运食物": luckyFood["食物"]
        };
    }

    /**
     * 计算能量分数
     * @param {Date} dateObj - 日期对象
     * @param {number} kin - KIN码
     * @returns {Object} 能量分数
     */
    calculateEnergyScores(dateObj, kin) {
        // 使用日期和KIN码作为基础
        const dayOfYear = this.getDayOfYear(dateObj);
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        
        // 计算月相因子（简化版）
        const moonPhaseFactor = (dayOfYear % 30) / 30.0;
        
        // 计算太阳能量因子（基于一年中的位置）
        const solarFactor = Math.sin(2 * Math.PI * dayOfYear / 365.0);
        
        // 计算KIN码能量因子
        const kinFactor = (kin % 13) / 13.0;
        
        // 基础能量值（60-75之间）
        let baseEnergy = 65 + 5 * solarFactor + 5 * moonPhaseFactor;
        
        // 各领域的能量调整因子
        const adjustments = {
            "综合": 0,
            "爱情": 3 * Math.sin(2 * Math.PI * month / 12),
            "财富": 4 * Math.cos(2 * Math.PI * day / 31),
            "事业": 3 * Math.sin(2 * Math.PI * kin / 260),
            "学习": 4 * Math.cos(2 * Math.PI * dayOfYear / 365)
        };
        
        // 计算最终能量分数
        const scores = {};
        const details = {};
        
        for (const [key, adjustment] of Object.entries(adjustments)) {
            // 计算基础分数
            let score = baseEnergy + adjustment;
            
            // 添加确定性变化（保持一致性）
            // 使用确定性算法替代随机变化
            const variationSeed = dateObj.getFullYear() * 10000 + (dateObj.getMonth() + 1) * 100 + dateObj.getDate() + this.hashCode(key) % 1000 + kin;
            // 使用简单的线性同余生成器生成确定性变化
            const variation = ((variationSeed * 1664525 + 1013904223) % (2**32)) / (2**32) * 16 - 8;
            score += variation;
            
            // 确保分数在合理范围内
            score = Math.max(50, Math.min(score, 95));
            
            // 四舍五入到整数
            score = Math.round(score);
            
            // 存储分数和详细信息
            scores[key] = score;
            details[key] = {
                "score": score,
                "trend": variation > 0 ? "上升" : "下降",
                "intensity": Math.abs(Math.round(variation)),
                "suggestion": this.getEnergySuggestion(key, score)
            };
        }
        
        return {
            "scores": scores,
            "details": details
        };
    }

    /**
     * 获取能量建议
     * @param {string} category - 能量类别
     * @param {number} score - 分数
     * @returns {string} 建议
     */
    getEnergySuggestion(category, score) {
        if (category === "综合") {
            if (score >= 80) {
                return "今天整体能量很高，适合开展各种活动，充分利用这一天";
            } else if (score >= 65) {
                return "今天能量平稳，保持平衡的心态，可以顺利完成计划";
            } else {
                return "今天能量较低，注意休息，避免过度消耗";
            }
        } else if (category === "爱情") {
            if (score >= 80) {
                return "今天爱情能量很高，适合表达感情，增进亲密关系";
            } else if (score >= 65) {
                return "今天爱情能量平稳，保持真诚沟通，维护感情稳定";
            } else {
                return "今天爱情能量较低，给自己和伴侣一些空间，避免冲突";
            }
        } else if (category === "财富") {
            if (score >= 80) {
                return "今天财富能量很高，适合做出财务决策，把握机会";
            } else if (score >= 65) {
                return "今天财富能量平稳，保持理性消费，关注长期规划";
            } else {
                return "今天财富能量较低，避免重大财务决策，保持节制";
            }
        } else if (category === "事业") {
            if (score >= 80) {
                return "今天事业能量很高，适合开展重要工作，展示才能";
            } else if (score >= 65) {
                return "今天事业能量平稳，专注当前任务，稳步推进";
            } else {
                return "今天事业能量较低，处理常规事务，避免重大决策";
            }
        } else if (category === "学习") {
            if (score >= 80) {
                return "今天学习能量很高，适合学习新知识，接受挑战";
            } else if (score >= 65) {
                return "今天学习能量平稳，保持专注，巩固已有知识";
            } else {
                return "今天学习能量较低，适合复习和整理，避免高难度内容";
            }
        }
        
        return "保持平衡，关注自己的需求";
    }

    /**
     * 获取每日灵感信息
     * @param {Date} dateObj - 日期对象
     * @param {number} kin - KIN码
     * @returns {Object} 灵感信息
     */
    getDailyInspiration(dateObj, kin) {
        // 使用确定性算法替代随机选择
        const seedValue = dateObj.getFullYear() * 10000 + (dateObj.getMonth() + 1) * 100 + dateObj.getDate() + kin;
        
        // 使用确定性选择替代随机选择
        const messageIndex = seedValue % this.mayaConfig.DAILY_MESSAGES.length;
        const dailyMessage = this.mayaConfig.DAILY_MESSAGES[messageIndex];
        
        const quoteIndex = (seedValue + 41) % this.mayaConfig.DAILY_QUOTES.length;
        const dailyQuote = this.mayaConfig.DAILY_QUOTES[quoteIndex];
        
        return {
            "message": dailyMessage,
            "quote": dailyQuote
        };
    }

    /**
     * 检查是否是特殊日期
     * @param {Date} dateObj - 日期对象
     * @returns {Object|null} 特殊日期信息
     */
    checkSpecialDate(dateObj) {
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const day = dateObj.getDate();
        
        // 简化版特殊日期检查（实际应使用天文计算）
        const specialDates = {
            "3-20": "春分",  // 约3月20日
            "6-21": "夏至",  // 约6月21日
            "9-23": "秋分",  // 约9月23日
            "12-21": "冬至"  // 约12月21日
        };
        
        const dateKey = `${month}-${day}`;
        if (specialDates[dateKey]) {
            const specialDateName = specialDates[dateKey];
            return {
                "name": specialDateName,
                "info": this.mayaConfig.MAYA_KEY_DATES[specialDateName]
            };
        }
        
        return null;
    }

    /**
     * 生成指定日期的玛雅日历信息
     * @param {Date} dateObj - 日期对象
     * @returns {Object} 玛雅日历信息
     */
    generateMayaInfo(dateObj) {
        // 基础日期信息
        const dateStr = this.getDateStr(dateObj);
        const weekday = this.getWeekday(dateObj);
        
        // 使用新的算法计算玛雅历法信息
        const mayaDateInfo = this.calculateMayaDateInfo(dateObj);
        const kin = mayaDateInfo.kin;
        
        // 获取玛雅印记和音调（包含详细信息）
        const sealInfo = this.getMayaSeal(kin);
        const toneInfo = this.getMayaTone(kin);
        
        // 获取玛雅月份和天数
        const mayaMonthInfo = this.calculateMayaMonth(dateObj);
        
        // 生成玛雅印记描述（使用新算法的结果）
        const sealDesc = mayaDateInfo.full_name;
        
        // 获取个性化建议和禁忌
        const suggestions = this.getPersonalizedSuggestions(dateObj, kin);
        
        // 获取个性化幸运物品
        const luckyItems = this.getPersonalizedLuckyItems(dateObj, kin);
        
        // 计算能量分数
        const energyInfo = this.calculateEnergyScores(dateObj, kin);
        
        // 获取每日灵感
        const inspiration = this.getDailyInspiration(dateObj, kin);
        
        // 检查是否是特殊日期
        const specialDate = this.checkSpecialDate(dateObj);
        
        // 构建玛雅日历信息
        const mayaInfo = {
            "date": dateStr,
            "weekday": weekday,
            "maya_kin": kin,  // 直接返回数字，不加前缀
            "maya_tone": mayaDateInfo.tone_name,  // 使用新算法的调性
            "maya_month": mayaMonthInfo,
            "maya_seal": mayaDateInfo.seal_name,  // 使用新算法的图腾
            "maya_seal_info": sealInfo.details,
            "maya_tone_info": toneInfo.details,
            "maya_seal_desc": sealDesc,  // 完整描述：调性的图腾
            "suggestions": suggestions,
            "lucky_items": luckyItems,
            "daily_message": inspiration.message,
            "daily_quote": inspiration.quote,
            "energy_scores": energyInfo.scores,
            "energy_details": energyInfo.details,
            "special_date": specialDate,
            "daily_guidance": {
                "morning": "保持平静的心态，专注于当下的任务",
                "afternoon": "处理重要事务，保持专注和耐心",
                "evening": "放松身心，回顾今日的收获和成长"
            }
        };
        
        return mayaInfo;
    }

    /**
     * 获取今日玛雅日历信息
     * @returns {Object} 今日玛雅日历信息
     */
    getTodayMayaInfo() {
        const today = new Date();
        return this.generateMayaInfo(today);
    }

    /**
     * 获取指定日期的玛雅日历信息
     * @param {string} dateStr - 日期字符串 (YYYY-MM-DD)
     * @returns {Object} 指定日期玛雅日历信息
     */
    getDateMayaInfo(dateStr) {
        try {
            const dateObj = new Date(dateStr);
            return this.generateMayaInfo(dateObj);
        } catch (error) {
            // 处理日期格式错误
            return {"error": "日期格式无效，请使用YYYY-MM-DD格式"};
        }
    }

    /**
     * 获取一段时间内的玛雅日历信息
     * @param {number} daysBefore - 之前天数
     * @param {number} daysAfter - 之后天数
     * @returns {Object} 玛雅日历信息范围
     */
    getMayaInfoRange(daysBefore = 3, daysAfter = 3) {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - daysBefore);
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + daysAfter);
        
        // 生成日期范围内的每一天
        const currentDate = new Date(startDate);
        const mayaInfoList = [];
        
        while (currentDate <= endDate) {
            const mayaInfo = this.generateMayaInfo(new Date(currentDate));
            mayaInfoList.push(mayaInfo);
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return {
            "maya_info_list": mayaInfoList,
            "date_range": {
                "start": this.getDateStr(startDate),
                "end": this.getDateStr(endDate)
            }
        };
    }

    /**
     * 更新玛雅历史记录
     * @param {string} birthDateStr - 出生日期字符串
     */
    updateMayaHistory(birthDateStr) {
        try {
            // 验证日期格式
            new Date(birthDateStr);
            
            // 如果日期已经在历史记录中，先移除它
            const index = this.mayaHistoryDates.indexOf(birthDateStr);
            if (index !== -1) {
                this.mayaHistoryDates.splice(index, 1);
            }
            
            // 将新日期添加到列表开头
            this.mayaHistoryDates.unshift(birthDateStr);
            
            // 保持列表长度不超过MAX_MAYA_HISTORY
            if (this.mayaHistoryDates.length > this.MAX_MAYA_HISTORY) {
                this.mayaHistoryDates = this.mayaHistoryDates.slice(0, this.MAX_MAYA_HISTORY);
            }
        } catch (error) {
            // 如果日期格式无效，不更新历史记录
            console.log(`无效的日期格式: ${birthDateStr}`);
        }
    }

    /**
     * 获取玛雅历史记录
     * @returns {Array} 玛雅历史记录
     */
    getMayaHistory() {
        return [...this.mayaHistoryDates]; // 返回副本
    }

    /**
     * 获取出生日期的玛雅日历信息
     * @param {string} birthDateStr - 出生日期字符串 (YYYY-MM-DD)
     * @returns {Object} 出生日历信息
     */
    getMayaBirthInfo(birthDateStr) {
        try {
            const birthDate = new Date(birthDateStr);
            // 更新历史记录
            this.updateMayaHistory(birthDateStr);
        } catch (error) {
            console.log(`日期格式错误: ${error}`);
            return {"error": "出生日期格式无效，请使用YYYY-MM-DD格式"};
        }
        
        // 获取基本玛雅日历信息
        const basicInfo = this.generateMayaInfo(new Date(birthDateStr));
        
        // 计算KIN码
        const kin = this.calculateKinNumber(new Date(birthDateStr));
        
        // 获取印记和音调信息
        const sealInfo = this.getMayaSeal(kin);
        const toneInfo = this.getMayaTone(kin);
        
        // 生成生命使命信息
        const lifePurpose = {
            "summary": `${toneInfo.name}的${sealInfo.name}代表了一种独特的生命能量`,
            "details": `你的生命使命与${sealInfo.details['特质']}有关`,
            "action_guide": `通过${toneInfo.details['行动']}的方式来实现你的潜能`
        };
        
        // 生成个人特质信息
        const personalTraits = {
            "strengths": [
                `与${sealInfo.details['特质'].split('、')[0]}相关的天赋`,
                `在${sealInfo.details['能量'].split('、')[0]}方面的能力`,
                `体现${toneInfo.details['本质']}的能力`,
                "发现和培养自己独特的才能",
                `${sealInfo.details['特质'].split('、')[1] ? sealInfo.details['特质'].split('、')[1] : sealInfo.details['特质']}相关的天赋`
            ],
            "challenges": [
                "平衡内在需求和外在期望",
                "克服内向和保守",
                "避免过度自我保护"
            ]
        };
        
        // 生成能量场信息
        // 基于印记和音调选择主要和次要能量场
        const energyFields = Object.keys(this.mayaConfig.ENERGY_FIELDS);
        
        // 使用确定性算法选择能量场
        const seedValue = this.getDateObj(birthDateStr).getTime() / (1000 * 60 * 60 * 24) + kin;
        
        const primaryField = energyFields[kin % energyFields.length];
        const remainingFields = energyFields.filter(f => f !== primaryField);
        const secondaryField = remainingFields[(seedValue + 13) % remainingFields.length];
        
        const birthEnergyField = {
            "primary": {
                "type": primaryField,
                "info": this.mayaConfig.ENERGY_FIELDS[primaryField]
            },
            "secondary": {
                "type": secondaryField,
                "info": this.mayaConfig.ENERGY_FIELDS[secondaryField]
            },
            "balance_suggestion": `平衡${primaryField}和${secondaryField}的能量，发挥你的最大潜能`
        };
        
        // 构建出生日历信息
        const birthInfo = {
            "date": basicInfo["date"],
            "weekday": basicInfo["weekday"],
            "maya_kin": basicInfo["maya_kin"],
            "maya_seal": basicInfo["maya_seal"],
            "maya_seal_desc": basicInfo["maya_seal_desc"],
            "maya_seal_info": basicInfo["maya_seal_info"],
            "maya_tone_info": basicInfo["maya_tone_info"],
            "life_purpose": lifePurpose,
            "personal_traits": personalTraits,
            "birth_energy_field": birthEnergyField
        };
        
        return birthInfo;
    }

    /**
     * 获取日期字符串
     * @param {Date} dateObj - 日期对象
     * @returns {string} 日期字符串 (YYYY-MM-DD)
     */
    getDateStr(dateObj) {
        if (!dateObj) {
            dateObj = new Date();
        }
        return dateObj.toISOString().split('T')[0];
    }

    /**
     * 获取星期几
     * @param {Date|string} dateInput - 日期输入
     * @returns {string} 星期几
     */
    getWeekday(dateInput) {
        let dateObj;
        if (!dateInput) {
            dateObj = new Date();
        } else if (typeof dateInput === 'string') {
            dateObj = new Date(dateInput);
        } else {
            dateObj = dateInput;
        }
        
        const weekdays = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];
        return weekdays[dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1];
    }

    /**
     * 获取一年中的第几天
     * @param {Date} dateObj - 日期对象
     * @returns {number} 一年中的第几天
     */
    getDayOfYear(dateObj) {
        const start = new Date(dateObj.getFullYear(), 0, 0);
        const diff = dateObj - start;
        const oneDay = 1000 * 60 * 60 * 24;
        return Math.floor(diff / oneDay);
    }

    /**
     * 获取日期对象
     * @param {string} dateStr - 日期字符串
     * @returns {Date} 日期对象
     */
    getDateObj(dateStr) {
        return new Date(dateStr);
    }

    /**
     * 计算哈希值
     * @param {string} str - 字符串
     * @returns {number} 哈希值
     */
    hashCode(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return Math.abs(hash);
    }
}

// 创建全局玛雅服务实例
const mayaService = new MayaService();

module.exports = { mayaService };