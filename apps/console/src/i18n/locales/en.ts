export default {
  /* ── Common ────────────────────────────────────── */
  common: {
    appName: "Omnia Console",
    back: "Back",
    loading: "Loading...",
    loadFailed: "Failed to load",
    unknownError: "Unknown error, please refresh",
    noData: "No data",
    empty: "—",
    create: "Create",
    toggleTheme: "Toggle theme",
  },

  /* ── Sidebar Navigation ────────────────────────── */
  nav: {
    dashboard: "Dashboard",
    agents: "Agents",
    skills: "Skills",
    tasks: "Tasks",
    sessions: "Sessions",
  },

  /* ── Dashboard ─────────────────────────────────── */
  dashboard: {
    title: "Dashboard",
    subtitle: "Omnia Console — OpenClaw Control Panel",
  },

  /* ── Agents ────────────────────────────────────── */
  agents: {
    title: "Agents",
    subtitle: "Manage all connected agents, view status and source information.",
    create: "New Agent",
    empty: "No agents",
    emptyHint: 'Click "New Agent" to get started',
    noModel: "— no model —",
    backToList: "Back to Agents",
    notFound: "Agent not found or inaccessible",

    basicInfo: "Basic Information",
    fieldId: "ID",
    fieldName: "Name",
    fieldEmoji: "Emoji",
    fieldModel: "Model",
    fieldWorkspace: "Workspace",
    fieldSource: "Source",
    fieldSourceRef: "Source Reference",
    fieldLastSync: "Last Sync",
    fieldLastActive: "Last Active",
    fieldCreatedAt: "Created At",
    fieldUpdatedAt: "Updated At",

    soul: "Soul",
    soulAriaLabel: "Agent Soul content",
    noSoul: "No Soul configured for this agent.",

    auditLogs: "Audit Logs",
    auditLogsEmpty: "No audit logs yet.",
    auditLogsLoadFailed: "Failed to load logs",
    auditVia: "via: {{source}}",

    statusIdle: "Idle",
    statusRunning: "Running",
    statusError: "Error",
    statusOffline: "Offline",

    sourceGateway: "Gateway",
    sourceLocal: "Local",
    sourceConfig: "Config",
  },

  /* ── Tasks ─────────────────────────────────────── */
  tasks: {
    title: "Tasks",
    subtitle: "Manage and monitor all agent tasks.",
    empty: "No tasks yet",
    emptyHint: "Tasks will appear here once agents start working.",
    columnQueued: "Queued",
    columnInProgress: "In Progress",
    columnDone: "Done",
    columnEmpty: "No tasks",
    assignedTo: "Agent: {{agent}}",

    statusPending: "Pending",
    statusAssigned: "Assigned",
    statusRunning: "Running",
    statusCompleted: "Completed",
    statusFailed: "Failed",
    statusCancelled: "Cancelled",
  },

  /* ── Skills ────────────────────────────────────── */
  skills: {
    title: "Skills",
    subtitle: "All registered skills available for agents during task execution.",
    empty: "No skills registered yet.",
    noDescription: "No description",
    colName: "Name / Description",
    colSource: "Source",
    colUpdatedAt: "Updated At",
    sourceLocal: "Local",
    sourceConfig: "Config",
    sourceGateway: "Gateway",
    sourceUser: "User",
    sourceSystem: "System",
  },

  /* ── Sessions ──────────────────────────────────── */
  sessions: {
    title: "Sessions",
    subtitle: "View all agent session records, including active and closed sessions.",
    empty: "No sessions found.",
    colId: "Session ID",
    colAgentId: "Agent ID",
    colStatus: "Status",
    colCreatedAt: "Created At",
    colClosedAt: "Closed At",

    statusOpen: "Open",
    statusClosed: "Closed",
  },
} as const
