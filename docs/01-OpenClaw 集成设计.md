# OpenClaw 集成设计

## 1. 集成目标

Omnia 通过 WebSocket 连接本地运行的 OpenClaw Gateway，代理其全部管理能力并以 Web UI 形式呈现。Omnia 不直接操作 OpenClaw 文件系统或数据库，所有交互通过 Gateway Protocol 完成。

## 2. 连接架构

```
浏览器 ←─ HTTP/SSE ──→ Omnia Server ←─ WebSocket ──→ OpenClaw Gateway
                        (代理层)                       (ws://localhost:18789)
```

采用 Server-Owned 架构（与 OpenClaw Studio 一致）：

- 浏览器不直连 Gateway
- Omnia Server 持有唯一的 WebSocket 连接
- 前端通过 HTTP API 发起操作，通过 SSE 接收实时事件流
- Omnia Server 负责协议转换、事件归一化和连接管理

## 3. Gateway Protocol 概要

### 3.1 连接握手

1. 建立 WebSocket 连接到 `ws://localhost:18789`
2. 发送 `connect` 请求（首帧必须）
3. 收到 `connect.challenge`，签名 nonce 完成认证
4. 认证通过后进入就绪状态

### 3.2 帧格式

三种帧类型，以 `type` 字段区分：

```typescript
// 请求
{ type: "req", id: string, method: string, params?: unknown }

// 响应
{ type: "res", id: string, ok: boolean, payload?: unknown, error?: ErrorShape }

// 事件广播
{ type: "event", event: string, payload?: unknown, seq?: number, stateVersion?: StateVersion }
```

### 3.3 协议参数

| 参数 | 值 |
|------|------|
| 协议版本 | v3 |
| 最大帧大小 | 25 MB |
| 最大发送缓冲 | 50 MB |
| 握手超时 | 10 秒 |
| 心跳间隔 | 30 秒 |
| 健康刷新 | 60 秒 |

## 4. Omnia 使用的 Gateway 方法

### 4.1 Agent 管理

| 方法 | 用途 |
|------|------|
| `agents.list` | 获取所有 Agent 列表 |
| `agents.create` | 创建新 Agent |
| `agents.update` | 更新 Agent 配置 |
| `agents.delete` | 删除 Agent |

### 4.2 Chat / 执行

| 方法 | 用途 |
|------|------|
| `chat.send` | 向 Agent 发送消息 / 发起执行 |
| `chat.abort` | 中止当前执行 |
| `chat.history` | 获取聊天历史 |

### 4.3 Session 管理

| 方法 | 用途 |
|------|------|
| `sessions.list` | 获取所有 Session |
| `sessions.preview` | 预览 Session 内容 |
| `sessions.reset` | 重置 Session |
| `sessions.compact` | 压缩 Session |

### 4.4 Tools

| 方法 | 用途 |
|------|------|
| `tools.catalog` | 获取运行时工具目录（按分组、来源） |

### 4.5 Skills

| 方法 | 用途 |
|------|------|
| `skills.install` | 安装 Skill |
| `skills.update` | 更新 Skill |
| `skills.bins` | 获取 Skill 执行文件（用于 auto-allow 检查） |

### 4.6 Models

| 方法 | 用途 |
|------|------|
| `models.list` | 获取可用模型列表 |

### 4.7 定时任务

| 方法 | 用途 |
|------|------|
| `cron.list` | 列出定时任务 |
| `cron.add` | 添加定时任务 |
| `cron.run` | 立即触发定时任务 |

### 4.8 系统

| 方法 | 用途 |
|------|------|
| `channels.status` | 获取 Channel 状态 |
| `system-presence` | 获取设备在线状态 |

## 5. 事件流

Gateway 通过 event 帧广播实时事件，Omnia 需要监听的关键事件：

| 事件 | 说明 |
|------|------|
| `chat.stream` | Agent 回复流（逐 token） |
| `chat.tool.call` | 工具调用开始 |
| `chat.tool.result` | 工具调用结果 |
| `chat.complete` | 回复完成 |
| `chat.error` | 执行错误 |
| `exec.approval.requested` | 需要人工审批的操作 |
| `session.updated` | Session 状态变化 |
| `agent.updated` | Agent 配置变化 |

## 6. Adapter 层设计

