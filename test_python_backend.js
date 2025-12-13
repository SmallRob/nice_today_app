const path = require('path');
const fs = require('fs');

// 添加更多的调试信息
console.log('当前工作目录:', process.cwd());
console.log('__dirname:', __dirname);
console.log('环境变量 NODE_ENV:', process.env.NODE_ENV || '未设置');

// 检查后端目录是否存在
const backendPath = path.join(__dirname, 'backend');
console.log('检查后端目录:', backendPath);
console.log('后端目录是否存在:', fs.existsSync(backendPath));

if (fs.existsSync(backendPath)) {
    const files = fs.readdirSync(backendPath);
    console.log('后端目录内容:', files);
    
    const electronScript = path.join(backendPath, 'electron_integration.py');
    console.log('Python脚本路径:', electronScript);
    console.log('Python脚本是否存在:', fs.existsSync(electronScript));
}

const { PythonBackendService } = require('./electron/services/pythonBackendService');

// 模拟生产环境
process.env.NODE_ENV = 'production';

async function testPythonBackend() {
    console.log('\n开始测试Python后端服务...');
    
    const backendService = new PythonBackendService();
    
    try {
        // 初始化服务
        await backendService.initialize();
        console.log('✅ 服务初始化成功');
        
        // 等待一段时间确保初始化完成
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 测试获取今日生物节律
        console.log('\n测试获取今日生物节律...');
        const biorhythmResult = await backendService.getTodayBiorhythm('1990-01-01');
        console.log('生物节律结果:', JSON.stringify(biorhythmResult, null, 2));
        
        // 测试获取今日玛雅信息
        console.log('\n测试获取今日玛雅信息...');
        const mayaResult = await backendService.getTodayMayaInfo();
        console.log('玛雅信息结果:', JSON.stringify(mayaResult, null, 2));
        
        // 测试获取今日穿搭建议
        console.log('\n测试获取今日穿搭建议...');
        const dressResult = await backendService.getTodayDressInfo();
        console.log('穿搭建议结果:', JSON.stringify(dressResult, null, 2));
        
        console.log('\n🎉 所有测试通过！');
    } catch (error) {
        console.error('❌ 测试失败:', error);
        console.error('错误堆栈:', error.stack);
    }
}

testPythonBackend();