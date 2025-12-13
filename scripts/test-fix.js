const { spawn } = require('child_process');
const path = require('path');

console.log('🔍 测试白屏问题修复...\n');

// 测试Python后端服务
async function testPythonBackend() {
    console.log('1. 测试Python后端服务...');
    
    const backendScript = path.join(__dirname, '../backend/electron_integration.py');
    
    return new Promise((resolve) => {
        const pythonProcess = spawn('python', [backendScript, 'get_today_biorhythm', JSON.stringify({birth_date: '1990-01-01'})], {
            cwd: path.join(__dirname, '../backend')
        });
        
        let stdoutData = '';
        let stderrData = '';
        
        pythonProcess.stdout.on('data', (data) => {
            stdoutData += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
            stderrData += data.toString();
        });
        
        pythonProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    const result = JSON.parse(stdoutData.trim());
                    console.log('✅ Python后端服务测试通过');
                    console.log('   结果:', JSON.stringify(result, null, 2));
                    resolve(true);
                } catch (error) {
                    console.log('❌ Python后端服务JSON解析失败');
                    console.log('   输出:', stdoutData);
                    resolve(false);
                }
            } else {
                console.log('❌ Python后端服务执行失败');
                console.log('   错误:', stderrData);
                resolve(false);
            }
        });
    });
}

// 测试前端构建文件
function testFrontendBuild() {
    console.log('\n2. 测试前端构建文件...');
    
    const buildDir = path.join(__dirname, '../frontend/build');
    const indexFile = path.join(buildDir, 'index.html');
    const jsDir = path.join(buildDir, 'static/js');
    const cssDir = path.join(buildDir, 'static/css');
    
    const fs = require('fs');
    
    if (!fs.existsSync(buildDir)) {
        console.log('❌ 前端构建目录不存在');
        return false;
    }
    
    if (!fs.existsSync(indexFile)) {
        console.log('❌ index.html文件不存在');
        return false;
    }
    
    const indexContent = fs.readFileSync(indexFile, 'utf8');
    if (!indexContent.includes('./static/js/')) {
        console.log('❌ HTML文件中的资源路径不正确');
        return false;
    }
    
    // 检查JS文件
    const jsFiles = fs.readdirSync(jsDir);
    if (jsFiles.length === 0) {
        console.log('❌ 没有找到JS文件');
        return false;
    }
    
    console.log('✅ 前端构建文件测试通过');
    console.log('   JS文件:', jsFiles.length + '个');
    return true;
}

// 测试Electron配置
function testElectronConfig() {
    console.log('\n3. 测试Electron配置...');
    
    const mainFile = path.join(__dirname, '../electron/main.js');
    const fs = require('fs');
    
    if (!fs.existsSync(mainFile)) {
        console.log('❌ main.js文件不存在');
        return false;
    }
    
    const content = fs.readFileSync(mainFile, 'utf8');
    
    // 检查关键配置
    const checks = [
        { name: 'loadFile配置', regex: /loadFile.*index\.html/ },
        { name: 'preload配置', regex: /preload.*preload\.js/ },
        { name: 'Python后端服务', regex: /PythonBackendService/ }
    ];
    
    let allPassed = true;
    checks.forEach(check => {
        if (content.match(check.regex)) {
            console.log(`   ✅ ${check.name}`);
        } else {
            console.log(`   ❌ ${check.name}`);
            allPassed = false;
        }
    });
    
    return allPassed;
}

// 主测试函数
async function main() {
    console.log('🚀 开始测试白屏问题修复...\n');
    
    const results = [];
    
    // 运行所有测试
    results.push(await testPythonBackend());
    results.push(testFrontendBuild());
    results.push(testElectronConfig());
    
    console.log('\n📊 测试结果总结:');
    console.log('================');
    
    const passed = results.filter(r => r).length;
    const total = results.length;
    
    console.log(`✅ 通过: ${passed}/${total}`);
    console.log(`❌ 失败: ${total - passed}/${total}`);
    
    if (passed === total) {
        console.log('\n🎉 所有测试通过！白屏问题应该已修复。');
        console.log('\n💡 建议下一步:');
        console.log('   1. 重新构建Electron应用: npm run build:electron');
        console.log('   2. 测试安装包功能');
        console.log('   3. 如果仍有问题，检查应用日志');
    } else {
        console.log('\n⚠️  部分测试失败，需要进一步修复。');
        console.log('\n🔧 需要检查的项目:');
        if (!results[0]) console.log('   • Python后端服务配置');
        if (!results[1]) console.log('   • 前端构建文件路径');
        if (!results[2]) console.log('   • Electron主进程配置');
    }
}

// 运行测试
main().catch(console.error);