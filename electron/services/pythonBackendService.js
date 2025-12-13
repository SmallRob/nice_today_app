const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 本地化服务实现，直接调用Python脚本而不是启动HTTP服务
class PythonBackendService {
    constructor() {
        this.backendPath = path.join(__dirname, '../../backend');
        this.electronScript = path.join(this.backendPath, 'electron_integration.py');
        this.isReady = true; // 本地化服务始终就绪
        this.serviceStatus = {
            biorhythm: true,
            maya: true,
            dress: true
        };
    }

    // 初始化Python后端服务
    initialize() {
        try {
            // 检查Python环境和必要文件
            this.checkPythonEnvironment()
                .then(() => this.checkRequiredFiles())
                .catch(error => {
                    console.error('Python后端服务初始化失败:', error);
                });
        } catch (error) {
            console.error('Python后端服务初始化异常:', error);
        }
    }

    // 检查Python环境
    async checkPythonEnvironment() {
        return new Promise((resolve, reject) => {
            const pythonCheck = spawn('python', ['--version']);
            
            pythonCheck.on('close', (code) => {
                if (code === 0) {
                    console.log('✅ Python环境检测通过');
                    resolve();
                } else {
                    reject(new Error('Python环境未安装或配置错误'));
                }
            });
            
            pythonCheck.on('error', (error) => {
                reject(new Error(`Python环境检查失败: ${error.message}`));
            });
        });
    }

    // 检查必要的文件
    async checkRequiredFiles() {
        return new Promise((resolve, reject) => {
            if (!fs.existsSync(this.electronScript)) {
                reject(new Error(`Electron集成脚本不存在: ${this.electronScript}`));
                return;
            }
            console.log('✅ 必要文件检查通过');
            resolve();
        });
    }

    // 直接调用Python脚本执行命令
    async executePythonMethod(methodName, args = {}) {
        if (!this.isReady) {
            throw new Error('Python后端服务未就绪');
        }

        return new Promise((resolve, reject) => {
            // 构造命令行参数
            const argsList = [
                this.electronScript,
                methodName,
                JSON.stringify(args)
            ];
            
            // 执行Python脚本
            const pythonProcess = spawn('python', argsList, {
                cwd: this.backendPath
            });
            
            let stdoutData = '';
            let stderrData = '';
            
            pythonProcess.stdout.on('data', (data) => {
                stdoutData += data.toString();
            });
            
            pythonProcess.stderr.on('data', (data) => {
                stderrData += data.toString();
            });
            
            pythonProcess.on('close', (code) => {
                if (code === 0) {
                    try {
                        const result = JSON.parse(stdoutData.trim());
                        resolve(result);
                    } catch (parseError) {
                        reject(new Error(`解析Python输出失败: ${parseError.message}`));
                    }
                } else {
                    reject(new Error(`Python脚本执行失败 (${code}): ${stderrData}`));
                }
            });
            
            pythonProcess.on('error', (error) => {
                reject(new Error(`执行Python脚本失败: ${error.message}`));
            });
        });
    }

    // 生物节律服务方法
    async getTodayBiorhythm(birthDate) {
        return await this.executePythonMethod('get_today_biorhythm', { birth_date: birthDate });
    }

    async getDateBiorhythm(birthDate, targetDate) {
        return await this.executePythonMethod('get_date_biorhythm', { 
            birth_date: birthDate, 
            target_date: targetDate 
        });
    }

    async getBiorhythmRange(birthDate, daysBefore, daysAfter) {
        return await this.executePythonMethod('get_biorhythm_range', { 
            birth_date: birthDate, 
            days_before: daysBefore, 
            days_after: daysAfter 
        });
    }

    // 玛雅历法服务方法
    async getTodayMayaInfo() {
        return await this.executePythonMethod('get_today_maya_info');
    }

    async getDateMayaInfo(targetDate) {
        return await this.executePythonMethod('get_date_maya_info', { target_date: targetDate });
    }

    async getMayaInfoRange(daysBefore, daysAfter) {
        return await this.executePythonMethod('get_maya_info_range', { 
            days_before: daysBefore, 
            days_after: daysAfter 
        });
    }

    async getMayaBirthInfo(birthDate) {
        return await this.executePythonMethod('get_maya_birth_info', { birth_date: birthDate });
    }

    // 穿搭建议服务方法
    async getTodayDressInfo() {
        return await this.executePythonMethod('get_today_dress_info');
    }

    async getDateDressInfo(targetDate) {
        return await this.executePythonMethod('get_date_dress_info', { target_date: targetDate });
    }

    async getDressInfoRange(daysBefore, daysAfter) {
        return await this.executePythonMethod('get_dress_info_range', { 
            days_before: daysBefore, 
            days_after: daysAfter 
        });
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
        if (this.pythonProcess) {
            console.log('正在关闭Python后端服务...');
            this.pythonProcess.kill();
            this.pythonProcess = null;
            this.isReady = false;
            this.serviceStatus = { biorhythm: false, maya: false, dress: false };
        }
    }
}

module.exports = { PythonBackendService };