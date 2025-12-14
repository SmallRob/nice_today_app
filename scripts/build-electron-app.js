const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 开始构建 Nice Today Electron 应用...\n');

// 检查前端构建文件是否存在
function checkFrontendBuild() {
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

// 构建Electron应用
function buildElectron() {
    console.log('\n2. 构建Electron应用...');
    
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
    console.log('\n3. 验证构建结果...');
    
    const distDir = path.join(__dirname, '../electron/dist');
    
    if (!fs.existsSync(distDir)) {
        console.error('❌ 构建目录不存在');
        return false;
    }
    
    const files = fs.readdirSync(distDir);
    const installers = files.filter(f => 
        f.endsWith('.exe') || f.endsWith('.dmg') || f.endsWith('.AppImage') || f.endsWith('.deb')
    );
    
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
        checkFrontendBuild();
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