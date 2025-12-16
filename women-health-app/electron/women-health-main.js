const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const isDev = process.env.NODE_ENV === 'development';

// 女性健康管理窗口
let womenHealthWindow = null;

// 创建女性健康管理窗口
function createWomenHealthWindow() {
  // 确保图标文件存在
  const iconPath = path.join(__dirname, 'nice_woman.png');
  
  womenHealthWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'default',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    show: false,
    backgroundColor: '#fdf2f8', // 粉紫色背景
    title: '女性健康管理 - Nice Today',
    autoHideMenuBar: true, // 自动隐藏菜单栏
  });

  // 设置空菜单，隐藏菜单栏
  Menu.setApplicationMenu(null);

  // 禁用开发者工具快捷键
  womenHealthWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' || 
        (input.control && input.shift && (input.key === 'I' || input.key === 'J')) ||
        (input.control && input.alt && input.key === 'I')) {
      event.preventDefault();
    }
  });

  // 加载女性健康管理页面
  if (isDev) {
    womenHealthWindow.loadURL('http://localhost:3000')
      .catch(err => {
        console.error('Failed to load dev URL:', err);
        // 显示错误页面
        womenHealthWindow.loadURL(`data:text/html;charset=utf-8,<html><body><h1>开发服务器未启动</h1><p>请运行 npm start 启动开发服务器</p></body></html>`);
      });
    womenHealthWindow.webContents.openDevTools();
  } else {
    // 在生产环境中，加载打包后的前端文件
    // 检查是否在asar包中
    const isAsar = __dirname.includes('.asar');
    let htmlPath;
    
    if (isAsar) {
      // 在asar包中，文件位于Resources/app目录下
      htmlPath = path.join(process.resourcesPath, 'app', 'index.html');
    } else {
      // 不在asar包中，使用相对路径
      const appPath = process.resourcesPath ? path.join(process.resourcesPath, 'app') : path.join(__dirname, '../frontend/build');
      htmlPath = path.join(appPath, 'index.html');
    }
    
    // 检查文件是否存在
    if (fs.existsSync(htmlPath)) {
      womenHealthWindow.loadFile(htmlPath)
        .catch(err => {
          console.error('Failed to load production file:', err);
          // 显示错误页面
          womenHealthWindow.loadURL(`data:text/html;charset=utf-8,<html><body><h1>加载失败</h1><p>无法加载应用文件: ${err.message}</p></body></html>`);
        });
    } else {
      // 显示错误页面
      womenHealthWindow.loadURL(`data:text/html;charset=utf-8,<html><body><h1>文件未找到</h1><p>应用文件不存在: ${htmlPath}</p></body></html>`);
    }
  }

  // 窗口准备就绪时显示
  womenHealthWindow.once('ready-to-show', () => {
    womenHealthWindow.show();
  });

  // 处理加载失败的情况
  womenHealthWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('页面加载失败:', errorCode, errorDescription);
    // 显示错误页面
    womenHealthWindow.loadURL(`data:text/html;charset=utf-8,<html><body><h1>加载失败</h1><p>错误代码: ${errorCode}<br>错误描述: ${errorDescription}</p></body></html>`);
  });

  womenHealthWindow.on('closed', () => {
    womenHealthWindow = null;
  });

  // 处理窗口控制
  womenHealthWindow.on('close', (event) => {
    if (process.platform === 'darwin') {
      event.preventDefault();
      womenHealthWindow.hide();
    }
  });

  return womenHealthWindow;
}

// 应用程序事件处理
app.whenReady().then(() => {
  createWomenHealthWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWomenHealthWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// 安全设置
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, navigationURL) => {
    navigationEvent.preventDefault();
  });
});