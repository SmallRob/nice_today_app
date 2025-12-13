const path = require('path');
const fs = require('fs');

console.log('=== Electron 资源路径调试 ===');
console.log('process.resourcesPath:', process.resourcesPath || '未定义');
console.log('__dirname:', __dirname);
console.log('process.cwd():', process.cwd());

// 检查常见的资源路径
const possiblePaths = [
  process.resourcesPath,
  path.join(__dirname, '..'),
  path.join(__dirname, '../..'),
  path.join(__dirname, '../../resources'),
  path.join(__dirname, '../../../resources')
];

possiblePaths.forEach((p, index) => {
  if (p) {
    console.log(`\n路径 ${index + 1}: ${p}`);
    try {
      if (fs.existsSync(p)) {
        const stats = fs.statSync(p);
        if (stats.isDirectory()) {
          console.log('  存在: 是');
          const items = fs.readdirSync(p);
          console.log('  内容:', items.slice(0, 10)); // 只显示前10项
          if (items.length > 10) {
            console.log(`  ... 还有 ${items.length - 10} 项`);
          }
        } else {
          console.log('  存在: 否（是文件）');
        }
      } else {
        console.log('  存在: 否');
      }
    } catch (err) {
      console.log('  访问错误:', err.message);
    }
  }
});

// 特别检查是否有 backend 目录
console.log('\n=== 检查 backend 目录 ===');
possiblePaths.forEach((p, index) => {
  if (p) {
    const backendPath = path.join(p, 'backend');
    console.log(`路径 ${index + 1} 的 backend: ${backendPath}`);
    try {
      if (fs.existsSync(backendPath)) {
        const stats = fs.statSync(backendPath);
        if (stats.isDirectory()) {
          console.log('  backend 存在: 是');
          const items = fs.readdirSync(backendPath);
          console.log('  backend 内容:', items.slice(0, 10));
        } else {
          console.log('  backend 存在: 否（是文件）');
        }
      } else {
        console.log('  backend 存在: 否');
      }
    } catch (err) {
      console.log('  访问错误:', err.message);
    }
  }
});