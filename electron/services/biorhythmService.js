const { configLoader } = require('./configLoader');

/**
 * 生物节律服务
 * 提供生物节律计算功能
 */
class BiorhythmService {
    constructor() {
        // 获取生物节律周期配置
        this.cycles = configLoader.getBiorhythmConfig().cycles;
        this.maxHistory = configLoader.getBiorhythmConfig().max_history;
        
        // 存储用户历史查询的出生日期
        this.historyDates = [];
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
        
        // 计算天数差
        const daysSinceBirth = Math.floor((targetDateObj - birthDateObj) / (1000 * 60 * 60 * 24));

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
        const [physical, emotional, intellectual] = this.calculateBiorhythm(birthDate, currentDate);
        
        return {
            date: currentDate.toISOString().split('T')[0],
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
            const dateStr = currentDateIter.toISOString().split('T')[0];
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
            return new Date(dateInput);
        } else {
            throw new Error(`无法解析日期: ${dateInput}`);
        }
    }
}

// 创建全局生物节律服务实例
const biorhythmService = new BiorhythmService();

module.exports = { biorhythmService };