const fs = require('fs');
const path = require('path');

// 创建必要的目录
const iconsDir = path.join(__dirname, 'electron', 'build', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// 复制PNG图标
const sourcePng = path.join(__dirname, 'frontend', 'src', 'images', 'nice_day.png');
const destPng = path.join(iconsDir, 'icon-256x256.png');

try {
    fs.copyFileSync(sourcePng, destPng);
    console.log('PNG图标已复制到:', destPng);
} catch (err) {
    console.error('复制PNG图标失败:', err);
}

// 创建一个简单的ICO文件（这里只是复制PNG并重命名为ICO，实际项目中应该使用专门的工具）
const destIco = path.join(iconsDir, 'icon-256x256.ico');
try {
    fs.copyFileSync(sourcePng, destIco);
    console.log('ICO图标已创建:', destIco);
} catch (err) {
    console.error('创建ICO图标失败:', err);
}

console.log('图标创建完成！');