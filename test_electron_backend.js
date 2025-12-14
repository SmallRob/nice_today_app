const { PythonBackendService } = require('./electron/services/pythonBackendService');

// 模拟Electron环境
process.env.NODE_ENV = 'production';

console.log('=== Electron后端服务测试 ===');

async function testBackendService() {
    try {
        const backendService = new PythonBackendService();
        
        console.log('\n1. 初始化服务...');
        await backendService.initialize();
        
        // 等待初始化完成
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('\n2. 测试Python环境...');
        await backendService.checkPythonEnvironment();
        console.log('✅ Python环境检查通过');
        
        console.log('\n3. 测试文件检查...');
        await backendService.checkRequiredFiles();
        console.log('✅ 文件检查通过');
        
        console.log('\n4. 测试生物节律功能...');
        const biorhythmResult = await backendService.getTodayBiorhythm('1990-01-01');
        console.log('生物节律结果:', JSON.stringify(biorhythmResult, null, 2));
        
        console.log('\n5. 测试玛雅历法功能...');
        const mayaResult = await backendService.getTodayMayaInfo();
        console.log('玛雅历法结果:', JSON.stringify(mayaResult, null, 2));
        
        console.log('\n6. 测试穿搭建议功能...');
        const dressResult = await backendService.getTodayDressInfo();
        console.log('穿搭建议结果:', JSON.stringify(dressResult, null, 2));
        
        console.log('\n🎉 所有测试通过!');
    } catch (error) {
        console.error('❌ 测试失败:', error);
        console.error('错误详情:', error.stack);
    }
}

testBackendService();