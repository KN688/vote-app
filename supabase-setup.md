# Supabase 数据库配置指南

## 1. 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 注册/登录账号
3. 点击 "New Project" 创建新项目
4. 填写项目信息：
   - Name: `vote-app`（或其他名称）
   - Database Password: 设置强密码（请妥善保存）
   - Region: 选择离你最近的区域
5. 等待项目创建完成（约2分钟）

## 2. 获取 API 密钥

1. 进入项目 Dashboard
2. 点击左侧菜单 "Settings" → "API"
3. 复制以下信息：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJxxxx...`

## 3. 创建数据库表

### 创建 votes 表

1. 点击左侧菜单 "Table Editor"
2. 点击 "New Table"
3. 填写表信息：

**Table Name**: `votes`

**Columns**:

| Name | Type | Default | Constraints |
|------|------|---------|-------------|
| id | int8 | (auto) | Primary Key |
| title | text | | not null |
| type | text | | not null |
| options | jsonb | `[]`::jsonb | |
| deadline | timestamp | | |
| description | text | | |
| status | text | `'active'` | not null |
| creator_id | text | | not null |
| creator_nickname | text | | |
| voters | text[] | `ARRAY[]::TEXT[]` | |
| vote_records | jsonb | `[]`::jsonb | |
| created_at | timestamp | `now()` | |
| updated_at | timestamp | `now()` | |

4. 点击 "Save"

### 创建索引（可选，提高查询性能）

在 "SQL Editor" 中执行以下 SQL：

```sql
-- 为 votes 表创建索引
CREATE INDEX idx_votes_status ON votes(status);
CREATE INDEX idx_votes_created_at ON votes(created_at DESC);
CREATE INDEX idx_votes_creator_id ON votes(creator_id);
CREATE INDEX idx_votes_voters ON votes USING GIN(voters);
```

## 4. 配置行级安全策略（RLS）

### 启用 RLS

在 "SQL Editor" 中执行：

```sql
-- 启用行级安全
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- 允许所有人读取投票
CREATE POLICY "允许所有人读取投票"
ON votes FOR SELECT
USING (true);

-- 允许所有人创建投票
CREATE POLICY "允许所有人创建投票"
ON votes FOR INSERT
WITH CHECK (true);

-- 允许所有人更新投票
CREATE POLICY "允许所有人更新投票"
ON votes FOR UPDATE
USING (true);

-- 允许所有人删除投票（可选）
CREATE POLICY "允许所有人删除投票"
ON votes FOR DELETE
USING (true);
```

## 5. 配置环境变量

### 创建 `.env.local` 文件

在项目根目录创建 `.env.local` 文件：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**注意**：
- 将 `your-project-id` 替换为你的实际项目 URL
- 将 `your-anon-key` 替换为你的 anon public key
- 此文件已添加到 `.gitignore`，不会被提交到 Git

## 6. 验证配置

1. 重启开发服务器：
   ```bash
   npm run dev
   ```

2. 打开浏览器访问 `http://localhost:3000`

3. 尝试创建一个投票，检查是否能正常保存到数据库

4. 在 Supabase 的 "Table Editor" 中查看 `votes` 表，确认数据已保存

## 7. 常见问题

### Q: 数据库连接失败？
A: 检查 `.env.local` 文件中的 URL 和 Key 是否正确

### Q: 无法创建投票？
A: 检查 RLS 策略是否正确配置

### Q: 数据没有实时更新？
A: 目前使用轮询方式，可以后续添加 Supabase Realtime 功能

## 8. 数据库结构说明

### votes 表字段说明

- `id`: 投票唯一ID（自动生成）
- `title`: 投票标题
- `type`: 投票类型（location/time）
- `options`: 选项数组，格式：`[{name: "选项1", count: 0}, ...]`
- `deadline`: 截止时间（可选）
- `description`: 备注说明
- `status`: 投票状态（active/closed）
- `creator_id`: 发起人ID
- `creator_nickname`: 发起人昵称
- `voters`: 已投票用户ID数组
- `vote_records`: 投票记录数组，格式：`[{user_id, user_nickname, selected_option, vote_time}, ...]`
- `created_at`: 创建时间
- `updated_at`: 更新时间

## 9. 免费额度说明

Supabase 免费套餐包含：
- 500MB 数据库存储
- 1GB 文件存储
- 50,000 API 请求/月
- 2个并发连接

对于小型投票应用，免费额度完全够用！