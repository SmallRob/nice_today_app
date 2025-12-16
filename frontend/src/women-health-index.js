import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import WomenHealthDashboard from './modules/women-health-new/components/WomenHealthDashboard';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <WomenHealthDashboard />
  </React.StrictMode>
);