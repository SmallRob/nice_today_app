import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WomenHealthApp from '../App';

const WomenHealthRoutes: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/women-health" element={<WomenHealthApp />} />
        <Route path="/women-health/" element={<WomenHealthApp />} />
        {/* 支持直接访问根路径 */}
        <Route path="/" element={<WomenHealthApp />} />
        {/* 404页面处理 */}
        <Route path="*" element={
          <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-pink-600 dark:text-pink-400 mb-2">
                页面未找到
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                抱歉，您访问的页面不存在
              </p>
              <button 
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200"
              >
                返回上一页
              </button>
            </div>
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default WomenHealthRoutes;