const puppeteer = require('puppeteer-core');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function debugTest() {
  console.log('=== 调试测试 ===\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: false
  });

  const page = await browser.newPage();

  // 捕获所有错误
  const errors = [];
  const warnings = [];
  const logs = [];

  page.on('console', msg => {
    const text = msg.text();
    logs.push({ type: msg.type(), text });
    if (msg.type() === 'error') errors.push(text);
    if (msg.type() === 'warning') warnings.push(text);
    console.log(`[${msg.type()}] ${text}`);
  });

  page.on('pageerror', error => {
    errors.push(error.message);
    console.log(`[页面错误] ${error.message}`);
    console.log(`[错误堆栈] ${error.stack}`);
  });

  page.on('requestfailed', request => {
    console.log(`[请求失败] ${request.url()} - ${request.failure()?.errorText}`);
  });

  console.log('导航到 http://localhost:3000');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });

  console.log('\n等待10秒...');
  await new Promise(resolve => setTimeout(resolve, 10000));

  console.log('\n=== 检查页面状态 ===');

  // 检查React是否加载
  const reactLoaded = await page.evaluate(() => {
    return typeof React !== 'undefined' && typeof ReactDOM !== 'undefined';
  });

  console.log('React/ReactDOM已加载:', reactLoaded);

  // 检查根元素
  const rootCheck = await page.evaluate(() => {
    const root = document.getElementById('root');
    return {
      exists: !!root,
      innerHTML: root ? root.innerHTML.substring(0, 500) : null,
      childCount: root ? root.children.length : 0,
      childElements: root ? Array.from(root.children).map(c => ({
        tagName: c.tagName,
        className: c.className,
        textContent: c.textContent?.substring(0, 50)
      })) : []
    };
  });

  console.log('根元素检查:', JSON.stringify(rootCheck, null, 2));

  // 尝试手动触发渲染
  const manualRender = await page.evaluate(() => {
    try {
      const root = document.getElementById('root');
      if (!root) return 'Root元素不存在';

      const hasReact = typeof ReactDOM !== 'undefined';
      if (!hasReact) return 'ReactDOM未加载';

      const hasApp = typeof App !== 'undefined';
      if (!hasApp) return 'App组件未加载';

      return '所有依赖都已加载，但React未渲染';
    } catch (e) {
      return `错误: ${e.message}`;
    }
  });

  console.log('\n手动渲染检查:', manualRender);

  // 获取所有script标签
  const scripts = await page.evaluate(() => {
    return Array.from(document.scripts).map(s => ({
      src: s.src,
      type: s.type,
      loaded: s.readyState === 'complete' || s.readyState === 'loaded'
    }));
  });

  console.log('\n脚本加载状态:');
  scripts.forEach(s => {
    console.log(`  ${s.type}: ${s.src || '(inline)'} - ${s.loaded ? '已加载' : '加载中'}`);
  });

  console.log('\n=== 错误汇总 ===');
  console.log(`错误数: ${errors.length}`);
  errors.forEach((e, i) => console.log(`  ${i + 1}. ${e}`));

  console.log(`\n警告数: ${warnings.length}`);
  warnings.forEach((w, i) => console.log(`  ${i + 1}. ${w}`));

  await page.screenshot({ path: 'screenshots/debug-test.png', fullPage: true });

  console.log('\n截图已保存: screenshots/debug-test.png');

  await browser.close();
}

debugTest().catch(console.error);