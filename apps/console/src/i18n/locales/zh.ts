export default {
  /* ── 通用 ──────────────────────────────────────── */
  common: {
    appName: "Omnia Console",
    back: "返回",
    loading: "加载中...",
    loadFailed: "加载失败",
    unknownError: "未知错误，请刷新重试",
    noData: "暂无数据",
    empty: "—",
    create: "新建",
    toggleTheme: "切换主题",
  },

  /* ── 侧边栏导航 ────────────────────────────────── */
  nav: {
    dashboard: "仪表盘",
    agents: "智能体",
    skills: "技能",
    tasks: "任务",
    sessions: "会话",
  },

  /* ── Dashboard ─────────────────────────────────── */
  dashboard: {
    title: "仪表盘",
    subtitle: "Omnia Console — OpenClaw 控制面板",
  },

  /* ── Agents ────────────────────────────────────── */
  agents: {
    title: "智能体",
    subtitle: "管理所有已接入的智能体，查看运行状态和来源信息。",
    create: "新建智能体",
    empty: "暂无智能体",
    emptyHint: "点击右上角“新建智能体”开始创建",
    noModel: "暂无模型",
    backToList: "返回智能体列表",
    notFound: "智能体不存在或无法访问",

    /* 详情页字段 */
    basicInfo: "基本信息",
    fieldId: "ID",
    fieldName: "名称",
    fieldEmoji: "表情",
    fieldModel: "模型",
    fieldWorkspace: "工作区",
    fieldSource: "来源",
    fieldSourceRef: "来源引用",
    fieldLastSync: "最近同步",
    fieldLastActive: "最近活跃",
    fieldCreatedAt: "创建时间",
    fieldUpdatedAt: "更新时间",

    /* Soul */
    soul: "Soul 配置",
    soulAriaLabel: "智能体 Soul 内容",
    noSoul: "该智能体未配置 Soul。",

    /* 审计日志 */
    auditLogs: "审计日志",
    auditLogsEmpty: "暂无审计日志记录。",
    auditLogsLoadFailed: "加载日志失败",
    auditVia: "来源: {{source}}",

    /* 状态 */
    statusIdle: "空闲",
    statusRunning: "运行中",
    statusError: "错误",
    statusOffline: "离线",

    /* 来源 */
    sourceGateway: "网关",
    sourceLocal: "本地",
    sourceConfig: "配置",
  },

  /* ── Tasks ─────────────────────────────────────── */
  tasks: {
    title: "任务",
    subtitle: "管理和监控所有智能体任务。",
    empty: "暂无任务",
    emptyHint: "当智能体开始工作后，任务将显示在这里。",
    columnQueued: "待处理",
    columnInProgress: "进行中",
    columnDone: "已完成",
    columnEmpty: "暂无任务",
    assignedTo: "智能体：{{agent}}",

    /* 状态 */
    statusPending: "待处理",
    statusAssigned: "已分配",
    statusRunning: "运行中",
    statusCompleted: "已完成",
    statusFailed: "失败",
    statusCancelled: "已取消",
  },

  /* ── Skills ────────────────────────────────────── */
  skills: {
    title: "技能",
    subtitle: "所有已注册到系统的技能，供智能体在执行任务时调用。",
    empty: "暂无已注册技能。",
    noDescription: "暂无描述",
    colName: "名称 / 描述",
    colSource: "来源",
    colUpdatedAt: "更新时间",
    sourceLocal: "本地",
    sourceConfig: "配置",
    sourceGateway: "网关",
    sourceUser: "用户",
    sourceSystem: "系统",
  },

  /* ── Sessions ──────────────────────────────────── */
  sessions: {
    title: "会话",
    subtitle: "查看所有智能体会话记录，包括当前活跃和已关闭的会话。",
    empty: "暂无会话记录。",
    colId: "会话 ID",
    colAgentId: "智能体 ID",
    colStatus: "状态",
    colCreatedAt: "创建时间",
    colClosedAt: "关闭时间",

    /* 状态 */
    statusOpen: "进行中",
    statusClosed: "已关闭",
  },
} as const
