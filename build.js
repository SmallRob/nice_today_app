const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建 Nice Today 桌面应用...');

// 构建步骤
async function build() {
    try {
        // 获取项目根目录
        const rootDir = __dirname;
        const electronDir = path.join(rootDir, 'electron');
        const frontendDir = path.join(rootDir, 'frontend');
        const backendDir = path.join(rootDir, 'backend');
        const distDir = path.join(electronDir, 'dist');
        
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
        
        // 步骤5: 验证后端文件
        console.log('\n📦 步骤5: 验证后端文件...');
        validateBackendFiles(backendDir);
        
        // 步骤6: 构建Electron应用
        console.log('\n📦 步骤6: 构建Electron桌面应用...');
        execSync('cd electron && npm run build', { stdio: 'inherit' });
        
        // 步骤7: 验证构建结果
        console.log('\n📦 步骤7: 验证构建结果...');
        validateBuildResult(distDir);
        
        console.log('\n🎉 构建完成！');
        
        // 显示构建结果
        if (fs.existsSync(distDir)) {
            const files = fs.readdirSync(distDir);
            console.log('\n📁 生成的文件:');
            files.forEach(file => {
                const filePath = path.join(distDir, file);
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

// 验证后端文件
function validateBackendFiles(backendDir) {
    const requiredFiles = [
        'electron_backend.py',
        'requirements.txt'
    ];
    
    const servicesDir = path.join(backendDir, 'services');
    const utilsDir = path.join(backendDir, 'utils');
    
    console.log('验证必需文件...');
    requiredFiles.forEach(file => {
        const filePath = path.join(backendDir, file);
        if (!fs.existsSync(filePath)) {
            throw new Error(`缺少必需文件: ${filePath}`);
        }
        console.log(`✅ 文件存在: ${file}`);
    });
    
    console.log('验证服务目录...');
    if (!fs.existsSync(servicesDir)) {
        throw new Error(`缺少服务目录: ${servicesDir}`);
    }
    console.log('✅ 服务目录存在');
    
    console.log('验证工具目录...');
    if (!fs.existsSync(utilsDir)) {
        throw new Error(`缺少工具目录: ${utilsDir}`);
    }
    console.log('✅ 工具目录存在');
}

// 验证构建结果
function validateBuildResult(distDir) {
    if (!fs.existsSync(distDir)) {
        throw new Error('构建目录未创建');
    }
    
    const files = fs.readdirSync(distDir);
    if (files.length === 0) {
        throw new Error('构建目录为空');
    }
    
    console.log('✅ 构建目录验证通过');
}

// 运行构建
build();