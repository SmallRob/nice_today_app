/**
 * 修复Electron应用打包后JS代码无法加载和执行的问题
 * 
 * 问题分析：
 * 1. 页面初始化时需要立即加载服务并计算默认结果
 * 2. 当前实现中服务初始化可能在页面完全加载前完成
 * 3. 需要确保在页面加载时JS已经准备就绪并可以正常执行
 */

const fs = require('fs');
const path = require('path');

// 修复main.js确保服务在窗口创建时就初始化
function fixMainJs() {
    const mainJsPath = path.join(__dirname, 'electron', 'main.js');
    let content = fs.readFileSync(mainJsPath, 'utf8');
    
    // 确保在createWindow函数中立即初始化后端服务
    const fixedContent = content.replace(
        /mainWindow.once\('ready-to-show', \(\) => \{[\s\S]*?mainWindow.show\(\)[\s\S]*?\}\)/,
        `mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    
    // 立即初始化后端服务确保页面加载时服务已就绪
    if (!backendService) {
        backendService = new JavaScriptBackendService()
        console.log('后端服务已初始化')
    }
  }`
    );
    
    fs.writeFileSync(mainJsPath, fixedContent, 'utf8');
    console.log('✓ 已修复 main.js');
}

// 修复preload.js确保API在页面加载前就绪
function fixPreloadJs() {
    const preloadJsPath = path.join(__dirname, 'electron', 'preload.js');
    let content = fs.readFileSync(preloadJsPath, 'utf8');
    
    // 添加服务就绪状态检查
    const fixedContent = content.replace(
        '// 暴露安全的API给渲染进程',
        `// 暴露安全的API给渲染进程
// 添加服务就绪状态检查
let isApiReady = false;
setTimeout(() => {
    isApiReady = true;
}, 100);`
    ).replace(
        'contextBridge.exposeInMainWorld(\'electronAPI\', {',
        `contextBridge.exposeInMainWorld('electronAPI', {
  // 服务状态检查
  isReady: () => isApiReady,`
    );
    
    fs.writeFileSync(preloadJsPath, fixedContent, 'utf8');
    console.log('✓ 已修复 preload.js');
}

// 修复desktopService.js确保服务调用前检查就绪状态
function fixDesktopService() {
    const desktopServicePath = path.join(__dirname, 'frontend', 'src', 'services', 'desktopService.js');
    let content = fs.readFileSync(desktopServicePath, 'utf8');
    
    // 在文件开头添加就绪状态检查函数
    if (!content.includes('isServiceReady')) {
        const importSection = content.indexOf('export const formatDateString');
        const insertPosition = content.lastIndexOf('\n', importSection);
        
        const readyCheckFunction = `
// 检查服务是否就绪
export const isServiceReady = () => {
  // 在Electron环境中检查API是否就绪
  if (isDesktopApp()) {
    return window.electronAPI?.isReady ? window.electronAPI.isReady() : false;
  }
  // Web环境中总是就绪
  return true;
};

`;
        
        const fixedContent = content.slice(0, insertPosition) + readyCheckFunction + content.slice(insertPosition);
        fs.writeFileSync(desktopServicePath, fixedContent, 'utf8');
        console.log('✓ 已修复 desktopService.js');
    }
}

// 修复BiorhythmTab组件确保在组件挂载时等待服务就绪
function fixBiorhythmTab() {
    const biorhythmTabPath = path.join(__dirname, 'frontend', 'src', 'components', 'BiorhythmTab.js');
    let content = fs.readFileSync(biorhythmTabPath, 'utf8');
    
    // 修改useEffect钩子确保等待服务就绪
    const fixedContent = content.replace(
        /useEffect\(\(\) => \{[\s\S]*?if \(loadBiorhythmDataRef\.current && apiBaseUrl && apiConnected\) \{[\s\S]*?\} else if \(!apiConnected\) \{[\s\S]*?setBirthDate\(new Date\(DEFAULT_BIRTH_DATE\)\);[\s\S]*?\}[\s\S]*?\}, \[apiBaseUrl, apiConnected, loadHistoryAndData, DEFAULT_BIRTH_DATE\]\);/,
        `useEffect(() => {
    // 等待服务就绪后再加载数据
    const waitForService = async () => {
      // 等待最多2秒让服务就绪
      let attempts = 0;
      const maxAttempts = 20; // 2秒 (20 * 100ms)
      
      while (attempts < maxAttempts) {
        if (loadBiorhythmDataRef.current && apiBaseUrl && apiConnected) {
          // 使用 setTimeout 确保在下一个事件循环中执行，避免初始化时的循环调用
          const timer = setTimeout(() => {
            loadHistoryAndData();
          }, 0);
          return () => clearTimeout(timer);
        } else if (!apiConnected) {
          // 如果API未连接，使用默认日期但不发送请求
          setIsDefaultDate(true);
          setBirthDate(new Date(DEFAULT_BIRTH_DATE));
          return;
        }
        
        // 等待100ms后重试
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      // 如果超过最大尝试次数仍未就绪，仍然尝试加载
      console.warn('服务未及时就绪，但仍尝试加载数据');
      if (loadBiorhythmDataRef.current) {
        const timer = setTimeout(() => {
          loadHistoryAndData();
        }, 0);
        return () => clearTimeout(timer);
      }
    };
    
    waitForService();
  }, [apiBaseUrl, apiConnected, loadHistoryAndData, DEFAULT_BIRTH_DATE]);`
    );
    
    fs.writeFileSync(biorhythmTabPath, fixedContent, 'utf8');
    console.log('✓ 已修复 BiorhythmTab.js');
}

