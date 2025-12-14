const { configLoader } = require('./configLoader');

/**
 * 生肖五行能量服务
 * 提供基于生肖和五行的每日能量指引功能
 */
class ZodiacEnergyService {
    constructor() {
        // 获取完整配置
        const config = configLoader.getConfig();
        
        // 检查配置是否加载成功
        if (!config) {
            console.error('配置加载失败，使用默认配置');
            this.useDefaultConfig();
            return;
        }
        
        // 获取生肖五行配置
        this.zodiacConfig = configLoader.getZodiacConfig() || {};
        
        // 验证配置完整性
        this.validateConfig();
    }

    /**
     * 使用默认配置
     */
    useDefaultConfig() {
        // 十二生肖与五行对应关系
        this.zodiacConfig = {
            "zodiac_elements": {
                "金": ["猴", "鸡"],
                "木": ["虎", "兔"],
                "水": ["鼠", "猪"],
                "火": ["蛇", "马"],
                "土": ["牛", "龙", "羊", "狗"]
            },
            "five_elements_relations": {
                "相生": {
                    "金": "水",
                    "水": "木", 
                    "木": "火",
                    "火": "土",
                    "土": "金"
                },
                "相克": {
                    "金": "木",
                    "木": "土",
                    "土": "水",
                    "水": "火",
                    "火": "金"
                }
            },
            "lifestyle_suggestions": {
                "金": {
                    "幸运颜色": ["白色", "金色", "银灰色"],
                    "适合饰品": ["黄金", "白金首饰"],
                    "适合行业": ["金融", "机械", "珠宝"],
                    "幸运方位": ["正西", "西北方"],
                    "能量提升": "佩戴金属饰品，从事金属相关行业，多向西方发展"
                },
                "木": {
                    "幸运颜色": ["绿色", "青色"],
                    "适合饰品": ["木质饰品", "绿色水晶"],
                    "适合行业": ["教育", "文化", "林业"],
                    "幸运方位": ["正东", "东北方"],
                    "能量提升": "多接触自然，公园散步，使用木质家具"
                },
                "水": {
                    "幸运颜色": ["蓝色", "黑色", "灰色"],
                    "适合饰品": ["水晶", "珍珠"],
                    "适合行业": ["贸易", "航运", "旅游"],
                    "幸运方位": ["正北", "西北方"],
                    "能量提升": "多喝水，居住水边，多向北方发展"
                },
                "火": {
                    "幸运颜色": ["红色", "紫色", "橙色"],
                    "适合饰品": ["红宝石", "玛瑙"],
                    "适合行业": ["能源", "传媒", "表演"],
                    "幸运方位": ["正南", "东南方"],
                    "能量提升": "多吃红色食物，参与热情活动，多向南方发展"
                },
                "土": {
                    "幸运颜色": ["黄色", "棕色", "卡其色"],
                    "适合饰品": ["玉石", "黄水晶"],
                    "适合行业": ["房地产", "建筑", "农业"],
                    "幸运方位": ["东北", "西南方"],
                    "能量提升": "多接触土地，从事稳定行业，佩戴玉石饰品"
                }
            },
            "food_suggestions": {
                "金": {
                    "宜": ["萝卜", "百合", "梨子", "银耳", "杏仁", "白萝卜", "豆腐"],
                    "忌": ["辣椒", "生姜", "羊肉", "狗肉", "烈酒"]
                },
                "木": {
                    "宜": ["菠菜", "芹菜", "苹果", "香蕉", "绿叶蔬菜", "豆类"],
                    "忌": ["油腻食物", "动物内脏", "过多酸味食物"]
                },
                "水": {
                    "宜": ["黑木耳", "黑米", "紫菜", "海带", "黑芝麻", "核桃"],
                    "忌": ["过咸食物", "生冷食物", "寒性水果"]
                },
                "火": {
                    "宜": ["红枣", "西红柿", "羊肉", "草莓", "番茄", "苦瓜"],
                    "忌": ["辛辣食物", "烧烤", "油炸食品", "烈酒"]
                },
                "土": {
                    "宜": ["土豆", "黄豆", "南瓜", "小米", "红枣", "山药"],
                    "忌": ["生冷食物", "甜食", "难消化食物"]
                }
            },
            "fengshui_suggestions": {
                "金": {
                    "家居布置": ["镜子", "金属装饰品", "金属工艺品"],
                    "摆放位置": ["西北方"],
                    "建议": "家中可多放金属装饰品，在西北方摆放金属工艺品增强能量"
                },
                "木": {
                    "家居布置": ["绿植", "木质家具", "富贵竹"],
                    "摆放位置": ["东方"],
                    "建议": "多养绿植，使用木质家具，在东方摆放富贵竹提升运势"
                },
                "水": {
                    "家居布置": ["鱼缸", "水景装饰", "水晶球"],
                    "摆放位置": ["北方"],
                    "建议": "可摆放鱼缸或水景装饰，在北方放置水晶球增强能量"
                },
                "火": {
                    "家居布置": ["红色装饰", "红色灯笼", "火山石"],
                    "摆放位置": ["南方"],
                    "建议": "使用红色装饰，在南方摆放红色灯笼或火山石提升热情"
                },
                "土": {
                    "家居布置": ["陶瓷制品", "黄水晶", "土色装饰"],
                    "摆放位置": ["东北方", "西南方"],
                    "建议": "摆放陶瓷制品或黄水晶，在东北方或西南方增强稳定能量"
                }
            },
            "relationship_suggestions": {
                "相生": {
                    "金": ["土"],
                    "木": ["水"],
                    "水": ["金"],
                    "火": ["木"],
                    "土": ["火"]
                },
                "建议": "适合与相生五行的人交往，能够互相促进，和谐相处"
            }
        };
    }

