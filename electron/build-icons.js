const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🎨 生成应用图标...');

// 创建简单的SVG图标
const svgIcon = `
<svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#ff6b6b;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#6b48ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#48b2ff;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="128" cy="128" r="120" fill="url(#gradient)" stroke="#ffffff" stroke-width="4"/>
  <circle cx="128" cy="128" r="80" fill="none" stroke="#ffffff" stroke-width="8" stroke-dasharray="20,10"/>
  <circle cx="128" cy="128" r="40" fill="none" stroke="#ffffff" stroke-width="4"/>
  <text x="128" y="140" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="24" font-weight="bold">NT</text>
</svg>`;

// 保存SVG文件
const svgPath = path.join(__dirname, 'build', 'icon.svg');
const buildDir = path.join(__dirname, 'build');

if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

fs.writeFileSync(svgPath, svgIcon);
console.log('✅ SVG图标已创建');

// 使用ImageMagick转换图标（如果可用）
try {
  // 检查是否安装了ImageMagick
  execSync('magick -version', { stdio: 'ignore' });
  
  console.log('🔄 使用ImageMagick转换图标格式...');
  
  // 转换为PNG
  const pngPath = path.join(__dirname, 'build', 'icon.png');
  execSync(`magick "${svgPath}" -resize 256x256 "${pngPath}"`, { stdio: 'inherit' });
  
  // 转换为ICO（Windows图标）
  const icoPath = path.join(__dirname, 'build', 'icon.ico');
  execSync(`magick "${pngPath}" -define icon:auto-resize=256,128,64,48,32,16 "${icoPath}"`, { stdio: 'inherit' });
  
  // 转换为ICNS（macOS图标）
  const icnsPath = path.join(__dirname, 'build', 'icon.icns');
  execSync(`magick "${pngPath}" -resize 1024x1024 "${buildDir}/icon_1024.png"`, { stdio: 'inherit' });
  execSync(`magick "${buildDir}/icon_1024.png" -resize 512x512 "${buildDir}/icon_512.png"`, { stdio: 'inherit' });
  execSync(`magick "${buildDir}/icon_1024.png" -resize 256x256 "${buildDir}/icon_256.png"`, { stdio: 'inherit' });
  execSync(`magick "${buildDir}/icon_1024.png" -resize 128x128 "${buildDir}/icon_128.png"`, { stdio: 'inherit' });
  execSync(`magick "${buildDir}/icon_1024.png" -resize 32x32 "${buildDir}/icon_32.png"`, { stdio: 'inherit' });
  execSync(`magick "${buildDir}/icon_1024.png" -resize 16x16 "${buildDir}/icon_16.png"`, { stdio: 'inherit' });
  
  console.log('✅ 图标转换完成');
  
} catch (error) {
  console.log('⚠️ ImageMagick不可用，使用备用方案...');
  
  // 备用方案：直接使用现有的PNG文件
  const existingIcon = path.join(__dirname, 'nice_day.png');
  if (fs.existsSync(existingIcon)) {
    // 复制现有图标到build目录
    const backupIcon = path.join(buildDir, 'icon.png');
    fs.copyFileSync(existingIcon, backupIcon);
    console.log('✅ 使用现有图标文件');
  } else {
    console.log('⚠️ 没有可用的图标文件，将使用默认图标');
  }
}