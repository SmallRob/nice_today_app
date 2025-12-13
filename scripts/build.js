const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建Nice Today桌面应用...\n');

// 清理构建目录
function cleanBuildDir() {
    console.log('🧹 清理构建目录...');
    const buildDirs = [
        'build',
        'dist',
        'electron/dist',
        'frontend/build'
    ];
    
    buildDirs.forEach(dir => {
        if (fs.existsSync(dir)) {
            fs.rmSync(dir, { recursive: true, force: true });
            console.log(`✅ 清理目录: ${dir}`);
        }
    });
}

// 构建前端应用
function buildFrontend() {
    console.log('\n📦 构建React前端应用...');
    try {
        execSync('cd frontend && npm run build', { stdio: 'inherit' });
        console.log('✅ 前端构建完成');
    } catch (error) {
        console.error('❌ 前端构建失败:', error.message);
        process.exit(1);
    }
}

// 生成应用图标
function generateIcons() {
    console.log('\n🎨 生成应用图标...');
    try {
        execSync('node scripts/simple-icons.js', { stdio: 'inherit' });
        console.log('✅ 图标生成完成');
    } catch (error) {
        console.error('❌ 图标生成失败:', error.message);
        // 图标生成失败不影响主要构建流程
    }
}

// 复制前端构建文件到Electron目录
function copyFrontendToElectron() {
    console.log('\n📁 复制前端文件到Electron目录...');
    const frontendBuildDir = 'frontend/build';
    const electronPublicDir = 'electron/public';
    
    // 确保目标目录存在
    if (!fs.existsSync(electronPublicDir)) {
        fs.mkdirSync(electronPublicDir, { recursive: true });
    }
    
    // 复制文件
    if (fs.existsSync(frontendBuildDir)) {
        // Windows系统使用xcopy，其他系统使用cp
        if (process.platform === 'win32') {
            execSync(`xcopy "${frontendBuildDir}" "${electronPublicDir}" /E /I /Y`, { stdio: 'inherit' });
        } else {
            execSync(`cp -r "${frontendBuildDir}/." "${electronPublicDir}/"`, { stdio: 'inherit' });
        }
        console.log('✅ 前端文件复制完成');
    } else {
        console.error('❌ 前端构建目录不存在');
        process.exit(1);
    }
}

// 构建Electron应用
function buildElectron() {
    console.log('\n⚡ 构建Electron应用...');
    try {
        execSync('cd electron && npm run build', { stdio: 'inherit' });
        console.log('✅ Electron应用构建完成');
    } catch (error) {
        console.error('❌ Electron构建失败:', error.message);
        process.exit(1);
    }
}

// 创建安装包
function createInstaller() {
    console.log('\n📦 创建安装包...');
    try {
        execSync('cd electron && npm run dist', { stdio: 'inherit' });
        console.log('✅ 安装包创建完成');
    } catch (error) {
        console.error('❌ 安装包创建失败:', error.message);
        process.exit(1);
    }
}

// 主构建流程
async function main() {
    try {
        cleanBuildDir();
        generateIcons();
        buildFrontend();
        copyFrontendToElectron();
        buildElectron();
        createInstaller();
        
        console.log('\n🎉 Nice Today桌面应用构建完成！');
        console.log('📁 安装包位置: electron/dist/');
        console.log('\n✨ 功能特色:');
        console.log('  • 完全本地化运行，无需网络连接');
        console.log('  • 集成生物节律和玛雅历法计算');
        console.log('  • 现代化图标系统');
        console.log('  • 支持Windows, macOS, Linux');
        console.log('\n🚀 下一步:');
        console.log('  1. 测试安装包功能');
        console.log('  2. 使用专业工具优化图标');
        console.log('  3. 发布到GitHub Releases (可选)');
        
    } catch (error) {
        console.error('❌ 构建过程出错:', error);
        process.exit(1);
    }
}

// 执行构建
main();