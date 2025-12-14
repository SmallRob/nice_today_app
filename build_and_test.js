/**
 * 完整的构建和测试脚本
 * 确保Electron应用能够正确构建并在打包后正常运行
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建和测试Nice Today Electron应用...');

// 构建步骤
async function buildAndTest() {
    try {
        // 步骤1: 清理环境
        console.log('\n📦 步骤1: 清理构建环境...');
        cleanBuildEnvironment();
        
        // 步骤2: 安装依赖
        console.log('\n📦 步骤2: 安装依赖...');
        installDependencies();
        
        // 步骤3: 构建前端
        console.log('\n📦 步骤3: 构建前端应用...');
        buildFrontend();
        
        // 步骤4: 测试JavaScript后端服务
        console.log('\n📦 步骤4: 测试JavaScript后端服务...');
        testJavaScriptBackend();
        
        // 步骤5: 构建Electron应用
        console.log('\n📦 步骤5: 构建Electron应用...');
        buildElectronApp();
        
        // 步骤6: 验证构建结果
        console.log('\n📦 步骤6: 验证构建结果...');
        verifyBuildResults();
        
        console.log('\n🎉 所有步骤完成！应用已成功构建。');
        console.log('\n💡 下一步操作:');
        console.log('  1. 运行 "npm start" 启动开发版本');
        console.log('  2. 运行 "npm run dist" 构建发布版本');
        console.log('  3. 在 electron/dist 目录中找到构建的应用');
        
    } catch (error) {
        console.error('\n❌ 构建过程中出现错误:', error.message);
        process.exit(1);
    }
}

// 清理构建环境
function cleanBuildEnvironment() {
    const electronDistPath = path.join(__dirname, 'electron', 'dist');
    const frontendBuildPath = path.join(__dirname, 'frontend', 'build');
    
    // 删除Electron构建目录
    if (fs.existsSync(electronDistPath)) {
        execSync(`rmdir /s /q "${electronDistPath}"`, { stdio: 'inherit', shell: true });
        console.log('  ✓ 已清理Electron构建目录');
    }
    
    // 删除前端构建目录
    if (fs.existsSync(frontendBuildPath)) {
        execSync(`rmdir /s /q "${frontendBuildPath}"`, { stdio: 'inherit', shell: true });
        console.log('  ✓ 已清理前端构建目录');
    }
}

// 安装依赖
function installDependencies() {
    // 安装前端依赖
    console.log('  📦 安装前端依赖...');
    execSync('cd frontend && npm install', { stdio: 'inherit', shell: true });
    
    // 安装Electron依赖
    console.log('  📦 安装Electron依赖...');
    execSync('cd electron && npm install', { stdio: 'inherit', shell: true });
    
    console.log('  ✓ 依赖安装完成');
}

// 构建前端
function buildFrontend() {
    console.log('  🏗️  构建前端应用...');
    execSync('cd frontend && npm run build', { stdio: 'inherit', shell: true });
    console.log('  ✓ 前端构建完成');
}

// 测试JavaScript后端服务
function testJavaScriptBackend() {
    console.log('  🧪 测试JavaScript后端服务...');
    execSync('node test_js_backend.js', { stdio: 'inherit', shell: true });
    console.log('  ✓ JavaScript后端服务测试通过');
}

// 构建Electron应用
function buildElectronApp() {
    console.log('  🏗️  构建Electron应用...');
    execSync('cd electron && npx electron-builder --config electron-builder-local.json', { stdio: 'inherit', shell: true });
    console.log('  ✓ Electron应用构建完成');
}

// 验证构建结果
function verifyBuildResults() {
    const distPath = path.join(__dirname, 'electron', 'dist');
    
    if (fs.existsSync(distPath)) {
        const files = fs.readdirSync(distPath);
        console.log('  📁 构建产物:');
        files.forEach(file => {
            console.log(`    - ${file}`);
        });
        
        // 检查关键文件是否存在
        const exeFile = files.find(f => f.endsWith('.exe'));
        if (exeFile) {
            console.log(`  ✓ 找到可执行文件: ${exeFile}`);
        } else {
            console.warn('  ⚠️  未找到可执行文件，请检查构建结果');
        }
    } else {
        console.error('  ❌ 未找到构建产物目录');
        throw new Error('构建失败：未生成构建产物');
    }
}

// 运行构建
buildAndTest();