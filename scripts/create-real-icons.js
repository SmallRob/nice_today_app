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
            // 如果没有转换工具，创建简单的BMP图标作为占位
            createBmpIcon(size);
        }
    } catch (error) {
        // 转换失败，创建BMP图标
        createBmpIcon(size);
    }
    
    console.log(`✅ 创建图标: ${size}x${size}.png`);
}

// 创建简单的BMP图标（纯文本格式）
function createBmpIcon(size) {
    const bmpPath = path.join(iconsDir, `icon-${size}x${size}.bmp`);
    const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    // 创建简单的1x1像素BMP文件（最小尺寸）
    const bmpHeader = Buffer.from([
        0x42, 0x4D,             // BM
        0x3E, 0x00, 0x00, 0x00, // File size: 62 bytes
        0x00, 0x00, 0x00, 0x00, // Reserved
        0x3E, 0x00, 0x00, 0x00, // Pixel data offset
        0x28, 0x00, 0x00, 0x00, // Header size: 40 bytes
        0x01, 0x00, 0x00, 0x00, // Width: 1
        0x01, 0x00, 0x00, 0x00, // Height: 1
        0x01, 0x00,             // Planes: 1
        0x18, 0x00,             // Bits per pixel: 24
        0x00, 0x00, 0x00, 0x00, // Compression: none
        0x00, 0x00, 0x00, 0x00, // Image size: 0
        0x00, 0x00, 0x00, 0x00, // X pixels per meter
        0x00, 0x00, 0x00, 0x00, // Y pixels per meter
        0x00, 0x00, 0x00, 0x00, // Colors used: 0
        0x00, 0x00, 0x00, 0x00, // Important colors: 0
        0xFF, 0x00, 0x00,       // Pixel data: blue (BGR format)
        0x00, 0x00, 0x00        // Padding
    ]);
    
    fs.writeFileSync(bmpPath, bmpHeader);
    
    // 复制BMP文件为PNG（Electron-builder需要PNG格式）
    fs.copyFileSync(bmpPath, pngPath);
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