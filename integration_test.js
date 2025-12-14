const { PythonBackendService } = require('./electron/services/pythonBackendService');

async function testIntegration() {
    console.log('=== Electron与Python集成测试 ===\n');
    
    try {
        // 创建后端服务实例
        const backendService = new PythonBackendService();
        
        console.log('1. 初始化Python后端服务...');
        await backendService.initialize();
        console.log('✅ 初始化完成\n');
        
        // 测试生物节律功能
        console.log('2. 测试生物节律功能...');
        const biorhythmResult = await backendService.getTodayBiorhythm('1990-01-01');
        console.log('生物节律结果:', JSON.stringify(biorhythmResult, null, 2));
        
        if (biorhythmResult.success) {
            console.log('✅ 生物节律功能正常\n');
        } else {
            console.log('❌ 生物节律功能异常\n');
        }
        
        // 测试玛雅历法功能
        console.log('3. 测试玛雅历法功能...');
        const mayaResult = await backendService.getTodayMayaInfo();
        console.log('玛雅历法结果:', JSON.stringify(mayaResult, null, 2));
        
        if (mayaResult.success) {
            console.log('✅ 玛雅历法功能正常\n');
        } else {
            console.log('❌ 玛雅历法功能异常\n');
        }
        
        // 测试穿搭建议功能
        console.log('4. 测试穿搭建议功能...');
        const dressResult = await backendService.getTodayDressInfo();
        console.log('穿搭建议结果:', JSON.stringify(dressResult, null, 2));
        
        if (dressResult.success) {
            console.log('✅ 穿搭建议功能正常\n');
        } else {
            console.log('❌ 穿搭建议功能异常\n');
        }
        
        console.log('🎉 集成测试完成！');
        
    } catch (error) {
        console.error('❌ 集成测试失败:', error);
    }
}

// 运行测试
testIntegration();