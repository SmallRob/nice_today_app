const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建Electron应用...\n');

// 确保前端构建文件存在
function ensureFrontendBuild() {
    console.log('1. 检查前端构建文件...');
    const frontendBuildDir = path.join(__dirname, '../frontend/build');
    const indexFile = path.join(frontendBuildDir, 'index.html');
    
    if (!fs.existsSync(frontendBuildDir) || !fs.existsSync(indexFile)) {
        console.log('❌ 前端构建文件不存在，正在构建前端...');
        try {
            execSync('cd ../frontend && npm run build', { stdio: 'inherit' });
            console.log('✅ 前端构建完成');
        } catch (error) {
            console.error('❌ 前端构建失败:', error.message);
            process.exit(1);
        }
    } else {
        console.log('✅ 前端构建文件已存在');
    }
}

// 复制前端文件到Electron public目录
function copyFrontendToElectron() {
    console.log('\n2. 复制前端文件到Electron目录...');
    
    const frontendBuildDir = path.join(__dirname, '../frontend/build');
    const electronPublicDir = path.join(__dirname, '../electron/public');
    
    // 确保目标目录存在
    if (!fs.existsSync(electronPublicDir)) {
        fs.mkdirSync(electronPublicDir, { recursive: true });
    }
    
    // 复制文件
    if (fs.existsSync(frontendBuildDir)) {
        try {
            // 清空目标目录
            if (fs.existsSync(electronPublicDir)) {
                fs.rmSync(electronPublicDir, { recursive: true, force: true });
                fs.mkdirSync(electronPublicDir, { recursive: true });
            }
            
            // 复制前端构建文件
            copyDir(frontendBuildDir, electronPublicDir);
            console.log('✅ 前端文件复制完成');
        } catch (error) {
            console.error('❌ 复制文件失败:', error.message);
            process.exit(1);
        }
    } else {
        console.error('❌ 前端构建目录不存在');
        process.exit(1);
    }
}

// 递归复制目录
function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const items = fs.readdirSync(src);
    
    for (const item of items) {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);
        
        const stat = fs.statSync(srcPath);
        
        if (stat.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// 生成简单的图标文件
function generateIcons() {
    console.log('\n3. 生成应用图标...');
    
    const iconsDir = path.join(__dirname, '../electron/build/icons');
    if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir, { recursive: true });
    }
    
    // 创建简单的占位图标文件
    const iconSizes = [16, 32, 48, 64, 128, 256, 512];
    
    iconSizes.forEach(size => {
        const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
        if (!fs.existsSync(iconPath)) {
            // 创建简单的SVG内容作为占位图标
            const svgContent = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#667eea"/>
                <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="white"/>
                <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="${size/8}" fill="#667eea">NT</text>
            </svg>`;
            
            fs.writeFileSync(iconPath.replace('.png', '.svg'), svgContent);
        }
    });
    
    console.log('✅ 图标文件生成完成');
}

// 构建Electron应用
function buildElectron() {
    console.log('\n4. 构建Electron应用...');
    
    try {
        // 切换到electron目录并构建
        process.chdir(path.join(__dirname, '../electron'));
        
        // 清理之前的构建
        if (fs.existsSync('dist')) {
            fs.rmSync('dist', { recursive: true, force: true });
        }
        
        console.log('正在构建Electron应用...');
        execSync('npm run dist', { stdio: 'inherit' });
        
        console.log('✅ Electron应用构建完成');
    } catch (error) {
        console.error('❌ Electron构建失败:', error.message);
        process.exit(1);
    }
}

// 验证构建结果
function verifyBuild() {
    console.log('\n5. 验证构建结果...');
    
    const distDir = path.join(__dirname, '../electron/dist');
    
    if (!fs.existsSync(distDir)) {
        console.error('❌ 构建目录不存在');
        return false;
    }
    
    const files = fs.readdirSync(distDir);
    const installers = files.filter(f => f.endsWith('.exe') || f.endsWith('.dmg') || f.endsWith('.AppImage') || f.endsWith('.deb'));
    
    if (installers.length === 0) {
        console.error('❌ 未找到安装包文件');
        return false;
    }
    
    console.log('✅ 找到安装包文件:');
    installers.forEach(installer => {
        console.log(`   • ${installer}`);
    });
    
    return true;
}

// 主构建流程
async function main() {
    try {
        ensureFrontendBuild();
        copyFrontendToElectron();
        generateIcons();
        buildElectron();
        
        if (verifyBuild()) {
            console.log('\n🎉 Electron应用构建成功！');
            console.log('📁 安装包位置: electron/dist/');
            console.log('\n💡 下一步:');
            console.log('   1. 安装并测试应用');
            console.log('   2. 检查应用功能是否正常');
            console.log('   3. 如有问题，查看应用日志');
        } else {
            console.log('\n⚠️  构建完成但验证失败');
        }
        
    } catch (error) {
        console.error('❌ 构建过程出错:', error);
        process.exit(1);
    }
}

// 运行构建
main();