const fs = require('fs');
const path = require('path');

console.log('开始修复前端组件中的函数定义问题...');

// 修复BiorhythmTab.js
function fixBiorhythmTab() {
    const componentPath = path.join(__dirname, 'frontend', 'src', 'components', 'BiorhythmTab.js');
    let content = fs.readFileSync(componentPath, 'utf8');
    
    // 添加loadHistoryAndData函数定义
    const loadHistoryAndDataFunction = `
  // 加载历史记录和数据
  const loadHistoryAndData = async () => {
    if (!apiBaseUrl || !apiConnected) return;
    
    try {
      // 获取历史记录
      const historyResult = await fetchHistoryDates(apiBaseUrl);
      if (historyResult.success) {
        setHistoryDates(historyResult.history);
      }
      
      // 加载默认数据
      if (birthDate) {
        await loadBiorhythmData(birthDate);
      } else {
        // 使用默认日期
        const defaultDate = new Date(DEFAULT_BIRTH_DATE);
        setBirthDate(defaultDate);
        setIsDefaultDate(true);
        await loadBiorhythmData(defaultDate);
      }
    } catch (error) {
      console.error('加载历史记录和数据失败:', error);
    }
  };`;
    
    // 在适当位置插入函数定义
    const insertPosition = content.indexOf('// 处理日期选择变化');
    if (insertPosition !== -1) {
        content = content.slice(0, insertPosition) + loadHistoryAndDataFunction + '\n\n  ' + content.slice(insertPosition);
    }
    
    // 修复useEffect依赖项
    content = content.replace(
        /useEffect\(\(\) => \{[\s\S]*?\}, \[apiBaseUrl, apiConnected, loadHistoryAndData, DEFAULT_BIRTH_DATE\]\);/,
        `useEffect(() => {
    // 等待服务就绪后再加载数据
    const waitForService = async () => {
      // 等待最多2秒让服务就绪
      let attempts = 0;
      const maxAttempts = 20; // 2秒 (20 * 100ms)
      
      while (attempts < maxAttempts) {
        if (loadBiorhythmDataRef.current && apiBaseUrl && apiConnected) {
          // 使用 setTimeout 确保在下一个事件循环中执行，避免初始化时的循环调用
          const timer = setTimeout(() => {
            loadHistoryAndData();
          }, 0);
          return () => clearTimeout(timer);
        } else if (!apiConnected) {
          // 如果API未连接，使用默认日期但不发送请求
          setIsDefaultDate(true);
          setBirthDate(new Date(DEFAULT_BIRTH_DATE));
          return;
        }
        
        // 等待100ms后重试
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      // 如果超过最大尝试次数仍未就绪，仍然尝试加载
      console.warn('服务未及时就绪，但仍尝试加载数据');
      if (loadBiorhythmDataRef.current) {
        const timer = setTimeout(() => {
          loadHistoryAndData();
        }, 0);
        return () => clearTimeout(timer);
      }
    };
    
    waitForService();
  }, [apiBaseUrl, apiConnected, DEFAULT_BIRTH_DATE]);`
    );
    
    fs.writeFileSync(componentPath, content, 'utf8');
    console.log('✓ 已修复 BiorhythmTab.js');
}

// 修复MayaCalendar.js
function fixMayaCalendar() {
    const componentPath = path.join(__dirname, 'frontend', 'src', 'components', 'MayaCalendar.js');
    let content = fs.readFileSync(componentPath, 'utf8');
    
    // 添加loadMayaCalendarRange函数定义
    const loadMayaCalendarRangeFunction = `
  // 加载玛雅日历范围数据
  const loadMayaCalendarRange = async () => {
    if (!apiBaseUrl) {
      setError("API基础URL未设置，无法获取玛雅日历信息");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const result = await fetchMayaCalendarRange(apiBaseUrl);
    
    if (result.success) {
      console.log(\`API返回的玛雅日历数据: \${result.mayaInfoList.length}天\`);
      console.log('日期列表:', result.mayaInfoList.map(info => info.date));
      setMayaInfoList(result.mayaInfoList);
      setDateRange(result.dateRange);
      
      // 默认选择今天的数据
      const today = new Date().toISOString().split('T')[0];
      const todayInfo = result.mayaInfoList.find(info => info.date === today);
      setSelectedMayaInfo(todayInfo || result.mayaInfoList[0]);
      setError(null);
      
      // 加载历史记录
      loadHistoryDates();
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };`;
    
    // 在适当位置插入函数定义
    const insertPosition = content.indexOf('// 加载历史记录');
    if (insertPosition !== -1) {
        content = content.slice(0, insertPosition) + loadMayaCalendarRangeFunction + '\n\n  ' + content.slice(insertPosition);
    }
    
    // 修复useEffect依赖项
    content = content.replace(
        /useEffect\(\(\) => \{[\s\S]*?\}, \[apiBaseUrl\]\);/,
        `useEffect(() => {
    // 等待服务就绪后再加载数据
    const waitForService = async () => {
      // 等待最多2秒让服务就绪
      let attempts = 0;
      const maxAttempts = 20; // 2秒 (20 * 100ms)
      
      while (attempts < maxAttempts) {
        if (apiBaseUrl) {
          loadMayaCalendarRange();
          return;
        }
        
        // 等待100ms后重试
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      // 如果超过最大尝试次数仍未就绪，仍然尝试加载
      console.warn('服务未及时就绪，但仍尝试加载玛雅日历数据');
      if (apiBaseUrl) {
        loadMayaCalendarRange();
      }
    };
    
    waitForService();
  }, [apiBaseUrl]);`
    );
    
    fs.writeFileSync(componentPath, content, 'utf8');
    console.log('✓ 已修复 MayaCalendar.js');
}

