# 03 - OpenClaw 对接服务（apps/openclaw）

## 职责

Core 后端服务，所有 OpenClaw 相关能力的唯一入口。其他服务（server）通过它的 API 获取 agent 能力。

## 模块划分

```
apps/openclaw/src/
├── gateway/          # OpenClaw 网关连接
│   ├── client.ts     #   WebSocket 客户端
│   ├── protocol.ts   #   协议消息定义
│   └── manager.ts    #   多连接管理
├── sync/             # 数据同步
│   ├── agent-sync.ts #   Agent 同步（网关 + 磁盘 + 配置）
│   ├── skill-sync.ts #   Skill 同步
│   └── session-sync.ts # Session 同步
├── scheduler/        # 任务调度
│   ├── engine.ts     #   调度引擎
│   └── dispatch.ts   #   任务分派
├── events/           # 事件系统
│   ├── bus.ts        #   事件总线
│   └── sse.ts        #   SSE 推送路由
├── db/               # 数据库
│   ├── schema.ts     #   Drizzle schema 定义
│   ├── migrate.ts    #   迁移管理
│   └── index.ts      #   数据库连接
├── routes/           # HTTP 路由
│   ├── agents.ts     #   Agent API
│   ├── skills.ts     #   Skill API
│   ├── sessions.ts   #   Session API
│   ├── tasks.ts      #   Task API
│   └── system.ts     #   系统状态 API
├── lib/              # 工具函数
│   └── response.ts   #   统一响应格式
├── app.ts            # Hono 应用初始化
└── index.ts          # 入口
```

## 数据库（omnia_core）

### agents 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PK | Agent ID |
| name | TEXT | 名称 |
| emoji | TEXT | 图标 |
| model | TEXT | 模型 |
| workspace | TEXT | 工作目录 |
| status | TEXT | idle / running / error / offline |
| source | TEXT | gateway / local / config |
| source_ref | TEXT | 来源引用（连接 ID / 磁盘路径） |
| soul | TEXT | Soul 内容缓存 |
| config | TEXT | 额外配置 JSON |
| last_sync_at | TIMESTAMP | 最后同步时间 |
| last_active_at | TIMESTAMP | 最后活跃时间 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### skills 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PK | Skill ID |
| name | TEXT | 名称 |
| description | TEXT | 描述 |
| source | TEXT | 来源 |
| content_hash | TEXT | 内容哈希（增量同步） |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### tasks 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PK | Task ID |
| title | TEXT | 任务标题 |
| description | TEXT | 任务描述 |
| status | TEXT | pending / assigned / running / done / failed |
| assigned_to | TEXT | 分配给哪个 agent |
| result | TEXT | 执行结果 |
| parent_id | TEXT | 父任务 ID（任务拆解） |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |
| completed_at | TIMESTAMP | 完成时间 |

### audit_logs 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PK | 日志 ID |
| entity_type | TEXT | agent / skill / task / session |
| entity_id | TEXT | 实体 ID |
| action | TEXT | created / updated / deleted / synced |
| detail | JSONB | 详情 |
| source | TEXT | user / sync / gateway / scheduler |
| created_at | TIMESTAMP | 时间 |

### sessions 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | TEXT PK | Session ID |
| agent_id | TEXT | 关联 Agent |
| status | TEXT | active / closed |
| created_at | TIMESTAMP | 创建时间 |
| closed_at | TIMESTAMP | 关闭时间 |

## API 设计

### 内部 API（console 使用）

全功能 CRUD + 管理操作。

### 开放 API（server 使用）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/agents | Agent 列表及状态 |
| GET | /api/agents/:id | Agent 详情 |
| GET | /api/skills | Skill 列表 |
| POST | /api/tasks | 提交任务 |
| GET | /api/tasks/:id | 任务状态和结果 |
| POST | /api/agents/:id/run | 给 Agent 发消息执行 |
| GET | /api/sessions | 会话列表 |
| GET | /api/sessions/:id | 会话详情 |
| GET | /api/events/stream | SSE 事件订阅 |

### 统一响应格式

```json
// 成功
{ "ok": true, "code": 0, "msg": "success", "data": { ... } }

// 失败
{ "ok": false, "code": "ERROR_CODE", "msg": "error message", "data": null }
```

## 事件类型

通过 SSE 推送的事件：

| 事件 | 说明 |
|------|------|
| connection | 网关连接状态变更 |
| agent.synced | Agent 同步完成 |
| agent.status | Agent 状态变更 |
| task.created | 新任务创建 |
| task.updated | 任务状态更新 |
| task.completed | 任务完成 |
| session.created | 新会话 |
| session.message | 会话消息 |
