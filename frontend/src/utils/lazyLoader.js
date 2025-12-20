import React, { Suspense } from 'react';

/**
 * 懒加载组件包装器
 * 提供加载状态和错误边界
 */

export const LazyLoader = ({ children, fallback = null }) => {
  return (
    <Suspense fallback={fallback || <DefaultLoadingSpinner />}>
      {children}
    </Suspense>
  );
};

/**
 * 默认加载状态组件
 */
const DefaultLoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    <span className="ml-2 text-gray-600">加载中...</span>
  </div>
);

/**
 * 错误边界组件
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('组件加载错误:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-medium">组件加载失败</h3>
          <p className="text-red-600 text-sm mt-1">
            {this.state.error?.message || '未知错误'}
          </p>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}