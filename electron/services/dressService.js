const { configLoader } = require('./configLoader');

/**
 * 穿搭建议服务
 * 提供穿衣颜色和饮食建议功能
 */
class DressService {
    constructor() {
        // 获取完整配置
        const config = configLoader.getConfig();
        
        // 检查配置是否加载成功
        if (!config) {
            console.error('配置加载失败，使用默认配置');
            this.useDefaultConfig();
            return;
        }
        
        // 获取各项配置，确保不为null或undefined
        this.fiveElements = configLoader.getFiveElementsConfig() || {};
        this.colorSystems = configLoader.getColorSystemsConfig() || {};
        this.dailyFood = config.daily_food || {};
        this.weekdayElements = config.weekday_elements || ["金", "木", "水", "火", "土", "金", "木"];
        this.starColors = config.star_colors || ["青色系", "黑色系", "红色系", "黄色系", "白色系", "青色系", "黑色系"];
        this.weekdayNames = config.weekday_names || ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];
        
        // 验证必要配置是否存在
        this.validateConfig();
    }

    /**
     * 使用默认配置
     */
    useDefaultConfig() {
        this.fiveElements = {
            "金": {"生": "水", "克": "木", "被克": "火", "颜色": ["白色", "金色", "银色"]},
            "木": {"生": "火", "克": "土", "被克": "金", "颜色": ["绿色", "青色", "靛青色"]},
            "水": {"生": "木", "克": "火", "被克": "土", "颜色": ["黑色", "蓝色", "深灰色"]},
            "火": {"生": "土", "克": "金", "被克": "水", "颜色": ["红色", "紫色", "粉色"]},
            "土": {"生": "金", "克": "水", "被克": "木", "颜色": ["黄色", "棕色", "土色"]}
        };
        this.colorSystems = {
            "青色系": {
                "五行": "木",
                "颜色": ["深青", "藏青", "中青", "墨绿色"],
                "吉凶": "吉",
                "描述": "于当日五行相生，大环境利你，且青色系为招财色，今日若身着此类衣物配饰，利于增强提升个人财运，且利于进行沟通和谈判。"
            },
            "黑色系": {
                "五行": "水",
                "颜色": ["青灰", "桃灰", "银灰"],
                "吉凶": "吉",
                "描述": "于当日五行相同，与整体环境磁场合一圆融。黑色系为智慧色，今日若多着此类衣物配饰，待人如沐春风且聪明伶俐，富有侠义之心。"
            },
            "红色系": {
                "五行": "火",
                "颜色": ["桃红", "朱红", "玫红"],
                "吉凶": "不吉",
                "描述": "被当日五行相克，大环境相对不占优势。尤其是做事情绪化，容易有疲劳感。着装颜色方面，建议不要选择大面积为各种红色系。"
            },
            "黄色系": {
                "五行": "土",
                "颜色": ["土黄", "杏黄", "姜黄"],
                "吉凶": "中性",
                "描述": "与当日五行相生，能够增强个人运势。黄色系代表稳重与踏实，适合需要专注和耐心的工作场合。"
            },
            "白色系": {
                "五行": "金",
                "颜色": ["纯白", "米白", "象牙白"],
                "吉凶": "中性",
                "描述": "当日五行被生，整体环境中性。白色系象征纯洁与简约，适合正式场合和需要展现专业形象的场合。"
            }
        };
        this.dailyFood = {
            "0": {"宜": ["黑芝麻", "萝卜", "木耳", "核桃", "山药", "银耳", "百合", "莲子"], "忌": ["辣椒", "生姜", "羊肉", "狗肉", "龙虾", "螃蟹", "榴莲", "白酒"]},
            "1": {"宜": ["豆腐", "鱼类", "苹果", "香蕉", "葡萄", "胡萝卜", "冬瓜", "薏米"], "忌": ["牛肉", "咖啡", "酒类", "巧克力", "油炸食品", "烧烤", "动物内脏", "腌制食品"]},
            "2": {"宜": ["鸡蛋", "蜂蜜", "菠菜", "西兰花", "西红柿", "黄瓜", "橙子", "柠檬"], "忌": ["海鲜", "油炸食品", "冷饮", "冰激凌", "生冷食物", "螃蟹", "虾", "贝类"]},
            "3": {"宜": ["燕麦", "香蕉", "牛奶", "酸奶", "红豆", "绿豆", "梨", "桃子"], "忌": ["辛辣食物", "烧烤", "腌制品", "腊肉", "香肠", "狗肉", "羊肉", "烈酒"]},
            "4": {"宜": ["红枣", "核桃", "山药", "花生", "黑豆", "糯米", "桂圆", "荔枝"], "忌": ["肥肉", "甜食", "刺激性食物", "油炸食品", "奶油", "奶酪", "巧克力", "碳酸饮料"]},
            "5": {"宜": ["绿茶", "糙米", "西红柿", "茄子", "苦瓜", "芹菜", "草莓", "猕猴桃"], "忌": ["油腻食物", "巧克力", "浓茶", "咖啡", "烈酒", "油炸食品", "动物脂肪", "加工食品"]},
            "6": {"宜": ["南瓜", "莲子", "薏米", "小米", "红豆", "百合", "苹果", "梨"], "忌": ["烟酒", "辛辣", "油炸食品", "烧烤", "动物内脏", "海鲜", "生冷食物", "刺激性调料"]}
        };
        this.weekdayElements = ["金", "木", "水", "火", "土", "金", "木"];
        this.starColors = ["青色系", "黑色系", "红色系", "黄色系", "白色系", "青色系", "黑色系"];
        this.weekdayNames = ["星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"];
    }

    /**
     * 验证配置完整性
     */
    validateConfig() {
        const missingConfigs = [];
        console.log('验证配置完整性...');
        console.log('五行配置:', this.fiveElements ? Object.keys(this.fiveElements).length + '个元素' : '缺失');
        console.log('颜色系统配置:', this.colorSystems ? Object.keys(this.colorSystems).length + '个系统' : '缺失');
        console.log('饮食配置:', this.dailyFood ? Object.keys(this.dailyFood).length + '天' : '缺失');
        
        if (!this.fiveElements || Object.keys(this.fiveElements).length === 0) {
            missingConfigs.push('five_elements');
        }
        if (!this.colorSystems || Object.keys(this.colorSystems).length === 0) {
            missingConfigs.push('color_systems');
        }
        if (!this.dailyFood || Object.keys(this.dailyFood).length === 0) {
            missingConfigs.push('daily_food');
        }
        
        if (missingConfigs.length > 0) {
            console.error(`配置缺失: ${missingConfigs.join(', ')}，使用默认配置`);
            this.useDefaultConfig();
            console.log('默认配置已应用');
        }
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
        
        // 检查dailyFood配置是否存在
        if (!this.dailyFood) {
            console.warn('dailyFood配置缺失，返回空的食物建议');
            return {"宜": [], "忌": []};
        }
        
        // 基础食物建议基于星期几
        const weekday = dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1; // 调整为0-6的范围，星期一为0
        const baseSuggestions = this.dailyFood[String(weekday)] || {"宜": [], "忌": []};
        
        // 确保baseSuggestions具有正确的结构
        if (!baseSuggestions || !Array.isArray(baseSuggestions["宜"]) || !Array.isArray(baseSuggestions["忌"])) {
            console.warn('基础食物建议结构不正确，使用默认值');
            return {"宜": [], "忌": []};
        }
        
        // 获取日期信息用于确定性随机
        const day = dateObj.getDate();
        const month = dateObj.getMonth() + 1;
        const year = dateObj.getFullYear();
        const dayOfYear = this.getDayOfYear(dateObj);
        
        // 生成多个确定性种子，用于不同的随机选择
        const baseSeed = day + month * 100 + year * 10000;
        const seed1 = this.hashCode(`${baseSeed}-good-1`);
        const seed2 = this.hashCode(`${baseSeed}-good-2`);
        const seed3 = this.hashCode(`${baseSeed}-bad-1`);
        const seed4 = this.hashCode(`${baseSeed}-bad-2`);
        const seed5 = this.hashCode(`${baseSeed}-special-${dayOfYear}`);
        
        // 收集所有可能的宜食食物和忌食食物
        const allGoodFoods = [];
        const allBadFoods = [];
        
        for (const dayFoods of Object.values(this.dailyFood)) {
            // 确保dayFoods具有正确的结构
            if (dayFoods && Array.isArray(dayFoods["宜"]) && Array.isArray(dayFoods["忌"])) {
                allGoodFoods.push(...dayFoods["宜"]);
                allBadFoods.push(...dayFoods["忌"]);
            }
        }
        
        // 去重
        const uniqueGoodFoods = [...new Set(allGoodFoods)];
        const uniqueBadFoods = [...new Set(allBadFoods)];
        
        // 根据月份和季节调整食物选择的权重
        const season = Math.floor((month - 1) / 3); // 0:冬, 1:春, 2:夏, 3:秋
        const seasonMultiplier = [0.8, 1.2, 1.5, 1.1][season]; // 不同季节的食物权重
        
        // 确定性随机选择函数
        const deterministicChoice = (array, seed, count = 1) => {
            const shuffled = [...array].sort((a, b) => {
                const hashA = this.hashCode(`${seed}-${a}`);
                const hashB = this.hashCode(`${seed}-${b}`);
                return hashA - hashB;
            });
            return shuffled.slice(0, Math.min(count, shuffled.length));
        };
        
        // 生成宜食食物建议
        let goodFoods = [];
        
        // 1. 保留部分基础建议（根据季节调整保留数量）
        const baseGoodCount = Math.floor(2 * seasonMultiplier);
        goodFoods.push(...deterministicChoice(baseSuggestions["宜"], seed1, baseGoodCount));
        
        // 2. 添加与当日五行相关的食物（基于中医五行食疗理论）
        const dailyElement = this.getDailyFiveElement(date);
        const elementGoodFoods = this.getElementRelatedFoods(dailyElement, "宜", uniqueGoodFoods);
        const elementGoodCount = Math.floor(1.5 * seasonMultiplier);
        goodFoods.push(...deterministicChoice(elementGoodFoods, seed2, elementGoodCount));
        
        // 3. 添加季节性食物
        const seasonalGoodFoods = this.getSeasonalFoods(month, "宜", uniqueGoodFoods);
        const seasonalGoodCount = Math.floor(1.2 * seasonMultiplier);
        goodFoods.push(...deterministicChoice(seasonalGoodFoods, seed3, seasonalGoodCount));
        
        // 4. 添加特殊日子的食物（如初一、十五等）
        const specialGoodFoods = this.getSpecialDayFoods(day, "宜", uniqueGoodFoods);
        goodFoods.push(...deterministicChoice(specialGoodFoods, seed5, 1));
        
        // 去重并限制数量
        goodFoods = [...new Set(goodFoods)];
        if (goodFoods.length > 5) {
            goodFoods = deterministicChoice(goodFoods, seed1, 5);
        }
        
        // 生成忌食食物建议
        let badFoods = [];
        
        // 1. 保留部分基础忌食建议
        const baseBadCount = Math.floor(2 * seasonMultiplier);
        badFoods.push(...deterministicChoice(baseSuggestions["忌"], seed3, baseBadCount));
        
        // 2. 添加与当日五行相克的食物
        const elementBadFoods = this.getElementRelatedFoods(dailyElement, "忌", uniqueBadFoods);
        const elementBadCount = Math.floor(1.5 * seasonMultiplier);
        badFoods.push(...deterministicChoice(elementBadFoods, seed4, elementBadCount));
        
        // 3. 添加季节性忌食食物
        const seasonalBadFoods = this.getSeasonalFoods(month, "忌", uniqueBadFoods);
        const seasonalBadCount = Math.floor(1.2 * seasonMultiplier);
        badFoods.push(...deterministicChoice(seasonalBadFoods, seed1, seasonalBadCount));
        
        // 4. 添加特殊日子的忌食食物
        const specialBadFoods = this.getSpecialDayFoods(day, "忌", uniqueBadFoods);
        badFoods.push(...deterministicChoice(specialBadFoods, seed2, 1));
        
        // 去重并限制数量
        badFoods = [...new Set(badFoods)];
        if (badFoods.length > 5) {
            badFoods = deterministicChoice(badFoods, seed2, 5);
        }
        
        // 确保至少有最少数量的建议
        if (goodFoods.length < 3) {
            const remainingGood = uniqueGoodFoods.filter(f => !goodFoods.includes(f));
            goodFoods.push(...deterministicChoice(remainingGood, seed5, 3 - goodFoods.length));
        }
        
        if (badFoods.length < 3) {
            const remainingBad = uniqueBadFoods.filter(f => !badFoods.includes(f));
            badFoods.push(...deterministicChoice(remainingBad, seed1, 3 - badFoods.length));
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
        
        // 检查必要的配置是否存在
        if (!this.colorSystems || !this.fiveElements) {
            console.error('颜色系统或五行配置缺失');
            return {
                "date": dateObj.toISOString().split('T')[0],
                "weekday": this.weekdayNames[dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1],
                "daily_element": dailyElement || "未知",
                "color_suggestions": [],
                "food_suggestions": {"宜": [], "忌": []}
            };
        }
        
        // 获取颜色建议
        const colorSuggestions = [];
        for (const [colorSystem, info] of Object.entries(this.colorSystems)) {
            // 确保info对象存在且有"五行"属性
            if (!info || !info["五行"]) {
                continue;
            }
            
            const element = info["五行"];
            // 确保dailyElement和this.fiveElements[dailyElement]存在
            if (!dailyElement || !this.fiveElements[dailyElement]) {
                continue;
            }
            
            const relation = element === dailyElement ? "相同" : (
                (this.fiveElements[dailyElement]["生"] === element || this.fiveElements[element]["生"] === dailyElement) ? "相生" : (
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
            
            // 确保info["颜色"]存在
            const colors = Array.isArray(info["颜色"]) ? info["颜色"] : [];
            
            const suggestion = {
                "颜色系统": colorSystem,
                "具体颜色": colors,
                "五行关系": `与当日五行${relation}`,
                "吉凶": luck,
                "描述": selectedDescription
            };
            colorSuggestions.push(suggestion);
        }
        
        // 获取饮食建议
        const foodSuggestions = this.getDailyFoodSuggestions(date);
        
        return {
            "date": this.formatDateLocal(dateObj),
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
            const dateStr = this.formatDateLocal(currentDateIter);
            const dressInfo = this.getDressInfoForDate(dateStr);
            dressInfoList.push(dressInfo);
            
            currentDateIter.setDate(currentDateIter.getDate() + 1);
        }
        
        return {
            "date_range": {
                "start": this.formatDateLocal(startDate),
                "end": this.formatDateLocal(endDate)
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
            // 处理YYYY-MM-DD格式的日期字符串，按本地时间（东八区）计算
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
                const parts = dateInput.split('-');
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // 月份从0开始
                const day = parseInt(parts[2], 10);
                
                // 使用本地时间创建日期，不涉及时区转换
                // 按照用户输入的日期直接计算，与当前时间无关
                return new Date(year, month, day);
            }
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

    /**
     * 根据五行属性获取相关食物
     * @param {string} element - 五行属性
     * @param {string} type - "宜"或"忌"
     * @param {Array} allFoods - 所有可选食物
     * @returns {Array} 相关食物列表
     */
    getElementRelatedFoods(element, type, allFoods) {
        // 根据中医五行理论，不同五行属性的人适合不同的食物
        const elementFoodMap = {
            "金": {
                "宜": ["梨", "苹果", "百合", "银耳", "蜂蜜", "豆腐", "杏仁", "白萝卜"],
                "忌": ["辣椒", "生姜", "羊肉", "油炸食品", "烈酒"]
            },
            "木": {
                "宜": ["绿叶蔬菜", "豆类", "水果", "坚果", "全谷物", "绿茶", "芹菜", "韭菜"],
                "忌": ["过多的酸味食物", "油腻食物", "动物内脏"]
            },
            "水": {
                "宜": ["黑豆", "黑芝麻", "海带", "紫菜", "黑木耳", "山药", "核桃", "薏米"],
                "忌": ["过咸食物", "生冷食物", "寒性水果"]
            },
            "火": {
                "宜": ["苦瓜", "西红柿", "绿豆", "冬瓜", "黄瓜", "莲子", "百合", "鸭肉"],
                "忌": ["辛辣食物", "烧烤", "羊肉", "油炸食品", "烈酒"]
            },
            "土": {
                "宜": ["小米", "红枣", "山药", "南瓜", "牛肉", "土豆", "胡萝卜", "香菇"],
                "忌": ["生冷食物", "油腻食物", "甜食", "难消化食物"]
            }
        };
        
        const elementFoods = elementFoodMap[element]?.[type] || [];
        // 从所有食物中筛选出与五行相关的食物
        return allFoods.filter(food => 
            elementFoods.some(ef => 
                food.includes(ef) || ef.includes(food)
            )
        );
    }

    /**
     * 根据月份获取季节性食物
     * @param {number} month - 月份 (1-12)
     * @param {string} type - "宜"或"忌"
     * @param {Array} allFoods - 所有可选食物
     * @returns {Array} 季节性食物列表
     */
    getSeasonalFoods(month, type, allFoods) {
        // 根据四季特点推荐食物
        const seasonFoodMap = {
            // 春季 (3-5月)
            "春季": {
                "宜": ["菠菜", "韭菜", "豆芽", "草莓", "樱桃", "蜂蜜", "绿豆", "芹菜"],
                "忌": ["过于油腻的食物", "辛辣食物", "动物内脏"]
            },
            // 夏季 (6-8月)
            "夏季": {
                "宜": ["西瓜", "苦瓜", "黄瓜", "冬瓜", "绿豆", "莲子", "百合", "鸭肉"],
                "忌": ["辛辣食物", "油腻食物", "烧烤", "烈酒"]
            },
            // 秋季 (9-11月)
            "秋季": {
                "宜": ["梨", "苹果", "银耳", "百合", "山药", "莲子", "核桃", "蜂蜜"],
                "忌": ["生冷食物", "辛辣食物", "油炸食品"]
            },
            // 冬季 (12-2月)
            "冬季": {
                "宜": ["黑芝麻", "核桃", "红枣", "山药", "羊肉", "牛肉", "黑豆", "黑木耳"],
                "忌": ["生冷食物", "寒性水果", "冰激凌"]
            }
        };
        
        // 确定季节
        let season;
        if (month >= 3 && month <= 5) season = "春季";
        else if (month >= 6 && month <= 8) season = "夏季";
        else if (month >= 9 && month <= 11) season = "秋季";
        else season = "冬季";
        
        const seasonFoods = seasonFoodMap[season]?.[type] || [];
        // 从所有食物中筛选出季节性食物
        return allFoods.filter(food => 
            seasonFoods.some(sf => 
                food.includes(sf) || sf.includes(food)
            )
        );
    }

    /**
     * 根据日期获取特殊日子的食物
     * @param {number} day - 日期
     * @param {string} type - "宜"或"忌"
     * @param {Array} allFoods - 所有可选食物
     * @returns {Array} 特殊日子的食物列表
     */
    getSpecialDayFoods(day, type, allFoods) {
        // 初一、十五等特殊日子推荐清淡食物
        const specialDayFoodMap = {
            "初一": {
                "宜": ["素食", "豆腐", "青菜", "水果", "粥", "面条"],
                "忌": ["肉类", "油腻食物", "烈酒", "刺激性食物"]
            },
            "十五": {
                "宜": ["清淡食物", "蔬菜", "水果", "粗粮", "豆制品"],
                "忌": ["油腻食物", "辛辣食物", "烈酒", "难消化食物"]
            }
        };
        
        let specialDayType = null;
        if (day === 1) specialDayType = "初一";
        else if (day === 15) specialDayType = "十五";
        
        const specialFoods = specialDayFoodMap[specialDayType]?.[type] || [];
        // 从所有食物中筛选出特殊日子的食物
        return allFoods.filter(food => 
            specialFoods.some(spf => 
                food.includes(spf) || spf.includes(food)
            )
        );
    }
}

// 创建全局穿搭服务实例
const dressService = new DressService();

module.exports = { dressService };