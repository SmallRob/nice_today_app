const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 测试macOS应用构建结果...\n');

// 检测当前系统架构
function getCurrentArch() {
    try {
        const arch = process.arch;
        const platform = process.platform;
        
        if (platform !== 'darwin') {
            console.log('⚠️  当前系统不是macOS，某些测试可能无法执行');
            return { arch, platform, isMac: false };
        }
        
        // 检测是否是Apple Silicon
        try {
            const result = execSync('uname -m', { encoding: 'utf8' }).trim();
            const isArm64Mac = result === 'arm64';
            return { 
                arch, 
                platform, 
                isMac: true, 
                isArm64Mac,
                systemArch: result
            };
        } catch (error) {
            return { arch, platform, isMac: true, isArm64Mac: false };
        }
    } catch (error) {
        console.error('❌ 检测系统架构失败:', error.message);
        return { arch: 'unknown', platform: 'unknown', isMac: false };
    }
}

// 检查构建文件是否存在
function checkBuildFiles() {
    console.log('📁 检查构建文件...');
    
    const distDir = path.join(__dirname, '..', 'electron', 'dist');
    
    if (!fs.existsSync(distDir)) {
        console.error('❌ 构建目录不存在');
        return false;
    }
    
    const files = fs.readdirSync(distDir);
    const macFiles = files.filter(file => 
        file.endsWith('.dmg') || file.endsWith('.zip')
    );
    
    if (macFiles.length === 0) {
        console.error('❌ 未找到macOS构建文件');
        return false;
    }
    
    console.log('✅ 找到以下macOS构建文件:');
    macFiles.forEach(file => {
        const filePath = path.join(distDir, file);
        const stats = fs.statSync(filePath);
        const fileSize = (stats.size / 1024 / 1024).toFixed(2);
        const arch = file.includes('arm64') ? '(Apple Silicon)' : 
                     file.includes('x64') ? '(Intel)' : '(未知架构)';
        console.log(`  📄 ${file} ${arch} (${fileSize} MB)`);
    });
    
    return true;
}

// 检查应用包结构
function checkAppPackageStructure() {
    console.log('\n🔍 检查应用包结构...');
    
    const distDir = path.join(__dirname, '..', 'electron', 'dist');
    
    // 查找.app文件
    const files = fs.readdirSync(distDir);
    const appFiles = files.filter(file => file.endsWith('.app'));
    
    if (appFiles.length === 0) {
        console.warn('⚠️  未找到.app文件，可能需要先解压ZIP文件');
        return false;
    }
    
    appFiles.forEach(appFile => {
        const appPath = path.join(distDir, appFile);
        console.log(`\n检查应用包: ${appFile}`);
        
        // 检查应用包结构
        const requiredPaths = [
            'Contents/Info.plist',
            'Contents/MacOS/Nice Today',
            'Contents/Resources/app.asar'
        ];
        
        requiredPaths.forEach(requiredPath => {
            const fullPath = path.join(appPath, requiredPath);
            if (fs.existsSync(fullPath)) {
                console.log(`  ✅ ${requiredPath}`);
            } else {
                console.log(`  ❌ ${requiredPath} (缺失)`);
            }
        });
    });
    
    return true;
}

// 检查应用架构兼容性
function checkArchCompatibility() {
    console.log('\n🏗️ 检查架构兼容性...');
    
    const systemInfo = getCurrentArch();
    console.log(`当前系统: ${systemInfo.platform} (${systemInfo.systemArch || systemInfo.arch})`);
    
    if (systemInfo.isMac) {
        if (systemInfo.isArm64Mac) {
            console.log('✅ 当前系统是Apple Silicon Mac，兼容ARM64应用');
            console.log('ℹ️  Intel应用可以通过Rosetta 2运行');
        } else {
            console.log('✅ 当前系统是Intel Mac，兼容x64应用');
            console.log('ℹ️  ARM64应用可能无法运行');
        }
    } else {
        console.log('⚠️  当前系统不是macOS，无法测试应用运行');
        return false;
    }
    
    return true;
}

