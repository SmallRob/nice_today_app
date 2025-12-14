const { configLoader } = require('./configLoader');

/**
 * 穿搭建议服务
 * 提供穿衣颜色和饮食建议功能
 */
class DressService {
    constructor() {
        // 获取配置
        this.fiveElements = configLoader.getFiveElementsConfig();
        this.colorSystems = configLoader.getColorSystemsConfig();
        this.dailyFood = configLoader.getConfig().daily_food || {};
        this.weekdayElements = configLoader.getConfig().weekday_elements || ["金", "木", "水", "火", "土", "金", "木"];
        this.starColors = configLoader.getConfig().star_colors || ["青色系", "黑色系", "红色系", "黄色系", "白色系", "青色系", "黑色系"];
        this.weekdayNames = configLoader.getConfig().weekday_names || ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];
    }

    /**
     * 根据日期计算当日五行属性
     * @param {string|Date} date - 日期
     * @returns {string} 五行属性
     */
    getDailyFiveElement(date = null) {
        const dateObj = this.parseDate(date);
        
        // 使用日期的多个因素来确定五行属性，使每天都有所不同
        // 1. 使用星期几作为基础
        const weekday = dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1; // 调整为0-6的范围，星期一为0
        const baseElement = this.weekdayElements[weekday];
        
        // 2. 使用日期的日、月、年的组合来调整
        const day = dateObj.getDate();
        const month = dateObj.getMonth() + 1;
        const year = dateObj.getFullYear();
        
        // 使用日期的各个部分计算一个哈希值，用于确定五行
        const dateHash = (day * 100 + month * 10 + year % 10) % 5;
        
        // 五行列表
        const elements = Object.keys(this.fiveElements); // ['金', '木', '水', '火', '土']
        
        // 根据日期哈希值调整基础五行
        // 如果哈希值为0，保持原有五行
        // 否则，根据哈希值选择不同的五行
        if (dateHash !== 0) {
            // 确保选择的五行与基础五行不同
            const availableElements = elements.filter(e => e !== baseElement);
            // 使用哈希值选择一个五行
            const selectedIndex = (dateHash - 1) % availableElements.length;
            return availableElements[selectedIndex];
        }
        
        return baseElement;
    }

    /**
     * 计算当日星宿运行对穿衣颜色的影响
     * @param {string|Date} date - 日期
     * @returns {string} 星宿颜色
     */
    getDailyStarInfluence(date = null) {
        const dateObj = this.parseDate(date);
        
        // 使用日期的多个因素来确定星宿影响
        const dayOfYear = this.getDayOfYear(dateObj); // 一年中的第几天
        const day = dateObj.getDate();
        const month = dateObj.getMonth() + 1;
        
        // 使用日期的不同组合来计算星宿索引
        // 这样可以确保不同日期有不同的星宿影响
        const starIndex = (dayOfYear + day * month) % this.starColors.length;
        
        return this.starColors[starIndex];
    }

    /**
     * 获取当日推荐穿衣颜色
     * @param {string|Date} date - 日期
     * @returns {Array} 推荐颜色系统列表
     */
    getRecommendedColors(date = null) {
        const dailyElement = this.getDailyFiveElement(date);
        const starColor = this.getDailyStarInfluence(date);
        
        // 获取与当日五行相生或相同的颜色系统
        const recommendedColors = [];
        for (const [colorSystem, info] of Object.entries(this.colorSystems)) {
            const element = info["五行"];
            if (element === dailyElement || 
                this.fiveElements[dailyElement]["生"] === element || 
                this.fiveElements[element]["生"] === dailyElement) {
                recommendedColors.push(colorSystem);
            }
        }
        
        // 如果星宿颜色不在推荐列表中，也添加进去
        if (!recommendedColors.includes(starColor)) {
            recommendedColors.push(starColor);
        }
        
        return recommendedColors;
    }

    /**
     * 获取当日饮食建议
     * @param {string|Date} date - 日期
     * @returns {Object} 饮食建议
     */
    getDailyFoodSuggestions(date = null) {
        const dateObj = this.parseDate(date);
        
        // 基础食物建议基于星期几
        const weekday = dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1; // 调整为0-6的范围，星期一为0
        const baseSuggestions = this.dailyFood[String(weekday)] || {"宜": [], "忌": []};
        
        // 使用日期的日、月来调整食物建议，使每天都有所不同
        const day = dateObj.getDate();
        const month = dateObj.getMonth() + 1;
        
        // 所有可能的宜食食物和忌食食物
        const allGoodFoods = [];
        const allBadFoods = [];
        
        for (const dayFoods of Object.values(this.dailyFood)) {
            allGoodFoods.push(...dayFoods["宜"]);
            allBadFoods.push(...dayFoods["忌"]);
        }
        
        // 去重
        const uniqueGoodFoods = [...new Set(allGoodFoods)];
        const uniqueBadFoods = [...new Set(allBadFoods)];
        
        // 使用日期生成确定性种子，确保同一天生成的结果一致
        const seed = day + month * 100 + dateObj.getFullYear() * 10000;
        
        // 从基础建议中保留一部分，并添加一些确定性选择的食物
        const goodFoods = baseSuggestions["宜"].slice(0, 2); // 保留前两个
        const badFoods = baseSuggestions["忌"].slice(0, 2);  // 保留前两个
        
        // 添加一个确定性选择的宜食食物
        const remainingGood = uniqueGoodFoods.filter(f => !goodFoods.includes(f));
        if (remainingGood.length > 0) {
            const selectedIndex = seed % remainingGood.length;
            goodFoods.push(remainingGood[selectedIndex]);
        }
        
        // 添加一个确定性选择的忌食食物
        const remainingBad = uniqueBadFoods.filter(f => !badFoods.includes(f));
        if (remainingBad.length > 0) {
            const selectedIndex = (seed + 37) % remainingBad.length;
            badFoods.push(remainingBad[selectedIndex]);
        }
        
        return {
            "宜": goodFoods,
            "忌": badFoods
        };
    }

    /**
     * 获取指定日期的穿衣与饮食建议
     * @param {string|Date} date - 日期
     * @returns {Object} 穿衣与饮食建议
     */
    getDressInfoForDate(date = null) {
        const dateObj = this.parseDate(date);
        const dailyElement = this.getDailyFiveElement(date);
        
        // 获取颜色建议
        const colorSuggestions = [];
        for (const [colorSystem, info] of Object.entries(this.colorSystems)) {
            const element = info["五行"];
            const relation = element === dailyElement ? "相同" : (
                this.fiveElements[dailyElement]["生"] === element || this.fiveElements[element]["生"] === dailyElement ? "相生" : (
                this.fiveElements[dailyElement]["克"] === element ? "相克" : "被克"
                )
            );
            
            // 根据日期调整吉凶判断，使每天的建议更加多样化
            const day = dateObj.getDate();
            const month = dateObj.getMonth() + 1;
            
            // 使用日期生成确定性种子，确保同一天生成的结果一致
            const seed = day + month * 100 + dateObj.getFullYear() * 10000 + this.hashCode(colorSystem);
            
            // 基于五行关系的基础吉凶判断
            let baseLuck = "吉";
            if (relation === "被克") {
                baseLuck = "不吉";
            } else if (relation !== "相同" && relation !== "相生") {
                baseLuck = "中性";
            }
            
            // 有10%的概率反转吉凶判断，增加变化性
            let luck = baseLuck;
            if (seed % 100 < 10) {
                if (baseLuck === "吉") {
                    luck = "中性";
                } else if (baseLuck === "不吉") {
                    luck = "中性";
                } else if (baseLuck === "中性") {
                    luck = seed % 2 === 0 ? "吉" : "不吉";
                }
            }
            
            // 根据日期调整描述，使每天的建议更加多样化
            const descriptions = [
                `于当日五行${relation}，${luck}相宜。今日若身着此类衣物配饰，有助于提升个人气场。`,
                `今日五行${relation}，整体环境${luck}。此颜色系能够帮助你更好地适应今天的能量场。`,
                `当日五行与此颜色${relation}，${luck}。穿着此类颜色有助于调和今日的能量。`,
                `此颜色与今日五行${relation}，${luck}。适合需要${["专注", "放松", "社交", "思考"][seed % 4]}的场合。`,
                `今日此颜色${luck}，与当日五行${relation}。可以${["提升运势", "增强气场", "改善心情", "促进交流"][seed % 4]}。`
            ];
            
            // 确定性选择一个描述
            const selectedDescription = descriptions[seed % descriptions.length];
            
            const suggestion = {
                "颜色系统": colorSystem,
                "具体颜色": info["颜色"],
                "五行关系": `与当日五行${relation}`,
                "吉凶": luck,
                "描述": selectedDescription
            };
            colorSuggestions.push(suggestion);
        }
        
        // 获取饮食建议
        const foodSuggestions = this.getDailyFoodSuggestions(date);
        
        return {
            "date": dateObj.toISOString().split('T')[0],
            "weekday": this.weekdayNames[dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1],
            "daily_element": dailyElement,
            "color_suggestions": colorSuggestions,
            "food_suggestions": foodSuggestions
        };
    }

    /**
     * 获取今日穿衣颜色和饮食建议
     * @returns {Object} 今日穿衣与饮食建议
     */
    getTodayDressInfo() {
        return this.getDressInfoForDate();
    }

    /**
     * 获取指定日期的穿衣颜色和饮食建议
     * @param {string} date - 日期字符串 (YYYY-MM-DD)
     * @returns {Object} 指定日期穿衣与饮食建议
     */
    getDateDressInfo(date) {
        return this.getDressInfoForDate(date);
    }

    /**
     * 获取一段时间内的穿衣颜色和饮食建议
     * @param {number} daysBefore - 之前天数
     * @param {number} daysAfter - 之后天数
     * @returns {Object} 穿衣建议范围
     */
    getDressInfoRange(daysBefore, daysAfter) {
        const currentDate = new Date();
        
        // 计算日期范围
        const startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - daysBefore);
        
        const endDate = new Date(currentDate);
        endDate.setDate(currentDate.getDate() + daysAfter);
        
        // 初始化结果数组
        const dressInfoList = [];
        
        // 计算每一天的穿衣信息
        const currentDateIter = new Date(startDate);
        while (currentDateIter <= endDate) {
            const dateStr = currentDateIter.toISOString().split('T')[0];
            const dressInfo = this.getDressInfoForDate(dateStr);
            dressInfoList.push(dressInfo);
            
            currentDateIter.setDate(currentDateIter.getDate() + 1);
        }
        
        return {
            "date_range": {
                "start": startDate.toISOString().split('T')[0],
                "end": endDate.toISOString().split('T')[0]
            },
            "dress_info_list": dressInfoList
        };
    }

    /**
     * 解析日期
     * @param {string|Date} dateInput - 日期输入
     * @returns {Date} Date对象
     */
    parseDate(dateInput) {
        if (!dateInput) {
            return new Date();
        } else if (typeof dateInput === 'string') {
            return new Date(dateInput);
        } else if (dateInput instanceof Date) {
            return dateInput;
        } else {
            throw new Error(`无法解析日期: ${dateInput}`);
        }
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

// 创建全局穿搭服务实例
const dressService = new DressService();

module.exports = { dressService };