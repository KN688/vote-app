// 简单的测试脚本 - 使用 Node.js 测试 API 和应用结构
const fs = require('fs');
const path = require('path');

console.log('=== 投票小程序功能测试 ===\n');

// 1. 检查项目结构
console.log('1. 检查项目结构...');
const requiredFiles = [
  'src/App.jsx',
  'src/supabase.js',
  'src/store/useStore.js',
  'src/pages/Home.jsx',
  'src/pages/CreateVote.jsx',
  'src/pages/VoteDetail.jsx',
  'src/pages/VoteResult.jsx',
  'src/pages/Profile.jsx',
  'src/components/Layout.jsx',
  'src/components/VoteCard.jsx',
  '.env.local'
];

let missingFiles = [];
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length === 0) {
  console.log('✅ 所有必需文件存在\n');
} else {
  console.log('❌ 缺少文件:', missingFiles.join(', '), '\n');
}

// 2. 检查环境变量配置
console.log('2. 检查环境变量配置...');
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const hasUrl = envContent.includes('VITE_SUPABASE_URL');
  const hasKey = envContent.includes('VITE_SUPABASE_ANON_KEY');

  if (hasUrl && hasKey) {
    console.log('✅ Supabase 配置已设置\n');
  } else {
    console.log('❌ Supabase 配置不完整\n');
  }
} else {
  console.log('❌ .env.local 文件不存在\n');
}

// 3. 检查 package.json 依赖
console.log('3. 检查项目依赖...');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  const requiredDeps = ['react', 'react-router-dom', 'zustand', '@supabase/supabase-js'];
  const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies?.[dep]);

  if (missingDeps.length === 0) {
    console.log('✅ 所有必需依赖已安装\n');
  } else {
    console.log('❌ 缺少依赖:', missingDeps.join(', '), '\n');
  }
}

// 4. 检查路由配置
console.log('4. 检查路由配置...');
const appPath = path.join(__dirname, 'src/App.jsx');
if (fs.existsSync(appPath)) {
  const appContent = fs.readFileSync(appPath, 'utf-8');
  const routes = ['/', '/create', '/vote/:id', '/result/:id', '/profile'];
  const missingRoutes = routes.filter(route => !appContent.includes(route));

  if (missingRoutes.length === 0) {
    console.log('✅ 所有路由已配置:', routes.join(', '), '\n');
  } else {
    console.log('❌ 缺少路由:', missingRoutes.join(', '), '\n');
  }
}

// 5. 检查 Store 功能
console.log('5. 检查 Store 功能...');
const storePath = path.join(__dirname, 'src/store/useStore.js');
if (fs.existsSync(storePath)) {
  const storeContent = fs.readFileSync(storePath, 'utf-8');
  const methods = ['fetchVotes', 'createVote', 'fetchVoteDetail', 'submitVote'];
  const missingMethods = methods.filter(method => !storeContent.includes(method));

  if (missingMethods.length === 0) {
    console.log('✅ Store 功能完整:', methods.join(', '), '\n');
  } else {
    console.log('❌ Store 缺少方法:', missingMethods.join(', '), '\n');
  }
}

console.log('=== 测试完成 ===');
console.log('\n注意: 完整的 UI 测试需要浏览器自动化工具 (Playwright/Cypress)');
console.log('请手动访问 http://localhost:5173 进行功能验证');