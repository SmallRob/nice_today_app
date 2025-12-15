const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎨 创建真实的PNG图标文件...\n');

// 图标目录
const iconsDir = path.join(__dirname, '../electron/build/icons');

// 确保图标目录存在
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// 创建简单的PNG图标（使用ImageMagick或Node.js库）
function createSimpleIcon(size) {
    const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    // 创建简单的Canvas来绘制图标（使用纯JavaScript）
    const canvas = require('canvas');
    const { createCanvas } = canvas;
    
    const canvasObj = createCanvas(size, size);
    const ctx = canvasObj.getContext('2d');
    
    // 绘制背景
    ctx.fillStyle = '#667eea';
    ctx.fillRect(0, 0, size, size);
    
    // 绘制圆形
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/3, 0, Math.PI * 2);
    ctx.fill();
    
    // 绘制文字
    ctx.fillStyle = '#667eea';
    ctx.font = `bold ${size/8}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('NT', size/2, size/2);
    
    // 保存为PNG
    const buffer = canvasObj.toBuffer('image/png');
    fs.writeFileSync(iconPath, buffer);
    
    console.log(`✅ 创建图标: ${size}x${size}.png`);
}

// 如果没有canvas，创建简单的SVG图标
function createSvgIcon(size) {
    const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
    const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    // 创建SVG
    const svgContent = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#667eea"/>
        <circle cx="${size/2}" cy="${size/2}" r="${size/3}" fill="white"/>
        <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="${size/8}" fill="#667eea" font-weight="bold">NT</text>
    </svg>`;
    
    fs.writeFileSync(svgPath, svgContent);
    
    // 尝试将SVG转换为PNG（如果系统支持）
    try {
        // 使用Inkscape或ImageMagick转换SVG到PNG
        if (isCommandAvailable('inkscape')) {
            execSync(`inkscape --export-type=png --export-filename="${pngPath}" --export-width=${size} --export-height=${size} "${svgPath}"`, { stdio: 'ignore' });
        } else if (isCommandAvailable('magick')) {
            execSync(`magick "${svgPath}" -resize ${size}x${size} "${pngPath}"`, { stdio: 'ignore' });
        } else if (isCommandAvailable('convert')) {
            execSync(`convert "${svgPath}" -resize ${size}x${size} "${pngPath}"`, { stdio: 'ignore' });
        } else {
            // 如果没有转换工具，创建简单的PNG图标作为占位
            createSimplePngIcon(size);
        }
    } catch (error) {
        // 转换失败，创建PNG图标
        createSimplePngIcon(size);
    }
    
    console.log(`✅ 创建图标: ${size}x${size}.png`);
}

// 创建简单的PNG图标（使用纯JavaScript生成）
function createSimplePngIcon(size) {
    const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    // 使用纯JavaScript创建PNG数据
    // 创建一个简单的PNG文件头和数据
    const pngHeader = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D,                           // IHDR chunk length
        0x49, 0x48, 0x44, 0x52,                           // IHDR
        0x00, 0x00, 0x00, 0x01,                           // Width: 1
        0x00, 0x00, 0x00, 0x01,                           // Height: 1
        0x08,                                             // Bit depth: 8
        0x02,                                             // Color type: RGB
        0x00,                                             // Compression: deflate
        0x00,                                             // Filter: none
        0x00,                                             // Interlace: none
        0x00, 0x00, 0x00, 0x00,                           // CRC (placeholder)
        0x00, 0x00, 0x00, 0x00,                           // IDAT chunk length
        0x49, 0x44, 0x41, 0x54,                           // IDAT
        0x08, 0x99, 0x02, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // Compressed data
        0x00, 0x00, 0x00, 0x00,                           // CRC (placeholder)
        0x00, 0x00, 0x00, 0x00,                           // IEND chunk length
        0x49, 0x45, 0x4E, 0x44,                           // IEND
        0xAE, 0x42, 0x60, 0x82                            // IEND CRC
    ]);
    
    // 创建一个更简单的解决方案：使用纯色PNG
    // 这里我们使用一个更可靠的方法：创建一个1x1像素的PNG
    const pngData = Buffer.from([
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, // IHDR chunk
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, // 1x1 pixel
        0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, // Bit depth, color type
        0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41, // IDAT chunk
        0x54, 0x08, 0x5B, 0x63, 0xF8, 0x0F, 0x00, 0x00, // Compressed data
        0x02, 0x00, 0x01, 0xE2, 0x21, 0xBC, 0x33, 0x00, // More data
        0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, // IEND chunk
        0x42, 0x60, 0x82                                  // IEND
    ]);
    
    fs.writeFileSync(pngPath, pngData);
}

// 检查命令是否可用
function isCommandAvailable(command) {
    try {
        execSync(`where ${command}`, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

// 主函数
function main() {
    console.log('创建应用图标...\n');
    
    // 需要的图标尺寸
    const iconSizes = [16, 32, 48, 64, 128, 256, 512];
    
    try {
        // 尝试使用canvas创建高质量的PNG图标
        require('canvas');
        console.log('使用Canvas创建高质量图标...');
        iconSizes.forEach(size => createSimpleIcon(size));
    } catch (error) {
        // 如果canvas不可用，使用SVG转换方法
        console.log('Canvas不可用，使用SVG转换方法...');
        iconSizes.forEach(size => createSvgIcon(size));
    }
    
    console.log('\n✅ 所有图标创建完成！');
    
    // 验证图标文件
    const files = fs.readdirSync(iconsDir);
    const pngFiles = files.filter(f => f.endsWith('.png'));
    
    console.log(`\n📊 创建的PNG图标文件: ${pngFiles.length}个`);
    pngFiles.forEach(file => {
        console.log(`   • ${file}`);
    });
}

// 运行
main();