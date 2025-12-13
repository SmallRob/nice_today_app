const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Nice Today桌面应用部署脚本\n');

// 部署配置
const deployConfig = {
    platforms: ['win32', 'darwin', 'linux'],
    arch: ['x64'],
    publish: false, // 设置为true可自动发布到GitHub Releases
    
    // 构建配置
    buildOptions: {
        win: ['nsis', 'portable'],
        mac: ['dmg'],
        linux: ['AppImage', 'deb']
    }
};

// 检查环境依赖
function checkDependencies() {
    console.log('🔍 检查环境依赖...');
    
    const requiredTools = [
        { name: 'Node.js', command: 'node --version' },
        { name: 'npm', command: 'npm --version' },
        { name: 'Python', command: 'python --version' },
        { name: 'pip', command: 'pip --version' }
    ];
    
    requiredTools.forEach(tool => {
        try {
            const version = execSync(tool.command, { encoding: 'utf8' }).trim();
            console.log(`✅ ${tool.name}: ${version}`);
        } catch (error) {
            console.error(`❌ ${tool.name}: 未安装`);
            process.exit(1);
        }
    });
}

// 安装依赖
function installDependencies() {
    console.log('\n📦 安装项目依赖...');
    
    const dependencies = [
        { name: '前端依赖', command: 'cd frontend && npm install', dir: 'frontend' },
        { name: 'Electron依赖', command: 'cd electron && npm install', dir: 'electron' },
        { name: 'Python依赖', command: 'cd backend && pip install -r requirements.txt', dir: 'backend' }
    ];
    
    dependencies.forEach(dep => {
        console.log(`\n📋 安装${dep.name}...`);
        try {
            if (fs.existsSync(dep.dir)) {
                execSync(dep.command, { stdio: 'inherit' });
                console.log(`✅ ${dep.name}安装完成`);
            } else {
                console.error(`❌ 目录不存在: ${dep.dir}`);
            }
        } catch (error) {
            console.error(`❌ ${dep.name}安装失败:`, error.message);
            process.exit(1);
        }
    });
}

// 生成图标
function generateIcons() {
    console.log('\n🎨 生成应用图标...');
    try {
        execSync('node scripts/generate-icons.js', { stdio: 'inherit' });
        console.log('✅ 图标生成完成');
    } catch (error) {
        console.error('❌ 图标生成失败:', error.message);
    }
}

// 构建应用
function buildApplication() {
    console.log('\n⚡ 构建桌面应用...');
    try {
        execSync('node scripts/build.js', { stdio: 'inherit' });
        console.log('✅ 应用构建完成');
    } catch (error) {
        console.error('❌ 应用构建失败:', error.message);
        process.exit(1);
    }
}

// 创建发布包
function createReleasePackages() {
    console.log('\n📦 创建发布包...');
    
    const distDir = 'electron/dist';
    if (!fs.existsSync(distDir)) {
        console.error('❌ 构建目录不存在');
        return;
    }
    
    // 创建发布说明
    const releaseNotes = `# Nice Today v1.0.0 发布说明

## 版本信息
- 版本: 1.0.0
- 发布日期: ${new Date().toLocaleDateString()}
- 支持平台: Windows, macOS, Linux

## 功能特色
- 🎯 完全本地化运行，无需网络连接
- 📊 生物节律分析（体力、情绪、智力周期）
- 🌙 玛雅日历与能量解读
- 👕 个性化穿衣饮食建议
- 🎨 现代化图标系统
- 🌙 深色模式支持

## 安装说明
### Windows
- 运行 \"Nice Today Setup 1.0.0.exe\" 进行安装
- 或使用便携版 \"Nice Today 1.0.0.exe\"

### macOS
- 打开 \"Nice Today-1.0.0.dmg\"
- 将应用拖拽到Applications文件夹

### Linux
- AppImage: 直接运行 \"Nice Today-1.0.0.AppImage\"
- DEB包: 使用 \"sudo dpkg -i Nice Today_1.0.0_amd64.deb\"

## 系统要求
- Windows 10+, macOS 10.14+, Ubuntu 18.04+
- 至少2GB RAM, 100MB磁盘空间
- 支持Python 3.8+

## 更新日志
- 初始版本发布
- 集成生物节律和玛雅历法功能
- 实现桌面应用本地化运行
- 现代化UI设计`;
    
    fs.writeFileSync(path.join(distDir, 'RELEASE_NOTES.md'), releaseNotes);
    console.log('✅ 发布说明创建完成');
    
    // 创建版本信息文件
    const versionInfo = {
        version: '1.0.0',
        buildDate: new Date().toISOString(),
        platforms: ['win32', 'darwin', 'linux'],
        features: [
            '本地化生物节律计算',
            '玛雅历法解析',
            '穿衣饮食建议',
            '现代化图标系统',
            '深色模式支持'
        ]
    };
    
    fs.writeFileSync(
        path.join(distDir, 'version.json'),
        JSON.stringify(versionInfo, null, 2)
    );
    
    console.log('✅ 版本信息创建完成');
}

// 显示构建结果
function showBuildResults() {
    console.log('\n📊 构建结果统计');
    console.log('================');
    
    const distDir = 'electron/dist';
    if (fs.existsSync(distDir)) {
        const files = fs.readdirSync(distDir);
        const packageFiles = files.filter(file => 
            file.endsWith('.exe') || 
            file.endsWith('.dmg') || 
            file.endsWith('.AppImage') || 
            file.endsWith('.deb')
        );
        
        console.log(`📦 生成的安装包 (${packageFiles.length}个):`);
        packageFiles.forEach(file => {
            const filePath = path.join(distDir, file);
            const stats = fs.statSync(filePath);
            const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
            console.log(`   • ${file} (${sizeMB}MB)`);
        });
        
        console.log('\n🎯 下一步操作:');
        console.log('   1. 测试安装包功能');
        console.log('   2. 发布到GitHub Releases (可选)');
        console.log('   3. 分发到用户');
    }
}

// 主部署流程
async function main() {
    console.log('🚀 开始部署Nice Today桌面应用\n');
    
    try {
        checkDependencies();
        installDependencies();
        generateIcons();
        buildApplication();
        createReleasePackages();
        showBuildResults();
        
        console.log('\n🎉 部署流程完成！');
        console.log('📁 安装包位置: electron/dist/');
        
    } catch (error) {
        console.error('❌ 部署过程出错:', error);
        process.exit(1);
    }
}

// 执行部署
main();