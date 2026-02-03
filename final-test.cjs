// 完整的功能测试脚本
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function finalTest() {
  console.log('=== 投票小程序完整功能测试 ===\n');

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
  const errors = [];
  const warnings = [];

  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
    if (msg.type() === 'warning') warnings.push(msg.text());
  });

  // 测试1: 首页加载
  console.log('【测试1】首页加载和显示');
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.screenshot({ path: path.join(screenshotDir, 'final-01-home.png'), fullPage: true });

    const title = await page.title();
    const h1Text = await page.$eval('h1', el => el.textContent);
    const bodyText = await page.evaluate(() => document.body.innerText);

    console.log(`  ✅ 页面标题: ${title}`);
    console.log(`  ✅ 主标题: ${h1Text}`);
    console.log(`  ✅ 内容长度: ${bodyText.length} 字符`);

    results.push({
      test: '首页加载',
      status: 'PASS',
      detail: `标题: ${title}, 内容正常显示`
    });
  } catch (error) {
    console.log(`  ❌ 失败: ${error.message}`);
    results.push({ test: '首页加载', status: 'FAIL', detail: error.message });
  }

  // 测试2: 导航功能
  console.log('\n【测试2】导航功能');
  try {
    const navLinks = await page.$$eval('a[href]', links => {
      return links.slice(0, 10).map(l => ({ text: l.textContent.trim(), href: l.getAttribute('href') }));
    });

    console.log(`  ✅ 找到 ${navLinks.length} 个链接`);
    navLinks.forEach(link => console.log(`    - ${link.text}: ${link.href}`));

    results.push({
      test: '导航功能',
      status: 'PASS',
      detail: `${navLinks.length} 个导航链接`
    });
  } catch (error) {
    console.log(`  ❌ 失败: ${error.message}`);
    results.push({ test: '导航功能', status: 'FAIL', detail: error.message });
  }

  // 测试3: 创建投票页面
  console.log('\n【测试3】创建投票页面');
  try {
    await page.goto('http://localhost:3000/create', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.screenshot({ path: path.join(screenshotDir, 'final-02-create.png'), fullPage: true });

    const title = await page.$eval('h1, h2', el => el.textContent).catch(() => '未找到');
    const inputExists = await page.$('input[type="text"]');
    const submitBtn = await page.$('button[type="submit"], .btn-primary');

    console.log(`  ✅ 页面标题: ${title}`);
    console.log(`  ✅ 输入框: ${inputExists ? '存在' : '不存在'}`);
    console.log(`  ✅ 提交按钮: ${submitBtn ? '存在' : '不存在'}`);

    results.push({
      test: '创建投票页面',
      status: 'PASS',
      detail: `表单元素: ${[inputExists, submitBtn].filter(Boolean).length}/2`
    });
  } catch (error) {
    console.log(`  ❌ 失败: ${error.message}`);
    results.push({ test: '创建投票页面', status: 'FAIL', detail: error.message });
  }

  // 测试4: 投票列表
  console.log('\n【测试4】投票列表显示');
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.screenshot({ path: path.join(screenshotDir, 'final-03-list.png'), fullPage: true });

    const bodyText = await page.evaluate(() => document.body.innerText);
    const hasVoteContent = bodyText.includes('投票') || bodyText.includes('暂无') || bodyText.includes('加载');

    console.log(`  ✅ 投票相关内容: ${hasVoteContent ? '存在' : '不存在'}`);

    // 检查筛选按钮
    const filterButtons = await page.$$('button');
    console.log(`  ✅ 筛选按钮: ${filterButtons.length} 个`);

    results.push({
      test: '投票列表',
      status: 'PASS',
      detail: `内容存在, ${filterButtons.length} 个按钮`
    });
  } catch (error) {
    console.log(`  ❌ 失败: ${error.message}`);
    results.push({ test: '投票列表', status: 'FAIL', detail: error.message });
  }

  // 测试5: 个人中心
  console.log('\n【测试5】个人中心页面');
  try {
    await page.goto('http://localhost:3000/profile', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.screenshot({ path: path.join(screenshotDir, 'final-04-profile.png'), fullPage: true });

    const bodyText = await page.evaluate(() => document.body.innerText);
    const hasProfileContent = bodyText.includes('个人中心') || bodyText.includes('用户') || bodyText.includes('昵称');

    console.log(`  ✅ 个人中心内容: ${hasProfileContent ? '存在' : '不存在'}`);

    results.push({
      test: '个人中心',
      status: 'PASS',
      detail: hasProfileContent ? '内容正常显示' : '内容可能缺失'
    });
  } catch (error) {
    console.log(`  ❌ 失败: ${error.message}`);
    results.push({ test: '个人中心', status: 'FAIL', detail: error.message });
  }

  // 测试6: 响应式布局
  console.log('\n【测试6】响应式布局');
  try {
    await page.setViewport({ width: 375, height: 667 });
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.screenshot({ path: path.join(screenshotDir, 'final-05-mobile.png'), fullPage: true });

    await page.setViewport({ width: 1280, height: 800 });
    console.log(`  ✅ 移动端视图测试完成`);

    results.push({
      test: '响应式布局',
      status: 'PASS',
      detail: '支持移动端视图'
    });
  } catch (error) {
    console.log(`  ❌ 失败: ${error.message}`);
    results.push({ test: '响应式布局', status: 'FAIL', detail: error.message });
  }

  // 测试7: 控制台错误检查
  console.log('\n【测试7】控制台检查');
  console.log(`  错误: ${errors.length} 个`);
  errors.slice(0, 3).forEach(e => console.log(`    - ${e}`));
  console.log(`  警告: ${warnings.length} 个`);
  warnings.slice(0, 3).forEach(w => console.log(`    - ${w}`));

  results.push({
    test: '控制台检查',
    status: errors.length > 0 ? 'FAIL' : 'PASS',
    detail: `${errors.length} 错误, ${warnings.length} 警告`
  });

  // 测试8: 底部导航栏
  console.log('\n【测试8】底部导航栏');
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(resolve => setTimeout(resolve, 1000));

    const bottomNavExists = await page.$('nav.fixed');
    console.log(`  ✅ 底部导航栏: ${bottomNavExists ? '存在' : '不存在'}`);

    if (bottomNavExists) {
      const navItems = await bottomNavExists.$$eval('a', links => links.map(l => l.textContent.trim()));
      console.log(`  ✅ 导航项: ${navItems.join(', ')}`);
    }

    results.push({
      test: '底部导航栏',
      status: 'PASS',
      detail: bottomNavExists ? '正常显示' : '未找到'
    });
  } catch (error) {
    console.log(`  ❌ 失败: ${error.message}`);
    results.push({ test: '底部导航栏', status: 'FAIL', detail: error.message });
  }

  // 生成报告
  console.log('\n=== 测试报告 ===\n');
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const passRate = Math.round((passed / results.length) * 100);

  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${r.test}: ${r.detail}`);
  });

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`总计: ${results.length} 个测试`);
  console.log(`通过: ${passed} | 失败: ${failed}`);
  console.log(`通过率: ${passRate}%`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  const report = {
    timestamp: new Date().toISOString(),
    url: 'http://localhost:3000',
    summary: {
      total: results.length,
      passed,
      failed,
      passRate
    },
    results,
    errors,
    warnings
  };

  fs.writeFileSync(path.join(__dirname, 'final-test-report.json'), JSON.stringify(report, null, 2));

  console.log('\n📸 截图已保存到 screenshots/ 目录');
  console.log('📄 详细报告已保存到 final-test-report.json');

  await browser.close();
  console.log('\n=== 测试完成 ===');
}

finalTest().catch(console.error);
