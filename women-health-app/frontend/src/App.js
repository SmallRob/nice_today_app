import React from 'react';
import MenstrualAssistant from './components/MenstrualAssistant';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

function App() {
  return (
    <ThemeProvider>
      <div className="App">
        <MenstrualAssistant />
      </div>
    </ThemeProvider>
  );
}

export default App;