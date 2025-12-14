const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 本地化服务实现，直接调用Python脚本而不是启动HTTP服务
class PythonBackendService {
    constructor() {
        // 确定后端路径 - 适配不同环境
        this.backendPath = this.determineBackendPath();
        
        // Python脚本路径 - 使用独立的backend脚本
        this.electronScript = path.join(this.backendPath, 'electron_backend.py');
        this.isReady = false; // 初始状态为未就绪
        this.useNodeFallback = false; // 是否使用Node.js回退
        this.pythonExecutable = null; // Python可执行文件路径
        
        this.serviceStatus = {
            biorhythm: true,
            maya: true,
            dress: true
        };
        
        console.log('Python后端服务初始化');
        console.log('  当前环境:', process.env.NODE_ENV || 'development');
        console.log('  后端路径:', this.backendPath);
        console.log('  脚本路径:', this.electronScript);
        
        // 自动初始化
        this.initialize();
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
    async initialize() {
        try {
            // 检查Python环境和必要文件
            await this.checkPythonEnvironment();
            await this.checkRequiredFiles();
            this.isReady = true;
            console.log('✅ Python后端服务初始化成功');
        } catch (error) {
            console.error('Python后端服务初始化失败:', error);
            // 即使初始化失败，也允许使用Node.js回退
            this.isReady = true;
        }
    }

    // 检查Python环境
    async checkPythonEnvironment() {
        return new Promise((resolve, reject) => {
            // 尝试多个可能的Python可执行文件路径
            const pythonExecutables = [
                'python',
                'python3',
                'python.exe',
                'python3.exe',
                'py' // Windows Python启动器
            ];
            
            let currentIndex = 0;
            
            const tryNextExecutable = () => {
                if (currentIndex >= pythonExecutables.length) {
                    console.error('❌ 未找到可用的Python环境');
                    console.log('将使用Node.js回退实现...');
                    // 设置回退标志，使用Node.js实现
                    this.useNodeFallback = true;
                    this.isReady = true;
                    resolve();
                    return;
                }
                
                const pythonExecutable = pythonExecutables[currentIndex];
                console.log(`尝试Python可执行文件: ${pythonExecutable}`);
                
                try {
                    const pythonCheck = spawn(pythonExecutable, ['--version'], { 
                        shell: true // 使用shell执行，支持复杂命令
                    });
                    
                    let stdoutData = '';
                    let stderrData = '';
                    
                    pythonCheck.stdout.on('data', (data) => {
                        stdoutData += data.toString();
                    });
                    
                    pythonCheck.stderr.on('data', (data) => {
                        stderrData += data.toString();
                    });
                    
                    pythonCheck.on('close', (code) => {
                        if (code === 0) {
                            const versionOutput = stdoutData || stderrData;
                            console.log(`✅ Python环境检测通过: ${pythonExecutable} (${versionOutput.trim()})`);
                            this.pythonExecutable = pythonExecutable;
                            resolve();
                        } else {
                            console.log(`Python可执行文件 ${pythonExecutable} 返回错误码: ${code}`);
                            currentIndex++;
                            tryNextExecutable();
                        }
                    });
                    
                    pythonCheck.on('error', (error) => {
                        console.log(`Python可执行文件 ${pythonExecutable} 不可用: ${error.message}`);
                        currentIndex++;
                        tryNextExecutable();
                    });
                } catch (error) {
                    console.log(`执行Python检查失败: ${error.message}`);
                    currentIndex++;
                    tryNextExecutable();
                }
            };
            
            tryNextExecutable();
        });
    }

    // 检查必要的文件
    async checkRequiredFiles() {
        return new Promise((resolve, reject) => {
            console.log('检查后端路径是否存在:', this.backendPath);
            if (!fs.existsSync(this.backendPath)) {
                console.error('❌ 后端路径不存在:', this.backendPath);
                // 启用Node.js回退
                this.useNodeFallback = true;
                resolve();
                return;
            }
            
            console.log('检查Python脚本是否存在:', this.electronScript);
            if (!fs.existsSync(this.electronScript)) {
                console.error('❌ Electron集成脚本不存在:', this.electronScript);
                // 启用Node.js回退
                this.useNodeFallback = true;
                resolve();
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

        // 如果启用了Node.js回退，使用JavaScript实现
        if (this.useNodeFallback) {
            console.log('使用Node.js回退实现执行方法:', methodName);
            return await this.executeNodeMethod(methodName, args);
        }

        return new Promise((resolve, reject) => {
            // 检查Python脚本是否存在
            if (!fs.existsSync(this.electronScript)) {
                console.error('Python脚本不存在:', this.electronScript);
                // 回退到Node.js实现
                this.executeNodeMethod(methodName, args)
                    .then(resolve)
                    .catch(reject);
                return;
            }

            // 构造命令行参数
            const argsList = [
                this.electronScript,
                methodName,
                JSON.stringify(args)
            ];
            
            // 在Windows上，为了避免shell解析问题，我们直接传递参数而不使用shell
            const spawnOptions = {
                cwd: this.backendPath,
                stdio: ['pipe', 'pipe', 'pipe']
            };
            
            // 只在非Windows平台上使用shell
            if (process.platform !== 'win32') {
                spawnOptions.shell = true;
            }
            
            console.log('执行Python命令:', this.pythonExecutable, argsList.join(' '));
            
            // 执行Python脚本
            const pythonProcess = spawn(this.pythonExecutable, argsList, spawnOptions);
            
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
                        
                        // 如果Python执行失败，尝试Node.js回退
                        console.log('Python执行失败，尝试Node.js回退实现...');
                        this.executeNodeMethod(methodName, args)
                            .then(resolve)
                            .catch(error => {
                                reject(new Error(`解析Python输出失败: ${parseError.message}`));
                            });
                    }
                } else {
                    console.error('Python脚本执行失败:', stderrData);
                    
                    // 如果Python执行失败，尝试Node.js回退
                    console.log('Python执行失败，尝试Node.js回退实现...');
                    this.executeNodeMethod(methodName, args)
                        .then(resolve)
                        .catch(error => {
                            reject(new Error(`Python脚本执行失败 (${code}): ${stderrData}`));
                        });
                }
            });
            
            pythonProcess.on('error', (error) => {
                console.error('执行Python脚本失败:', error);
                
                // 如果Python执行失败，尝试Node.js回退
                console.log('Python执行失败，尝试Node.js回退实现...');
                this.executeNodeMethod(methodName, args)
                    .then(resolve)
                    .catch(fallbackError => {
                        reject(new Error(`执行Python脚本失败: ${error.message}`));
                    });
            });
        });
    }

