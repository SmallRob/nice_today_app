const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建 Nice Today Electron 桌面应用...');

// 构建步骤
async function finalBuild() {
    try {
        // 获取项目根目录
        const rootDir = __dirname;
        const electronDir = path.join(rootDir, 'electron');
        const frontendDir = path.join(rootDir, 'frontend');
        const backendDir = path.join(rootDir, 'backend');
        const distDir = path.join(electronDir, 'dist');
        
        // 步骤1: 清理环境
        console.log('\n📦 步骤1: 清理构建环境...');
        cleanDirectory(distDir);
        
        // 步骤2: 创建图标文件
        console.log('\n📦 步骤2: 创建应用图标...');
        createAppIcons();
        
        // 步骤3: 安装前端依赖并构建
        console.log('\n📦 步骤3: 构建前端应用...');
        execSync('cd frontend && npm install', { stdio: 'inherit' });
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
        
        console.log('\n🎉 Electron应用构建完成！');
        
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

// 清理函数
function cleanDirectory(dirPath) {
    if (fs.existsSync(dirPath)) {
        console.log(`清理目录: ${dirPath}`);
        try {
            fs.rmSync(dirPath, { recursive: true, force: true });
            console.log(`✅ 清理成功: ${dirPath}`);
        } catch (error) {
            console.log(`❌ 清理失败 ${dirPath}: ${error.message}`);
        }
    }
}

// 创建应用图标
function createAppIcons() {
    const iconsDir = path.join(__dirname, 'electron', 'build', 'icons');
    if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir, { recursive: true });
    }
    
    // 复制PNG图标
    const sourcePng = path.join(__dirname, 'frontend', 'src', 'images', 'nice_day.png');
    const destPng = path.join(iconsDir, 'icon-256x256.png');
    
    try {
        fs.copyFileSync(sourcePng, destPng);
        console.log('✅ PNG图标已复制到:', destPng);
    } catch (err) {
        console.error('❌ 复制PNG图标失败:', err);
    }
    
    // 创建真实的ICO文件
    try {
        const { default: pngToIco } = require('png-to-ico');
        pngToIco(sourcePng)
            .then(buf => {
                const icoPath = path.join(iconsDir, 'icon-256x256.ico');
                fs.writeFileSync(icoPath, buf);
                console.log('✅ 真实的ICO图标已创建:', icoPath);
            })
            .catch(err => {
                console.error('❌ 创建ICO图标失败:', err);
            });
    } catch (err) {
        console.error('❌ 导入png-to-ico失败:', err);
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
    
    // 检查是否生成了可执行文件
    const exeFiles = files.filter(file => file.endsWith('.exe'));
    if (exeFiles.length === 0) {
        throw new Error('未生成可执行文件');
    }
    
    console.log('✅ 构建目录验证通过');
    console.log(`✅ 生成了 ${exeFiles.length} 个可执行文件`);
}

// 运行构建
finalBuild();