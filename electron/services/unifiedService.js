const { biorhythmService } = require('./biorhythmService');
const { mayaService } = require('./mayaService');
const { dressService } = require('./dressService');
const { seasonHealthService } = require('./seasonHealthService');
const { zodiacEnergyService } = require('./zodiacEnergyService');

/**
 * 统一服务
 * 整合生物节律、玛雅历法和穿搭建议功能
 */
class UnifiedService {
    constructor() {
        this.biorhythmService = biorhythmService;
        this.mayaService = mayaService;
        this.dressService = dressService;
        this.seasonHealthService = seasonHealthService;
        this.zodiacEnergyService = zodiacEnergyService;
    }

    // ==================== 生物节律相关接口 ====================
    
    /**
     * 获取生物节律历史查询记录
     * @returns {Object} 历史记录
     */
    getBiorhythmHistory() {
        return {"history": this.biorhythmService.getHistory()};
    }

    /**
     * 获取今天的生物节律
     * @param {string} birthDate - 出生日期 (YYYY-MM-DD)
     * @returns {Object} 今日生物节律数据
     */
    getTodayBiorhythm(birthDate) {
        return this.biorhythmService.getTodayBiorhythm(birthDate);
    }

    /**
     * 获取指定日期的生物节律
     * @param {string} birthDate - 出生日期 (YYYY-MM-DD)
     * @param {string} date - 目标日期 (YYYY-MM-DD)
     * @returns {Object} 指定日期生物节律数据
     */
    getDateBiorhythm(birthDate, date) {
        return this.biorhythmService.getDateBiorhythm(birthDate, date);
    }

    /**
     * 获取一段时间内的生物节律
     * @param {string} birthDate - 出生日期 (YYYY-MM-DD)
     * @param {number} daysBefore - 之前天数
     * @param {number} daysAfter - 之后天数
     * @returns {Object} 生物节律范围数据
     */
    getBiorhythmRange(birthDate, daysBefore, daysAfter) {
        return this.biorhythmService.getBiorhythmRange(birthDate, daysBefore, daysAfter);
    }

    // ==================== 玛雅历法相关接口 ====================
    
    /**
     * 获取今日玛雅历法信息
     * @returns {Object} 今日玛雅历法信息
     */
    getTodayMayaInfo() {
        return this.mayaService.getTodayMayaInfo();
    }

    /**
     * 获取指定日期的玛雅历法信息
     * @param {string} date - 目标日期 (YYYY-MM-DD)
     * @returns {Object} 指定日期玛雅历法信息
     */
    getDateMayaInfo(date) {
        return this.mayaService.getDateMayaInfo(date);
    }

    /**
     * 获取一段时间内的玛雅历法信息
     * @param {number} daysBefore - 之前天数
     * @param {number} daysAfter - 之后天数
     * @returns {Object} 玛雅历法范围信息
     */
    getMayaInfoRange(daysBefore, daysAfter) {
        return this.mayaService.getMayaInfoRange(daysBefore, daysAfter);
    }

    /**
     * 获取玛雅出生图信息
     * @param {string} birthDate - 出生日期 (YYYY-MM-DD)
     * @returns {Object} 玛雅出生图信息
     */
    getMayaBirthInfo(birthDate) {
        return this.mayaService.getMayaBirthInfo(birthDate);
    }

    /**
     * 获取玛雅历史记录
     * @returns {Object} 玛雅历史记录
     */
    getMayaHistory() {
        return {
            "success": true,
            "history": this.mayaService.getMayaHistory()
        };
    }

    // ==================== 穿搭建议相关接口 ====================
    
    /**
     * 获取今日穿衣颜色和饮食建议
     * @returns {Object} 今日穿搭建议
     */
    getTodayDressInfo() {
        return this.dressService.getTodayDressInfo();
    }

    /**
     * 获取指定日期的穿衣颜色和饮食建议
     * @param {string} date - 目标日期 (YYYY-MM-DD)
     * @returns {Object} 指定日期穿搭建议
     */
    getDateDressInfo(date) {
        return this.dressService.getDateDressInfo(date);
    }

    /**
     * 获取一段时间内的穿衣颜色和饮食建议
     * @param {number} daysBefore - 之前天数
     * @param {number} daysAfter - 之后天数
     * @returns {Object} 穿搭建议范围
     */
    getDressInfoRange(daysBefore, daysAfter) {
        return this.dressService.getDressInfoRange(daysBefore, daysAfter);
    }

    // ==================== 四季五行养生相关接口 ====================
    
    /**
     * 获取综合的四季五行养生建议
     * @param {Date|string} date - 日期
     * @returns {Object} 养生建议数据
     */
    getSeasonHealthAdvice(date) {
        return this.seasonHealthService.getSeasonHealthAdvice(date);
    }

    // ==================== 生肖能量相关接口 ====================
    
    /**
     * 获取今日生肖能量指引
     * @param {string} userZodiac - 用户生肖
     * @returns {Object} 今日能量指引
     */
    getTodayZodiacEnergy(userZodiac) {
        return this.zodiacEnergyService.getTodayEnergyGuidance(userZodiac);
    }

    /**
     * 获取指定日期的生肖能量指引
     * @param {string} userZodiac - 用户生肖
     * @param {string} date - 目标日期 (YYYY-MM-DD)
     * @returns {Object} 指定日期能量指引
     */
    getDateZodiacEnergy(userZodiac, date) {
        return this.zodiacEnergyService.getDateEnergyGuidance(userZodiac, date);
    }

    /**
     * 根据年份计算生肖
     * @param {number} year - 年份
     * @returns {string} 生肖
     */
    getZodiacFromYear(year) {
        return this.zodiacEnergyService.getZodiacFromYear(year);
    }

    /**
     * 获取所有生肖列表
     * @returns {Array} 生肖列表
     */
    getAllZodiacs() {
        return this.zodiacEnergyService.getAllZodiacs();
    }

    // ==================== 系统接口 ====================
    
    /**
     * 健康检查
     * @returns {Object} 健康检查结果
     */
    healthCheck() {
        return {
            "status": "healthy",
            "service": "unified-backend",
            "timestamp": new Date().toISOString(),
            "services": {
                "biorhythm": true,
                "maya": true,
                "dress": true,
                "seasonHealth": true,
                "zodiacEnergy": true
            }
        };
    }
}

// 创建全局统一服务实例
const unifiedService = new UnifiedService();

module.exports = { unifiedService };