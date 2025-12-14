## 解决方案

### 方案一：统一使用 electron-builder.json（推荐）

删除 [electron/package.json](file:///e:/WorkSource/nice_today_app/electron/package.json) 中的 `build` 字段，完全依赖 [electron/electron-builder.json](file:///e:/WorkSource/nice_today_app/electron/electron-builder.json)：


### 方案二：确保两个配置文件的一致性

如果我们希望保留 [electron/package.json](file:///e:/WorkSource/nice_today_app/electron/package.json) 中的配置，我们需要确保它与 [electron/electron-builder.json](file:///e:/WorkSource/nice_today_app/electron/electron-builder.json) 一致。但目前我们已经删除了 [electron/package.json](file:///e:/WorkSource/nice_today_app/electron/package.json) 中的 `build` 字段，所以采用方案一。

## 构建开发指南

### 1. 环境准备

#### 系统要求
- Node.js 16+
- Python 3.8+
- Windows/macOS/Linux

#### 安装依赖
```bash
# 安装前端依赖
cd frontend
npm install

# 安装Electron依赖
cd ../electron
npm install
```

### 2. 开发流程

#### 启动开发环境
```bash
# 方法一：使用npm scripts
cd electron
npm run dev

# 方法二：使用concurrently并行启动
# 在项目根目录执行
npm run dev
```

#### 开发注意事项
1. 前端代码修改后会热重载
2. 后端Python代码修改后需要重启Electron应用
3. 确保Python环境已正确安装并可执行

### 3. 构建流程

#### 构建步骤
```bash
# 1. 构建前端
cd frontend
npm run build

# 2. 构建Electron应用
cd ../electron
npm run dist
```

#### 或者使用一体化构建脚本
```bash
# 在项目根目录执行
npm run build
```

### 4. 打包配置说明

#### 资源打包
- 前端构建文件会被打包到 `app` 目录
- 后端Python代码会被打包到 `backend` 目录
- 所有非Node.js依赖文件都会被包含

#### 过滤规则
```json
{
  "extraResources": [
    {
      "from": "../backend",
      "to": "backend",
      "filter": [
        "**/*",
        "!node_modules",
        "!*.log",
        "!logs/**/*",
        "!__pycache__/**/*",
        "!*.pyc"
      ]
    }
  ]
}
```

### 5. 调试技巧

#### 查看资源路径
在Electron主进程中添加以下代码来调试资源路径：
```javascript
console.log('process.resourcesPath:', process.resourcesPath);
console.log('__dirname:', __dirname);
```

#### 测试Python后端
创建测试脚本来验证Python后端功能：
```javascript
const { PythonBackendService } = require('./electron/services/pythonBackendService');

async function testBackend() {
  const backendService = new PythonBackendService();
  await backendService.initialize();
  
  // 测试各项功能
  const result = await backendService.getTodayBiorhythm('1990-01-01');
  console.log(result);
}
```

### 6. 常见问题及解决方案

#### 问题1：构建时报权限错误
**现象**：`Access is denied` 或类似错误
**解决方案**：
1. 关闭杀毒软件
2. 以管理员身份运行命令行
3. 清理构建缓存：
   ```bash
   cd electron
   rm -rf dist
   rm -rf node_modules
   npm install
   ```

#### 问题2：Python后端调用失败
**现象**：无法找到Python脚本或执行失败
**解决方案**：
1. 检查资源是否正确打包
2. 验证Python环境是否可用
3. 检查路径查找逻辑是否正确

#### 问题3：中文乱码问题
**现象**：返回结果中中文显示为乱码
**解决方案**：
在Python脚本中设置编码：
```python
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
```

## 调试构建问题

### 步骤1：清理环境
```bash
cd electron
rm -rf dist
rm -rf node_modules
npm cache clean --force
```

### 步骤2：重新安装依赖
```bash
npm install
```

### 步骤3：构建应用
```bash
npm run dist
```

### 步骤4：验证构建结果
检查 `electron/dist` 目录中的构建产物，确保包含以下内容：
1. 可执行文件
2. `resources/backend` 目录包含所有Python文件
3. `resources/app` 目录包含前端构建文件

### 步骤5：测试应用
安装并运行构建好的应用，验证以下功能：
1. 应用能正常启动
2. Python后端服务能正常调用
3. 所有核心功能正常工作

通过以上指南和调试步骤，应该能够解决Electron应用构建完成后无法调用后端Python代码的问题。关键是要确保构建配置的一致性和资源文件的完整性。