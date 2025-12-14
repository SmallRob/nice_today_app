const { contextBridge, ipcRenderer } = require('electron')

// 暴露安全的API给渲染进程
// 添加服务就绪状态检查
let isApiReady = false;
setTimeout(() => {
    isApiReady = true;
}, 100);
// 添加服务就绪状态检查
let isApiReady = false;
setTimeout(() => {
    isApiReady = true;
}, 100);
contextBridge.exposeInMainWorld('electronAPI', {
  // 服务状态检查
  isReady: () => isApiReady,
  // 服务状态检查
  isReady: () => isApiReady,
  // 生物节律相关API
  biorhythm: {
    getToday: (birthDate) => ipcRenderer.invoke('biorhythm:get-today', birthDate),
    getDate: (birthDate, targetDate) => ipcRenderer.invoke('biorhythm:get-date', birthDate, targetDate),
    getRange: (birthDate, daysBefore, daysAfter) => ipcRenderer.invoke('biorhythm:get-range', birthDate, daysBefore, daysAfter)
  },

  // 玛雅历法相关API
  maya: {
    getToday: () => ipcRenderer.invoke('maya:get-today'),
    getDate: (targetDate) => ipcRenderer.invoke('maya:get-date', targetDate),
    getRange: (daysBefore, daysAfter) => ipcRenderer.invoke('maya:get-range', daysBefore, daysAfter),
    getBirthInfo: (birthDate) => ipcRenderer.invoke('maya:get-birth-info', birthDate)
  },

  // 穿搭建议相关API
  dress: {
    getToday: () => ipcRenderer.invoke('dress:get-today'),
    getDate: (targetDate) => ipcRenderer.invoke('dress:get-date', targetDate),
    getRange: (daysBefore, daysAfter) => ipcRenderer.invoke('dress:get-range', daysBefore, daysAfter)
  },

  // 系统相关API
  system: {
    healthCheck: () => ipcRenderer.invoke('system:health-check')
  },

  // 应用信息
  appInfo: {
    version: '1.0.0',
    name: 'Nice Today',
    isDesktop: true
  }
})

// 开发环境下的调试支持
if (process.env.NODE_ENV === 'development') {
  contextBridge.exposeInMainWorld('__dev__', {
    reload: () => ipcRenderer.invoke('dev:reload'),
    openDevTools: () => ipcRenderer.invoke('dev:open-tools')
  })
}