    /**
     * 验证配置完整性
     */
    validateConfig() {
        const requiredConfigs = ["zodiac_elements", "five_elements_relations", "lifestyle_suggestions", 
                               "food_suggestions", "fengshui_suggestions", "relationship_suggestions"];
        
        const missingConfigs = requiredConfigs.filter(config => !this.zodiacConfig[config]);
        
        if (missingConfigs.length > 0) {
            console.error(`生肖配置缺失: ${missingConfigs.join(', ')}，使用默认配置`);
            this.useDefaultConfig();
        }
    }

    /**
     * 根据年份计算生肖
     * @param {number} year - 年份
     * @returns {string} 生肖
     */
    getZodiacFromYear(year) {
        const zodiacs = ["鼠", "牛", "虎", "兔", "龙", "蛇", "马", "羊", "猴", "鸡", "狗", "猪"];
        const baseYear = 1900; // 鼠年
        const index = (year - baseYear) % 12;
        return zodiacs[index];
    }

    /**
     * 根据生肖获取五行属性
     * @param {string} zodiac - 生肖
     * @returns {string} 五行属性
     */
    getElementFromZodiac(zodiac) {
        for (const [element, zodiacs] of Object.entries(this.zodiacConfig.zodiac_elements)) {
            if (zodiacs.includes(zodiac)) {
                return element;
            }
        }
        return "未知";
    }

    /**
     * 获取当日五行属性（复用穿搭服务的算法）
     * @param {string|Date} date - 日期
     * @returns {string} 五行属性
     */
    getDailyFiveElement(date = null) {
        const dateObj = this.parseDate(date);
        const weekdayElements = ["金", "木", "水", "火", "土", "金", "木"];
        const weekday = dateObj.getDay() === 0 ? 6 : dateObj.getDay() - 1;
        return weekdayElements[weekday];
    }

