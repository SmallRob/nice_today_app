#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Electron集成专用脚本 - 本地化计算服务
"""

import os
import sys
import json
import logging
from datetime import datetime

# 添加项目路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 禁用FastAPI和HTTP服务器相关功能
os.environ['ELECTRON_MODE'] = 'true'

# 导入服务模块
from services.biorhythm_service import (
    get_history, get_today_biorhythm, get_date_biorhythm, get_biorhythm_range
)
from services.dress_service import (
    get_today_dress_info, get_date_dress_info, get_dress_info_range
)
from services.maya_service import (
    get_today_maya_info, get_date_maya_info, get_maya_info_range,
    get_maya_birth_info, get_maya_history
)
from utils.date_utils import normalize_date_string

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)-8s | %(name)-15s | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger('ElectronBackend')

class ElectronBackendService:
    """Electron集成后端服务"""
    
    def __init__(self):
        self.logger = logger
        self.service_status = {
            'biorhythm': True,
            'maya': True,
            'dress': True
        }
        
    def is_service_ready(self, service_name):
        """检查服务状态"""
        return self.service_status.get(service_name, False)
    
    def get_today_biorhythm(self, birth_date):
        """获取今日生物节律"""
        try:
            birth_date = normalize_date_string(birth_date)
            result = get_today_biorhythm(birth_date)
            return {'success': True, 'data': result}
        except Exception as e:
            logger.error(f"获取今日生物节律失败: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_date_biorhythm(self, birth_date, target_date):
        """获取指定日期生物节律"""
        try:
            birth_date = normalize_date_string(birth_date)
            target_date = normalize_date_string(target_date)
            result = get_date_biorhythm(birth_date, target_date)
            return {'success': True, 'data': result}
        except Exception as e:
            logger.error(f"获取指定日期生物节律失败: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_biorhythm_range(self, birth_date, days_before, days_after):
        """获取生物节律范围"""
        try:
            birth_date = normalize_date_string(birth_date)
            result = get_biorhythm_range(birth_date, days_before, days_after)
            return {'success': True, 'data': result}
        except Exception as e:
            logger.error(f"获取生物节律范围失败: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_today_maya_info(self):
        """获取今日玛雅历法信息"""
        try:
            result = get_today_maya_info()
            return {'success': True, 'data': result}
        except Exception as e:
            logger.error(f"获取今日玛雅历法信息失败: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_date_maya_info(self, target_date):
        """获取指定日期玛雅历法信息"""
        try:
            target_date = normalize_date_string(target_date)
            result = get_date_maya_info(target_date)
            return {'success': True, 'data': result}
        except Exception as e:
            logger.error(f"获取指定日期玛雅历法信息失败: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_maya_info_range(self, days_before, days_after):
        """获取玛雅历法范围信息"""
        try:
            result = get_maya_info_range(days_before, days_after)
            return {'success': True, 'data': result}
        except Exception as e:
            logger.error(f"获取玛雅历法范围信息失败: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_maya_birth_info(self, birth_date):
        """获取玛雅出生图信息"""
        try:
            result = get_maya_birth_info(birth_date)
            return {'success': True, 'data': result}
        except Exception as e:
            logger.error(f"获取玛雅出生图信息失败: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_today_dress_info(self):
        """获取今日穿搭建议"""
        try:
            result = get_today_dress_info()
            return {'success': True, 'data': result}
        except Exception as e:
            logger.error(f"获取今日穿搭建议失败: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_date_dress_info(self, target_date):
        """获取指定日期穿搭建议"""
        try:
            target_date = normalize_date_string(target_date)
            result = get_date_dress_info(target_date)
            return {'success': True, 'data': result}
        except Exception as e:
            logger.error(f"获取指定日期穿搭建议失败: {e}")
            return {'success': False, 'error': str(e)}
    
    def get_dress_info_range(self, days_before, days_after):
        """获取穿搭建议范围信息"""
        try:
            result = get_dress_info_range(days_before, days_after)
            return {'success': True, 'data': result}
        except Exception as e:
            logger.error(f"获取穿搭建议范围信息失败: {e}")
            return {'success': False, 'error': str(e)}

def main():
    """主函数 - 用于测试"""
    service = ElectronBackendService()
    
    # 测试服务
    result = service.get_today_biorhythm('1990-01-01')
    print("测试结果:", json.dumps(result, ensure_ascii=False, indent=2))


def handle_method_call(method_name, args_json):
    """处理方法调用"""
    try:
        # 解析参数
        args = json.loads(args_json) if args_json else {}
    except json.JSONDecodeError as e:
        print(json.dumps({"success": False, "error": f"参数解析失败: {str(e)}"}))
        return
    
    # 创建服务实例
    service = ElectronBackendService()
    
    # 根据方法名调用对应的方法
    try:
        if method_name == 'get_today_biorhythm':
            result = service.get_today_biorhythm(**args)
        elif method_name == 'get_date_biorhythm':
            result = service.get_date_biorhythm(**args)
        elif method_name == 'get_biorhythm_range':
            result = service.get_biorhythm_range(**args)
        elif method_name == 'get_today_maya_info':
            result = service.get_today_maya_info()
        elif method_name == 'get_date_maya_info':
            result = service.get_date_maya_info(**args)
        elif method_name == 'get_maya_info_range':
            result = service.get_maya_info_range(**args)
        elif method_name == 'get_maya_birth_info':
            result = service.get_maya_birth_info(**args)
        elif method_name == 'get_today_dress_info':
            result = service.get_today_dress_info()
        elif method_name == 'get_date_dress_info':
            result = service.get_date_dress_info(**args)
        elif method_name == 'get_dress_info_range':
            result = service.get_dress_info_range(**args)
        else:
            result = {"success": False, "error": f"未知方法: {method_name}"}
    except Exception as e:
        result = {"success": False, "error": f"方法执行失败: {str(e)}"}
    
    # 输出结果
    print(json.dumps(result, ensure_ascii=False))


if __name__ == '__main__':
    import sys
    
    # 如果提供了命令行参数，则处理方法调用
    if len(sys.argv) >= 2:
        method_name = sys.argv[1]
        args_json = sys.argv[2] if len(sys.argv) > 2 else "{}"
        handle_method_call(method_name, args_json)
    else:
        # 否则运行默认测试
        main()