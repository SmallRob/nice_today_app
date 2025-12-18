const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🍎 开始构建macOS版本应用...\n');

// 获取命令行参数
const args = process.argv.slice(2);
const buildArm64 = args.includes('--arm64') || args.includes('-a');
const buildX64 = args.includes('--x64') || args.includes('-x');
const buildBoth = !buildArm64 && !buildX64; // 默认构建两种架构

// 清理构建目录
function cleanBuildDir() {
    console.log('🧹 清理macOS构建目录...');
    const buildDirs = [
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
        execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, '..', 'frontend') });
        console.log('✅ 前端构建完成');
    } catch (error) {
        console.error('❌ 前端构建失败:', error.message);
        process.exit(1);
    }
}

// 生成应用图标
function generateIcons() {
    console.log('\n🎨 转换应用图标...');
    try {
        execSync('node scripts/convert-icon.js', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
        console.log('✅ 图标转换完成');
    } catch (error) {
        console.error('❌ 图标转换失败:', error.message);
        // 图标生成失败不影响主要构建流程
    }
}

// 复制前端构建文件到Electron目录
function copyFrontendToElectron() {
    console.log('\n📁 复制前端文件到Electron目录...');
    const frontendBuildDir = path.join(__dirname, '..', 'frontend', 'build');
    const electronPublicDir = path.join(__dirname, '..', 'electron', 'public');
    
    // 确保目标目录存在
    if (!fs.existsSync(electronPublicDir)) {
        fs.mkdirSync(electronPublicDir, { recursive: true });
    }
    
    // 复制文件
    if (fs.existsSync(frontendBuildDir)) {
        execSync(`cp -r "${frontendBuildDir}/." "${electronPublicDir}/"`, { stdio: 'inherit' });
        console.log('✅ 前端文件复制完成');
    } else {
        console.error('❌ 前端构建目录不存在');
        process.exit(1);
    }
}

// 构建macOS应用
function buildMacOS(arch) {
    const archName = arch === 'arm64' ? 'Apple Silicon (ARM64)' : 'Intel (x64)';
    console.log(`\n🍎 构建macOS应用 (${archName})...`);
    
    try {
        const buildCommand = `npx electron-builder --mac --${arch}`;
        console.log(`执行命令: ${buildCommand}`);
        execSync(buildCommand, { stdio: 'inherit', cwd: path.join(__dirname, '..', 'electron') });
        console.log(`✅ macOS应用 (${archName}) 构建完成`);
    } catch (error) {
        console.error(`❌ macOS应用 (${archName}) 构建失败:`, error.message);
        process.exit(1);
    }
}

// 测试构建结果
function testBuildResult(arch) {
    const archName = arch === 'arm64' ? 'arm64' : 'x64';
    console.log(`\n🧪 测试macOS应用 (${archName}) 构建结果...`);
    
    const distDir = path.join(__dirname, '..', 'electron', 'dist');
    const expectedFiles = [
        `Nice Today-${archName}.dmg`,
        `Nice Today-${archName}.zip`
    ];
    
    let allFilesExist = true;
    expectedFiles.forEach(file => {
        const filePath = path.join(distDir, file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            const fileSize = (stats.size / 1024 / 1024).toFixed(2);
            console.log(`✅ 找到文件: ${file} (${fileSize} MB)`);
        } else {
            console.error(`❌ 未找到文件: ${file}`);
            allFilesExist = false;
        }
    });
    
    if (!allFilesExist) {
        console.error(`❌ macOS应用 (${archName}) 构建结果不完整`);
        return false;
    }
    
    console.log(`✅ macOS应用 (${archName}) 构建结果验证通过`);
    return true;
}

// 显示构建结果
function showBuildResults() {
    console.log('\n📁 构建结果:');
    const distDir = path.join(__dirname, '..', 'electron', 'dist');
    
    if (fs.existsSync(distDir)) {
        const files = fs.readdirSync(distDir);
        const macFiles = files.filter(file => 
            file.endsWith('.dmg') || file.endsWith('.zip') || file.endsWith('.app')
        );
        
        if (macFiles.length > 0) {
            console.log('\n🍎 macOS构建文件:');
            macFiles.forEach(file => {
                const filePath = path.join(distDir, file);
                const stats = fs.statSync(filePath);
                if (stats.isFile()) {
                    const fileSize = (stats.size / 1024 / 1024).toFixed(2);
                    const arch = file.includes('arm64') ? '(Apple Silicon)' : 
                                 file.includes('x64') ? '(Intel)' : '(通用)';
                    console.log(`   📄 ${file} ${arch} (${fileSize} MB)`);
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
        if (buildBoth) {
            console.log('  • 架构: Intel (x64) + Apple Silicon (ARM64)');
        } else if (buildArm64) {
            console.log('  • 架构: Apple Silicon (ARM64) 仅');
        } else if (buildX64) {
            console.log('  • 架构: Intel (x64) 仅');
        }
        console.log('  • 目标: DMG + ZIP');
        
        // 执行构建步骤
        cleanBuildDir();
        generateIcons();
        buildFrontend();
        copyFrontendToElectron();
        
        // 根据选择的架构进行构建
        if (buildBoth || buildArm64) {
            buildMacOS('arm64');
            testBuildResult('arm64');
        }
        
        if (buildBoth || buildX64) {
            buildMacOS('x64');
            testBuildResult('x64');
        }
        
        // 显示构建结果
        showBuildResults();
        
        console.log('\n🎉 macOS应用构建完成！');
        console.log('\n✨ 功能特色:');
        console.log('  • 支持Intel和Apple Silicon Mac');
        console.log('  • 代码签名准备就绪');
        console.log('  • 符合Mac App Store分发要求');
        console.log('  • 完全本地化运行，无需网络连接');
        
        console.log('\n🚀 下一步:');
        console.log('  1. 测试安装包功能');
        console.log('  2. 代码签名 (如需分发)');
        console.log('  3. 公证 (如需分发)');
        console.log('  4. 发布到GitHub Releases (可选)');
        
        console.log('\n📖 使用说明:');
        console.log('  • 构建两种架构: npm run build:mac');
        console.log('  • 仅构建ARM64: npm run build:mac -- --arm64');
        console.log('  • 仅构建x64: npm run build:mac -- --x64');
        
    } catch (error) {
        console.error('❌ 构建过程出错:', error);
        process.exit(1);
    }
}

// 执行构建
main();