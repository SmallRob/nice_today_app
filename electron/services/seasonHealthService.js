const fs = require('fs');
const path = require('path');
const { configLoader } = require('./configLoader');

/**
 * 四季五行养生服务
 * 提供基于四季五行规律的身体养生建议
 */
class SeasonHealthService {
    constructor() {
        // 获取配置
        const config = configLoader.getConfig();
        
        // 初始化数据路径
        this.dataPath = path.join(__dirname, '../../frontend/public/data/organRhythmSeanson.csv');
        
        // 加载四季五行数据
        this.loadSeasonData();
    }

    /**
     * 加载四季五行数据
     */
    loadSeasonData() {
        try {
            if (fs.existsSync(this.dataPath)) {
                const csvData = fs.readFileSync(this.dataPath, 'utf8');
                this.seasonData = this.parseCSV(csvData);
                console.log('四季五行数据加载成功');
            } else {
                console.error('四季五行数据文件不存在:', this.dataPath);
                this.seasonData = this.getDefaultSeasonData();
            }
        } catch (error) {
            console.error('加载四季五行数据失败:', error);
            this.seasonData = this.getDefaultSeasonData();
        }
    }

    /**
     * 解析CSV数据
     * @param {string} csvData - CSV字符串
     * @returns {Array} 解析后的数据
     */
    parseCSV(csvData) {
        const lines = csvData.split('\n').filter(line => line.trim());
        const headers = lines[0].split('\t').map(h => h.trim());
        const data = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split('\t').map(v => v.trim());
            if (values.length === headers.length) {
                const entry = {};
                for (let j = 0; j < headers.length; j++) {
                    entry[headers[j]] = values[j];
                }
                data.push(entry);
            }
        }
        
