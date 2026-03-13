export default {
  /* ── 通用 ──────────────────────────────────────── */
  common: {
    appName: 'Omnia Console',
    back: '返回',
    loading: '加载中...',
    loadFailed: '加载失败',
    unknownError: '未知错误，请刷新重试',
    noData: '暂无数据',
    empty: '—',
    create: '新建',
  },

  /* ── 侧边栏导航 ────────────────────────────────── */
  nav: {
    dashboard: 'Dashboard',
    agents: 'Agents',
    skills: 'Skills',
    tasks: 'Tasks',
    sessions: 'Sessions',
  },

  /* ── Dashboard ─────────────────────────────────── */
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Omnia Console — OpenClaw 控制面板',
  },

  /* ── Agents ────────────────────────────────────── */
  agents: {
    title: 'Agents',
    subtitle: '管理所有已接入的智能体，查看运行状态和来源信息。',
    create: '新建 Agent',
    empty: '暂无 Agent',
    emptyHint: '点击右上角"新建 Agent"开始创建',
    noModel: '— no model —',
    backToList: '返回 Agents',
    notFound: 'Agent 不存在或无法访问',

    /* 详情页字段 */
    basicInfo: '基本信息',
    fieldId: 'ID',
    fieldName: '名称',
    fieldEmoji: 'Emoji',
    fieldModel: 'Model',
    fieldWorkspace: 'Workspace',
    fieldSource: '来源',
    fieldSourceRef: '来源引用',
    fieldLastSync: '最近同步',
    fieldLastActive: '最近活跃',
    fieldCreatedAt: '创建时间',
    fieldUpdatedAt: '更新时间',

    /* Soul */
    soul: 'Soul',
    noSoul: '该 Agent 未配置 Soul。',

    /* 审计日志 */
    auditLogs: '审计日志',
    auditLogsEmpty: '暂无审计日志记录。',
    auditLogsLoadFailed: '加载日志失败',
    auditVia: '来源: {{source}}',

    /* 状态 */
    statusIdle: '空闲',
    statusRunning: '运行中',
    statusError: '错误',
    statusOffline: '离线',

    /* 来源 */
    sourceGateway: '网关',
    sourceLocal: '本地',
    sourceConfig: '配置',
  },

  /* ── Tasks ─────────────────────────────────────── */
  tasks: {
    title: 'Tasks',
    subtitle: '管理和监控所有智能体任务。',
    empty: '暂无任务',
    emptyHint: '当智能体开始工作后，任务将显示在这里。',
    columnQueued: '待处理',
    columnInProgress: '进行中',
    columnDone: '已完成',
    columnEmpty: '暂无任务',
    assignedTo: 'Agent: {{agent}}',

    /* 状态 */
    statusPending: '待处理',
    statusAssigned: '已分配',
    statusRunning: '运行中',
    statusCompleted: '已完成',
    statusFailed: '失败',
    statusCancelled: '已取消',
  },

  /* ── Skills ────────────────────────────────────── */
  skills: {
    title: 'Skills',
    subtitle: '所有已注册到系统的 Skill，供 Agent 在执行任务时调用。',
    empty: '暂无已注册的 Skill。',
    noDescription: '暂无描述',
    colName: '名称 / 描述',
    colSource: '来源',
    colUpdatedAt: '更新时间',
  },

  /* ── Sessions ──────────────────────────────────── */
  sessions: {
    title: 'Sessions',
    subtitle: '查看所有 Agent 会话记录，包括当前活跃和已关闭的会话。',
    empty: '暂无会话记录。',
    colId: 'Session ID',
    colAgentId: 'Agent ID',
    colStatus: '状态',
    colCreatedAt: '创建时间',
    colClosedAt: '关闭时间',

    /* 状态 */
    statusOpen: '进行中',
    statusClosed: '已关闭',
  },
} as const
