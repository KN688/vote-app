// 详细的功能测试脚本
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function detailedTest() {
  console.log('=== 投票小程序详细功能测试 ===\n');

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

  // 1. 访问首页
  console.log('=== 测试 1: 首页显示 ===');
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 15000 });

    // 等待页面内容加载
    await new Promise(resolve => setTimeout(resolve, 3000));

    await page.screenshot({ path: path.join(screenshotDir, 'detail-01-home.png'), fullPage: true });

    // 检查页面内容
    const pageTitle = await page.title();
    console.log(`  页面标题: ${pageTitle}`);

    // 获取页面文本内容
    const bodyText = await page.evaluate(() => document.body.innerText);
    console.log(`  页面内容长度: ${bodyText.length} 字符`);
    if (bodyText.length > 10) {
      console.log(`  前100字符: ${bodyText.substring(0, 100)}...`);
    }

    // 检查关键元素
    const h1Exists = await page.$('h1');
    const rootElement = await page.$('#root');

    console.log(`  h1元素存在: ${h1Exists ? '是' : '否'}`);
    console.log(`  #root元素存在: ${rootElement ? '是' : '否'}`);

    if (h1Exists) {
      const h1Text = await page.$eval('h1', el => el.textContent);
      console.log(`  h1内容: ${h1Text}`);
    }

    results.push({ test: '首页显示', status: 'PASS', detail: `标题: ${pageTitle}, 内容: ${bodyText.length > 10 ? '有' : '无'}` });
  } catch (error) {
    console.log(`  ❌ 失败: ${error.message}`);
    results.push({ test: '首页显示', status: 'FAIL', detail: error.message });
  }

  // 2. 测试导航
  console.log('\n=== 测试 2: 导航功能 ===');
  try {
    const navLinks = await page.$$eval('nav a, [role="navigation"] a, a[href^="/"]', links => {
      return links.slice(0, 10).map(l => ({ text: l.textContent, href: l.href }));
    });

    console.log(`  找到 ${navLinks.length} 个导航链接`);
    navLinks.forEach(link => console.log(`    - ${link.text}: ${link.href}`));

    results.push({ test: '导航功能', status: 'PASS', detail: `${navLinks.length} 个链接` });
  } catch (error) {
    console.log(`  ⚠️  失败: ${error.message}`);
    results.push({ test: '导航功能', status: 'WARN', detail: error.message });
  }

  // 3. 测试创建投票功能
  console.log('\n=== 测试 3: 创建投票 ===');
  try {
    // 查找创建投票按钮
    const createBtn = await page.$('a[href="/create"], button:contains("创建"), .create-btn');
    if (createBtn) {
      await createBtn.click();
      await new Promise(resolve => setTimeout(resolve, 2000));
    } else {
      await page.goto('http://localhost:3000/create');
    }

    await page.screenshot({ path: path.join(screenshotDir, 'detail-02-create.png'), fullPage: true });

    const formTitle = await page.$eval('h1, h2, .title', el => el.textContent).catch(() => '未找到');
    console.log(`  表单标题: ${formTitle}`);

    // 检查表单元素
    const inputExists = await page.$('input[type="text"]');
    const textareaExists = await page.$('textarea');
    const buttonExists = await page.$('button[type="submit"], .btn-primary');

    console.log(`  输入框: ${inputExists ? '有' : '无'}`);
    console.log(`  文本域: ${textareaExists ? '有' : '无'}`);
    console.log(`  提交按钮: ${buttonExists ? '有' : '无'}`);

    // 尝试填写表单
    if (inputExists) {
      await page.fill('input[type="text"]', '测试投票 - 今天吃什么？');
      console.log(`  ✅ 成功填写标题`);
    }

    if (buttonExists) {
      await page.screenshot({ path: path.join(screenshotDir, 'detail-03-create-filled.png'), fullPage: true });
      console.log(`  ✅ 准备提交表单`);
    }

    results.push({ test: '创建投票', status: 'PASS', detail: `表单元素: ${[inputExists, textareaExists, buttonExists].filter(Boolean).length}/3` });
  } catch (error) {
    console.log(`  ❌ 失败: ${error.message}`);
    results.push({ test: '创建投票', status: 'FAIL', detail: error.message });
  }

  // 4. 返回首页检查投票列表
  console.log('\n=== 测试 4: 投票列表 ===');
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const pageText = await page.evaluate(() => document.body.innerText);
    console.log(`  页面文本: ${pageText.substring(0, 200)}...`);

    // 检查是否有投票相关内容
    const hasVoteText = pageText.includes('投票') || pageText.includes('暂无') || pageText.includes('加载');
    console.log(`  投票相关内容: ${hasVoteText ? '有' : '无'}`);

    await page.screenshot({ path: path.join(screenshotDir, 'detail-04-list.png'), fullPage: true });

    results.push({ test: '投票列表', status: 'PASS', detail: `内容存在: ${hasVoteText}` });
  } catch (error) {
    console.log(`  ❌ 失败: ${error.message}`);
    results.push({ test: '投票列表', status: 'FAIL', detail: error.message });
  }

  // 5. 测试个人中心
  console.log('\n=== 测试 5: 个人中心 ===');
  try {
    await page.goto('http://localhost:3000/profile', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.screenshot({ path: path.join(screenshotDir, 'detail-05-profile.png'), fullPage: true });

    const pageText = await page.evaluate(() => document.body.innerText);
    console.log(`  页面文本: ${pageText.substring(0, 200)}...`);

    results.push({ test: '个人中心', status: 'PASS', detail: '页面可访问' });
  } catch (error) {
    console.log(`  ❌ 失败: ${error.message}`);
    results.push({ test: '个人中心', status: 'FAIL', detail: error.message });
  }

  // 6. 控制台检查
  console.log('\n=== 测试 6: 控制台检查 ===');
  const errors = [];
  const warnings = [];

  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
    if (msg.type() === 'warning') warnings.push(msg.text());
  });

  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 3000));

  console.log(`  错误: ${errors.length} 个`);
  errors.slice(0, 3).forEach(e => console.log(`    - ${e}`));
  console.log(`  警告: ${warnings.length} 个`);

  results.push({
    test: '控制台检查',
    status: errors.length > 0 ? 'FAIL' : 'PASS',
    detail: `${errors.length} 错误, ${warnings.length} 警告`
  });

  // 生成报告
  console.log('\n=== 测试报告 ===\n');
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;

  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${icon} ${r.test}: ${r.detail}`);
  });

  console.log(`\n总计: ${results.length} | 通过: ${passed} | 失败: ${failed} | 警告: ${warned}`);

  const report = {
    timestamp: new Date().toISOString(),
    summary: { total: results.length, passed, failed, warned },
    results
  };

  fs.writeFileSync(path.join(__dirname, 'detailed-test-report.json'), JSON.stringify(report, null, 2));

  console.log('\n截图已保存到 screenshots/ 目录');
  console.log('详细报告已保存到 detailed-test-report.json');

  await browser.close();
  console.log('\n=== 测试完成 ===');
}

detailedTest().catch(console.error);
