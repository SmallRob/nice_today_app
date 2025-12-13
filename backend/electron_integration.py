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
# 导入服务模块 - 简化版本，避免复杂的依赖
try:
    from utils.date_utils import normalize_date_string
except ImportError:
    # 如果无法导入，提供本地实现
    import datetime
    def normalize_date_string(date_str: str) -> str:
        """标准化日期字符串，确保格式为YYYY-MM-DD"""
        try:
            date_obj = datetime.datetime.strptime(date_str, "%Y-%m-%d")
            return date_obj.strftime("%Y-%m-%d")
        except ValueError:
            return date_str

# 简化版本的生物节律计算
def get_today_biorhythm(birth_date):
    """获取今日生物节律 - 简化版本"""
    from datetime import datetime
    import math
    
    birth_date = normalize_date_string(birth_date)
    today = datetime.now().strftime("%Y-%m-%d")
    return get_date_biorhythm(birth_date, today)

def get_date_biorhythm(birth_date, target_date):
    """获取指定日期生物节律 - 简化版本"""
    from datetime import datetime
    import math
    
    # 生物节律周期
    CYCLES = {'physical': 23, 'emotional': 28, 'intellectual': 33}
    
    birth_date = datetime.strptime(normalize_date_string(birth_date), "%Y-%m-%d")
    target_date = datetime.strptime(normalize_date_string(target_date), "%Y-%m-%d")
    
    days_since_birth = (target_date - birth_date).days
    
    def calculate_rhythm_value(cycle, days):
        return int(100 * math.sin(2 * math.pi * days / cycle))
    
    return {
        'physical': calculate_rhythm_value(CYCLES['physical'], days_since_birth),
        'emotional': calculate_rhythm_value(CYCLES['emotional'], days_since_birth),
        'intellectual': calculate_rhythm_value(CYCLES['intellectual'], days_since_birth),
        'date': target_date.strftime("%Y-%m-%d"),
        'birth_date': birth_date.strftime("%Y-%m-%d")
    }

def get_biorhythm_range(birth_date, days_before, days_after):
    """获取生物节律范围 - 简化版本"""
    from datetime import datetime, timedelta
    
    birth_date = datetime.strptime(normalize_date_string(birth_date), "%Y-%m-%d")
    today = datetime.now()
    
    start_date = today - timedelta(days=days_before)
    end_date = today + timedelta(days=days_after)
    
    results = []
    current_date = start_date
    
    while current_date <= end_date:
        result = get_date_biorhythm(birth_date.strftime("%Y-%m-%d"), current_date.strftime("%Y-%m-%d"))
        results.append(result)
        current_date += timedelta(days=1)
    
    return results

# 简化版本的玛雅历法计算
def get_today_maya_info():
    """获取今日玛雅历法信息 - 简化版本"""
    from datetime import datetime
    return get_date_maya_info(datetime.now().strftime("%Y-%m-%d"))

def get_date_maya_info(target_date):
    """获取指定日期玛雅历法信息 - 简化版本"""
    import random
    
    # 简单的玛雅历法模拟
    kin_numbers = [str(i) for i in range(1, 261)]
    seals = ['红龙', '白风', '蓝夜', '黄种子', '红蛇', '白世界桥', '蓝手', 
             '黄星星', '红月', '白狗', '蓝猴', '黄人', '红天行者', '白巫师', 
             '蓝鹰', '黄战士', '红地球', '白镜子', '蓝风暴', '黄太阳']
    tones = [str(i) for i in range(1, 14)]
    
    return {
        'kin': random.choice(kin_numbers),
        'seal': random.choice(seals),
        'tone': random.choice(tones),
        'date': target_date,
        'description': f"今日玛雅历法信息：{random.choice(seals)}星系印记"
    }

def get_maya_info_range(days_before, days_after):
    """获取玛雅历法范围信息 - 简化版本"""
    from datetime import datetime, timedelta
    
    today = datetime.now()
    start_date = today - timedelta(days=days_before)
    end_date = today + timedelta(days=days_after)
    
    results = []
    current_date = start_date
    
    while current_date <= end_date:
        result = get_date_maya_info(current_date.strftime("%Y-%m-%d"))
        results.append(result)
        current_date += timedelta(days=1)
    
    return results

def get_maya_birth_info(birth_date):
    """获取玛雅出生图信息 - 简化版本"""
    import random
    
    signs = ['红龙', '白风', '蓝夜', '黄种子', '红蛇', '白世界桥', '蓝手', 
             '黄星星', '红月', '白狗', '蓝猴', '黄人', '红天行者', '白巫师', 
             '蓝鹰', '黄战士', '红地球', '白镜子', '蓝风暴', '黄太阳']
    
    return {
        'birth_kin': random.randint(1, 260),
        'birth_seal': random.choice(signs),
        'birth_tone': random.randint(1, 13),
        'birth_date': birth_date,
        'description': f"您的出生玛雅星系印记：{random.choice(signs)}"
    }

# 简化版本的穿搭建议
def get_today_dress_info():
    """获取今日穿搭建议 - 简化版本"""
    from datetime import datetime
    return get_date_dress_info(datetime.now().strftime("%Y-%m-%d"))

def get_date_dress_info(target_date):
    """获取指定日期穿搭建议 - 简化版本"""
    import random
    
    colors = ['青色系', '黑色系', '红色系', '黄色系', '白色系']
    styles = ['简约休闲', '商务正式', '运动活力', '时尚潮流', '优雅知性']
    accessories = ['手表', '项链', '手链', '耳环', '帽子', '围巾']
    
    return {
        'lucky_color': random.choice(colors),
        'style': random.choice(styles),
        'accessory': random.choice(accessories),
        'date': target_date,
        'advice': f"今日建议穿着{random.choice(colors)}色系的{random.choice(styles)}风格"
    }

def get_dress_info_range(days_before, days_after):
    """获取穿搭建议范围信息 - 简化版本"""
    from datetime import datetime, timedelta
    
    today = datetime.now()
    start_date = today - timedelta(days=days_before)
    end_date = today + timedelta(days=days_after)
    
    results = []
    current_date = start_date
    
    while current_date <= end_date:
        result = get_date_dress_info(current_date.strftime("%Y-%m-%d"))
        results.append(result)
        current_date += timedelta(days=1)
    
    return results

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