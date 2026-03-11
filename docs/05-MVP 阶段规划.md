# MVP 阶段规划

## 1. 总体策略

先搭架子跑通链路，再逐步丰富功能。每个阶段结束时应有可运行的产物。

## 2. Phase 1 — 骨架搭建

### 目标

搭建项目工程、连通 OpenClaw Gateway、跑通最基础的交互链路。

### 交付物

- pnpm monorepo 工程结构（web / server / shared）
- Omnia Server 启动并连接 OpenClaw Gateway
- 前端可访问，展示连接状态
- 一个最简 Agent 列表页（从 Gateway 拉取数据展示）

### 具体任务

- [ ] 初始化 monorepo（pnpm-workspace.yaml、tsconfig、eslint、prettier）
- [ ] 初始化 web 包（Vite + React + TypeScript + Tailwind + shadcn/ui）
- [ ] 初始化 server 包（Fastify + TypeScript）
- [ ] 初始化 shared 包（共享类型定义）
- [ ] 实现 OpenClaw Adapter：WebSocket 连接 + 认证握手 + 心跳
- [ ] 实现 server 代理接口：`GET /api/agents` → `agents.list`
- [ ] 实现 server 状态接口：`GET /api/status`
- [ ] 前端布局骨架：侧边栏 + 顶部栏 + 主内容区 + 底部状态栏
- [ ] 前端 Agent 列表页：调用 API 展示 Agent 卡片
- [ ] 前端连接状态指示器

## 3. Phase 2 — Agent 管理 + Chat

### 目标

完成 Agent 的完整管理流程和基础 Chat 能力。

### 交付物

- Agent CRUD 完整可用
- Agent 配置文件（SOUL.md 等）可在 UI 中编辑
- 可以在 Chat 界面与 Agent 对话，流式展示回复

### 具体任务

- [ ] Agent 详情页（概览 + 配置 Tab）
- [ ] Workspace 文件读写接口（server 直接操作文件系统）
- [ ] 内嵌 Monaco Editor，编辑 AGENTS.md / SOUL.md / IDENTITY.md / USER.md / TOOLS.md
- [ ] 实现 SSE 推送端点（`/api/events/stream`）
- [ ] Chat 页面：消息输入 + 流式渲染 + 工具调用展示
- [ ] Agent 创建/删除功能
- [ ] 审批弹窗（exec.approval.requested → UI 展示 → 用户操作 → resolve）

## 4. Phase 3 — Skill / Session / Tools 管理

### 目标

补齐 OpenClaw 核心概念的管理能力。

### 交付物

- Skill 列表 + 详情 + 安装
- Session 列表 + 详情 + 操作
- Tools 目录查看
- Model 列表查看

### 具体任务

- [ ] Skill 列表页（从文件系统读取 skills/ + Gateway skills.bins）
- [ ] Skill 详情页（SKILL.md 渲染）
- [ ] Skill 安装功能
- [ ] Session 列表页
- [ ] Session 详情（对话历史浏览）
- [ ] Session 操作（重置、压缩）
- [ ] Tools 目录页（tools.catalog）
- [ ] Models 列表页（models.list）

## 5. Phase 4 — Workspace 管理 + 执行追踪

### 目标

完善 Workspace 文件管理体验，增加执行追踪能力。

### 交付物

- 完整的 Workspace 文件浏览器 + 编辑器
- 执行事件流实时展示
- 执行历史查询

### 具体任务

- [ ] Workspace 文件树浏览器
- [ ] 多 Workspace 切换
- [ ] 文件编辑器（Monaco + Markdown 预览）
- [ ] SQLite 初始化（Drizzle schema + migration）
- [ ] 执行记录持久化（server 端记录每次 chat.send → complete 的过程）
- [ ] 执行追踪页面（时间线视图）
- [ ] 执行历史列表 + 详情

## 6. Phase 5 — 项目模板 + Cron + Dashboard

### 目标

实现多 Agent 项目模板和系统总览。

### 交付物

- 项目模板定义与管理
- 从模板一键启动项目
- Cron 管理
- Dashboard 总览

### 具体任务

- [ ] 项目模板 CRUD（数据库存储）
- [ ] 模板编辑器（表单 + YAML 双模式）
- [ ] 项目实例启动流程（自动创建 Workspace + 发起执行）
- [ ] 项目实例列表 + 状态展示
- [ ] Cron 列表 + 创建 + 手动触发
- [ ] Dashboard 页面（连接状态、Agent 概览、事件流、数据图表）
- [ ] 系统设置页

## 7. Phase 6 — 打磨与增强（后续）

### 方向

- 记忆系统增强（偏好提炼、反馈循环）
- 执行反馈机制（满意/不满意 → 记忆写入）
- Agent 关系可视化（多 Agent 路由拓扑图）
- 项目模板市场（导入/导出/分享）
- 全局搜索（跨 Agent / Session / 执行 / 产物）
- 性能优化与体验打磨

## 8. 技术风险

| 风险 | 影响 | 应对 |
|------|------|------|
| Gateway Protocol 文档不完整 | Adapter 实现可能需要读源码 | 参考 OpenClaw Studio 的实现 |
| Gateway 方法参数不明确 | 接口对接困难 | 参考 `src/gateway/protocol/schema.ts` |
| WebSocket 连接不稳定 | 事件丢失、状态不一致 | 重连 + 心跳 + 错误重试 |
| Workspace 文件并发读写 | 与 OpenClaw 冲突 | 读取为主，写入时加文件锁 |
| OpenClaw 版本升级破坏兼容 | Adapter 需要适配 | 协议版本协商 + Adapter 隔离 |
