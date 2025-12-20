#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
缓存管理器 - 提供API响应缓存功能
基于内存的简单缓存，支持TTL（生存时间）
"""

import time
import hashlib
import json
from typing import Any, Optional, Dict
from functools import wraps

class CacheManager:
    """缓存管理器类"""
    
    def __init__(self, default_ttl: int = 300):  # 默认5分钟
        self._cache: Dict[str, Dict] = {}
        self.default_ttl = default_ttl
        
    def _generate_key(self, func_name: str, *args, **kwargs) -> str:
        """生成缓存键"""
        key_data = {
            'func': func_name,
            'args': args,
            'kwargs': kwargs
        }
        key_str = json.dumps(key_data, sort_keys=True)
        return hashlib.md5(key_str.encode()).hexdigest()
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """设置缓存"""
        if ttl is None:
            ttl = self.default_ttl
            
        self._cache[key] = {
            'value': value,
            'expires_at': time.time() + ttl
        }
    
    def get(self, key: str) -> Optional[Any]:
        """获取缓存值"""
        if key not in self._cache:
            return None
            
        item = self._cache[key]
        if time.time() > item['expires_at']:
            del self._cache[key]
            return None
            
        return item['value']
    
    def delete(self, key: str) -> None:
        """删除缓存"""
        if key in self._cache:
            del self._cache[key]
    
    def clear_expired(self) -> None:
        """清理过期缓存"""
        current_time = time.time()
        expired_keys = [
            key for key, item in self._cache.items() 
            if current_time > item['expires_at']
        ]
        for key in expired_keys:
            del self._cache[key]
    
    def clear_all(self) -> None:
        """清理所有缓存"""
        self._cache.clear()
    
    def size(self) -> int:
        """返回缓存项数量"""
        self.clear_expired()
        return len(self._cache)

# 全局缓存实例
cache_manager = CacheManager()

def cached(ttl: Optional[int] = None, key_prefix: Optional[str] = None):
    """
    缓存装饰器
    
    Args:
        ttl: 缓存生存时间（秒）
        key_prefix: 缓存键前缀
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # 生成缓存键
            prefix = key_prefix or func.__name__
            cache_key = cache_manager._generate_key(prefix, *args, **kwargs)
            
            # 尝试从缓存获取
            cached_result = cache_manager.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # 执行函数并缓存结果
            result = func(*args, **kwargs)
            cache_manager.set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator

def cache_by_key(cache_key: str, ttl: Optional[int] = None):
    """
    根据指定键进行缓存的装饰器
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # 尝试从缓存获取
            cached_result = cache_manager.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # 执行函数并缓存结果
            result = func(*args, **kwargs)
            cache_manager.set(cache_key, result, ttl)
            
            return result
        return wrapper
    return decorator