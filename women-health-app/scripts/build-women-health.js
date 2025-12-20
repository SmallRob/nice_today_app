const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🌸 开始构建女性健康管理独立应用...\n');

// 获取命令行参数
const args = process.argv.slice(2);
const isDev = args.includes('--dev') || args.includes('-d');

// 清理构建目录
function cleanBuildDir() {
    console.log('🧹 清理构建目录...');
    const buildDirs = [
        'frontend/build'
    ];
    
    buildDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            fs.rmSync(dir, { recursive: true, force: true });
            console.log(`✅ 清理目录: ${dir}`);
        }
    });
}

// 构建女性健康管理前端应用
function buildFrontend() {
    console.log('\n📦 构建女性健康管理前端应用...');
    try {
        const frontendPath = path.join(__dirname, '../frontend');
        execSync('npm run build', { 
            stdio: 'inherit',
            cwd: frontendPath
        });
        console.log('✅ 前端构建完成');
    } catch (error) {
        console.error('❌ 前端构建失败:', error.message);
        process.exit(1);
    }
}

// 构建Electron应用
function buildElectron() {
    console.log('\n🍎 构建Electron应用...');
    
    try {
        const electronPath = path.join(__dirname, '../electron');
        const buildCommand = 'npx electron-builder --config electron-builder-women-health.json';
        
        console.log(`执行命令: ${buildCommand}`);
        execSync(buildCommand, { 
            stdio: 'inherit',
            cwd: electronPath
        });
        console.log('✅ Electron应用构建完成');
    } catch (error) {
        console.error('❌ Electron应用构建失败:', error.message);
        process.exit(1);
    }
}

// 测试构建结果
function testBuildResult() {
    console.log('\n🧪 测试构建结果...');
    
    const distDir = path.join(__dirname, '../electron/dist-women-health');
    
    if (fs.existsSync(distDir)) {
        const files = fs.readdirSync(distDir);
        const appFiles = files.filter(file => 
            file.endsWith('.dmg') || file.endsWith('.zip') || file.endsWith('.exe') || file.endsWith('.AppImage')
        );
        
        if (appFiles.length > 0) {
            console.log('✅ 找到构建文件:');
            appFiles.forEach(file => {
                const filePath = path.join(distDir, file);
                const stats = fs.statSync(filePath);
                if (stats.isFile()) {
                    const fileSize = (stats.size / 1024 / 1024).toFixed(2);
                    console.log(`   📄 ${file} (${fileSize} MB)`);
                }
            });
            return true;
        }
    }
    
    console.error('❌ 未找到构建文件');
    return false;
}

// 显示构建结果
function showBuildResults() {
    console.log('\n📁 构建结果:');
    const distDir = path.join(__dirname, '../electron/dist-women-health');
    
    if (fs.existsSync(distDir)) {
        const files = fs.readdirSync(distDir);
        const appFiles = files.filter(file => 
            file.endsWith('.dmg') || file.endsWith('.zip') || file.endsWith('.exe') || file.endsWith('.AppImage') || file.endsWith('.app')
        );
        
        if (appFiles.length > 0) {
            console.log('\n📱 女性健康管理应用构建文件:');
            appFiles.forEach(file => {
                const filePath = path.join(distDir, file);
                const stats = fs.statSync(filePath);
                if (stats.isFile()) {
                    const fileSize = (stats.size / 1024 / 1024).toFixed(2);
                    const platform = file.includes('mac') || file.endsWith('.dmg') || file.endsWith('.app') ? '(Mac)' : 
                                   file.includes('win') || file.endsWith('.exe') ? '(Windows)' : 
                                   file.includes('linux') || file.endsWith('.AppImage') ? '(Linux)' : '(通用)';
                    console.log(`   📄 ${file} ${platform} (${fileSize} MB)`);
                }
            });
        }
    }
}

// 主构建流程
async function main() {
    try {
        // 显示构建配置
        console.log('🔧 构建配置:');
        console.log(`  • 模式: ${isDev ? '开发模式' : '生产模式'}`);
        console.log('  • 目标: 独立的女性健康管理应用');
        
        // 执行构建步骤
        cleanBuildDir();
        buildFrontend();
        buildElectron();
        
        // 显示构建结果
        showBuildResults();
        
        if (testBuildResult()) {
            console.log('\n🎉 女性健康管理独立应用构建完成！');
            console.log('\n✨ 功能特色:');
            console.log('  • 独立的女性健康管理功能');
            console.log('  • 经期预测和健康数据分析');
            console.log('  • 本地数据存储，保护隐私');
            console.log('  • 响应式设计，支持暗黑模式');
            
            console.log('\n🚀 下一步:');
            console.log('  1. 测试安装包功能');
            console.log('  2. 代码签名 (如需分发)');
            console.log('  3. 公证 (如需分发)');
            console.log('  4. 发布到GitHub Releases (可选)');
            
            console.log('\n📖 使用说明:');
            console.log('  • 构建生产版本: npm run build');
            console.log('  • 构建开发版本: npm run build -- --dev');
        } else {
            console.error('❌ 构建结果验证失败');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ 构建过程出错:', error);
        process.exit(1);
    }
}

// 执行构建
main();