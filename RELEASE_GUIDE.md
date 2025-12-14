# GitHub Release 发布指南

本指南详细介绍如何将 Nice Today 应用打包并发布到 GitHub Release。

## 🚀 发布流程概览

1. **准备工作** - 代码整理和测试
2. **构建应用** - 生成各平台的可执行文件
3. **创建Git标签** - 标记版本号
4. **创建GitHub Release** - 发布版本
5. **上传附件** - 添加可执行文件

## 📋 准备工作

### 1. 确保代码已提交
```bash
# 检查当前状态
git status

# 提交所有更改
git add .
git commit -m "准备发布版本 vX.X.X"

# 推送到远程仓库
git push origin main
```

### 2. 更新版本信息
更新以下文件中的版本号：
- `package.json` - 项目版本
- `electron/package.json` - Electron版本
- `frontend/package.json` - 前端版本

确保版本号一致，例如：
```json
{
  "version": "1.0.0"
}
```

### 3. 运行测试
```bash
# 运行集成测试
node integration_test.js

# 运行构建和测试
node build_and_test.js
```

## 🏗️ 构建应用

### 1. 安装依赖
```bash
# 安装项目依赖
npm install

# 进入前端目录并安装依赖
cd frontend
npm install
cd ..
```

### 2. 构建前端资源
```bash
# 构建前端
npm run build

# 或者使用构建脚本
node build.js
```

### 3. 创建应用图标
```bash
# 生成各平台的应用图标
node create_real_icons.js
```

### 4. 打包各平台可执行文件

#### Windows平台
```bash
# 使用electron-builder打包Windows应用
npx electron-builder --win

# 或使用项目脚本
npm run build-win
```

#### macOS平台
```bash
# 打包macOS应用
npx electron-builder --mac

# 或使用项目脚本
npm run build-mac
```

#### Linux平台
```bash
# 打包Linux应用
npx electron-builder --linux

# 或使用项目脚本
npm run build-linux
```

### 5. 检查构建结果
构建完成后，检查 `dist/` 目录（或 `build/` 目录）中的文件：
- Windows: `.exe` 安装程序和便携版
- macOS: `.dmg` 磁盘映像
- Linux: `.AppImage`、`.deb`、`.rpm` 包

## 🏷️ 创建Git标签

### 1. 创建标签
```bash
# 创建带注释的标签
git tag -a v1.0.0 -m "发布版本 1.0.0"

# 推送标签到远程仓库
git push origin v1.0.0
```

### 2. 列出和验证标签
```bash
# 列出所有标签
git tag -l

# 显示标签详情
git show v1.0.0
```

## 📦 创建GitHub Release

### 方式一：通过GitHub网页界面

1. 访问 GitHub 仓库页面
2. 点击上方的 "Releases" 选项卡
3. 点击 "Create a new release" 按钮
4. 选择刚才创建的标签 (v1.0.0)
5. 填写Release标题和描述：
   ```
   Release v1.0.0

   ## 🌟 新功能
   - 完整的生物节律计算功能
   - 个性化穿衣建议系统
   - 饮食推荐功能
   - 玛雅历法服务
   - 精确的日期计算和时区处理

   ## 🐛 修复
   - 修复生物节律日期计算错误
   - 修复穿衣指南无结果问题
   - 修复日期时区转换问题

   ## ⚠️ 注意事项
   - 首次发布，请先阅读使用文档
   - Windows 10及以上系统支持
   ```
6. 点击 "Publish release" 发布

### 方式二：通过GitHub CLI

1. 安装GitHub CLI（如果尚未安装）：
   ```bash
   # Windows (使用Chocolatey)
   choco install gh

   # Windows (使用winget)
   winget install GitHub.cli

   # macOS
   brew install gh

   # Linux (Ubuntu/Debian)
   sudo apt install gh
   ```

2. 登录GitHub：
   ```bash
   gh auth login
   ```

3. 创建Release：
   ```bash
   # 创建带标题和描述的Release
   gh release create v1.0.0 --title "版本 1.0.0" --notes "$(cat RELEASE_NOTES.md)"

   # 或者使用内联描述
   gh release create v1.0.0 --title "版本 1.0.0" --notes "发布版本 1.0.0，包含完整功能和修复"
   ```