        return data;
    }

    /**
     * 获取默认四季五行数据
     * @returns {Array} 默认数据
     */
    getDefaultSeasonData() {
        return [
            {
                "季节": "春(立春~立夏)",
                "五行": "木",
                "主令脏腑": "肝、胆",
                "节律特点与功能状态": "生发、疏泄。肝气在春季最为旺盛，主导气血的疏通和情绪的畅达。如同树木抽枝发芽，人体阳气也开始升发。此时节律重在\"疏泄\"与\"条达\"。",
                "生活调整核心建议": "1. 夜卧早起：适当晚睡（不晚于23点），早起，顺应阳气生发。2. 广步于庭：多进行户外散步、踏青、慢跑等温和运动，助肝气疏泄。3. 舒畅情志：保持心情愉悦，避免恼怒、抑郁，以防肝气郁结。4. 饮食增甘减酸：适当多吃绿色蔬菜（如菠菜、芹菜）和发芽食物（如豆芽），少吃过于酸涩收敛的食物，以助阳气升发。"
            },
            {
                "季节": "夏(立夏~立秋)",
                "五行": "火",
                "主令脏腑": "心、小肠",
                "节律特点与功能状态": "生长、旺盛。心气通于夏，阳气最盛，气血运行加速，新陈代谢旺盛。此时节律重在\"养长\"与\"清养\"。",
                "生活调整核心建议": "1. 夜卧早起：可再稍晚睡，但务必早起，接受日照。2. 无厌于日：适当接受阳光（避开暴晒），使汗液通畅，排出郁热。3. 静养心神：天气炎热易扰心神，应保持心境平和，避免烦躁。可午休片刻以养心。4. 饮食增苦减咸：适当吃些苦味食物（如苦瓜、莲子心）以清心火，多食红色食物（如西红柿、红枣）养心，避免过咸加重心脏负担。"
            },
            {
                "季节": "长夏(夏秋之交)",
                "五行": "土",
                "主令脏腑": "脾、胃",
                "节律特点与功能状态": "化育、运化。此时湿气最盛，脾胃负担重，主司饮食的消化吸收和水液的代谢。此时节律重在\"健脾祛湿\"。",
                "生活调整核心建议": "1. 规律作息：保持起居规律，避免贪凉。2. 避免潮湿：居住环境需保持干爽，避免外湿侵袭。3. 饮食清淡，忌贪凉：多吃黄色和甘淡食物（如小米、南瓜、山药）健脾，忌食生冷、油腻、甜腻之物，以免困阻脾胃。4. 适度运动：适度活动以助脾运化，但避免在潮湿闷热环境下剧烈运动。"
            },
            {
                "季节": "秋(立秋~立冬)",
                "五行": "金",
                "主令脏腑": "肺、大肠",
                "节律特点与功能状态": "收敛、肃降。秋气主收，与肺的宣发肃降功能相应。此时阳气渐收，阴气渐长，气候干燥。此时节律重在\"养收\"与\"润燥\"。",
                "生活调整核心建议": "1. 早卧早起：早睡以避秋凉，早起使肺气得以舒展。2. 使志安宁：情绪上要保持平静，避免悲忧伤感，以减轻对肺气的耗伤。3. 防秋燥：多喝水，多吃白色润肺食物（如梨、银耳、百合、莲子）。4. 适度秋冻：不宜过早添厚衣，让身体逐渐适应凉意，增强耐寒力。"
            },
            {
                "季节": "冬(立冬~立春)",
                "五行": "水",
                "主令脏腑": "肾、膀胱",
                "节律特点与功能状态": "闭藏、固守。冬气主藏，与肾的藏精功能相通。此时阳气潜藏，阴气最盛，是储蓄能量、修复身体的黄金时期。此时节律重在\"养藏\"。",
                "生活调整核心建议": "1. 早卧晚起：早睡晚起，必待日光。保证充足睡眠，利于阳气潜藏，阴精积蓄。2. 祛寒就温：注意保暖，尤其保护头、背、脚，但室内不宜过热，避免耗伤阴津。3. 精神内守：避免剧烈情绪波动，减少消耗，使神志内藏。4. 饮食增苦减咸，温补：可适量食用黑色和咸味食物（如黑豆、黑芝麻、海带）入肾，但总体不宜过咸。宜温补，如羊肉、核桃，以滋补肾脏，养护阳气。"
            }
        ];
    }

    /**
     * 根据日期获取当前季节
     * @param {Date|string} date - 日期
     * @returns {Object} 季节信息
     */
    getCurrentSeason(date = null) {
        const dateObj = this.parseDate(date);
        const month = dateObj.getMonth() + 1; // 1-12
        const day = dateObj.getDate();
        
        // 根据阳历日期确定季节
        let season;
        
        // 春季 (立春~立夏): 2月4日左右至5月5日左右
        if ((month === 2 && day >= 4) || month === 3 || month === 4 || (month === 5 && day < 5)) {
            season = "春";
        }
        // 夏季 (立夏~立秋): 5月5日左右至8月7日左右
        else if ((month === 5 && day >= 5) || month === 6 || month === 7 || (month === 8 && day < 7)) {
            season = "夏";
        }
        // 长夏 (夏秋之交): 8月7日左右至9月7日左右
        else if ((month === 8 && day >= 7) || (month === 9 && day < 7)) {
            season = "长夏";
        }
        // 秋季 (立秋~立冬): 9月7日左右至11月7日左右
        else if ((month === 9 && day >= 7) || month === 10 || (month === 11 && day < 7)) {
            season = "秋";
        }
        // 冬季 (立冬~立春): 11月7日左右至次年2月4日左右
        else {
            season = "冬";
        }
        
        // 查找对应的季节数据
        const seasonData = this.seasonData.find(data => data.季节.includes(season));
        
        return {
            name: season,
            element: seasonData ? seasonData.五行 : "",
            organs: seasonData ? seasonData.主令脏腑 : "",
            characteristics: seasonData ? seasonData.节律特点与功能状态 : "",
            advice: seasonData ? seasonData.生活调整核心建议 : ""
        };
    }

    /**
     * 根据日期获取器官节律数据
     * @param {Date|string} date - 日期
     * @returns {Object} 器官节律数据
     */
    getOrganRhythm(date = null) {
        const dateObj = this.parseDate(date);
        const hour = dateObj.getHours();
        
        // 定义24小时器官节律
        const organRhythms = [
            { time: "01:00-03:00", organ: "肝胆", description: "肝胆经当令，解毒代谢最活跃的时间", suggestion: "保证充足睡眠，避免熬夜", healthTip: "熬夜会加重肝胆负担，影响第二天精神状态" },
            { time: "03:00-05:00", organ: "肺", description: "肺经当令，气血循环活跃，适合呼吸系统调理", suggestion: "深度睡眠中自然呼吸", healthTip: "早起后深呼吸练习，有益肺部健康" },
            { time: "05:00-07:00", organ: "大肠", description: "大肠经当令，排便最佳时间", suggestion: "起床后喝温水，养成定时排便习惯", healthTip: "便秘者可顺时针按摩腹部，促进肠道蠕动" },
            { time: "07:00-09:00", organ: "胃", description: "胃经当令，消化吸收能力最强", suggestion: "享用营养均衡的早餐", healthTip: "避免冷饮和生冷食物，保护胃气" },
            { time: "09:00-11:00", organ: "脾", description: "脾经当令，运化水湿，吸收营养", suggestion: "适合进行轻度办公和学习工作", healthTip: "避免过度思虑，久坐伤脾" },
            { time: "11:00-13:00", organ: "心", description: "心经当令，阳气最盛，血液循环最活跃", suggestion: "午休15-30分钟，养心安神", healthTip: "避免剧烈运动和情绪激动" },
            { time: "13:00-15:00", organ: "小肠", description: "小肠经当令，分清泌浊，吸收精华", suggestion: "午餐后慢走，帮助消化", healthTip: "避免暴饮暴食，给小肠减负" },
            { time: "15:00-17:00", organ: "膀胱", description: "膀胱经当令，排泄废物，排毒最佳时间", suggestion: "适量饮水，促进排尿排毒", healthTip: "憋尿会损伤膀胱功能，影响肾脏" },
            { time: "17:00-19:00", organ: "肾", description: "肾经当令，藏精固本，储存能量", suggestion: "适合进行轻松的社交活动", healthTip: "避免过度劳累，耗损肾气" },
            { time: "19:00-21:00", organ: "心包", description: "心包经当令，保护心脏，调节情绪", suggestion: "轻松的晚餐和家庭时间", healthTip: "晚餐宜清淡，避免过饱" },
            { time: "21:00-23:00", organ: "三焦", description: "三焦经当令，协调各脏腑功能", suggestion: "准备入睡，营造良好睡眠环境", healthTip: "避免睡前使用电子产品" },
            { time: "23:00-01:00", organ: "胆", description: "胆经当令，决断能力最强，胆汁分泌旺盛", suggestion: "进入深度睡眠，胆汁正常分泌", healthTip: "深夜进食会增加胆囊负担" }
        ];
        
        // 根据当前时间找到对应的器官节律
        for (const rhythm of organRhythms) {
            const [start, end] = rhythm.time.split('-');
            const [startHour, startMin] = start.split(':').map(Number);
            const [endHour, endMin] = end.split(':').map(Number);
            
            const currentMinutes = hour * 60 + dateObj.getMinutes();
            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;
            
            if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
                return {
                    current: true,
                    ...rhythm
                };
            }
        }
        
        // 如果没有找到，返回默认数据
        return {
            current: false,
            time: "",
            organ: "",
            description: "",
            suggestion: "",
            healthTip: ""
        };
    }

    /**
     * 获取综合的四季五行养生建议
     * @param {Date|string} date - 日期
     * @returns {Object} 养生建议数据
     */
    getSeasonHealthAdvice(date = null) {
        const season = this.getCurrentSeason(date);
        const organRhythm = this.getOrganRhythm(date);
        
        // 根据五行属性获取相应的养生建议
        const elementAdvice = this.getElementAdvice(season.element);
        
        // 获取当前日期的描述
        const dateObj = this.parseDate(date);
        const dateStr = this.formatDateLocal(dateObj);
        
        return {
            date: dateStr,
            season: season,
            organRhythm: organRhythm,
            elementAdvice: elementAdvice
        };
    }

    /**
     * 根据五行属性获取养生建议
     * @param {string} element - 五行属性
     * @returns {Object} 五行养生建议
     */
    getElementAdvice(element) {
        const elementAdvices = {
            "木": {
                "颜色": ["绿色", "青色"],
                "食物": ["绿叶蔬菜", "豆类", "水果", "坚果"],
                "运动": ["散步", "慢跑", "瑜伽", "伸展"],
                "情绪": ["保持愉悦", "避免愤怒", "舒缓压力"],
                "养生重点": "疏肝理气，调畅情志"
            },
            "火": {
                "颜色": ["红色", "紫色"],
                "食物": ["红色食物", "苦味食物", "清凉食物"],
                "运动": ["游泳", "太极", "轻度运动"],
                "情绪": ["保持平和", "避免急躁", "静心养神"],
                "养生重点": "养心安神，清热降火"
            },
            "土": {
                "颜色": ["黄色", "棕色"],
                "食物": ["黄色食物", "甘淡食物", "易消化食物"],
                "运动": ["散步", "快走", "避免潮湿环境"],
                "情绪": ["避免思虑过度", "保持稳定"],
                "养生重点": "健脾祛湿，调养脾胃"
            },
            "金": {
                "颜色": ["白色", "金色"],
                "食物": ["白色润肺食物", "滋润食物"],
                "运动": ["呼吸练习", "户外散步"],
                "情绪": ["保持平静", "避免悲伤"],
                "养生重点": "润肺养阴，防燥润泽"
            },
            "水": {
                "颜色": ["黑色", "蓝色"],
                "食物": ["黑色食物", "温补食物", "咸味食物"],
                "运动": ["保暖运动", "适度活动"],
                "情绪": ["精神内守", "避免恐惧"],
                "养生重点": "温补肾阳，固本培元"
            }
        };
        
        return elementAdvices[element] || {
            "颜色": [],
            "食物": [],
            "运动": [],
            "情绪": [],
            "养生重点": ""
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

// 创建全局四季五行养生服务实例
const seasonHealthService = new SeasonHealthService();

module.exports = { seasonHealthService };