Omnia Server 中的 `openclaw-adapter` 模块封装所有 Gateway 通信。

### 6.1 职责

- 管理 WebSocket 连接生命周期（连接、重连、心跳）
- 封装 Gateway Protocol 帧的编解码
- 处理认证握手和 challenge 签名
- 将 Gateway 原始事件转换为 Omnia 内部事件格式
- 向业务层暴露语义化调用接口
- 管理请求 ID 与响应的映射

### 6.2 对上层暴露的接口

```typescript
interface OpenClawAdapter {
  // 连接管理
  connect(): Promise<void>
  disconnect(): void
  isConnected(): boolean
  onConnectionChange(cb: (connected: boolean) => void): void

  // Agent
  listAgents(): Promise<Agent[]>
  createAgent(config: AgentConfig): Promise<Agent>
  updateAgent(id: string, config: Partial<AgentConfig>): Promise<Agent>
  deleteAgent(id: string): Promise<void>

  // Chat
  sendMessage(agentId: string, message: string): Promise<void>
  abortChat(agentId: string): Promise<void>
  getChatHistory(sessionId: string): Promise<ChatMessage[]>

  // Session
  listSessions(): Promise<Session[]>
  resetSession(sessionId: string): Promise<void>
  compactSession(sessionId: string): Promise<void>

  // Tools & Skills
  getToolsCatalog(): Promise<ToolGroup[]>
  installSkill(url: string): Promise<void>
  updateSkill(name: string): Promise<void>

  // Models
  listModels(): Promise<Model[]>

  // Cron
  listCronJobs(): Promise<CronJob[]>
  addCronJob(config: CronConfig): Promise<CronJob>
  runCronJob(id: string): Promise<void>

  // 事件订阅
  on(event: string, handler: (payload: unknown) => void): void
  off(event: string, handler: (payload: unknown) => void): void
}
```

### 6.3 不负责的内容

- 不做业务逻辑判断（项目模板、编排决策）
- 不直接持久化数据
- 不向前端暴露 Gateway 协议细节

## 7. Workspace 文件访问

Omnia 需要读写 OpenClaw Workspace 中的配置文件（AGENTS.md、SOUL.md 等）。

### 7.1 访问方式

优先通过 Gateway 协议提供的方法操作。若 Gateway 无对应方法，Omnia Server 直接读写文件系统（因为两者运行在同一台机器上）。

### 7.2 访问的文件

| 文件 | 操作 | 说明 |
|------|------|------|
| `~/.openclaw/openclaw.json` | 读 | 获取 Gateway 配置、Agent 路由映射 |
| `workspace/AGENTS.md` | 读写 | Agent 行为指令编辑 |
| `workspace/SOUL.md` | 读写 | Agent 身份/人格编辑 |
| `workspace/USER.md` | 读写 | 用户偏好编辑 |
| `workspace/IDENTITY.md` | 读写 | Agent 名称/风格编辑 |
| `workspace/TOOLS.md` | 读写 | 工具说明编辑 |
| `workspace/MEMORY.md` | 读 | 查看长期记忆 |
| `workspace/memory/` | 读 | 查看记忆日志 |
| `workspace/skills/` | 读 | 查看已安装 Skill |

## 8. 连接状态管理

### 8.1 连接状态

```
disconnected → connecting → authenticating → connected → disconnected
```

### 8.2 重连策略

- 连接断开后自动重连
- 指数退避：1s → 2s → 4s → 8s → 最大 30s
- 前端展示连接状态指示器

### 8.3 健康检查

- 每 30 秒发送心跳
- 超过 2 次心跳未响应判定为断连
- Gateway 健康状态通过 `system-presence` 事件感知

## 9. 审批代理

OpenClaw 的工具执行审批（`exec.approval.requested`）通过 Omnia UI 呈现：

1. Gateway 广播 `exec.approval.requested` 事件
2. Omnia Server 转发到前端
3. 前端展示审批弹窗（操作详情 + 风险提示）
4. 用户批准/拒绝
5. Omnia Server 调用 `exec.approval.resolve` 回传结果

## 10. 协议版本兼容

- Omnia 在连接时通过 `minProtocol` / `maxProtocol` 声明支持的协议范围
- 当前目标：Protocol v3
- Gateway 协议升级时，仅需修改 Adapter 层
