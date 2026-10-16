# TECH_DESIGN — 技术设计文档

> 版本：v1.0
> 更新日期：2026-10-15

---

## 1. 技术选型总览

| 层面 | 选型 | 理由 |
| --- | --- | --- |
| 框架 | Next.js 14（App Router）+ React 18 + TypeScript | 同一代码库承载前台 SSR/SSG + API 路由（后台），SEO 友好 |
| 样式 | Tailwind CSS | 原子化，快速实现深色主题与响应式 |
| 数据库 ORM | Prisma | 类型安全，迁移方便 |
| 数据库（开发） | SQLite | 零配置，本地即用 |
| 数据库（生产） | PostgreSQL（Neon / Supabase / Vercel PG） | 高并发与持久化 |
| 鉴权 | 自研 JWT（`jose`）+ httpOnly Cookie + `bcryptjs` | 轻量、可控，避免重依赖 |
| Markdown | `react-markdown` + `remark-gfm` + `rehype-highlight` | 博客正文渲染与代码高亮 |
| 校验 | Zod | 前后端共用 schema 校验 |
| 星空背景 | 自研 Canvas 2D 组件 | 无重依赖，性能与降级可控 |
| 代码规范 | ESLint + Prettier | 统一风格 |
| 部署 | Vercel（推荐） | 与 Next.js 生态契合，一键部署 |

> 备选：若希望完全静态部署（无服务器 API），可将博客改为本地 Markdown 文件 + 内容层（Contentlayer）。但本方案因需 `/admin` 在线管理，采用「服务端 API + 数据库」方案。

---

## 2. 架构设计

### 2.1 总体架构

