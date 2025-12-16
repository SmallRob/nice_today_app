#!/usr/bin/env node

/**
 * 构建女性健康管理独立应用程序
 * 支持多平台构建
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// 当前平台
const currentPlatform = process.platform;

// 支持的架构
const supportedArchs = {
  darwin: ['arm64', 'x64'],
  win32: ['x64'],
  linux: ['x64']
};

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    platform: null,
    arch: null,
    clean: false,
    dev: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--platform' || arg === '-p') {
      options.platform = args[++i];
    } else if (arg === '--arch' || arg === '-a') {
      options.arch = args[++i];
    } else if (arg === '--clean' || arg === '-c') {
      options.clean = true;
    } else if (arg === '--dev' || arg === '-d') {
      options.dev = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
构建女性健康管理独立应用程序

用法:
  node build-women-health-app.js [选项]

选项:
  -p, --platform <platform>  指定平台 (darwin, win32, linux)
  -a, --arch <architecture>   指定架构 (arm64, x64)
  -c, --clean               构建前清理输出目录
  -d, --dev                 开发模式
  -h, --help                显示帮助信息

示例:
  node build-women-health-app.js --platform darwin --arch arm64
  node build-women-health-app.js -p win32 -a x64
  node build-women-health-app.js --clean --dev
  `);
      process.exit(0);
    }
  }

  // 如果没有指定平台，使用当前平台
  if (!options.platform) {
    options.platform = currentPlatform;
  }

  // 如果没有指定架构，使用平台默认架构
  if (!options.arch) {
    if (options.platform === 'darwin') {
      options.arch = 'arm64'; // 默认使用ARM64架构
    } else {
      options.arch = 'x64';
    }
  }

  return options;
}

// 清理输出目录
function cleanOutputDir() {
  const electronDir = path.join(__dirname, '../electron');
  const outputDir = path.join(electronDir, 'dist-women-health');
  
  if (fs.existsSync(outputDir)) {
    console.log(`清理输出目录: ${outputDir}`);
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
}

// 构建应用程序
async function buildApp(options) {
  const electronDir = path.join(__dirname, '../electron');
  
  console.log(`开始构建女性健康管理独立应用...`);
  console.log(`平台: ${options.platform}`);
  console.log(`架构: ${options.arch}`);
  console.log(`模式: ${options.dev ? '开发' : '生产'}`);
  console.log('----------------------------------------');

  try {
    // 更新package.json用于构建
    const packagePath = path.join(electronDir, 'package-women-health.json');
    const targetPackagePath = path.join(electronDir, 'package.json');
    
    if (fs.existsSync(packagePath)) {
      // 备份原始package.json
      if (fs.existsSync(targetPackagePath)) {
        fs.copyFileSync(targetPackagePath, path.join(electronDir, 'package-backup.json'));
      }
      
      // 复制女性健康应用的package.json
      fs.copyFileSync(packagePath, targetPackagePath);
      console.log('已更新package.json配置');
    }

    // 设置环境变量
    const env = {
      ...process.env,
      NODE_ENV: options.dev ? 'development' : 'production',
      ELECTRON_PLATFORM: options.platform,
      ELECTRON_ARCH: options.arch
    };

    // 构建命令
    let buildCommand;
    if (options.platform === 'darwin') {
      if (options.arch === 'arm64') {
        buildCommand = 'npm run dist:mac:arm64';
      } else if (options.arch === 'x64') {
        buildCommand = 'npm run dist:mac:x64';
      } else {
        buildCommand = 'npm run dist:mac';
      }
    } else if (options.platform === 'win32') {
      buildCommand = 'npm run dist:win';
    } else if (options.platform === 'linux') {
      buildCommand = 'npm run dist:linux';
    }

    // 执行构建
    console.log(`执行构建命令: ${buildCommand}`);
    
    await new Promise((resolve, reject) => {
      const child = spawn(buildCommand, {
        cwd: electronDir,
        shell: true,
        stdio: 'inherit',
        env: env
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log('构建成功完成');
          resolve();
        } else {
          console.error(`构建失败，退出码: ${code}`);
          reject(new Error(`构建失败，退出码: ${code}`));
        }
      });

      child.on('error', (error) => {
        console.error('构建过程中发生错误:', error);
        reject(error);
      });
    });

    // 恢复原始package.json
    const backupPackagePath = path.join(electronDir, 'package-backup.json');
    if (fs.existsSync(backupPackagePath)) {
      fs.copyFileSync(backupPackagePath, targetPackagePath);
      fs.unlinkSync(backupPackagePath);
      console.log('已恢复原始package.json配置');
    }

    console.log('----------------------------------------');
    console.log('女性健康管理独立应用构建完成！');
    
    // 显示输出文件
    const outputDir = path.join(electronDir, 'dist-women-health');
    if (fs.existsSync(outputDir)) {
      console.log('\n构建输出文件:');
      const listFiles = (dir, prefix = '') => {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            console.log(`${prefix}${item}/`);
            if (item.includes('女性健康管理') || item.includes('women-health')) {
              listFiles(fullPath, prefix + '  ');
            }
          } else {
            console.log(`${prefix}${item}`);
          }
        });
      };
      
      listFiles(outputDir);
    }

  } catch (error) {
    console.error('构建过程中发生错误:', error);
    process.exit(1);
  }
}

// 主函数
async function main() {
  const options = parseArgs();
  
  // 验证平台和架构
  if (!supportedArchs[options.platform]) {
    console.error(`不支持的平台: ${options.platform}`);
    console.error(`支持的平台: ${Object.keys(supportedArchs).join(', ')}`);
    process.exit(1);
  }
  
  if (!supportedArchs[options.platform].includes(options.arch)) {
    console.error(`平台 ${options.platform} 不支持的架构: ${options.arch}`);
    console.error(`支持的平台 ${options.platform} 架构: ${supportedArchs[options.platform].join(', ')}`);
    process.exit(1);
  }
  
  // 清理输出目录（如果需要）
  if (options.clean) {
    cleanOutputDir();
  }
  
  // 构建应用程序
  await buildApp(options);
}

// 运行主函数
if (require.main === module) {
  main().catch(error => {
    console.error('发生未处理的错误:', error);
    process.exit(1);
  });
}

module.exports = {
  buildApp,
  parseArgs,
  cleanOutputDir
};