// 修复DressInfo.js
function fixDressInfo() {
    const componentPath = path.join(__dirname, 'frontend', 'src', 'components', 'DressInfo.js');
    let content = fs.readFileSync(componentPath, 'utf8');
    
    // 添加loadDressInfoRange函数定义
    const loadDressInfoRangeFunction = `
  // 加载穿搭建议范围数据
  const loadDressInfoRange = async () => {
    if (!apiBaseUrl) {
      setError("API基础URL未设置，无法获取穿搭建议信息");
      setLoading(false);
      return;
    }
    
    setLoading(true);
    const result = await fetchDressInfoRange(apiBaseUrl);
    
    if (result.success) {
      console.log(\`API返回的穿搭建议数据: \${result.dressInfoList.length}天\`);
      setDressInfoList(result.dressInfoList);
      setDateRange(result.dateRange);
      
      // 默认选择今天的数据
      const today = new Date().toISOString().split('T')[0];
      const todayInfo = result.dressInfoList.find(info => info.date === today);
      setSelectedDressInfo(todayInfo || result.dressInfoList[0]);
      setError(null);
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };`;
    
    // 在适当位置插入函数定义
    const insertPosition = content.indexOf('// 处理日期选择');
    if (insertPosition !== -1) {
        content = content.slice(0, insertPosition) + loadDressInfoRangeFunction + '\n\n  ' + content.slice(insertPosition);
    }
    
    // 修复useEffect依赖项
    content = content.replace(
        /useEffect\(\(\) => \{[\s\S]*?\}, \[apiBaseUrl\]\);/,
        `useEffect(() => {
    // 等待服务就绪后再加载数据
    const waitForService = async () => {
      // 等待最多2秒让服务就绪
      let attempts = 0;
      const maxAttempts = 20; // 2秒 (20 * 100ms)
      
      while (attempts < maxAttempts) {
        if (apiBaseUrl) {
          loadDressInfoRange();
          return;
        }
        
        // 等待100ms后重试
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      
      // 如果超过最大尝试次数仍未就绪，仍然尝试加载
      console.warn('服务未及时就绪，但仍尝试加载穿搭建议数据');
      if (apiBaseUrl) {
        loadDressInfoRange();
      }
    };
    
    waitForService();
  }, [apiBaseUrl]);`
    );
    
    fs.writeFileSync(componentPath, content, 'utf8');
    console.log('✓ 已修复 DressInfo.js');
}

// 主函数
function main() {
    console.log('开始修复前端组件中的函数定义问题...\n');
    
    try {
        fixBiorhythmTab();
        fixMayaCalendar();
        fixDressInfo();
        
        console.log('\n✅ 所有修复已完成！');
        console.log('\n修复说明：');
        console.log('1. 为BiorhythmTab.js添加了loadHistoryAndData函数定义');
        console.log('2. 为MayaCalendar.js添加了loadMayaCalendarRange函数定义');
        console.log('3. 为DressInfo.js添加了loadDressInfoRange函数定义');
        console.log('4. 修复了useEffect依赖项以避免ESLint错误');
        
        console.log('\n请重新构建应用以使更改生效：');
        console.log('npm run build (在项目根目录中)');
    } catch (error) {
        console.error('❌ 修复过程中出现错误:', error.message);
        process.exit(1);
    }
}

// 执行修复
main();