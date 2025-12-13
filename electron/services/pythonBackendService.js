const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 本地化服务实现，直接调用Python脚本而不是启动HTTP服务
class PythonBackendService {
    constructor() {
        // 确定后端路径 - 适配不同环境
        this.backendPath = this.determineBackendPath();
        
        // Python脚本路径
        this.electronScript = path.join(this.backendPath, 'electron_integration.py');
        this.isReady = true; // 本地化服务始终就绪
        this.serviceStatus = {
            biorhythm: true,
            maya: true,
            dress: true
        };
        
        console.log('Python后端服务初始化');
        console.log('  当前环境:', process.env.NODE_ENV || 'development');
        console.log('  后端路径:', this.backendPath);
        console.log('  脚本路径:', this.electronScript);
        console.log('  资源路径:', process.resourcesPath || 'N/A');
        console.log('  __dirname:', __dirname);
    }

    // 确定后端路径的智能方法
    determineBackendPath() {
        // 在Electron生产环境中
        if (process.env.NODE_ENV === 'production' && process.resourcesPath) {
            const prodBackendPath = path.join(process.resourcesPath, 'backend');
            if (fs.existsSync(prodBackendPath)) {
                console.log('使用生产环境资源路径:', prodBackendPath);
                return prodBackendPath;
            }
        }
        
        // 在Electron开发环境中
        const devBackendPath = path.join(__dirname, '../../backend');
        if (fs.existsSync(devBackendPath)) {
            console.log('使用开发环境路径:', devBackendPath);
            return devBackendPath;
        }
        
        // 回退到相对路径
        const fallbackPath = path.join(__dirname, '../backend');
        if (fs.existsSync(fallbackPath)) {
            console.log('使用回退路径:', fallbackPath);
            return fallbackPath;
        }
        
        // 最后的回退选项 - 当前目录下的backend
        const currentBackendPath = path.join(process.cwd(), 'backend');
        if (fs.existsSync(currentBackendPath)) {
            console.log('使用当前目录路径:', currentBackendPath);
            return currentBackendPath;
        }
        
        // 如果都找不到，返回默认路径并让后续检查报错
        console.log('无法确定后端路径，使用默认路径');
        return process.resourcesPath ? 
            path.join(process.resourcesPath, 'backend') : 
            path.join(__dirname, '../../backend');
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
            // 在Windows上使用python.exe，在其他平台使用python
            const pythonExecutable = process.platform === 'win32' ? 'python.exe' : 'python';
            const pythonCheck = spawn(pythonExecutable, ['--version']);
            
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
            console.log('检查后端路径是否存在:', this.backendPath);
            if (!fs.existsSync(this.backendPath)) {
                console.error('❌ 后端路径不存在:', this.backendPath);
                reject(new Error(`后端路径不存在: ${this.backendPath}`));
                return;
            }
            
            console.log('检查Python脚本是否存在:', this.electronScript);
            if (!fs.existsSync(this.electronScript)) {
                console.error('❌ Electron集成脚本不存在:', this.electronScript);
                reject(new Error(`Electron集成脚本不存在: ${this.electronScript}`));
                return;
            }
            
            // 检查必要的Python模块是否存在
            const requiredModules = ['utils', 'services'];
            for (const module of requiredModules) {
                const modulePath = path.join(this.backendPath, module);
                if (!fs.existsSync(modulePath)) {
                    console.error('❌ 必要模块不存在:', modulePath);
                    reject(new Error(`必要模块不存在: ${modulePath}`));
                    return;
                }
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
            // 检查Python脚本是否存在
            if (!fs.existsSync(this.electronScript)) {
                console.error('Python脚本不存在:', this.electronScript);
                reject(new Error(`Python脚本不存在: ${this.electronScript}`));
                return;
            }

            // 构造命令行参数
            const argsList = [
                this.electronScript,
                methodName,
                JSON.stringify(args)
            ];
            
            // 使用完整的Python可执行文件路径
            const pythonExecutable = process.platform === 'win32' ? 'python.exe' : 'python';
            
            console.log('执行Python命令:', pythonExecutable, argsList.join(' '));
            
            // 执行Python脚本
            const pythonProcess = spawn(pythonExecutable, argsList, {
                cwd: this.backendPath,
                stdio: ['pipe', 'pipe', 'pipe']
            });
            
            let stdoutData = '';
            let stderrData = '';
            
            pythonProcess.stdout.on('data', (data) => {
                stdoutData += data.toString();
                console.log('Python stdout:', data.toString());
            });
            
            pythonProcess.stderr.on('data', (data) => {
                stderrData += data.toString();
                console.log('Python stderr:', data.toString());
            });
            
            pythonProcess.on('close', (code) => {
                console.log(`Python进程退出码: ${code}`);
                if (code === 0) {
                    try {
                        // 处理可能的额外输出（如Python警告信息）
                        const lines = stdoutData.trim().split('\n');
                        const lastLine = lines[lines.length - 1];
                        const result = JSON.parse(lastLine);
                        console.log('Python执行成功:', result);
                        resolve(result);
                    } catch (parseError) {
                        console.error('解析Python输出失败:', parseError);
                        console.error('原始输出:', stdoutData);
                        reject(new Error(`解析Python输出失败: ${parseError.message}`));
                    }
                } else {
                    console.error('Python脚本执行失败:', stderrData);
                    reject(new Error(`Python脚本执行失败 (${code}): ${stderrData}`));
                }
            });
            
            pythonProcess.on('error', (error) => {
                console.error('执行Python脚本失败:', error);
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
        // 注意：当前实现是无状态的，不需要关闭
        console.log('Python后端服务已关闭');
    }
}

module.exports = { PythonBackendService };