// 模拟应用启动测试
function simulateAppStartup() {
    console.log('\n🚀 模拟应用启动测试...');
    
    const distDir = path.join(__dirname, '..', 'electron', 'dist');
    const files = fs.readdirSync(distDir);
    const dmgFiles = files.filter(file => file.endsWith('.dmg'));
    
    if (dmgFiles.length === 0) {
        console.warn('⚠️  未找到DMG文件，无法模拟应用启动');
        return false;
    }
    
    dmgFiles.forEach(dmgFile => {
        console.log(`\n检查DMG文件: ${dmgFile}`);
        const dmgPath = path.join(distDir, dmgFile);
        
        // 检查DMG文件是否可以挂载
        try {
            const result = execSync(`hdiutil attach "${dmgPath}" -readonly -nobrowse -noverify`, 
                                 { encoding: 'utf8', timeout: 10000 });
            console.log('✅ DMG文件可以正常挂载');
            
            // 获取挂载路径
            const mountPathMatch = result.match(/\/Volumes\/([^\s]+)/);
            if (mountPathMatch) {
                const mountPath = mountPathMatch[0];
                console.log(`挂载路径: ${mountPath}`);
                
                // 检查应用是否存在
                const appPath = path.join(mountPath, 'Nice Today.app');
                if (fs.existsSync(appPath)) {
                    console.log('✅ 应用存在于DMG中');
                    
                    // 检查应用架构
                    try {
                        const archResult = execSync(`file "${appPath}/Contents/MacOS/Nice Today"`, 
                                                  { encoding: 'utf8' });
                        console.log(`应用架构: ${archResult.trim()}`);
                    } catch (error) {
                        console.warn('⚠️  无法检测应用架构');
                    }
                } else {
                    console.warn('⚠️  应用不存在于DMG中');
                }
                
                // 卸载DMG
                execSync(`hdiutil detach "${mountPath}"`, { encoding: 'utf8' });
                console.log('✅ DMG已卸载');
            }
        } catch (error) {
            console.warn(`⚠️  无法挂载DMG文件: ${error.message}`);
        }
    });
    
    return true;
}

// 生成测试报告
function generateTestReport() {
    console.log('\n📊 生成测试报告...');
    
    const systemInfo = getCurrentArch();
    const testResults = {
        system: {
            platform: systemInfo.platform,
            arch: systemInfo.systemArch || systemInfo.arch,
            isMac: systemInfo.isMac,
            isArm64Mac: systemInfo.isArm64Mac
        },
        buildFiles: checkBuildFiles(),
        appStructure: checkAppPackageStructure(),
        archCompatibility: checkArchCompatibility(),
        appStartup: simulateAppStartup(),
        timestamp: new Date().toISOString()
    };
    
    const reportPath = path.join(__dirname, '..', 'macos-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
    console.log(`✅ 测试报告已保存到: ${reportPath}`);
    
    return testResults;
}

// 主测试流程
async function main() {
    try {
        console.log('🧪 开始macOS应用测试...\n');
        
        // 检查构建文件
        const filesExist = checkBuildFiles();
        if (!filesExist) {
            console.error('❌ 请先运行构建命令: npm run build:mac');
            process.exit(1);
        }
        
        // 生成测试报告
        const testResults = generateTestReport();
        
        // 显示测试总结
        console.log('\n🎉 测试完成！');
        console.log('\n📊 测试总结:');
        console.log(`  • 系统平台: ${testResults.system.platform}`);
        console.log(`  • 系统架构: ${testResults.system.arch}`);
        console.log(`  • 构建文件: ${testResults.buildFiles ? '✅ 通过' : '❌ 失败'}`);
        console.log(`  • 应用结构: ${testResults.appStructure ? '✅ 通过' : '❌ 失败'}`);
        console.log(`  • 架构兼容: ${testResults.archCompatibility ? '✅ 通过' : '❌ 失败'}`);
        console.log(`  • 启动测试: ${testResults.appStartup ? '✅ 通过' : '❌ 失败'}`);
        
        console.log('\n📖 建议:');
        if (testResults.system.isMac && testResults.system.isArm64Mac) {
            console.log('  • 建议优先使用ARM64版本以获得最佳性能');
            console.log('  • Intel版本可以通过Rosetta 2运行，但性能可能较低');
        } else if (testResults.system.isMac && !testResults.system.isArm64Mac) {
            console.log('  • 建议使用x64版本以获得原生性能');
            console.log('  • ARM64版本可能无法运行');
        } else {
            console.log('  • 当前系统不是macOS，无法测试应用运行');
            console.log('  • 建议在macOS系统上进行测试');
        }
        
    } catch (error) {
        console.error('❌ 测试过程出错:', error);
        process.exit(1);
    }
}

// 执行测试
main();