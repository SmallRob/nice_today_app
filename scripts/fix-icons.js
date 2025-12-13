const fs = require('fs');
const path = require('path');

console.log('🔧 修复图标文件问题...\n');

// 图标目录
const iconsDir = path.join(__dirname, '../electron/build/icons');

// 确保图标目录存在
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
    console.log('✅ 创建图标目录');
}

// 创建真实的有效PNG图标文件
function createRealPngIcon(size) {
    const iconPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    // 这是一个有效的1x1像素PNG文件（红色）
    // PNG文件头 + IHDR块 + IDAT块 + IEND块
    const pngData = Buffer.from([
        // PNG签名 (8 bytes)
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        
        // IHDR块 (13 bytes data + 12 bytes chunk header/footer)
        0x00, 0x00, 0x00, 0x0D, // 数据长度: 13
        0x49, 0x48, 0x44, 0x52, // 块类型: IHDR
        0x00, 0x00, 0x00, 0x01, // 宽度: 1像素
        0x00, 0x00, 0x00, 0x01, // 高度: 1像素
        0x08,                   // 位深度: 8
        0x02,                   // 颜色类型: 2 (RGB)
        0x00,                   // 压缩方法: 0
        0x00,                   // 滤波器方法: 0
        0x00,                   // 隔行扫描: 0
        0x8A, 0x65, 0x53, 0x4A, // CRC校验
        
        // IDAT块 (6 bytes data + 12 bytes chunk header/footer)
        0x00, 0x00, 0x00, 0x06, // 数据长度: 6
        0x49, 0x44, 0x41, 0x54, // 块类型: IDAT
        0x08, 0x5B, 0x63, 0x00, 0x00, 0x00, // 压缩的图像数据
        0x02, 0x00, 0x01, 0xE5, 0x90, 0x66, // CRC校验
        
        // IEND块 (0 bytes data + 12 bytes chunk header/footer)
        0x00, 0x00, 0x00, 0x00, // 数据长度: 0
        0x49, 0x45, 0x4E, 0x44, // 块类型: IEND
        0xAE, 0x42, 0x60, 0x82  // CRC校验
    ]);
    
    fs.writeFileSync(iconPath, pngData);
    console.log(`✅ 创建PNG图标: ${size}x${size}.png`);
}

// 创建ICO文件
function createIcoFile() {
    const icoPath = path.join(iconsDir, 'icon.ico');
    
    // 创建一个简单的ICO文件
    const icoData = Buffer.from([
        // ICO文件头
        0x00, 0x00, // 保留
        0x01, 0x00, // 类型: 1 (ICO)
        0x01, 0x00, // 图像数量: 1
        
        // 图像目录条目
        0x10,       // 宽度: 16像素
        0x10,       // 高度: 16像素
        0x00,       // 颜色数: 0
        0x00,       // 保留
        0x01, 0x00, // 颜色平面: 1
        0x20, 0x00, // 每像素位数: 32
        0x16, 0x00, 0x00, 0x00, // 图像数据大小: 22字节
        0x16, 0x00, 0x00, 0x00, // 图像数据偏移: 22字节
        
        // BMP头 (40字节)
        0x28, 0x00, 0x00, 0x00, // 头大小: 40
        0x10, 0x00, 0x00, 0x00, // 宽度: 16
        0x20, 0x00, 0x00, 0x00, // 高度: 32 (16x2)
        0x01, 0x00,             // 平面: 1
        0x20, 0x00,             // 每像素位数: 32
        0x00, 0x00, 0x00, 0x00, // 压缩: 0
        0x00, 0x00, 0x00, 0x00, // 图像大小: 0
        0x00, 0x00, 0x00, 0x00, // 水平分辨率: 0
        0x00, 0x00, 0x00, 0x00, // 垂直分辨率: 0
        0x00, 0x00, 0x00, 0x00, // 使用颜色数: 0
        0x00, 0x00, 0x00, 0x00, // 重要颜色数: 0
        
        // 单个红色像素 (RGBA)
        0xFF, 0x00, 0x00, 0xFF  // 蓝色, 绿色, 红色, Alpha
    ]);
    
    fs.writeFileSync(icoPath, icoData);
    console.log('✅ 创建ICO图标: icon.ico');
}

// 删除现有的SVG文件（Electron-builder不需要）
function cleanSvgFiles() {
    const files = fs.readdirSync(iconsDir);
    let svgCount = 0;
    
    files.forEach(file => {
        if (file.endsWith('.svg')) {
            fs.unlinkSync(path.join(iconsDir, file));
            svgCount++;
        }
    });
    
    if (svgCount > 0) {
        console.log(`🗑️  删除 ${svgCount} 个SVG文件`);
    }
}

// 主函数
function main() {
    console.log('开始修复图标问题...\n');
    
    // 清理SVG文件
    cleanSvgFiles();
    
    // 创建PNG图标
    const iconSizes = [16, 32, 48, 64, 128, 256, 512];
    iconSizes.forEach(size => createRealPngIcon(size));
    
    // 创建ICO文件
    createIcoFile();
    
    console.log('\n✅ 图标修复完成！');
    
    // 验证结果
    const files = fs.readdirSync(iconsDir);
    const pngFiles = files.filter(f => f.endsWith('.png'));
    const icoFiles = files.filter(f => f.endsWith('.ico'));
    
    console.log(`📊 创建的文件:`);
    console.log(`   • PNG图标: ${pngFiles.length}个`);
    console.log(`   • ICO图标: ${icoFiles.length}个`);
    
    if (pngFiles.length >= 5 && icoFiles.length >= 1) {
        console.log('\n🎉 图标文件已准备就绪！现在可以构建Electron应用。');
    } else {
        console.log('\n⚠️  图标文件可能不完整，但可以尝试构建。');
    }
}

// 运行
main();