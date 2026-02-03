const puppeteer = require('puppeteer-core');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function simpleTest() {
  console.log('开始简单测试...\n');

  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: false
  });

  const page = await browser.newPage();

  // 监听所有控制台消息
  page.on('console', msg => {
    console.log(`[${msg.type()}] ${msg.text()}`);
  });

  // 监听所有网络请求
  page.on('request', request => {
    console.log(`[请求] ${request.method()} ${request.url()}`);
  });

  page.on('response', response => {
    const status = response.status();
    if (status >= 400) {
      console.log(`[响应错误] ${status} ${response.url()}`);
    }
  });

  console.log('导航到 http://localhost:3000');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });

  console.log('\n等待5秒...');
  await new Promise(resolve => setTimeout(resolve, 5000));

  console.log('\n=== 页面状态 ===');
  const pageState = await page.evaluate(() => {
    return {
      title: document.title,
      url: window.location.href,
      bodyHTML: document.body.innerHTML.substring(0, 500),
      rootHTML: document.getElementById('root')?.innerHTML?.substring(0, 500) || 'root为空',
      bodyText: document.body.innerText?.substring(0, 200) || '无文本',
      scripts: Array.from(document.scripts).map(s => s.src),
      styles: Array.from(document.styleSheets).map(s => s.href)
    };
  });

  console.log('标题:', pageState.title);
  console.log('URL:', pageState.url);
  console.log('Root内容:', pageState.rootHTML);
  console.log('Body文本:', pageState.bodyText);
  console.log('脚本数量:', pageState.scripts.length);
  console.log('样式数量:', pageState.styles.length);

  await page.screenshot({ path: 'screenshots/simple-test.png', fullPage: true });
  console.log('\n截图已保存: screenshots/simple-test.png');

  await browser.close();
}

simpleTest().catch(console.error);