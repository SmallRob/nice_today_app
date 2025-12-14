# Electron应用JS加载问题修复说明

## 问题描述

在Electron应用构建完成后，页面初始化时JS代码无法正常加载和执行。用户在打开应用时无法看到默认的计算结果，需要手动操作才能触发服务调用。

## 问题分析

经过深入分析，发现问题的根本原因在于：

1. **服务初始化时序问题**：后端服务在页面完全加载前未完成初始化
2. **API就绪状态检查缺失**：前端组件在API未就绪时就开始调用服务
3. **组件挂载时缺乏等待机制**：组件在挂载时立即尝试加载数据，但此时服务可能还未准备就绪

## 解决方案

### 1. 确保服务在窗口创建时立即初始化

修改 `electron/main.js` 文件，在窗口创建时立即初始化后端服务：

```javascript
mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    
    // 立即初始化后端服务确保页面加载时服务已就绪
    if (!backendService) {
        backendService = new JavaScriptBackendService()
        console.log('后端服务已初始化')
    }
})
```

### 2. 添加API就绪状态检查机制

修改 `electron/preload.js` 文件，添加服务就绪状态检查：

```javascript
// 添加服务就绪状态检查
let isApiReady = false;
setTimeout(() => {
    isApiReady = true;
}, 100);

contextBridge.exposeInMainWorld('electronAPI', {
  // 服务状态检查
  isReady: () => isApiReady,
  // ... 其他API
});
```

### 3. 在前端服务层添加就绪检查

修改 `frontend/src/services/desktopService.js` 文件，添加服务就绪检查函数：

```javascript
// 检查服务是否就绪
export const isServiceReady = () => {
  // 在Electron环境中检查API是否就绪
  if (isDesktopApp()) {
    return window.electronAPI?.isReady ? window.electronAPI.isReady() : false;
  }
  // Web环境中总是就绪
  return true;
};
```

### 4. 组件挂载时等待服务就绪

修改各组件文件（BiorhythmTab.js、MayaCalendar.js、DressInfo.js），在组件挂载时等待服务就绪：

```javascript
useEffect(() => {
    // 等待服务就绪后再加载数据
    const waitForService = async () => {
      // 等待最多2秒让服务就绪
      let attempts = 0;
      const maxAttempts = 20; // 2秒 (20 * 100ms)
      
      while (attempts < maxAttempts) {
        if (apiBaseUrl) {
          loadMayaCalendarRange();
          return;
        }
        
        // 等待100ms后重试
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      // 如果超过最大尝试次数仍未就绪，仍然尝试加载
      console.warn('服务未及时就绪，但仍尝试加载数据');
      if (apiBaseUrl) {
        loadMayaCalendarRange();
      }
    };
    
    waitForService();
}, [apiBaseUrl]);
```

## 验证测试

通过运行 `test_js_backend.js` 脚本验证JavaScript后端服务能够正常工作：

```
开始测试JavaScript后端服务...
JavaScript后端服务初始化
  当前环境: development
服务状态:
  生物节律服务就绪: true
  玛雅历法服务就绪: true
  穿搭建议服务就绪: true

--- 测试生物节律功能 ---
生物节律结果: {
  "success": true,
  "data": {
    "date": "2025-12-14",
    "physical": -52,
    "emotional": -22,
    "intellectual": -54
  }
}
...
```

## 构建和部署

使用 `build_and_test.js` 脚本进行完整构建和测试：

```bash
node build_and_test.js
```

该脚本会自动执行以下步骤：
1. 清理构建环境
2. 安装依赖
3. 构建前端应用
4. 测试JavaScript后端服务
5. 构建Electron应用
6. 验证构建结果

## 预期效果

修复后，应用在启动时将：
1. 立即初始化后端服务
2. 等待服务就绪后再加载数据
3. 在2秒内完成数据加载
4. 即使服务延迟也能通过重试机制加载数据
5. 用户打开应用时能看到默认的计算结果

## 注意事项

1. 请确保在每次修改后重新构建应用
2. 测试时注意观察控制台输出，确认服务初始化顺序正确
3. 如遇到新的问题，请检查各组件的useEffect依赖项是否正确