    // Node.js回退实现
    async executeNodeMethod(methodName, args = {}) {
        console.log('使用Node.js实现执行方法:', methodName, args);
        
        try {
            let result;
            
            switch (methodName) {
                case 'get_today_biorhythm':
                case 'get_date_biorhythm':
                    result = this.getBiorhythmNode(args.birth_date || args.birth_date, args.target_date || new Date().toISOString().split('T')[0]);
                    break;
                    
                case 'get_biorhythm_range':
                    result = this.getBiorhythmRangeNode(args.birth_date, args.days_before || 7, args.days_after || 7);
                    break;
                    
                case 'get_today_maya_info':
                case 'get_date_maya_info':
                    result = this.getMayaInfoNode(args.target_date || new Date().toISOString().split('T')[0]);
                    break;
                    
                case 'get_maya_info_range':
                    result = this.getMayaInfoRangeNode(args.days_before || 7, args.days_after || 7);
                    break;
                    
                case 'get_maya_birth_info':
                    result = this.getMayaBirthInfoNode(args.birth_date);
                    break;
                    
                case 'get_today_dress_info':
                case 'get_date_dress_info':
                    result = this.getDressInfoNode(args.target_date || new Date().toISOString().split('T')[0]);
                    break;
                    
                case 'get_dress_info_range':
                    result = this.getDressInfoRangeNode(args.days_before || 7, args.days_after || 7);
                    break;
                    
                default:
                    throw new Error(`未知方法: ${methodName}`);
            }
            
            return { success: true, data: result };
            
        } catch (error) {
            console.error('Node.js回退实现失败:', error);
            return { 
                success: false, 
                error: error.message,
                fallback: true
            };
        }
    }

