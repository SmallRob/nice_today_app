const { contextBridge, ipcRenderer } = require('electron')

// 暴露安全的API给渲染进程
// 添加服务就绪状态检查 - 立即设置为true，因为服务在窗口创建时已初始化
let isApiReady = true;
// #region agent log
fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'electron/preload.js:6',message:'API ready flag set immediately',data:{isApiReady},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'D'})}).catch(()=>{});
// #endregion
contextBridge.exposeInMainWorld('electronAPI', {
  // 服务状态检查
  isReady: () => {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'electron/preload.js:13',message:'isReady called',data:{isApiReady},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'D'})}).catch(()=>{});
    // #endregion
    return isApiReady;
  },
  // 生物节律相关API
  biorhythm: {
    getToday: (birthDate) => ipcRenderer.invoke('biorhythm:get-today', birthDate),
    getDate: (birthDate, targetDate) => ipcRenderer.invoke('biorhythm:get-date', birthDate, targetDate),
    getRange: (birthDate, daysBefore, daysAfter) => ipcRenderer.invoke('biorhythm:get-range', birthDate, daysBefore, daysAfter),
    getHistory: () => ipcRenderer.invoke('biorhythm:get-history'),
    clearHistory: () => ipcRenderer.invoke('biorhythm:clear-history'),
    removeHistory: (birthDate) => ipcRenderer.invoke('biorhythm:remove-history', birthDate),
    getDefaultBirthdate: () => ipcRenderer.invoke('biorhythm:get-default-birthdate')
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

  // 四季五行养生相关API
  seasonHealth: {
    getAdvice: (date) => ipcRenderer.invoke('seasonHealth:get-advice', date)
  },

  // 生肖能量相关API
  zodiacEnergy: {
    getToday: (userZodiac) => ipcRenderer.invoke('zodiacEnergy:get-today', userZodiac),
    getDate: (userZodiac, targetDate) => ipcRenderer.invoke('zodiacEnergy:get-date', userZodiac, targetDate),
    getZodiacFromYear: (year) => ipcRenderer.invoke('zodiacEnergy:get-zodiac-from-year', year),
    getAllZodiacs: () => ipcRenderer.invoke('zodiacEnergy:get-all-zodiacs')
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