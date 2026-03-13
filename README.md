# Omnia

基于 OpenClaw 的智能体编排平台。Core 层对接 OpenClaw 网关，提供 agent 同步、任务调度、事件推送等基础能力；业务层在此之上构建垂直应用。

## 架构

```
console ──→ openclaw
web ──→ server ──→ openclaw
                      │
                      ↓ WebSocket
               OpenClaw Gateway
```

| 应用 | 类型 | 端口 | 职责 |
|------|------|------|------|
| `openclaw` | 后端服务 | 3001 | 网关连接、agent/skill 同步、任务调度、事件总线 |
| `console` | 前端 | 5173 | 网关状态、agent 管理、skill 管理、会话监控 |
| `server` | 后端服务 | 3002 | 垂直业务 API，通过 openclaw 调度 agent |
| `web` | 前端 | 5174 | 垂直业务 UI，任务流程与产出展示 |

## 技术栈

- **前端**：React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Zustand + TanStack Query
- **后端**：Node.js + TypeScript + Hono + PostgreSQL + Drizzle ORM
- **实时通信**：SSE
- **包管理**：pnpm workspace

## 项目结构

```
apps/
├── console/     # 控制台前端
├── openclaw/    # OpenClaw 对接服务
├── web/         # 业务前端
└── server/      # 业务后端
```

## 开发

```bash
pnpm install
pnpm dev          # 启动所有应用
pnpm dev:core     # 只启动 openclaw + console
pnpm dev:app      # 只启动 server + web
```

## 文档

详细设计文档见 [docs/](./docs/) 目录：

- [架构总览](./docs/01-架构总览.md)
- [技术栈](./docs/02-技术栈.md)
- [OpenClaw 对接服务](./docs/03-OpenClaw对接服务.md)
- [控制台前端](./docs/04-控制台前端.md)
- [业务后端与前端](./docs/05-业务后端与前端.md)
- [项目规范与工程化](./docs/06-项目规范与工程化.md)
- [实施阶段](./docs/07-实施阶段.md)
- [代码注释规范](./docs/08-代码注释规范.md)
- [接口规范](./docs/09-接口规范.md)
- [开发环境](./docs/10-开发环境.md)
- [服务间通信与鉴权](./docs/11-服务间通信与鉴权.md)
- [日志规范](./docs/12-日志规范.md)
- [测试策略](./docs/13-测试策略.md)
- [错误处理](./docs/14-错误处理.md)

## 演进规划

当前阶段为 monorepo 开发模式。后续 `openclaw` + `console` 将抽离为独立 npm 包，业务项目可通过依赖引入复用核心能力。
