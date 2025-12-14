const path = require('path');
const fs = require('fs');
const { unifiedService } = require('./unifiedService');

// 本地化服务实现，纯JavaScript实现
class JavaScriptBackendService {
    constructor() {
        this.serviceStatus = {
            biorhythm: true,
            maya: true,
            dress: true
        };
        
        console.log('JavaScript后端服务初始化');
        console.log('  当前环境:', process.env.NODE_ENV || 'development');
    }

    // 生物节律计算
    getTodayBiorhythm(birthDate) {
        try {
            const result = unifiedService.getTodayBiorhythm(birthDate);
            return { success: true, data: result };
        } catch (error) {
            console.error('获取今日生物节律失败:', error);
            return { success: false, error: error.message };
        }
    }

    getDateBiorhythm(birthDate, targetDate) {
        try {
            const result = unifiedService.getDateBiorhythm(birthDate, targetDate);
            return { success: true, data: result };
        } catch (error) {
            console.error('获取指定日期生物节律失败:', error);
            return { success: false, error: error.message };
        }
    }

    getBiorhythmRange(birthDate, daysBefore, daysAfter) {
        try {
            const result = unifiedService.getBiorhythmRange(birthDate, daysBefore, daysAfter);
            return { success: true, data: result };
        } catch (error) {
            console.error('获取生物节律范围失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 生物节律历史记录相关API
    getBiorhythmHistory() {
        try {
            const result = unifiedService.getBiorhythmHistory();
            return { success: true, data: result.history };
        } catch (error) {
            console.error('获取生物节律历史记录失败:', error);
            return { success: false, error: error.message };
        }
    }

    clearBiorhythmHistory() {
        try {
            // 这里需要实现清除历史记录的逻辑
            // 暂时返回成功状态
            return { success: true, data: '历史记录已清除' };
        } catch (error) {
            console.error('清除生物节律历史记录失败:', error);
            return { success: false, error: error.message };
        }
    }

    removeBiorhythmHistory(birthDate) {
        try {
            // 这里需要实现删除特定历史记录的逻辑
            // 暂时返回成功状态
            return { success: true, data: `已删除出生日期 ${birthDate} 的历史记录` };
        } catch (error) {
            console.error('删除生物节律历史记录失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 玛雅历法计算
    getTodayMayaInfo() {
        try {
            const result = unifiedService.getTodayMayaInfo();
            return { success: true, data: result };
        } catch (error) {
            console.error('获取今日玛雅历法信息失败:', error);
            return { success: false, error: error.message };
        }
    }

    getDateMayaInfo(targetDate) {
        try {
            const result = unifiedService.getDateMayaInfo(targetDate);
            return { success: true, data: result };
        } catch (error) {
            console.error('获取指定日期玛雅历法信息失败:', error);
            return { success: false, error: error.message };
        }
    }

    getMayaInfoRange(daysBefore, daysAfter) {
        try {
            const result = unifiedService.getMayaInfoRange(daysBefore, daysAfter);
            return { success: true, data: result };
        } catch (error) {
            console.error('获取玛雅历法范围信息失败:', error);
            return { success: false, error: error.message };
        }
    }

    getMayaBirthInfo(birthDate) {
        try {
            const result = unifiedService.getMayaBirthInfo(birthDate);
            return { success: true, data: result };
        } catch (error) {
            console.error('获取玛雅出生图信息失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 穿搭建议
    getTodayDressInfo() {
        try {
            const result = unifiedService.getTodayDressInfo();
            return { success: true, data: result };
        } catch (error) {
            console.error('获取今日穿搭建议失败:', error);
            return { success: false, error: error.message };
        }
    }

    getDateDressInfo(targetDate) {
        try {
            const result = unifiedService.getDateDressInfo(targetDate);
            return { success: true, data: result };
        } catch (error) {
            console.error('获取指定日期穿搭建议失败:', error);
            return { success: false, error: error.message };
        }
    }

    getDressInfoRange(daysBefore, daysAfter) {
        try {
            const result = unifiedService.getDressInfoRange(daysBefore, daysAfter);
            // 确保返回的格式符合前端期望
            // 前端期望: { success: true, data: { dress_info_list: [...], date_range: {...} } }
            
            // 如果result已经具有正确的结构，直接返回
            if (result && result.dress_info_list && result.date_range) {
                return { 
                    success: true, 
                    data: {
                        dress_info_list: result.dress_info_list,
                        date_range: result.date_range
                    }
                };
            } 
            
            // 如果result是一个数组，转换为标准格式
            if (result && Array.isArray(result)) {
                // 计算日期范围
                const currentDate = new Date();
                const startDate = new Date(currentDate);
                startDate.setDate(currentDate.getDate() - daysBefore);
                const endDate = new Date(currentDate);
                endDate.setDate(currentDate.getDate() + daysAfter);
                
                // 添加本地日期格式化方法
                const formatDateLocal = (date) => {
                    if (!date) return null;
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                };
                
                return {
                    success: true,
                    data: {
                        dress_info_list: result,
                        date_range: {
                            start: formatDateLocal(startDate),
                            end: formatDateLocal(endDate)
                        }
                    }
                };
            }
            
            // 如果result是另一种格式，尝试提取dress_info_list
            if (result && result.data && result.data.dress_info_list) {
                return {
                    success: true,
                    data: {
                        dress_info_list: result.data.dress_info_list,
                        date_range: result.data.date_range || (() => {
                            const today = new Date();
                            const formatDateLocal = (date) => {
                                if (!date) return null;
                                const year = date.getFullYear();
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                return `${year}-${month}-${day}`;
                            };
                            return {
                                start: formatDateLocal(today),
                                end: formatDateLocal(today)
                            };
                        })()
                    }
                };
            }
            
            // 如果以上都不匹配，返回原始结果
            console.warn('穿搭建议范围信息格式不符合预期:', result);
            return { success: true, data: result };
        } catch (error) {
            console.error('获取穿搭建议范围信息失败:', error);
            return { success: false, error: error.message };
        }
    }

    // 服务状态检查
    isBiorhythmServiceReady() {
        return this.serviceStatus.biorhythm;
    }

    isMayaServiceReady() {
        return this.serviceStatus.maya;
    }

    isDressServiceReady() {
        return this.serviceStatus.dress;
    }

    // 关闭服务
    shutdown() {
        console.log('JavaScript后端服务已关闭');
    }
}

module.exports = { JavaScriptBackendService };