```
┌─────────────────────────────── 浏览器 ───────────────────────────────┐
│  前台页面 (/)  ( /blog )  ( /blog/[slug] )     后台 (/admin/*)       │
└───────────────┬───────────────────────────────────────┬──────────────┘
                │ RSC / Server Component 渲染             │ 受保护 API
                ▼                                        ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        Next.js 应用（App Router）                      │
│  ┌──────────────┐  ┌──────────────────┐  ┌────────────────────────┐  │
│  │ Server 页面   │  │ Route Handlers   │  │ Middleware（鉴权拦截） │  │
│  │ (SSG/ISR)    │  │ /api/admin/*     │  │ /admin 未登录重定向    │  │
│  └──────┬───────┘  └────────┬─────────┘  └────────────────────────┘  │
│         │                   │                                         │
│         ▼                   ▼                                         │
│  ┌──────────────────────────────────────────────────┐                │
│  │            服务层 (services / repository)          │                │
│  └──────────────────────┬───────────────────────────┘                │
│                         ▼                                             │
│              ┌─────────────────────┐                                 │
│              │   Prisma + SQLite   │                                 │
│              └─────────────────────┘                                 │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 渲染策略

| 页面 | 策略 | 说明 |
| --- | --- | --- |
| `/` 首页 | SSG（`revalidate` 为 ISR） | 内容变更后自动再生成 |
| `/blog` | ISR（`revalidate: 60`） | 列表 |
| `/blog/[slug]` | SSG（`generateStaticParams`）+ ISR | 详情 |
| `/admin/*` | 客户端组件（CSR） | 动态后台，鉴权后调用 API |
| `/api/admin/*` | Route Handlers（动态） | 写操作接口 |

---

## 3. 目录结构

```
personal-portfolio/
├─ prisma/
│  └─ schema.prisma              # 数据模型定义
├─ public/
│  └─ uploads/                   # 上传的头像/封面/简历（或使用对象存储）
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx              # 根布局（星空背景 + 主题）
│  │  ├─ page.tsx                # 首页
│  │  ├─ blog/
│  │  │  ├─ page.tsx             # 博客列表
│  │  │  └─ [slug]/page.tsx      # 博客详情
│  │  ├─ admin/
│  │  │  ├─ layout.tsx           # 后台布局（侧边栏 + 鉴权）
│  │  │  ├─ page.tsx             # Dashboard
│  │  │  ├─ login/page.tsx       # 登录
│  │  │  ├─ profile/page.tsx     # 个人资料/技能/项目
│  │  │  └─ blog/page.tsx        # 博客管理
│  │  └─ api/
│  │     ├─ auth/
│  │     │  ├─ login/route.ts    # POST 登录
│  │     │  └─ logout/route.ts   # POST 退出
│  │     └─ admin/
│  │        ├─ profile/route.ts  # GET/PUT 个人资料
│  │        ├─ skills/route.ts   # GET/PUT 技能
│  │        ├─ projects/route.ts # CRUD 项目
│  │        └─ posts/route.ts    # CRUD 博客
│  ├─ components/
│  │  ├─ starfield/Starfield.tsx     # 星空 Canvas 组件
│  │  ├─ hero/Hero.tsx
│  │  ├─ skills/Skills.tsx
│  │  ├─ projects/ProjectCard.tsx
│  │  ├─ blog/PostCard.tsx
│  │  └─ admin/...                    # 后台表单组件
│  ├─ lib/
│  │  ├─ prisma.ts                  # Prisma 客户端单例
│  │  ├─ auth.ts                    # JWT 签发/校验、session
│  │  ├─ validators.ts              # Zod schemas
│  │  └─ markdown.ts                # Markdown 渲染封装
│  ├─ middleware.ts                 # /admin 鉴权重定向
│  └─ styles/globals.css            # Tailwind 入口 + 主题变量
├─ .env / .env.example
├─ tailwind.config.ts
├─ tsconfig.json
├─ next.config.mjs
├─ package.json
├─ PRD.md
├─ TECH_DESIGN.md
└─ AGENTS.md
```

---

## 4. 数据模型（Prisma Schema）

```prisma
datasource db {
  provider = "sqlite"      // 生产切换 "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Admin {
  id           String   @id @default(cuid())
  username     String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Profile {
  id        String  @id @default(cuid())
  name      String
  title     String
  tagline   String
  about     String          // 长文本，支持换行
  avatarUrl String?
  resumeUrl String?
  updatedAt DateTime @updatedAt
}

model SocialLink {
  id        String  @id @default(cuid())
  type      String          // github | email | linkedin | x | website ...
  label     String
  url       String
  sortOrder Int     @default(0)
}

model SkillCategory {
  id        String  @id @default(cuid())
  name      String
  sortOrder Int     @default(0)
  skills    Skill[]
}

model Skill {
  id         String        @id @default(cuid())
  name       String
  level      Int           @default(80)   // 0-100 熟练度
  icon       String?                       // 图标标识/emoji
  categoryId String
  category   SkillCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  sortOrder  Int           @default(0)
}

model Project {
  id          String   @id @default(cuid())
  title       String
  summary     String
  description String
  coverUrl    String?
  techStack   String   @default("[]")   // JSON 字符串数组
  githubUrl   String?
  demoUrl     String?
  featured    Boolean  @default(false)
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Post {
  id          String    @id @default(cuid())
  title       String
  slug        String    @unique
  summary     String?
  content     String     // Markdown
  coverUrl    String?
  tags        String     @default("[]")
  status      String     @default("DRAFT") // DRAFT | PUBLISHED
  publishedAt DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}
```

> 说明：`Post.status` 使用字符串而非枚举。SQLite 连接器不支持 Prisma `enum`，因此在应用层用 Zod 的 `z.enum(["DRAFT","PUBLISHED"])` 做校验；若生产切换到 PostgreSQL，可再改回原生枚举。

> `techStack` / `tags` 以 JSON 字符串存储，读写时在服务层做 `JSON.parse/stringify`；若需要复杂查询可拆为关联表。

---

## 5. API 设计

统一约定：

- 管理接口前缀 `/api/admin/*`，除 `/api/auth/login` 外均需鉴权。
- 返回格式：`{ data }` 或 `{ error: { message, code } }`。
- 状态码：200 成功、400 参数错误、401 未认证、404 不存在、500 服务器错误。

### 5.1 鉴权

| Method | Path | 说明 |
| --- | --- | --- |
| POST | `/api/auth/login` | body: `{ username, password }`；成功签发 JWT 写入 httpOnly cookie |
| POST | `/api/auth/logout` | 清除 cookie |

### 5.2 个人资料与内容

| Method | Path | 说明 |
| --- | --- | --- |
| GET | `/api/admin/profile` | 读取个人资料 + 社交链接 |
| PUT | `/api/admin/profile` | 更新个人资料 |
| PUT | `/api/admin/social-links` | 整体更新社交链接列表 |
| PUT | `/api/admin/skills` | 整体更新技能分类与技能 |
| GET | `/api/admin/projects` | 项目列表 |
| POST | `/api/admin/projects` | 新建项目 |
| PUT | `/api/admin/projects/[id]` | 更新项目 |
| DELETE | `/api/admin/projects/[id]` | 删除项目 |
| GET | `/api/admin/posts` | 博客列表（含草稿） |
| POST | `/api/admin/posts` | 新建博客 |
| PUT | `/api/admin/posts/[id]` | 更新博客 |
| DELETE | `/api/admin/posts/[id]` | 删除博客 |
| POST | `/api/admin/upload` | 上传文件（头像/封面/简历） |

### 5.3 鉴权实现要点（`lib/auth.ts`）

- 登录成功后：`jose` 的 `SignJWT` 签发，`payload = { sub: adminId, username }`，有效期 7 天。
- Cookie：`name = "portfolio_token"`，`httpOnly: true`，`sameSite: "lax"`，`secure: process.env.NODE_ENV === "production"`，`path: "/"`。
- 校验函数 `getSession()` 读取并 `jwtVerify`，用于 Route Handlers 与 Server 组件。
- `middleware.ts`：匹配 `/admin`（除 `/admin/login`）时，校验 cookie；无效则 `redirect` 到 `/admin/login`。

### 5.4 输入校验（Zod）

每个写接口对应一个 Zod schema，例如：

```ts
const loginSchema = z.object({
  username: z.string().min(1).max(50),
  password: z.string().min(6).max(100),
});

const postSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/).max(200),
  summary: z.string().max(500).optional(),
  content: z.string(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});
```

---

## 6. 星空背景设计（Starfield）

### 6.1 实现方案

自研 React 组件 `Starfield.tsx`，使用 Canvas 2D：

- 粒子：随机分布的星点，带随机大小（0.5–2px）与透明度。
- 动画：`requestAnimationFrame` 循环，星点做缓慢「闪烁」（透明度正弦变化），可选缓慢漂移。
- 流星（可选）：低频随机划过，增加氛围。
- 懒加载/降级：`prefers-reduced-motion` 时渲染静态星空；移动端粒子数量减半。

### 6.2 关键参数（可配置）

```ts
const STARS_DESKTOP = 220;
const STARS_MOBILE = 100;
const SHOOTING_STAR_INTERVAL = 4000; // ms
```

### 6.3 性能策略

- Canvas 使用 `devicePixelRatio` 适配高清屏，但移动端限制最大 `dpr=2`。
- 页面 `visibilitychange` 时暂停/恢复动画。
- 星空作为页面背景层（`position: fixed; z-index: -1`），不参与文档流，避免影响布局。
- 后台管理页不使用星空背景（保持简洁、省资源）。

### 6.4 深色主题配色（设计令牌）

| 令牌 | 值 | 用途 |
| --- | --- | --- |
| `bg-base` | `#0b1020`（近深夜蓝黑） | 页面背景 |
| `bg-surface` | `#141a2e` | 卡片背景 |
| `text-primary` | `#e6ecff` | 主文字 |
| `text-secondary` | `#8b98c4` | 次要文字 |
| `accent` | `#6d8bff`（星蓝） | 强调色 / 链接 / 按钮 |
| `border` | `#232c47` | 边框 |

在 `tailwind.config.ts` 中以 `colors` 扩展，并配合 `darkMode: 'class'`（或直接作为默认主题）。

---

## 7. 响应式设计

- 断点沿用 Tailwind 默认：`sm`(640) / `md`(768) / `lg`(1024) / `xl`(1280)。
- 首页：桌面为多区块纵向布局；技能/项目卡片网格 `grid-cols-1 → sm:grid-cols-2 → lg:grid-cols-3`。
- 导航：移动端使用汉堡菜单（可折叠）。
- 后台：桌面侧边栏，移动端顶部栏 + 抽屉。
- 所有交互元素触控区域 ≥ 44px。

---

## 8. 安全设计

- 密码：`bcryptjs.hash(password, 12)`。
- 登录限流：基于 IP + 用户名的简单计数（单机可用内存 Map，生产可接 Upstash Redis），如 1 分钟 5 次失败锁定 5 分钟。
- JWT 密钥：`.env` 中 `AUTH_SECRET`，不少于 32 位随机字符串，绝不入库/入 git。
- 上传文件：校验 MIME 类型与大小（如 ≤ 5MB），文件名随机化，防路径穿越。
- Markdown 渲染：默认不做危险 HTML 注入（`react-markdown` 默认转义），如启用 `rehype-raw` 需配合 sanitize。

---

## 9. SEO 设计

- 根布局使用 `metadata` 导出站点 title/description。
- 博客详情页 `generateMetadata` 按文章标题、摘要生成 title/description + OG 标签。
- 首页/博客列表提供结构化数据（可选 `JSON-LD` Person / Blog）。

---

## 10. 部署与环境变量

### 10.1 环境变量（`.env.example`）

```
DATABASE_URL="file:./dev.db"          # 生产: postgresql://...
AUTH_SECRET="please-generate-32+random-chars"
ADMIN_USERNAME="admin"                # 首次初始化管理员
ADMIN_PASSWORD="change-me-strong-password"
```

### 10.2 部署步骤（Vercel）

1. 仓库关联 Vercel，框架自动识别 Next.js。
2. 配置环境变量（生产 `DATABASE_URL` 指向 PostgreSQL，`AUTH_SECRET`）。
3. 执行 `prisma migrate deploy`（构建脚本中加入）。
4. 部署后访问 `/admin`，用初始账号登录并修改密码。

---

## 11. 测试策略（建议）

| 层 | 工具 | 覆盖 |
| --- | --- | --- |
| 单元 | Vitest | `lib/auth.ts`、`lib/validators.ts` 等纯函数 |
| 组件 | Testing Library | 关键组件渲染 |
| 接口 | Vitest + Supertest（或直接调用 handler） | 鉴权与 CRUD 接口 |
| E2E | Playwright（可选） | 登录 → 编辑 → 前台生效主流程 |

