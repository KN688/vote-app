// 浏览器自动化测试脚本
const puppeteer = require('puppeteer');
const fs = require('fs');

async function testApp() {
  console.log('=== 投票小程序浏览器测试 ===\n');
  console.log('正在启动浏览器...\n');

  const browser = await puppeteer.launch({
    headless: false,  // 显示浏览器窗口
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const results = [];

  // 1. 测试首页加载
  console.log('测试 1: 首页加载...');
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'screenshots/01-homepage.png', fullPage: true });

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
    const navItems = await page.$$eval('nav a', links => links.map(l => l.textContent));
    console.log(`  ✅ 导航项目: ${navItems.join(', ')}`);
    results.push({ test: '导航栏', status: 'PASS', detail: navItems.join(', ') });
  } catch (error) {
    console.log(`  ⚠️  导航检查失败: ${error.message}`);
    results.push({ test: '导航栏', status: 'WARN', detail: error.message });
  }

  // 3. 测试创建投票页面
  console.log('\n测试 3: 创建投票页面...');
  try {
    await page.goto('http://localhost:5173/create', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'screenshots/02-create-vote.png', fullPage: true });

    const pageTitle = await page.$eval('h1, h2', el => el.textContent);
    console.log(`  ✅ 创建投票页面加载成功，标题: ${pageTitle}`);
    results.push({ test: '创建投票页面', status: 'PASS', detail: pageTitle });
  } catch (error) {
    console.log(`  ❌ 创建投票页面加载失败: ${error.message}`);
    results.push({ test: '创建投票页面', status: 'FAIL', detail: error.message });
  }

  // 4. 测试个人中心
  console.log('\n测试 4: 个人中心页面...');
  try {
    await page.goto('http://localhost:5173/profile', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'screenshots/03-profile.png', fullPage: true });

    const pageTitle = await page.$eval('h1, h2', el => el.textContent);
    console.log(`  ✅ 个人中心页面加载成功，标题: ${pageTitle}`);
    results.push({ test: '个人中心', status: 'PASS', detail: pageTitle });
  } catch (error) {
    console.log(`  ❌ 个人中心页面加载失败: ${error.message}`);
    results.push({ test: '个人中心', status: 'FAIL', detail: error.message });
  }

  // 5. 返回首页检查投票列表
  console.log('\n测试 5: 投票列表显示...');
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: 'screenshots/04-vote-list.png', fullPage: true });

    const voteCards = await page.$$('.vote-card, [class*="vote"], [class*="card"]');
    console.log(`  ✅ 检测到 ${voteCards.length} 个投票卡片`);
    results.push({ test: '投票列表', status: 'PASS', detail: `${voteCards.length} 个投票` });
  } catch (error) {
    console.log(`  ⚠️  投票列表检查: ${error.message}`);
    results.push({ test: '投票列表', status: 'WARN', detail: error.message });
  }

  // 6. 检查控制台错误
  console.log('\n测试 6: 检查控制台错误...');
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 2000));

  if (errors.length === 0) {
    console.log('  ✅ 无控制台错误');
    results.push({ test: '控制台错误', status: 'PASS', detail: '无错误' });
  } else {
    console.log(`  ❌ 发现 ${errors.length} 个控制台错误:`);
    errors.forEach(err => console.log(`    - ${err}`));
    results.push({ test: '控制台错误', status: 'FAIL', detail: `${errors.length} 个错误` });
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

  // 保存报告
  const report = {
    timestamp: new Date().toISOString(),
    summary: { total: results.length, passed, failed, warned },
    results
  };

  if (!fs.existsSync('screenshots')) {
    fs.mkdirSync('screenshots');
  }
  fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));

  console.log('\n截图已保存到 screenshots/ 目录');
  console.log('测试报告已保存到 test-report.json');

  await browser.close();
  console.log('\n=== 测试完成 ===');
}

testApp().catch(console.error);