// 修复MayaCalendar组件确保在组件挂载时等待服务就绪
function fixMayaCalendar() {
    const mayaCalendarPath = path.join(__dirname, 'frontend', 'src', 'components', 'MayaCalendar.js');
    let content = fs.readFileSync(mayaCalendarPath, 'utf8');
    
    // 修改useEffect钩子确保等待服务就绪
    const fixedContent = content.replace(
        /useEffect\(\(\) => \{[\s\S]*?if \(apiBaseUrl\) \{[\s\S]*?loadMayaCalendarRange\(\);[\s\S]*?\}[\s\S]*?\}, \[apiBaseUrl\]\);/,
        `useEffect(() => {
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
      console.warn('服务未及时就绪，但仍尝试加载玛雅日历数据');
      if (apiBaseUrl) {
        loadMayaCalendarRange();
      }
    };
    
    waitForService();
  }, [apiBaseUrl]);`
    );
    
    fs.writeFileSync(mayaCalendarPath, fixedContent, 'utf8');
    console.log('✓ 已修复 MayaCalendar.js');
}

// 修复DressInfo组件确保在组件挂载时等待服务就绪
function fixDressInfo() {
    const dressInfoPath = path.join(__dirname, 'frontend', 'src', 'components', 'DressInfo.js');
    let content = fs.readFileSync(dressInfoPath, 'utf8');
    
    // 修改useEffect钩子确保等待服务就绪
    const fixedContent = content.replace(
        /useEffect\(\(\) => \{[\s\S]*?if \(apiBaseUrl\) \{[\s\S]*?loadDressInfoRange\(\);[\s\S]*?\}[\s\S]*?\}, \[apiBaseUrl\]\);/,
        `useEffect(() => {
    // 等待服务就绪后再加载数据
    const waitForService = async () => {
      // 等待最多2秒让服务就绪
      let attempts = 0;
      const maxAttempts = 20; // 2秒 (20 * 100ms)
      
      while (attempts < maxAttempts) {
        if (apiBaseUrl) {
          loadDressInfoRange();
          return;
        }
        
        // 等待100ms后重试
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      // 如果超过最大尝试次数仍未就绪，仍然尝试加载
      console.warn('服务未及时就绪，但仍尝试加载穿搭建议数据');
      if (apiBaseUrl) {
        loadDressInfoRange();
      }
    };
    
    waitForService();
  }, [apiBaseUrl]);`
    );
    
    fs.writeFileSync(dressInfoPath, fixedContent, 'utf8');
    console.log('✓ 已修复 DressInfo.js');
}

// 主函数
function main() {
    console.log('开始修复Electron应用JS加载问题...\n');
    
    try {
        fixMainJs();
        fixPreloadJs();
        fixDesktopService();
        fixBiorhythmTab();
        fixMayaCalendar();
        fixDressInfo();
        
        console.log('\n✅ 所有修复已完成！');
        console.log('\n修复说明：');
        console.log('1. 确保后端服务在窗口创建时立即初始化');
        console.log('2. 添加服务就绪状态检查机制');
        console.log('3. 组件挂载时等待服务就绪后再加载数据');
        console.log('4. 增加超时重试机制确保即使服务延迟也能加载');
        
        console.log('\n请重新构建应用以使更改生效：');
        console.log('npm run build (在electron目录中)');
    } catch (error) {
        console.error('❌ 修复过程中出现错误:', error.message);
        process.exit(1);
    }
}

// 执行修复
main();