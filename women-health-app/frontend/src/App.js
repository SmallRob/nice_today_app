import React from 'react';
import MenstrualAssistant from './components/MenstrualAssistant';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <div className="App purple:bg-purple-50 dark:bg-gray-900 pink:bg-pink-50">
        <MenstrualAssistant />
      </div>
    </ThemeProvider>
  );
}

export default App;