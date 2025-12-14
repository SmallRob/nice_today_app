#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const semver = require('semver');

// 获取当前版本号
const packagePath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
let currentVersion = packageJson.version;

// 获取命令行参数（patch, minor, major 或具体版本号）
const versionType = process.argv[2] || 'patch';

// 计算新版本号
let newVersion;
if (['patch', 'minor', 'major'].includes(versionType)) {
  newVersion = semver.inc(currentVersion, versionType);
} else {
  // 如果提供了具体的版本号
  newVersion = versionType;
  if (!semver.valid(newVersion)) {
    console.error(`错误: 无效的版本号格式: ${newVersion}`);
    process.exit(1);
  }
}

console.log(`🚀 开始发布流程，当前版本: ${currentVersion}，新版本: ${newVersion}`);

// 确认发布
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question(`确认发布版本 ${newVersion}? (y/n): `, (answer) => {
  if (answer.toLowerCase() !== 'y') {
    console.log('发布已取消');
    rl.close();
    process.exit(0);
  }
  
  try {
    // 1. 更新版本号
    console.log('\n📝 更新版本号...');
    packageJson.version = newVersion;
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
    
    // 更新electron/package.json的版本号
    const electronPackagePath = path.join(__dirname, '..', 'electron', 'package.json');
    const electronPackageJson = JSON.parse(fs.readFileSync(electronPackagePath, 'utf8'));
    electronPackageJson.version = newVersion;
    fs.writeFileSync(electronPackagePath, JSON.stringify(electronPackageJson, null, 2));
    
    // 更新frontend/package.json的版本号
    const frontendPackagePath = path.join(__dirname, '..', 'frontend', 'package.json');
    const frontendPackageJson = JSON.parse(fs.readFileSync(frontendPackagePath, 'utf8'));
    frontendPackageJson.version = newVersion;
    fs.writeFileSync(frontendPackagePath, JSON.stringify(frontendPackageJson, null, 2));
    
    // 2. 运行测试
    console.log('🧪 运行测试...');
    execSync('node integration_test.js', { stdio: 'inherit' });
    
    // 3. 构建应用
    console.log('🏗️ 构建应用...');
    execSync('node build.js', { stdio: 'inherit' });
    
    // 4. 创建应用图标
    console.log('🎨 创建应用图标...');
    execSync('node create_real_icons.js', { stdio: 'inherit' });
    
    // 5. 提交版本更新
    console.log('💾 提交版本更新...');
    execSync('git add .', { stdio: 'inherit' });
    execSync(`git commit -m "chore(release): bump version to ${newVersion}"`, { stdio: 'inherit' });
    execSync('git push origin main', { stdio: 'inherit' });
    
    // 6. 创建Git标签
    console.log(`🏷️ 创建Git标签 v${newVersion}...`);
    execSync(`git tag -a v${newVersion} -m "发布版本 ${newVersion}"`, { stdio: 'inherit' });
    execSync(`git push origin v${newVersion}`, { stdio: 'inherit' });
    
    // 7. 生成发布说明
    console.log('📄 生成发布说明...');
    const releaseNotesPath = path.join(__dirname, '..', 'RELEASE_NOTES.md');
    let releaseNotes = fs.readFileSync(releaseNotesPath, 'utf8');
    releaseNotes = releaseNotes.replace(/{VERSION}/g, newVersion);
    
    // 8. 检查是否安装了GitHub CLI
    try {
      execSync('gh --version', { stdio: 'ignore' });
      console.log('📦 创建GitHub Release...');
      
      // 创建GitHub Release
      const tempReleaseNotesPath = path.join(__dirname, '..', 'temp_release_notes.md');
      fs.writeFileSync(tempReleaseNotesPath, releaseNotes);
      
      execSync(`gh release create v${newVersion} --title "版本 ${newVersion}" --notes "$(cat ${tempReleaseNotesPath})"`, { stdio: 'inherit' });
      
      // 检查是否有构建文件
      const electronDistPath = path.join(__dirname, '..', 'electron', 'dist');
      if (fs.existsSync(electronDistPath)) {
        console.log('📎 上传构建文件...');
        const files = fs.readdirSync(electronDistPath);
        const uploadCommands = files
          .filter(file => /\.(exe|dmg|AppImage|deb|rpm)$/.test(file))
          .map(file => `"${path.join(electronDistPath, file)}"`)
          .join(' ');
          
        if (uploadCommands) {
          execSync(`gh release upload v${newVersion} ${uploadCommands}`, { stdio: 'inherit' });
        }
      }
      
      // 清理临时文件
      fs.unlinkSync(tempReleaseNotesPath);
      
      console.log(`\n✅ 版本 ${newVersion} 发布成功！`);
      console.log(`🌐 请访问 GitHub Releases 页面查看发布详情`);
      
    } catch (error) {
      console.warn('⚠️ GitHub CLI 未安装或配置不正确，请手动创建 Release');
      console.log('📄 已准备好发布说明，请复制以下内容到 GitHub Release 页面：');
      console.log('----------------------------------------');
      console.log(releaseNotes);
      console.log('----------------------------------------');
      console.log('\n🔗 GitHub Releases 地址: https://github.com/[用户名]/[仓库名]/releases');
    }
    
    rl.close();
  } catch (error) {
    console.error('❌ 发布失败:', error.message);
    rl.close();
    process.exit(1);
  }
});