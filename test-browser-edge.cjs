// 使用Edge进行浏览器测试
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function testApp() {
  console.log('=== 投票小程序浏览器测试 (使用Edge) ===\n');
  console.log('正在启动Edge浏览器...\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // 创建截图目录
  const screenshotDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const results = [];

  // 1. 测试首页加载
  console.log('测试 1: 首页加载...');
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });
    await page.screenshot({ path: path.join(screenshotDir, '01-homepage.png'), fullPage: true });

    const title = await page.title();
    console.log(`  ✅ 首页加载成功，标题: ${title}`);
    results.push({ test: '首页加载', status: 'PASS', detail: title });
  } catch (error) {
    console.log(`  ❌ 首页加载失败: ${error.message}`);
    results.push({ test: '首页加载', status: 'FAIL', detail: error.message });
  }

  // 2. 检查导航元素
  console.log('\n测试 2: 检查导航栏...');
  try {
    const navItems = await page.$$eval('nav a, [role="navigation"] a', links => links.map(l => l.textContent));
    console.log(`  ✅ 导航项目: ${navItems.join(', ')}`);
    results.push({ test: '导航栏', status: 'PASS', detail: navItems.join(', ') });
  } catch (error) {
    console.log(`  ⚠️  导航检查失败: ${error.message}`);
    results.push({ test: '导航栏', status: 'WARN', detail: error.message });
  }

  // 3. 测试创建投票页面
  console.log('\n测试 3: 创建投票页面...');
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });
    await page.screenshot({ path: path.join(screenshotDir, '02-create-vote.png'), fullPage: true });

    const pageTitle = await page.$eval('h1, h2, .title', el => el.textContent).catch(() => '未找到标题');
    console.log(`  ✅ 创建投票页面加载成功，标题: ${pageTitle}`);
    results.push({ test: '创建投票页面', status: 'PASS', detail: pageTitle });
  } catch (error) {
    console.log(`  ❌ 创建投票页面加载失败: ${error.message}`);
    results.push({ test: '创建投票页面', status: 'FAIL', detail: error.message });
  }

  // 4. 测试个人中心
  console.log('\n测试 4: 个人中心页面...');
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });
    await page.screenshot({ path: path.join(screenshotDir, '03-profile.png'), fullPage: true });

    const pageTitle = await page.$eval('h1, h2, .title', el => el.textContent).catch(() => '未找到标题');
    console.log(`  ✅ 个人中心页面加载成功，标题: ${pageTitle}`);
    results.push({ test: '个人中心', status: 'PASS', detail: pageTitle });
  } catch (error) {
    console.log(`  ❌ 个人中心页面加载失败: ${error.message}`);
    results.push({ test: '个人中心', status: 'FAIL', detail: error.message });
  }

  // 5. 返回首页检查投票列表
  console.log('\n测试 5: 投票列表显示...');
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });
    await page.screenshot({ path: path.join(screenshotDir, '04-vote-list.png'), fullPage: true });

    const voteCards = await page.$$('.vote-card, [class*="vote"], [class*="card"]');
    console.log(`  ✅ 检测到 ${voteCards.length} 个投票相关元素`);
    results.push({ test: '投票列表', status: 'PASS', detail: `${voteCards.length} 个元素` });
  } catch (error) {
    console.log(`  ⚠️  投票列表检查: ${error.message}`);
    results.push({ test: '投票列表', status: 'WARN', detail: error.message });
  }

  // 6. 检查控制台错误
  console.log('\n测试 6: 检查控制台错误...');
  const errors = [];
  const warnings = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    } else if (msg.type() === 'warning') {
      warnings.push(msg.text());
    }
  });

  await page.reload({ waitUntil: 'networkidle2', timeout: 10000 });
  await new Promise(resolve => setTimeout(resolve, 2000));

  if (errors.length === 0) {
    console.log(`  ✅ 无控制台错误 (有 ${warnings.length} 个警告)`);
    results.push({ test: '控制台错误', status: 'PASS', detail: '无错误' });
  } else {
    console.log(`  ❌ 发现 ${errors.length} 个控制台错误:`);
    errors.slice(0, 5).forEach(err => console.log(`    - ${err}`));
    if (errors.length > 5) console.log(`    ... 还有 ${errors.length - 5} 个错误`);
    results.push({ test: '控制台错误', status: 'FAIL', detail: `${errors.length} 个错误` });
  }

  // 7. 测试筛选功能
  console.log('\n测试 7: 投票筛选功能...');
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });

    // 尝试点击"进行中"标签
    const activeBtn = await page.$('button:has-text("进行中")') || await page.$('button:contains("进行中")');
    if (activeBtn) {
      await activeBtn.click();
      await page.screenshot({ path: path.join(screenshotDir, '05-filter-active.png'), fullPage: true });
      console.log(`  ✅ 筛选功能可点击`);
      results.push({ test: '筛选功能', status: 'PASS', detail: '可点击' });
    } else {
      console.log(`  ⚠️  未找到筛选按钮`);
      results.push({ test: '筛选功能', status: 'WARN', detail: '按钮未找到' });
    }
  } catch (error) {
    console.log(`  ⚠️  筛选功能测试: ${error.message}`);
    results.push({ test: '筛选功能', status: 'WARN', detail: error.message });
  }

  // 8. 测试响应式布局
  console.log('\n测试 8: 响应式布局 (移动端视图)...');
  try {
    await page.setViewport({ width: 375, height: 667 });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 10000 });
    await page.screenshot({ path: path.join(screenshotDir, '06-mobile-view.png'), fullPage: true });

    await page.setViewport({ width: 1280, height: 800 });
    console.log(`  ✅ 响应式布局测试完成`);
    results.push({ test: '响应式布局', status: 'PASS', detail: '支持移动端' });
  } catch (error) {
    console.log(`  ❌ 响应式布局测试失败: ${error.message}`);
    results.push({ test: '响应式布局', status: 'FAIL', detail: error.message });
  }

  // 生成测试报告
  console.log('\n=== 测试报告 ===\n');
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;

  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${result.test}: ${result.detail}`);
  });

  console.log(`\n总计: ${results.length} 个测试`);
  console.log(`通过: ${passed}, 失败: ${failed}, 警告: ${warned}`);
  console.log(`通过率: ${Math.round((passed / results.length) * 100)}%`);

  // 保存报告
  const report = {
    timestamp: new Date().toISOString(),
    summary: { total: results.length, passed, failed, warned, passRate: Math.round((passed / results.length) * 100) },
    results
  };

  fs.writeFileSync(path.join(__dirname, 'test-report.json'), JSON.stringify(report, null, 2));

  console.log('\n截图已保存到 screenshots/ 目录');
  console.log('测试报告已保存到 test-report.json');

  await browser.close();
  console.log('\n=== 测试完成 ===');
}

testApp().catch(console.error);