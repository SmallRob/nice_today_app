const { configLoader } = require('./configLoader');
const { userConfigManager } = require('./userConfigManager');

/**
 * 生物节律服务
 * 提供生物节律计算功能
 */
class BiorhythmService {
    constructor() {
        // 获取生物节律周期配置
        this.cycles = configLoader.getBiorhythmConfig().cycles;
        this.maxHistory = configLoader.getBiorhythmConfig().max_history;
        
        // 加载用户历史记录
        this.loadHistoryFromConfig();
    }

    /**
     * 从用户配置加载历史记录
     */
    loadHistoryFromConfig() {
        try {
            const historyItems = userConfigManager.getBiorhythmHistory();
            this.historyDates = [...historyItems];
            console.log('加载历史记录成功:', this.historyDates.length, '个历史记录');
        } catch (error) {
            console.error('加载历史记录失败:', error);
            this.historyDates = [];
        }
    }

    /**
     * 获取默认出生日期
     * @returns {string} 默认出生日期
     */
    getDefaultBirthDate() {
        // 确保历史记录已加载
        if (!this.historyDates || this.historyDates.length === 0) {
            this.loadHistoryFromConfig();
        }
        
        // 如果有历史记录，返回最新的历史记录日期
        if (this.historyDates && this.historyDates.length > 0) {
            console.log('使用历史记录中的最新日期:', this.historyDates[0]);
            return this.historyDates[0];
        }
        
        // 否则返回默认日期
        console.log('没有历史记录，使用默认日期: 1991-01-01');
        return "1991-01-01";
    }

    /**
     * 计算特定周期的节律值
     * @param {number} cycle - 周期天数
     * @param {number} daysSinceBirth - 出生以来的天数
     * @returns {number} 节律值
     */
    calculateRhythmValue(cycle, daysSinceBirth) {
        return Math.round(100 * Math.sin(2 * Math.PI * daysSinceBirth / cycle));
    }

    /**
     * 计算特定日期的生物节律值
     * @param {string} birthDate - 出生日期 (YYYY-MM-DD)
     * @param {string} targetDate - 目标日期 (YYYY-MM-DD)
     * @returns {Array} [physical, emotional, intellectual] 节律值数组
     */
    calculateBiorhythm(birthDate, targetDate) {
        const birthDateObj = this.parseDate(birthDate);
        const targetDateObj = this.parseDate(targetDate);
        
        // 计算天数差，使用更精确的方法避免时区问题
        const timeDiff = targetDateObj.getTime() - birthDateObj.getTime();
        const daysSinceBirth = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

        const physicalValue = this.calculateRhythmValue(this.cycles.physical, daysSinceBirth);
        const emotionalValue = this.calculateRhythmValue(this.cycles.emotional, daysSinceBirth);
        const intellectualValue = this.calculateRhythmValue(this.cycles.intellectual, daysSinceBirth);

        return [physicalValue, emotionalValue, intellectualValue];
    }

    /**
     * 更新历史记录
     * @param {string} birthDate - 出生日期
     */
    updateHistory(birthDate) {
        // 如果日期已经在历史记录中，先移除它
        const index = this.historyDates.indexOf(birthDate);
        if (index !== -1) {
            this.historyDates.splice(index, 1);
        }
        
        // 将新日期添加到列表开头
        this.historyDates.unshift(birthDate);
        
        // 保持列表长度不超过MAX_HISTORY
        if (this.historyDates.length > this.maxHistory) {
            this.historyDates = this.historyDates.slice(0, this.maxHistory);
        }

        // 保存到用户配置
        try {
            userConfigManager.addBiorhythmHistory(birthDate);
        } catch (error) {
            console.error('保存历史记录失败:', error);
        }
    }

    /**
     * 获取历史记录
     * @returns {Array} 历史记录数组
     */
    getHistory() {
        return [...this.historyDates]; // 返回副本
    }

    /**
     * 获取今天的生物节律
     * @param {string} birthDate - 出生日期
     * @returns {Object} 今日生物节律数据
     */
    getTodayBiorhythm(birthDate) {
        // 更新历史记录
        this.updateHistory(birthDate);
        
        const currentDate = new Date();
        const [physical, emotional, intellectual] = this.calculateBiorhythm(birthDate, this.formatDateLocal(currentDate));
        
        // 使用本地时间格式化日期，避免时区问题
        return {
            date: this.formatDateLocal(currentDate),
            physical: physical,
            emotional: emotional,
            intellectual: intellectual
        };
    }

    /**
     * 获取指定日期的生物节律
     * @param {string} birthDate - 出生日期
     * @param {string} date - 目标日期
     * @returns {Object} 指定日期生物节律数据
     */
    getDateBiorhythm(birthDate, date) {
        // 更新历史记录
        this.updateHistory(birthDate);
        
        const [physical, emotional, intellectual] = this.calculateBiorhythm(birthDate, date);
        
        return {
            date: date,
            physical: physical,
            emotional: emotional,
            intellectual: intellectual
        };
    }

    /**
     * 获取一段时间内的生物节律
     * @param {string} birthDate - 出生日期
     * @param {number} daysBefore - 之前天数
     * @param {number} daysAfter - 之后天数
     * @returns {Object} 生物节律范围数据
     */
    getBiorhythmRange(birthDate, daysBefore, daysAfter) {
        // 更新历史记录
        this.updateHistory(birthDate);
        
        const birthDateObj = this.parseDate(birthDate);
        const currentDate = new Date();
        
        // 计算日期范围
        const startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - daysBefore);
        
        const endDate = new Date(currentDate);
        endDate.setDate(currentDate.getDate() + daysAfter);
        
        // 初始化结果数组
        const dates = [];
        const physicalValues = [];
        const emotionalValues = [];
        const intellectualValues = [];
        
        // 计算每一天的节律值
        const currentDateIter = new Date(startDate);
        while (currentDateIter <= endDate) {
            const dateStr = this.formatDateLocal(currentDateIter);
            const [physical, emotional, intellectual] = this.calculateBiorhythm(birthDate, dateStr);
            
            dates.push(dateStr);
            physicalValues.push(physical);
            emotionalValues.push(emotional);
            intellectualValues.push(intellectual);
            
            currentDateIter.setDate(currentDateIter.getDate() + 1);
        }
        
        return {
            dates: dates,
            physical: physicalValues,
            emotional: emotionalValues,
            intellectual: intellectualValues
        };
    }

    /**
     * 解析日期字符串
     * @param {string|Date} dateInput - 日期输入
     * @returns {Date} Date对象
     */
    parseDate(dateInput) {
        if (dateInput instanceof Date) {
            return dateInput;
        } else if (typeof dateInput === 'string') {
            // 处理YYYY-MM-DD格式的日期字符串，按本地时间（东八区）计算
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
                const parts = dateInput.split('-');
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // 月份从0开始
                const day = parseInt(parts[2], 10);
                
                // 使用本地时间创建日期，不涉及时区转换
                // 按照用户输入的日期直接计算节律，与当前时间无关
                return new Date(year, month, day);
            }
            return new Date(dateInput);
        } else {
            throw new Error(`无法解析日期: ${dateInput}`);
        }
    }

    /**
     * 格式化日期为YYYY-MM-DD字符串，按本地时间（东八区）
     * @param {Date} date - 日期对象
     * @returns {string} 格式化后的日期字符串
     */
    formatDateLocal(date) {
        if (!date) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

// 创建全局生物节律服务实例
const biorhythmService = new BiorhythmService();

module.exports = { biorhythmService };