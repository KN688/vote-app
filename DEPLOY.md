# Vercel 部署指南

## 1. 准备工作

确保你已经：
- ✅ 完成了 Supabase 配置（参考 `supabase-setup.md`）
- ✅ 本地测试通过
- ✅ 拥有 GitHub 账号

## 2. 推送代码到 GitHub

```bash
# 初始化 Git 仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: 聚餐投票应用"

# 创建 GitHub 仓库后，添加远程仓库
git remote add origin https://github.com/your-username/vote-app.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

## 3. 在 Vercel 部署

### 方法一：通过 Vercel 网站部署（推荐）

1. 访问 [https://vercel.com](https://vercel.com)
2. 注册/登录（建议使用 GitHub 账号登录）
3. 点击 "Add New..." → "Project"
4. 导入你的 GitHub 仓库
5. 配置项目：
   - **Framework Preset**: Vite
   - **Root Directory**: `./`（默认）
   - **Build Command**: `npm run build`（自动检测）
   - **Output Directory**: `dist`（自动检测）

6. 配置环境变量：
   - 点击 "Environment Variables"
   - 添加以下变量：
     - `VITE_SUPABASE_URL`: 你的 Supabase Project URL
     - `VITE_SUPABASE_ANON_KEY`: 你的 Supabase anon key
   - 点击 "Add"

7. 点击 "Deploy"
8. 等待部署完成（约1-2分钟）
9. 部署成功后会获得一个 `.vercel.app` 域名

### 方法二：通过 Vercel CLI 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署
vercel

# 按照提示操作：
# - Set up and deploy? Yes
# - Link to existing project? No
# - Project name: vote-app
# - Override settings? No
# - VITE_SUPABASE_URL: 输入你的 Supabase URL
# - VITE_SUPABASE_ANON_KEY: 输入你的 Supabase anon key
```

## 4. 配置自定义域名（可选）

1. 在 Vercel 项目中点击 "Settings" → "Domains"
2. 输入你的域名（例如：`vote.example.com`）
3. 按照提示配置 DNS 记录

## 5. 自动部署

配置完成后，每次你推送代码到 GitHub，Vercel 会自动重新部署：

```bash
git add .
git commit -m "Update feature"
git push
```

## 6. 环境变量管理

### 在 Vercel 网站上管理环境变量

1. 进入项目 Dashboard
2. 点击 "Settings" → "Environment Variables"
3. 可以添加、编辑、删除环境变量
4. 修改后需要重新部署才能生效

### 更新环境变量后重新部署

```bash
# 使用 Vercel CLI
vercel --prod
```

或者在 Vercel 网站上点击 "Redeploy"

## 7. 查看部署日志

1. 进入项目 Dashboard
2. 点击 "Deployments"
3. 点击具体的部署记录
4. 可以查看构建日志、函数日志等

## 8. 常见问题

### Q: 部署失败怎么办？

A: 检查以下几点：
- 确保所有依赖都已正确安装
- 检查构建日志中的错误信息
- 确保环境变量已正确配置

### Q: 如何回滚到之前的版本？

A: 在 Vercel Dashboard 中：
1. 点击 "Deployments"
2. 找到要回滚的版本
3. 点击右侧的 "..." 菜单
4. 选择 "Promote to Production"

### Q: 如何设置预览环境？

A: Vercel 会自动为每个 Pull Request 创建预览部署，无需额外配置

### Q: 免费额度是多少？

Vercel 免费套餐包含：
- 无限项目
- 100GB 带宽/月
- 无限构建
- 自动 HTTPS
- 全球 CDN

对于小型应用完全够用！

## 9. 分享应用

部署成功后，你可以：

1. **分享链接**：直接分享 Vercel 提供的 `.vercel.app` 域名
2. **分享到微信群**：群成员点击链接即可参与投票
3. **自定义域名**：配置自己的域名（可选）

## 10. 下一步

- [ ] 配置自定义域名
- [ ] 设置 GitHub Actions 自动测试
- [ ] 添加错误监控（如 Sentry）
- [ ] 优化性能（图片压缩、代码分割等）