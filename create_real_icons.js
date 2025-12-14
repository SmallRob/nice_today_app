const fs = require('fs');
const path = require('path');
const { default: pngToIco } = require('png-to-ico');

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

// 创建真实的ICO文件
pngToIco(sourcePng)
    .then(buf => {
        const icoPath = path.join(iconsDir, 'icon-256x256.ico');
        fs.writeFileSync(icoPath, buf);
        console.log('真实的ICO图标已创建:', icoPath);
    })
    .catch(err => {
        console.error('创建ICO图标失败:', err);
    });

console.log('图标创建脚本执行完成！');