    /**
     * 计算生肖与当日五行的能量匹配度
     * @param {string} userZodiac - 用户生肖
     * @param {string} dailyElement - 当日五行
     * @returns {Object} 匹配度信息
     */
    calculateEnergyMatch(userZodiac, dailyElement) {
        const userElement = this.getElementFromZodiac(userZodiac);
        
        if (userElement === "未知" || dailyElement === "未知") {
            return {
                "匹配度": 0,
                "关系": "未知",
                "描述": "无法计算能量匹配度"
            };
        }

        let matchScore = 50; // 基础分数50分
        let relationship = "中性";
        let description = "";

        // 五行关系判断
        if (userElement === dailyElement) {
            matchScore = 85; // 相同五行，能量和谐
            relationship = "相同";
            description = "今日五行与你生肖相同，能量和谐，做事顺遂";
        } else if (this.zodiacConfig.five_elements_relations.相生[userElement] === dailyElement) {
            matchScore = 95; // 相生关系，能量极佳
            relationship = "相生";
            description = "今日五行与你生肖相生，能量充沛，适合积极行动";
        } else if (this.zodiacConfig.five_elements_relations.相生[dailyElement] === userElement) {
            matchScore = 80; // 被生关系，能量良好
            relationship = "被生";
            description = "今日五行生你生肖，能量注入，适合接受新事物";
        } else if (this.zodiacConfig.five_elements_relations.相克[userElement] === dailyElement) {
            matchScore = 30; // 相克关系，能量冲突
            relationship = "相克";
            description = "今日五行与你生肖相克，需要谨慎行事";
        } else if (this.zodiacConfig.five_elements_relations.相克[dailyElement] === userElement) {
            matchScore = 40; // 被克关系，能量受限
            relationship = "被克";
            description = "今日五行克你生肖，需要保持耐心和稳定";
        }

        return {
            "匹配度": matchScore,
            "关系": relationship,
            "描述": description,
            "用户五行": userElement,
            "当日五行": dailyElement
        };
    }

    /**
     * 获取全面的每日能量指引
     * @param {string} userZodiac - 用户生肖
     * @param {string|Date} date - 日期
     * @returns {Object} 能量指引信息
     */
    getDailyEnergyGuidance(userZodiac, date = null) {
        const userElement = this.getElementFromZodiac(userZodiac);
        const dailyElement = this.getDailyFiveElement(date);
        const energyMatch = this.calculateEnergyMatch(userZodiac, dailyElement);
        
        // 获取相生五行（适合交往的人）
        const compatibleElements = this.zodiacConfig.relationship_suggestions.相生[userElement] || [];
        const compatibleZodiacs = compatibleElements.map(element => 
            this.zodiacConfig.zodiac_elements[element]
        ).flat();

        return {
            "日期": this.formatDateLocal(date ? this.parseDate(date) : new Date()),
            "用户生肖": userZodiac,
            "用户五行": userElement,
            "当日五行": dailyElement,
            "能量匹配": energyMatch,
            "生活建议": this.zodiacConfig.lifestyle_suggestions[userElement] || {},
            "饮食调理": this.zodiacConfig.food_suggestions[userElement] || {},
            "家居风水": this.zodiacConfig.fengshui_suggestions[userElement] || {},
            "人际关系": {
                "适合交往的五行": compatibleElements,
                "适合交往的生肖": compatibleZodiacs,
                "建议": this.zodiacConfig.relationship_suggestions.建议
            }
        };
    }

    /**
     * 获取今日能量指引
     * @param {string} userZodiac - 用户生肖
     * @returns {Object} 今日能量指引
     */
    getTodayEnergyGuidance(userZodiac) {
        return this.getDailyEnergyGuidance(userZodiac);
    }

    /**
     * 获取指定日期的能量指引
     * @param {string} userZodiac - 用户生肖
     * @param {string} date - 日期字符串 (YYYY-MM-DD)
     * @returns {Object} 指定日期能量指引
     */
    getDateEnergyGuidance(userZodiac, date) {
        return this.getDailyEnergyGuidance(userZodiac, date);
    }

    /**
     * 获取所有生肖列表
     * @returns {Array} 生肖列表
     */
    getAllZodiacs() {
        const allZodiacs = [];
        for (const zodiacs of Object.values(this.zodiacConfig.zodiac_elements)) {
            allZodiacs.push(...zodiacs);
        }
        return [...new Set(allZodiacs)];
    }

    /**
     * 解析日期
     */
    parseDate(dateInput) {
        if (!dateInput) {
            return new Date();
        } else if (typeof dateInput === 'string') {
            if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
                const parts = dateInput.split('-');
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const day = parseInt(parts[2], 10);
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
     * 格式化日期为YYYY-MM-DD字符串
     */
    formatDateLocal(date) {
        if (!date) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}

// 创建全局生肖能量服务实例
const zodiacEnergyService = new ZodiacEnergyService();

module.exports = { zodiacEnergyService };