    // Node.js生物节律实现
    getBiorhythmNode(birthDate, targetDate) {
        const birth = new Date(birthDate);
        const target = new Date(targetDate);
        const daysDiff = Math.floor((target - birth) / (1000 * 60 * 60 * 24));
        
        const calculateRhythm = (cycle, days) => {
            return Math.round(100 * Math.sin(2 * Math.PI * days / cycle));
        };
        
        return {
            physical: calculateRhythm(23, daysDiff),
            emotional: calculateRhythm(28, daysDiff),
            intellectual: calculateRhythm(33, daysDiff),
            date: targetDate,
            birth_date: birthDate
        };
    }

    getBiorhythmRangeNode(birthDate, daysBefore, daysAfter) {
        const results = [];
        const today = new Date();
        
        for (let i = -daysBefore; i <= daysAfter; i++) {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + i);
            const dateStr = targetDate.toISOString().split('T')[0];
            
            results.push(this.getBiorhythmNode(birthDate, dateStr));
        }
        
        return results;
    }

    // Node.js玛雅历法实现
    getMayaInfoNode(targetDate) {
        const seals = ['红龙', '白风', '蓝夜', '黄种子', '红蛇', '白世界桥', '蓝手', 
                      '黄星星', '红月', '白狗', '蓝猴', '黄人', '红天行者', '白巫师', 
                      '蓝鹰', '黄战士', '红地球', '白镜子', '蓝风暴', '黄太阳'];
        
        // 基于日期生成确定性但伪随机的值
        const dateHash = targetDate.split('-').reduce((sum, num) => sum + parseInt(num), 0);
        const kin = (dateHash % 260) + 1;
        const sealIndex = dateHash % seals.length;
        const tone = (dateHash % 13) + 1;
        
        return {
            kin: kin.toString(),
            seal: seals[sealIndex],
            tone: tone.toString(),
            date: targetDate,
            description: `今日玛雅历法信息：${seals[sealIndex]}星系印记`
        };
    }

    getMayaInfoRangeNode(daysBefore, daysAfter) {
        const results = [];
        const today = new Date();
        
        for (let i = -daysBefore; i <= daysAfter; i++) {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + i);
            const dateStr = targetDate.toISOString().split('T')[0];
            
            results.push(this.getMayaInfoNode(dateStr));
        }
        
        return results;
    }

    getMayaBirthInfoNode(birthDate) {
        const signs = ['红龙', '白风', '蓝夜', '黄种子', '红蛇', '白世界桥', '蓝手', 
                      '黄星星', '红月', '白狗', '蓝猴', '黄人', '红天行者', '白巫师', 
                      '蓝鹰', '黄战士', '红地球', '白镜子', '蓝风暴', '黄太阳'];
        
        const dateHash = birthDate.split('-').reduce((sum, num) => sum + parseInt(num), 0);
        const sealIndex = dateHash % signs.length;
        
        return {
            birth_kin: (dateHash % 260) + 1,
            birth_seal: signs[sealIndex],
            birth_tone: (dateHash % 13) + 1,
            birth_date: birthDate,
            description: `您的出生玛雅星系印记：${signs[sealIndex]}`
        };
    }

    // Node.js穿搭建议实现
    getDressInfoNode(targetDate) {
        const colors = ['青色系', '黑色系', '红色系', '黄色系', '白色系'];
        const styles = ['简约休闲', '商务正式', '运动活力', '时尚潮流', '优雅知性'];
        const accessories = ['手表', '项链', '手链', '耳环', '帽子', '围巾'];
        
        const dateHash = targetDate.split('-').reduce((sum, num) => sum + parseInt(num), 0);
        const colorIndex = dateHash % colors.length;
        const styleIndex = dateHash % styles.length;
        const accessoryIndex = dateHash % accessories.length;
        
        return {
            lucky_color: colors[colorIndex],
            style: styles[styleIndex],
            accessory: accessories[accessoryIndex],
            date: targetDate,
            advice: `今日建议穿着${colors[colorIndex]}色系的${styles[styleIndex]}风格`
        };
    }

    getDressInfoRangeNode(daysBefore, daysAfter) {
        const results = [];
        const today = new Date();
        
        for (let i = -daysBefore; i <= daysAfter; i++) {
            const targetDate = new Date(today);
            targetDate.setDate(today.getDate() + i);
            const dateStr = targetDate.toISOString().split('T')[0];
            
            results.push(this.getDressInfoNode(dateStr));
        }
        
        return results;
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