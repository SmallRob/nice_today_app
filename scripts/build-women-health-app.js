#!/usr/bin/env node

/**
 * 构建女性健康管理独立应用程序
 * 从women-health-app的独立app代码中构建
 * 构建输出目录为: electron/dist-women-health
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dev: false,
    arm64: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--dev' || arg === '-d') {
      options.dev = true;
    } else if (arg === '--arm64') {
      options.arm64 = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log(`
构建女性健康管理独立应用程序
从women-health-app的独立app代码中构建
构建输出目录为: electron/dist-women-health

用法:
  node build-women-health-app.js [选项]

选项:
  --arm64                   构建ARM64架构版本 (仅macOS)
  -d, --dev                 开发模式
  -h, --help                显示帮助信息

示例:
  node build-women-health-app.js --arm64
  node build-women-health-app.js --dev --arm64
  `);
      process.exit(0);
    }
  }

  return options;
}

// 构建应用程序
async function buildApp(options) {
  const womenHealthAppDir = path.join(__dirname, '../women-health-app');
  
  console.log(`开始构建女性健康管理独立应用...`);
  console.log(`构建源目录: ${womenHealthAppDir}`);
  console.log(`输出目录: ${womenHealthAppDir}/electron/dist-women-health`);
  console.log(`模式: ${options.dev ? '开发' : '生产'}`);
  console.log(`架构: ${options.arm64 ? 'ARM64' : '默认'}`);
  console.log('----------------------------------------');

  try {
    // 检查构建源目录是否存在
    if (!fs.existsSync(womenHealthAppDir)) {
      throw new Error(`构建源目录不存在: ${womenHealthAppDir}`);
    }

    // 检查构建脚本是否存在
    const buildScriptPath = path.join(womenHealthAppDir, 'scripts/build-women-health.js');
    if (!fs.existsSync(buildScriptPath)) {
      throw new Error(`构建脚本不存在: ${buildScriptPath}`);
    }

    // 构建命令参数
    const buildArgs = [];
    if (options.dev) {
      buildArgs.push('--dev');
    }

    // 执行构建
    console.log(`执行构建命令: node scripts/build-women-health.js ${buildArgs.join(' ')}`);
    console.log(`构建工作目录: ${womenHealthAppDir}`);
    
    await new Promise((resolve, reject) => {
      const child = spawn('node', ['scripts/build-women-health.js', ...buildArgs], {
        cwd: womenHealthAppDir,
        shell: true,
        stdio: 'inherit'
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

    console.log('----------------------------------------');
    console.log('女性健康管理独立应用构建完成！');
    
    // 显示输出文件
    const outputDir = path.join(womenHealthAppDir, 'electron/dist-women-health');
    if (fs.existsSync(outputDir)) {
      console.log('\n构建输出文件:');
      const listFiles = (dir, prefix = '') => {
        const items = fs.readdirSync(dir);
        items.forEach(item => {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          
          if (stat.isDirectory()) {
            console.log(`${prefix}${item}/`);
            if (item.includes('女性健康管理') || item.includes('women-health') || item.includes('woman-health')) {
              listFiles(fullPath, prefix + '  ');
            }
          } else {
            console.log(`${prefix}${item}`);
          }
        });
      };
      
      listFiles(outputDir);
      
      // 显示完整的输出路径
      console.log(`\n构建输出目录: ${outputDir}`);
    } else {
      console.warn('警告: 未找到预期的输出目录');
      console.warn('预期输出目录:', outputDir);
    }

  } catch (error) {
    console.error('构建过程中发生错误:', error);
    process.exit(1);
  }
}

// 主函数
async function main() {
  const options = parseArgs();
  
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