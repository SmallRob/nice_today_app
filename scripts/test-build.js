const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 测试Nice Today桌面应用构建结果...\n');

// 测试配置
const testConfig = {
    buildDir: 'electron/dist',
    expectedFiles: [
        'Nice Today Setup 1.0.0.exe',
        'Nice Today-1.0.0.dmg',
        'Nice Today-1.0.0.AppImage',
        'Nice Today_1.0.0_amd64.deb'
    ],
    minFileSize: 1024 * 50 // 50KB最小文件大小
};

// 检查构建目录是否存在
function checkBuildDir() {
    console.log('📁 检查构建目录...');
    
    if (!fs.existsSync(testConfig.buildDir)) {
        console.error('❌ 构建目录不存在:', testConfig.buildDir);
        return false;
    }
    
    console.log('✅ 构建目录存在');
    return true;
}

// 检查安装包文件
function checkInstallationFiles() {
    console.log('\n📦 检查安装包文件...');
    
    const files = fs.readdirSync(testConfig.buildDir);
    const installationFiles = files.filter(file => 
        file.endsWith('.exe') || 
        file.endsWith('.dmg') || 
        file.endsWith('.AppImage') || 
        file.endsWith('.deb')
    );
    
    console.log(`📋 找到 ${installationFiles.length} 个安装包:`);
    
    let allFilesValid = true;
    installationFiles.forEach(file => {
        const filePath = path.join(testConfig.buildDir, file);
        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
        
        if (stats.size > testConfig.minFileSize) {
            console.log(`   ✅ ${file} (${sizeMB}MB)`);
        } else {
            console.log(`   ❌ ${file} (${sizeMB}MB) - 文件大小异常`);
            allFilesValid = false;
        }
    });
    
    return { files: installationFiles, allValid: allFilesValid };
}

// 检查其他构建文件
function checkOtherFiles() {
    console.log('\n📄 检查其他构建文件...');
    
    const expectedFiles = [
        'RELEASE_NOTES.md',
        'version.json'
    ];
    
    let allFilesExist = true;
    expectedFiles.forEach(file => {
        const filePath = path.join(testConfig.buildDir, file);
        if (fs.existsSync(filePath)) {
            console.log(`   ✅ ${file}`);
        } else {
            console.log(`   ❌ ${file} - 文件不存在`);
            allFilesExist = false;
        }
    });
    
    return allFilesExist;
}

// 检查图标文件
function checkIconFiles() {
    console.log('\n🎨 检查图标文件...');
    
    const iconDir = 'electron/build/icons';
    if (!fs.existsSync(iconDir)) {
        console.log('   ⚠️ 图标目录不存在');
        return false;
    }
    
    const iconFiles = fs.readdirSync(iconDir);
    const svgFiles = iconFiles.filter(file => file.endsWith('.svg'));
    const pngFiles = iconFiles.filter(file => file.endsWith('.png'));
    
    console.log(`   📋 SVG图标: ${svgFiles.length} 个`);
    console.log(`   📋 PNG图标: ${pngFiles.length} 个`);
    
    return svgFiles.length > 0;
}

// 验证文件完整性
function validateFileIntegrity() {
    console.log('\n🔍 验证文件完整性...');
    
    const checks = [
        { name: '构建目录', check: checkBuildDir },
        { name: '安装包文件', check: checkInstallationFiles },
        { name: '其他文件', check: checkOtherFiles },
        { name: '图标文件', check: checkIconFiles }
    ];
    
    let allChecksPassed = true;
    
    checks.forEach(check => {
        const result = check.check();
        if (result === false || (typeof result === 'object' && !result.allValid)) {
            allChecksPassed = false;
        }
    });
    
    return allChecksPassed;
}

// 生成测试报告
function generateTestReport(allChecksPassed) {
    console.log('\n📊 测试报告');
    console.log('===========');
    
    if (allChecksPassed) {
        console.log('✅ 所有测试通过！');
        console.log('\n🎉 构建验证成功！');
        console.log('\n🚀 下一步操作:');
        console.log('   1. 在目标平台上测试安装包');
        console.log('   2. 验证应用功能完整性');
        console.log('   3. 发布到分发渠道');
    } else {
        console.log('❌ 部分测试失败');
        console.log('\n🔧 需要修复的问题:');
        console.log('   1. 检查构建配置');
        console.log('   2. 验证依赖安装');
        console.log('   3. 重新运行构建脚本');
    }
    
    return allChecksPassed;
}

// 主测试流程
async function main() {
    try {
        console.log('🧪 开始构建结果测试...\n');
        
        const allChecksPassed = validateFileIntegrity();
        const testResult = generateTestReport(allChecksPassed);
        
        if (testResult) {
            console.log('\n✅ 测试完成 - 构建验证通过');
            process.exit(0);
        } else {
            console.log('\n❌ 测试完成 - 需要修复构建问题');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ 测试过程中出错:', error);
        process.exit(1);
    }
}

// 执行测试
main();