## 📎 上传附件

### 方式一：通过网页界面上传
1. 在Release页面点击 "Attach binaries by dropping them here or selecting them"
2. 选择构建好的可执行文件上传
3. 等待上传完成

### 方式二：通过GitHub CLI上传
```bash
# 上传Windows版本
gh release upload v1.0.0 dist/NiceToday-Setup-1.0.0.exe

# 上传macOS版本
gh release upload v1.0.0 dist/NiceToday-1.0.0.dmg

# 上传Linux版本
gh release upload v1.0.0 dist/NiceToday-1.0.0.AppImage

# 批量上传
gh release upload v1.0.0 dist/*.exe dist/*.dmg dist/*.AppImage
```

## 🔍 验证Release

1. 访问GitHub Releases页面，检查Release是否正确创建
2. 下载各平台的可执行文件并测试
3. 确认版本号和应用功能正常
4. 检查Release描述是否准确完整

## 📝 维护更新日志

### 1. 创建CHANGELOG.md文件
```markdown
# 更新日志

所有重要的项目变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.0.0] - 2024-01-XX

### 新增
- 生物节律计算功能
- 个性化穿衣建议系统
- 饮食推荐功能
- 玛雅历法服务
- 精确的日期计算和时区处理

### 修复
- 修复生物节律日期计算错误
- 修复穿衣指南无结果问题
- 修复日期时区转换问题
```

### 2. 为后续更新维护日志
每次发布新版本时，更新CHANGELOG.md文件并添加新的变更记录。

## ⚡ 自动化发布（可选）

### 创建发布脚本
创建 `scripts/release.js` 文件自动化发布流程：

```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const version = process.argv[2] || '1.0.0';

console.log(`开始发布版本 ${version}...`);

// 1. 运行测试
console.log('运行测试...');
execSync('node integration_test.js', { stdio: 'inherit' });

// 2. 构建应用
console.log('构建应用...');
execSync('npm run build', { stdio: 'inherit' });

// 3. 创建Git标签
console.log(`创建Git标签 v${version}...`);
execSync(`git tag -a v${version} -m "发布版本 ${version}"`, { stdio: 'inherit' });
execSync(`git push origin v${version}`, { stdio: 'inherit' });

// 4. 创建GitHub Release
console.log('创建GitHub Release...');
const releaseNotes = fs.readFileSync('RELEASE_NOTES.md', 'utf8');
execSync(`gh release create v${version} --title "版本 ${version}" --notes "${releaseNotes}"`, { stdio: 'inherit' });

// 5. 上传附件
console.log('上传附件...');
execSync(`gh release upload v${version} dist/*`, { stdio: 'inherit' });

console.log(`版本 ${version} 发布成功！`);
```

### 使用发布脚本
```bash
# 发布版本
node scripts/release.js 1.0.0

# 或添加到package.json
"scripts": {
  "release": "node scripts/release.js"
}

# 使用npm脚本
npm run release 1.0.1
```

## 🎯 最佳实践

1. **语义化版本控制**：遵循 `主版本号.次版本号.修订号` 格式
   - 主版本号：不兼容的API修改
   - 次版本号：向下兼容的功能性新增
   - 修订号：向下兼容的问题修正

2. **详细的发布说明**：
   - 列出所有新功能
   - 说明重要的Bug修复
   - 提供升级指南（如有必要）
   - 包含已知问题和限制

3. **版本标签管理**：
   - 为每个发布版本创建Git标签
   - 使用一致的标签格式（如v1.0.0）
   - 为标签添加描述信息

4. **附件组织**：
   - 为每个平台提供适当的安装包
   - 使用清晰的文件命名
   - 考虑提供源代码压缩包

5. **发布前检查**：
   - 确保所有测试通过
   - 验证构建文件可正常运行
   - 检查版本号一致性
   - 更新相关文档

通过遵循以上指南，您可以高效、规范地将Nice Today应用发布到GitHub，方便用户下载使用。