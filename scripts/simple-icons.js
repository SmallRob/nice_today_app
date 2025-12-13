const fs = require('fs');
const path = require('path');

console.log('🎨 创建简易应用图标...');

// 图标尺寸配置
const iconSizes = [16, 32, 64, 128, 256, 512];
const outputDir = 'electron/build/icons';

// 确保输出目录存在
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// 创建SVG图标内容
function createSVGIcon(size) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- 背景圆形 -->
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="url(#gradient)" stroke="#ffffff" stroke-width="2"/>
  
  <!-- 太阳/月亮符号 -->
  <circle cx="${size/2}" cy="${size/2}" r="${size*0.3}" fill="#ffffff"/>
  
  <!-- 太阳光芒（仅在大尺寸图标上） -->
  ${size >= 128 ? Array.from({length: 8}, (_, i) => {
    const angle = (i * Math.PI) / 4;
    const startX = size/2 + Math.cos(angle) * size*0.3;
    const startY = size/2 + Math.sin(angle) * size*0.3;
    const endX = size/2 + Math.cos(angle) * (size*0.3 + size*0.15);
    const endY = size/2 + Math.sin(angle) * (size*0.3 + size*0.15);
    return `<line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" stroke="#ffffff" stroke-width="${size*0.02}"/>`;
  }).join('') : ''}
</svg>`;
}

// 生成PNG占位文件
function generatePlaceholderPNG(size) {
    const content = `# Nice Today 应用图标 - ${size}x${size}px
# 这是一个占位文件，请替换为实际图标
# 建议使用专业图标设计工具创建多尺寸图标

图标规格:
- 尺寸: ${size}x${size}像素
- 格式: PNG (透明背景)
- 色彩: 支持透明通道

生成建议:
1. 使用专业图标设计软件 (如: Adobe Illustrator, Figma)
2. 从512x512px开始设计，然后缩小到其他尺寸
3. 确保在小尺寸下仍然清晰可辨
4. 使用矢量图形以获得最佳缩放效果`;
    
    const filename = `icon-${size}x${size}.png`;
    const filepath = path.join(outputDir, filename);
    
    fs.writeFileSync(filepath, content);
    console.log(`✅ 创建占位文件: ${filename}`);
    
    return filepath;
}

// 生成SVG图标
function generateSVGIcon(size) {
    const content = createSVGIcon(size);
    const filename = `icon-${size}x${size}.svg`;
    const filepath = path.join(outputDir, filename);
    
    fs.writeFileSync(filepath, content);
    console.log(`✅ 生成SVG图标: ${filename}`);
    
    return filepath;
}

// 创建图标说明文件
function createIconReadme() {
    const readmeContent = `# Nice Today 应用图标

## 图标规格
应用图标采用现代化设计，结合太阳/月亮元素，代表生物节律与时间周期。

### 设计理念
- 渐变背景：代表能量流动和周期变化
- 圆形太阳/月亮：象征生物节律的循环特性
- 光芒设计：体现活力和能量辐射

### 现有图标文件
- SVG格式：矢量图标，可无限缩放
- PNG占位文件：需要替换为实际PNG图标

### 图标尺寸
| 尺寸 | 用途 | 状态 |
|------|------|------|
| 16x16px | 小图标、任务栏 | SVG生成 |
| 32x32px | 中等图标 | SVG生成 |
| 64x64px | 中等图标 | SVG生成 |
| 128x128px | 大图标 | SVG生成 |
| 256x256px | 应用图标 | SVG生成 |
| 512x512px | 高清图标 | SVG生成 |

### 后续步骤
1. 使用专业工具将SVG转换为PNG格式
2. 优化小尺寸图标的清晰度
3. 创建Windows图标文件 (.ico)
4. 创建macOS图标文件 (.icns)

### 推荐工具
- **在线转换**: [CloudConvert](https://cloudconvert.com/)
- **桌面软件**: GIMP, Inkscape, Adobe Illustrator
- **图标生成**: [Favicon Generator](https://realfavicongenerator.net/)

### 颜色方案
- 主渐变: #667eea → #764ba2
- 图标主体: #ffffff
- 边框: #ffffff`;
    
    fs.writeFileSync(path.join(outputDir, 'README.md'), readmeContent);
}

// 生成所有图标
async function generateAllIcons() {
    console.log('\n📐 生成SVG图标...');
    
    const svgFiles = [];
    const pngFiles = [];
    
    for (const size of iconSizes) {
        const svgFile = generateSVGIcon(size);
        svgFiles.push(svgFile);
        
        // 为PNG格式创建占位文件
        const pngFile = generatePlaceholderPNG(size);
        pngFiles.push(pngFile);
    }
    
    // 创建图标配置文件
    const iconConfig = {
        name: "Nice Today",
        version: "1.0.0",
        description: "生物节律与玛雅历法桌面应用",
        generated: new Date().toISOString(),
        formats: {
            svg: "矢量格式，支持无限缩放",
            png: "位图格式，需要专业工具生成"
        },
        icons: iconSizes.map(size => ({
            size: size,
            svg: `icon-${size}x${size}.svg`,
            png: `icon-${size}x${size}.png`
        }))
    };
    
    fs.writeFileSync(
        path.join(outputDir, 'icons.json'),
        JSON.stringify(iconConfig, null, 2)
    );
    
    // 创建说明文件
    createIconReadme();
    
    console.log('\n🎉 图标生成完成！');
    console.log('📁 图标位置: electron/build/icons/');
    console.log('📋 包含以下格式:');
    console.log('   • SVG图标 (已生成)');
    console.log('   • PNG占位文件 (需要替换)');
    console.log('\n💡 下一步: 使用专业工具将SVG转换为PNG格式');
    
    return { svgFiles, pngFiles };
}

// 执行图标生成
generateAllIcons().catch(console.error);