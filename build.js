const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建 Nice Today 桌面应用...');

// 构建步骤
async function build() {
    try {
        // 步骤1: 清理环境
        console.log('\n📦 步骤1: 清理构建环境...');
        require('./scripts/clean-build.js');
        
        // 步骤2: 安装前端依赖
        console.log('\n📦 步骤2: 安装前端依赖...');
        execSync('cd frontend && npm install', { stdio: 'inherit' });
        
        // 步骤3: 构建前端
        console.log('\n📦 步骤3: 构建前端应用...');
        execSync('cd frontend && npm run build', { stdio: 'inherit' });
        
        // 步骤4: 安装Electron依赖
        console.log('\n📦 步骤4: 安装Electron依赖...');
        execSync('cd electron && npm install', { stdio: 'inherit' });
        
        // 步骤5: 构建Electron应用
        console.log('\n📦 步骤5: 构建Electron桌面应用...');
        execSync('cd electron && npm run build', { stdio: 'inherit' });
        
        console.log('\n🎉 构建完成！');
        
        // 显示构建结果
        const distPath = path.join(__dirname, 'electron', 'dist');
        if (fs.existsSync(distPath)) {
            const files = fs.readdirSync(distPath);
            console.log('\n📁 生成的文件:');
            files.forEach(file => {
                const filePath = path.join(distPath, file);
                const stats = fs.statSync(filePath);
                if (stats.isFile()) {
                    console.log(`   📄 ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
                } else {
                    console.log(`   📁 ${file}/`);
                }
            });
        }
        
        console.log('\n✅ 构建成功！应用文件位于 electron/dist/ 目录');
        
    } catch (error) {
        console.error('\n❌ 构建失败:', error.message);
        process.exit(1);
    }
}

// 运行构建
build();