const fs = require('fs');
const path = require('path');
const { app } = require('electron');

/**
 * 用户配置管理器
 * 负责管理用户的历史记录和个人设置
 */
class UserConfigManager {
    constructor() {
        // 用户配置目录
        this.userConfigDir = this.getUserConfigDir();
        this.userConfigFile = path.join(this.userConfigDir, 'user_config.json');
        this.config = this.loadConfig();
    }

    /**
     * 获取用户配置目录
     * @returns {string} 用户配置目录路径
     */
    getUserConfigDir() {
        // 在开发环境中使用项目目录，在生产环境中使用用户数据目录
        if (process.env.NODE_ENV === 'development') {
            return path.join(__dirname, '../../backend/config');
        } else {
            const userDataPath = app.getPath('userData');
            return path.join(userDataPath, 'config');
        }
    }

    /**
     * 加载用户配置
     * @returns {Object} 用户配置对象
     */
    loadConfig() {
        try {
            // 确保配置目录存在
            if (!fs.existsSync(this.userConfigDir)) {
                fs.mkdirSync(this.userConfigDir, { recursive: true });
            }

            // 如果配置文件不存在，创建默认配置
            if (!fs.existsSync(this.userConfigFile)) {
                return this.createDefaultConfig();
            }

            // 读取配置文件
            const configData = fs.readFileSync(this.userConfigFile, 'utf8');
            return JSON.parse(configData);
        } catch (error) {
            console.error('加载用户配置失败:', error);
            return this.createDefaultConfig();
        }
    }

    /**
     * 创建默认配置
     * @returns {Object} 默认配置对象
     */
    createDefaultConfig() {
        const defaultConfig = {
            version: '1.0.0',
            last_updated: new Date().toISOString(),
            biorhythm_history: [
                {
                    birth_date: "1991-01-01",
                    last_used: new Date().toISOString(),
                    usage_count: 0,
                    is_default: true
                }
            ],
            max_history_items: 6,
            preferences: {
                theme: 'auto',
                language: 'zh-CN',
                show_tips: true
            }
        };

        // 保存默认配置
        this.saveConfig(defaultConfig);
        return defaultConfig;
    }

    /**
     * 保存配置
     * @param {Object} config - 配置对象
     */
    saveConfig(config = null) {
        try {
            const configToSave = config || this.config;
            configToSave.last_updated = new Date().toISOString();
            
            fs.writeFileSync(this.userConfigFile, JSON.stringify(configToSave, null, 2), 'utf8');
        } catch (error) {
            console.error('保存用户配置失败:', error);
        }
    }

    /**
     * 添加或更新生物节律历史记录
     * @param {string} birthDate - 出生日期 (YYYY-MM-DD)
     */
    addBiorhythmHistory(birthDate) {
        // 检查是否已存在该日期
        const existingIndex = this.config.biorhythm_history.findIndex(item => 
            item.birth_date === birthDate
        );

        if (existingIndex !== -1) {
            // 更新现有记录
            this.config.biorhythm_history[existingIndex].last_used = new Date().toISOString();
            this.config.biorhythm_history[existingIndex].usage_count += 1;
            
            // 将最近使用的记录移到最前面
            const updatedItem = this.config.biorhythm_history.splice(existingIndex, 1)[0];
            this.config.biorhythm_history.unshift(updatedItem);
        } else {
            // 添加新记录
            const newHistoryItem = {
                birth_date: birthDate,
                last_used: new Date().toISOString(),
                usage_count: 1,
                is_default: false
            };

            this.config.biorhythm_history.unshift(newHistoryItem);

            // 保持记录数量不超过最大值
            if (this.config.biorhythm_history.length > this.config.max_history_items) {
                this.config.biorhythm_history = this.config.biorhythm_history.slice(0, this.config.max_history_items);
            }
        }

        // 保存配置
        this.saveConfig();
    }

    /**
     * 获取生物节律历史记录
     * @returns {Array} 历史记录数组
     */
    getBiorhythmHistory() {
        return this.config.biorhythm_history.map(item => item.birth_date);
    }

    /**
     * 获取详细的生物节律历史记录
     * @returns {Array} 详细历史记录数组
     */
    getDetailedBiorhythmHistory() {
        return [...this.config.biorhythm_history];
    }

    /**
     * 清除所有历史记录
     */
    clearBiorhythmHistory() {
        // 保留默认记录
        const defaultRecord = this.config.biorhythm_history.find(item => item.is_default);
        this.config.biorhythm_history = defaultRecord ? [defaultRecord] : [];
        
        // 如果没有默认记录，添加一个
        if (this.config.biorhythm_history.length === 0) {
            this.config.biorhythm_history.push({
                birth_date: "1991-01-01",
                last_used: new Date().toISOString(),
                usage_count: 0,
                is_default: true
            });
        }

        this.saveConfig();
    }

    /**
     * 删除特定的历史记录
     * @param {string} birthDate - 要删除的出生日期
     */
    removeBiorhythmHistory(birthDate) {
        // 不能删除默认记录
        if (birthDate === "1991-01-01") {
            return;
        }

        this.config.biorhythm_history = this.config.biorhythm_history.filter(item => 
            item.birth_date !== birthDate
        );

        this.saveConfig();
    }

    /**
     * 更新用户偏好设置
     * @param {Object} preferences - 偏好设置对象
     */
    updatePreferences(preferences) {
        this.config.preferences = { ...this.config.preferences, ...preferences };
        this.saveConfig();
    }

    /**
     * 获取用户偏好设置
     * @returns {Object} 偏好设置对象
     */
    getPreferences() {
        return this.config.preferences;
    }

    /**
     * 获取配置信息
     * @returns {Object} 完整的配置对象
     */
    getConfig() {
        return { ...this.config };
    }
}

// 创建全局用户配置管理器实例
const userConfigManager = new UserConfigManager();

module.exports = { userConfigManager };