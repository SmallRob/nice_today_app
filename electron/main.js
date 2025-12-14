const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const path = require('path')
const fs = require('fs')
const isDev = process.env.NODE_ENV === 'development'

// 使用新的JavaScript后端服务模块
const { JavaScriptBackendService } = require('./services/javascriptBackendService')

let mainWindow
let backendService

function createWindow() {
  // 立即初始化后端服务，确保在窗口创建时服务已就绪
  if (!backendService) {
    backendService = new JavaScriptBackendService()
    console.log('后端服务已初始化（在窗口创建时）')
    // #region agent log
    const logPath = path.join(__dirname, '../../.cursor/debug.log');
    try{fs.appendFileSync(logPath,JSON.stringify({location:'electron/main.js:13',message:'Backend service initialized at window creation',data:{hasService:!!backendService},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})+'\n');}catch(e){}
    // #endregion
  }

  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: !isDev
    },
    icon: process.platform === 'win32' 
      ? path.join(__dirname, 'build/icons/icon-256x256.ico')
      : path.join(__dirname, 'build/icons/icon-256x256.png'),
    titleBarStyle: 'default',
    autoHideMenuBar: true, // 隐藏菜单栏
    show: false
  })

  // 加载React应用
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    // 在生产环境中，加载打包后的前端文件
    const appPath = process.resourcesPath ? path.join(process.resourcesPath, 'app') : path.join(__dirname, '../frontend/build');
    const htmlPath = path.join(appPath, 'index.html')
    // #region agent log
    const logPath = path.join(__dirname, '../../.cursor/debug.log');
    try{fs.appendFileSync(logPath,JSON.stringify({location:'electron/main.js:37',message:'Loading HTML file',data:{appPath,htmlPath,exists:fs.existsSync(htmlPath)},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})+'\n');}catch(e){}
    // #endregion
    mainWindow.loadFile(htmlPath)
  }

  // 窗口准备就绪后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // 窗口关闭时的处理
  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // 设置菜单
  createMenu()
}

function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        {
          label: '重新加载',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow.reload()
          }
        },
        {
          label: '开发者工具',
          accelerator: 'F12',
          click: () => {
            mainWindow.webContents.toggleDevTools()
          }
        },
        { type: 'separator' },
        {
          label: '退出',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit()
          }
        }
      ]
    },
    {
      label: '编辑',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: '帮助',
      submenu: [
        {
          label: '关于',
          click: () => {
            require('electron').dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于',
              message: 'Nice Today - 生物节律与玛雅历法应用',
              detail: '版本 1.0.0\n本地化桌面版本'
            })
          }
        }
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

// 应用准备就绪
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// 所有窗口关闭时退出应用（macOS除外）
app.on('window-all-closed', () => {
  if (backendService) {
    backendService.shutdown()
  }
  
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC通信处理 - 生物节律相关
ipcMain.handle('biorhythm:get-today', async (event, birthDate) => {
  try {
    return await backendService.getTodayBiorhythm(birthDate)
  } catch (error) {
    console.error('生物节律今日数据获取失败:', error)
    throw error
  }
})

ipcMain.handle('biorhythm:get-date', async (event, birthDate, targetDate) => {
  try {
    return await backendService.getDateBiorhythm(birthDate, targetDate)
  } catch (error) {
    console.error('生物节律指定日期数据获取失败:', error)
    throw error
  }
})

ipcMain.handle('biorhythm:get-range', async (event, birthDate, daysBefore, daysAfter) => {
  try {
    return await backendService.getBiorhythmRange(birthDate, daysBefore, daysAfter)
  } catch (error) {
    console.error('生物节律范围数据获取失败:', error)
    throw error
  }
})

// 生物节律历史记录相关
ipcMain.handle('biorhythm:get-history', async () => {
  try {
    return await backendService.getBiorhythmHistory()
  } catch (error) {
    console.error('生物节律历史记录获取失败:', error)
    throw error
  }
})

ipcMain.handle('biorhythm:clear-history', async () => {
  try {
    return await backendService.clearBiorhythmHistory()
  } catch (error) {
    console.error('清除生物节律历史记录失败:', error)
    throw error
  }
})

ipcMain.handle('biorhythm:remove-history', async (event, birthDate) => {
  try {
    return await backendService.removeBiorhythmHistory(birthDate)
  } catch (error) {
    console.error('删除生物节律历史记录失败:', error)
    throw error
  }
})

// IPC通信处理 - 玛雅历法相关
ipcMain.handle('maya:get-today', async () => {
  try {
    return await backendService.getTodayMayaInfo()
  } catch (error) {
    console.error('今日玛雅历法信息获取失败:', error)
    throw error
  }
})

ipcMain.handle('maya:get-date', async (event, targetDate) => {
  try {
    return await backendService.getDateMayaInfo(targetDate)
  } catch (error) {
    console.error('指定日期玛雅历法信息获取失败:', error)
    throw error
  }
})

ipcMain.handle('maya:get-range', async (event, daysBefore, daysAfter) => {
  try {
    return await backendService.getMayaInfoRange(daysBefore, daysAfter)
  } catch (error) {
    console.error('玛雅历法范围信息获取失败:', error)
    throw error
  }
})

ipcMain.handle('maya:get-birth-info', async (event, birthDate) => {
  try {
    return await backendService.getMayaBirthInfo(birthDate)
  } catch (error) {
    console.error('玛雅出生图信息获取失败:', error)
    throw error
  }
})

// IPC通信处理 - 穿搭建议相关
ipcMain.handle('dress:get-today', async () => {
  try {
    return await backendService.getTodayDressInfo()
  } catch (error) {
    console.error('今日穿搭建议获取失败:', error)
    throw error
  }
})

ipcMain.handle('dress:get-date', async (event, targetDate) => {
  try {
    return await backendService.getDateDressInfo(targetDate)
  } catch (error) {
    console.error('指定日期穿搭建议获取失败:', error)
    throw error
  }
})

ipcMain.handle('dress:get-range', async (event, daysBefore, daysAfter) => {
  try {
    return await backendService.getDressInfoRange(daysBefore, daysAfter)
  } catch (error) {
    console.error('穿搭建议范围信息获取失败:', error)
    throw error
  }
})

// 系统状态检查
ipcMain.handle('system:health-check', async () => {
  try {
    return {
      status: 'healthy',
      service: 'nice-today-desktop',
      timestamp: new Date().toISOString(),
      services: {
        biorhythm: backendService.isBiorhythmServiceReady(),
        maya: backendService.isMayaServiceReady(),
        dress: backendService.isDressServiceReady()
      }
    }
  } catch (error) {
    console.error('系统健康检查失败:', error)
    throw error
  }
})