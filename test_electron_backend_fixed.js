const { PythonBackendService } = require('./electron/services/pythonBackendService');

async function testBackendService() {
    console.log('开始测试Electron后端服务...');
    
    // 创建后端服务实例
    const backendService = new PythonBackendService();
    
    // 等待初始化完成
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('服务状态:');
    console.log('  是否就绪:', backendService.isReady);
    console.log('  是否使用回退:', backendService.useNodeFallback);
    console.log('  Python可执行文件:', backendService.pythonExecutable);
    console.log('  后端路径:', backendService.backendPath);
    
    // 测试生物节律功能
    try {
        console.log('\n--- 测试生物节律功能 ---');
        const biorhythmResult = await backendService.getTodayBiorhythm('1990-01-01');
        console.log('生物节律结果:', JSON.stringify(biorhythmResult, null, 2));
    } catch (error) {
        console.error('生物节律测试失败:', error.message);
    }
    
    // 测试玛雅历法功能
    try {
        console.log('\n--- 测试玛雅历法功能 ---');
        const mayaResult = await backendService.getTodayMayaInfo();
        console.log('玛雅历法结果:', JSON.stringify(mayaResult, null, 2));
    } catch (error) {
        console.error('玛雅历法测试失败:', error.message);
    }
    
    // 测试穿搭建议功能
    try {
        console.log('\n--- 测试穿搭建议功能 ---');
        const dressResult = await backendService.getTodayDressInfo();
        console.log('穿搭建议结果:', JSON.stringify(dressResult, null, 2));
    } catch (error) {
        console.error('穿搭建议测试失败:', error.message);
    }
    
    console.log('\n测试完成!');
}

// 运行测试
testBackendService().catch(console.error);