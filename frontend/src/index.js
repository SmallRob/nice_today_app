import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';

// #region agent log
fetch('http://127.0.0.1:7242/ingest/b3387138-a87a-4b03-a45b-f70781421b47',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'frontend/src/index.js:8',message:'React app starting',data:{hasElectronAPI:typeof window.electronAPI!=='undefined',electronAPIReady:window.electronAPI?.isReady?.()||false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
// #endregion

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);