#!/bin/bash

# 女性健康管理独立应用启动脚本

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_PATH="$SCRIPT_DIR/../electron/dist/mac-arm64/女性健康管理.app"

# 检查应用是否存在
if [ -d "$APP_PATH" ]; then
    echo "启动女性健康管理独立应用..."
    open "$APP_PATH"
else
    echo "错误: 找不到女性健康管理独立应用"
    echo "请先构建应用: npm run build"
    exit 1
fi