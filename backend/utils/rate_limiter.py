#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
请求限流器 - 防止API滥用和DDoS攻击
基于令牌桶算法的简单限流实现
"""

import time
from typing import Dict, Tuple
from collections import defaultdict

class RateLimiter:
    """请求限流器类"""
    
    def __init__(self, max_requests: int = 100, window_size: int = 60):
        """
        初始化限流器
        
        Args:
            max_requests: 时间窗口内最大请求数
            window_size: 时间窗口大小（秒）
        """
        self.max_requests = max_requests
        self.window_size = window_size
        self.requests: Dict[str, list] = defaultdict(list)
    
    def is_allowed(self, client_id: str) -> Tuple[bool, int]:
        """
        检查是否允许请求
        
        Returns:
            Tuple[是否允许, 剩余请求次数]
        """
        current_time = time.time()
        
        # 清理过期请求记录
        window_start = current_time - self.window_size
        self.requests[client_id] = [
            req_time for req_time in self.requests[client_id]
            if req_time > window_start
        ]
        
        # 检查当前请求数
        request_count = len(self.requests[client_id])
        
        if request_count < self.max_requests:
            # 允许请求，记录时间戳
            self.requests[client_id].append(current_time)
            return True, self.max_requests - request_count - 1
        else:
            # 拒绝请求
            return False, 0
    
    def get_usage_info(self, client_id: str) -> Dict:
        """获取客户端使用情况"""
        current_time = time.time()
        window_start = current_time - self.window_size
        
        # 清理过期请求记录
        self.requests[client_id] = [
            req_time for req_time in self.requests[client_id]
            if req_time > window_start
        ]
        
        request_count = len(self.requests[client_id])
        
        return {
            'client_id': client_id,
            'current_requests': request_count,
            'max_requests': self.max_requests,
            'remaining': max(0, self.max_requests - request_count),
            'window_size': self.window_size,
            'reset_time': window_start + self.window_size
        }

# 全局限流器实例
rate_limiter = RateLimiter(max_requests=200, window_size=60)  # 每分钟最多200次请求

def rate_limit(max_requests: int = 100, window_size: int = 60):
    """
    请求限流装饰器
    
    Args:
        max_requests: 时间窗口内最大请求数
        window_size: 时间窗口大小（秒）
    """
    def decorator(func):
        # 为每个端点创建独立的限流器
        endpoint_limiter = RateLimiter(max_requests, window_size)
        
        def wrapper(*args, **kwargs):
            # 从请求中获取客户端标识（IP地址或用户ID）
            # 这里简化处理，实际应用中需要从请求上下文中获取
            client_id = "default_client"
            
            allowed, remaining = endpoint_limiter.is_allowed(client_id)
            
            if not allowed:
                from fastapi import HTTPException
                raise HTTPException(
                    status_code=429,
                    detail={
                        "error": "请求过于频繁",
                        "message": f"请等待{window_size}秒后再试",
                        "retry_after": window_size
                    }
                )
            
            # 添加限流信息到响应头
            response = func(*args, **kwargs)
            
            # 如果是FastAPI响应对象，可以添加头部信息
            if hasattr(response, 'headers'):
                response.headers["X-RateLimit-Limit"] = str(max_requests)
                response.headers["X-RateLimit-Remaining"] = str(remaining)
                response.headers["X-RateLimit-Reset"] = str(int(time.time() + window_size))
            
            return response
        
        return wrapper
    return decorator