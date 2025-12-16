const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

// 女性健康管理窗口
let womenHealthWindow = null;

// 创建女性健康管理窗口
function createWomenHealthWindow() {
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
    icon: path.join(__dirname, '../images/icon.png'),
    show: false,
    backgroundColor: '#fdf2f8', // 粉紫色背景
    title: '女性健康管理 - Nice Today'
  });

  // 加载女性健康管理页面
  if (isDev) {
    womenHealthWindow.loadURL('http://localhost:3000/women-health');
    womenHealthWindow.webContents.openDevTools();
  } else {
    womenHealthWindow.loadFile(path.join(__dirname, '../frontend/build/women-health/index.html'));
  }

  // 窗口准备就绪时显示
  womenHealthWindow.once('ready-to-show', () => {
    womenHealthWindow.show();
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

// IPC 处理
ipcMain.handle('get-app-info', () => {
  return {
    version: app.getVersion(),
    platform: process.platform,
    isDesktop: true
  };
});

ipcMain.handle('navigate-to-dashboard', () => {
  if (womenHealthWindow) {
    womenHealthWindow.hide();
    // 通知主窗口显示
    const mainWindow = BrowserWindow.getAllWindows().find(win => 
      win !== womenHealthWindow
    );
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  }
});

// 导出窗口管理函数
module.exports = {
  createWomenHealthWindow,
  getWomenHealthWindow: () => womenHealthWindow,
  isWomenHealthWindowOpen: () => womenHealthWindow !== null
};