# AGENTS.md — 开发与 AI 协作指南

> 本文档面向所有在此仓库上工作的开发者与 AI 编程助手。开始任何改动前请先阅读本文件，并严格遵守其中的约定。

---

## 1. 项目简介

这是一个个人作品集网站，包含：

- 前台：个人介绍、技能展示、项目展示、博客。
- 后台：`/admin` 登录与内容管理。
- 视觉：深色主题 + Canvas 星空背景 + 响应式 + 简洁现代。

技术栈：**Next.js 14（App Router）+ TypeScript + Tailwind CSS + Prisma（SQLite/PostgreSQL）+ 自研 JWT 鉴权**。

详细需求见 `PRD.md`，技术设计见 `TECH_DESIGN.md`。

---

## 2. 常用命令

```bash
npm install                 # 安装依赖
npm run dev                 # 本地开发（http://localhost:3000）
npm run build               # 生产构建
npm run start               # 运行生产构建
npm run lint                # ESLint 检查
npm run format              # Prettier 格式化

# Prisma
npx prisma migrate dev --name <name>   # 生成并应用迁移（开发）
npx prisma generate                    # 生成 Prisma Client
npx prisma db push                     # 快速同步 schema（无迁移文件时）
npx prisma studio                      # 打开数据库可视化
```

> Windows 环境使用 PowerShell；命令中的 `&&` 需替换为 `;`。

---

## 3. 目录结构（约定）

见 `TECH_DESIGN.md` 第 3 节。核心原则：

- `src/app/**`：路由与页面（App Router），只放页面级组合逻辑。
- `src/components/**`：可复用 UI 组件，按模块分目录（`hero/`、`skills/`、`projects/`、`blog/`、`admin/`、`starfield/`）。
- `src/lib/**`：纯逻辑与无 UI 的封装（`prisma.ts`、`auth.ts`、`validators.ts`、`markdown.ts`）。
- `prisma/schema.prisma`：唯一数据模型来源，改动后必须生成迁移。

---

## 4. 代码规范

### 4.1 TypeScript

- 严格模式（`strict: true`），禁止 `any`（确有必要时写明理由）。
- 所有函数导出尽量标注参数与返回类型。
- 优先使用 `type`，对象字面量结构使用 `interface`。

### 4.2 命名

| 类型 | 约定 | 示例 |
| --- | --- | --- |
| 组件 | PascalCase | `ProjectCard.tsx` |
| 函数/变量 | camelCase | `getPublishedPosts` |
| 常量 | UPPER_SNAKE_CASE | `AUTH_COOKIE_NAME` |
| 路由目录 | 小写 + 中划线 | `blog/[slug]` |
| 数据库表 | PascalCase 单数 | `Project` |
| API 路径 | 小写 + 中划线 | `/api/admin/posts` |

### 4.3 样式（Tailwind）

- 使用 `tailwind.config.ts` 中定义的设计令牌（颜色、间距），不要硬编码十六进制颜色到组件中。
- 深色主题令牌见 `TECH_DESIGN.md` 6.4。
- 类名按固定顺序书写：布局 → 间距 → 排版 → 颜色 → 边框 → 效果。
- 复杂的重复样式抽成组件或 `@apply`（谨慎使用 `@apply`）。

### 4.4 数据访问

- **永远不要**在客户端组件里直接调用 Prisma。
- 数据读取：Server Component 直接调用 `src/lib` 中的服务函数，或通过 `/api`。
- 数据写入：一律通过 Route Handler（`/api/admin/*`），并在服务端做鉴权 + Zod 校验。

### 4.5 鉴权

- 后台写接口必须调用 `requireAdmin()`（`lib/auth.ts`）校验，未通过返回 401。
- 前端请求后台 API 使用统一封装的 `fetch` 帮助函数，携带 credentials。
- 不要在前端保存敏感信息（密码、token）。

---

## 5. 功能开发流程（Checklist）

新增/修改功能时，按以下顺序执行：

1. **理解需求**：阅读 `PRD.md` 与 `TECH_DESIGN.md` 相关章节。
2. **数据层**：如需新增字段/表，修改 `prisma/schema.prisma`，运行迁移。
3. **校验层**：在 `src/lib/validators.ts` 定义 Zod schema。
4. **服务层**：在 `src/lib` 写纯逻辑（如 `getPublishedPosts`）。
5. **接口层**：新增/修改 Route Handler。
6. **UI 层**：新增组件与页面，接入数据。
7. **验证**：`npm run lint` + `npm run build`，必要时 `npm run dev` 手动验证。

---

## 6. 关键实现约定

### 6.1 星空背景

- 使用 `src/components/starfield/Starfield.tsx`。
- 仅在根布局（前台）挂载一次，通过 `position: fixed; z-index: -1` 作为背景。
- 尊重 `prefers-reduced-motion`，移动端降低粒子数量（见 `TECH_DESIGN.md` 6）。
- 不要在每个页面重复挂载。

### 6.2 博客

- 正文使用 Markdown 存储，渲染用 `lib/markdown.ts` 统一封装。
- 前台只展示 `status === "PUBLISHED"` 的文章，按 `publishedAt` 倒序。
- `slug` 唯一，由标题生成或手动填写，正则 `^[a-z0-9-]+$`。
- 后台列表需展示草稿状态，且草稿不可在前台通过 URL 直接访问。

### 6.3 上传

- 统一走 `/api/admin/upload`，存储到 `public/uploads/`（或对象存储）。
- 校验 MIME 与大小，文件名随机化。
- 大文件/生产环境建议对象存储（OSS/S3），本地开发用本地目录即可。

### 6.4 环境变量

- 新增环境变量必须同步更新 `.env.example`。
- 绝不在代码或提交中写死密钥。

---

## 7. 测试与验收

- 提交前运行：`npm run lint`、`npm run build`。
- 涉及鉴权/数据变更时，手动验证「未登录 401 → 登录 → 操作 → 前台生效」主流程。
- 新增纯函数尽量配套单元测试（Vitest）。

---

## 8. 提交规范

- 提交信息使用约定式提交：`feat:` / `fix:` / `docs:` / `refactor:` / `chore:`。
- 一个提交尽量只做一件事。

---

## 9. 常见注意事项

- **App Router 与客户端组件**：仅在需要交互/状态/浏览器 API 时使用 `'use client'`，能用 Server Component 就用 Server Component。
- **序列化边界**：Server Component 传给 Client Component 的 props 必须是可序列化的（不要传 Prisma 对象/函数）。
- **重定向**：鉴权重定向优先在 `middleware.ts` 处理，页面内也可用 `redirect()`。
- **图片**：所有图片使用 `next/image`（本地上传的远程路径需在 `next.config.mjs` 配置 `images.remotePatterns`，或直接用本地 `public` 路径）。
- **数据库切换**：开发 SQLite，生产 PostgreSQL；迁移文件保持一致，避免 provider 差异导致的迁移冲突。
