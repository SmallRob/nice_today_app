const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧹 清理构建环境...');

// 清理函数
function cleanDirectory(dirPath) {
    if (fs.existsSync(dirPath)) {
        console.log(`清理目录: ${dirPath}`);
        try {
            // 先尝试标准删除
            fs.rmSync(dirPath, { recursive: true, force: true });
            console.log(`✅ 清理成功: ${dirPath}`);
        } catch (error) {
            console.log(`❌ 清理失败 ${dirPath}: ${error.message}`);
            // 如果是文件被锁定，等待后重试
            if (error.code === 'EBUSY' || error.message.includes('被另一进程使用')) {
                console.log('等待1秒后重试...');
                setTimeout(() => {
                    try {
                        fs.rmSync(dirPath, { recursive: true, force: true });
                        console.log(`✅ 重试清理成功: ${dirPath}`);
                    } catch (retryError) {
                        console.log(`❌ 重试清理失败: ${retryError.message}`);
                    }
                }, 1000);
            }
        }
    }
}

// 清理所有构建相关目录
const dirsToClean = [
    'electron/dist',
    'electron/node_modules',
    'frontend/build',
    'frontend/node_modules',
    'electron_build'
];

dirsToClean.forEach(dir => {
    cleanDirectory(path.join(__dirname, '..', dir));
});

// 清理进程
console.log('🔪 清理锁定进程...');
try {
    if (process.platform === 'win32') {
        // Windows平台
        execSync('taskkill /F /IM electron.exe 2>nul || echo "No electron processes found"', { stdio: 'inherit' });
        execSync('taskkill /F /IM node.exe 2>nul || echo "No node processes found"', { stdio: 'inherit' });
    } else {
        // Unix平台
        execSync('pkill -f electron 2>/dev/null || echo "No electron processes found"', { stdio: 'inherit' });
        execSync('pkill -f node 2>/dev/null || echo "No node processes found"', { stdio: 'inherit' });
    }
} catch (error) {
    console.log('进程清理完成');
}

console.log('✅ 清理完成！');