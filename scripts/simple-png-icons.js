const fs = require('fs');
const path = require('path');

console.log('🎨 创建简单的PNG图标文件...\n');

// 图标目录
const iconsDir = path.join(__dirname, '../electron/build/icons');

// 确保图标目录存在
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// 创建简单的PNG图标（使用base64编码的1x1像素PNG）
function createSimplePngIcon(size) {
    const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    // 创建一个非常小的PNG文件（1x1像素）作为占位符
    // 这是一个1x1像素的红色PNG图像（base64编码）
    const tinyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    
    // 解码base64并写入文件
    const pngBuffer = Buffer.from(tinyPngBase64, 'base64');
    fs.writeFileSync(iconPath, pngBuffer);
    
    console.log(`✅ 创建图标: ${size}x${size}.png`);
    return true;
}

// 创建ICO文件（Windows图标）
function createIcoFile() {
    const icoPath = path.join(iconsDir, 'icon.ico');
    
    // 创建简单的ICO文件（使用base64编码）
    const icoBase64 = 'AAABAAEAEBAQAAEABAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAgAAAAAAAAAAAAAAAEAAAABAAAAAAAAAAAAAAAAEAAABAAAAAQAAAAEAA';
    
    try {
        const icoBuffer = Buffer.from(icoBase64, 'base64');
        fs.writeFileSync(icoPath, icoBuffer);
        console.log('✅ 创建图标: icon.ico');
        return true;
    } catch (error) {
        console.log('⚠️  无法创建ICO文件，但PNG文件应该足够');
        return false;
    }
}

// 主函数
function main() {
    console.log('创建应用图标...\n');
    
    // 需要的图标尺寸
    const iconSizes = [16, 32, 48, 64, 128, 256, 512];
    
    let successCount = 0;
    
    // 创建PNG图标
    iconSizes.forEach(size => {
        if (createSimplePngIcon(size)) {
            successCount++;
        }
    });
    
    // 创建ICO文件
    createIcoFile();
    
    console.log('\n✅ 图标创建完成！');
    console.log(`📊 成功创建: ${successCount}个PNG图标`);
    
    // 验证图标文件
    const files = fs.readdirSync(iconsDir);
    const pngFiles = files.filter(f => f.endsWith('.png'));
    
    console.log(`\n📁 图标目录内容:`);
    files.forEach(file => {
        console.log(`   • ${file}`);
    });
    
    if (pngFiles.length >= 3) {
        console.log('\n🎉 图标文件已准备好，现在可以构建Electron应用！');
    } else {
        console.log('\n⚠️  图标文件可能不足，但可以尝试构建');
    }
}

// 运行
main();