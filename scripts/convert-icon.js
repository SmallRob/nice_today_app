const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎨 转换应用图标...\n');

// 源图标文件
const sourceIcon = path.join(__dirname, '../electron/nice_day.png');
const iconsDir = path.join(__dirname, '../electron/build/icons');

// 确保图标目录存在
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// 检查源文件是否存在
if (!fs.existsSync(sourceIcon)) {
    console.error('❌ 源图标文件不存在:', sourceIcon);
    process.exit(1);
}

console.log('✅ 找到源图标文件:', sourceIcon);

// 检查系统是否支持图像处理工具
function checkImageTools() {
    const tools = ['magick', 'convert', 'sips'];
    for (const tool of tools) {
        try {
            execSync(`which ${tool}`, { stdio: 'ignore' });
            console.log(`✅ 找到图像处理工具: ${tool}`);
            return tool;
        } catch (error) {
            // 工具不存在，继续检查下一个
        }
    }
    return null;
}

// 使用sips工具转换图标（macOS内置）
function convertWithSips(size) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    try {
        execSync(`sips -z ${size} ${size} "${sourceIcon}" --out "${outputPath}"`, { stdio: 'ignore' });
        console.log(`✅ 使用sips创建图标: ${size}x${size}.png`);
        return true;
    } catch (error) {
        console.error(`❌ sips转换失败 (${size}x${size}):`, error.message);
        return false;
    }
}

// 使用ImageMagick转换图标
function convertWithImageMagick(size) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    try {
        execSync(`magick "${sourceIcon}" -resize ${size}x${size} "${outputPath}"`, { stdio: 'ignore' });
        console.log(`✅ 使用ImageMagick创建图标: ${size}x${size}.png`);
        return true;
    } catch (error) {
        console.error(`❌ ImageMagick转换失败 (${size}x${size}):`, error.message);
        return false;
    }
}

// 使用convert工具转换图标
function convertWithConvert(size) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    try {
        execSync(`convert "${sourceIcon}" -resize ${size}x${size} "${outputPath}"`, { stdio: 'ignore' });
        console.log(`✅ 使用convert创建图标: ${size}x${size}.png`);
        return true;
    } catch (error) {
        console.error(`❌ convert转换失败 (${size}x${size}):`, error.message);
        return false;
    }
}

// 创建简单的占位图标（当所有工具都不可用时）
function createPlaceholderIcon(size) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    // 复制源文件作为占位
    try {
        fs.copyFileSync(sourceIcon, outputPath);
        console.log(`⚠️  使用源文件作为占位图标: ${size}x${size}.png`);
        return true;
    } catch (error) {
        console.error(`❌ 创建占位图标失败 (${size}x${size}):`, error.message);
        return false;
    }
}

// 转换单个图标尺寸
function convertIcon(size) {
    const tool = checkImageTools();
    
    if (tool === 'sips') {
        return convertWithSips(size);
    } else if (tool === 'magick') {
        return convertWithImageMagick(size);
    } else if (tool === 'convert') {
        return convertWithConvert(size);
    } else {
        console.log('⚠️  未找到图像处理工具，使用源文件作为占位');
        return createPlaceholderIcon(size);
    }
}

// 主函数
function main() {
    console.log('开始转换应用图标...\n');
    
    // Electron需要的图标尺寸
    const iconSizes = [16, 32, 48, 64, 128, 256, 512];
    
    let successCount = 0;
    let failedCount = 0;
    
    // 转换每个尺寸的图标
    iconSizes.forEach(size => {
        if (convertIcon(size)) {
            successCount++;
        } else {
            failedCount++;
        }
    });
    
    console.log('\n📊 图标转换结果:');
    console.log(`✅ 成功: ${successCount}个`);
    console.log(`❌ 失败: ${failedCount}个`);
    
    if (failedCount === 0) {
        console.log('\n🎉 所有图标转换完成！');
        
        // 显示生成的图标文件
        const files = fs.readdirSync(iconsDir);
        const pngFiles = files.filter(f => f.endsWith('.png'));
        
        console.log(`\n📁 生成的PNG图标文件: ${pngFiles.length}个`);
        pngFiles.forEach(file => {
            const filePath = path.join(iconsDir, file);
            const stats = fs.statSync(filePath);
            console.log(`   • ${file} (${stats.size} bytes)`);
        });
    } else {
        console.log('\n⚠️  部分图标转换失败，但构建仍可继续');
    }
}

// 运行
main();