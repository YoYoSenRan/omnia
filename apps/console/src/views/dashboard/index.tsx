import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { Bot, Zap, ListTodo, MessageSquare, Plus } from "lucide-react"
import { useAgents } from "@/hooks/use-agents"
import { useSkills } from "@/hooks/use-skills"
import { useTasks } from "@/hooks/use-tasks"
import { useSessions } from "@/hooks/use-sessions"
import { Button } from "@/components/ui/button"
import { StatCard } from "./components/stat-card"
import { SystemStatus } from "./components/system-status"
import { ActivityFeed } from "./components/activity-feed"
import { AgentOverview } from "./components/agent-overview"
import { TaskDistribution } from "./components/task-distribution"

export function Dashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: agents } = useAgents()
  const { data: skills } = useSkills()
  const { data: tasks } = useTasks()
  const { data: sessions } = useSessions()

  const onlineAgents = agents?.filter((a) => a.status === "running" || a.status === "idle").length ?? 0
  const activeTasks = tasks?.filter((t) => t.status === "running" || t.status === "assigned").length ?? 0
  const openSessions = sessions?.filter((s) => s.status === "open").length ?? 0

  return (
    <div className="space-y-6">
      {/* 标题行 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("dashboard.title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("dashboard.subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate("/agents")}>
            <Plus className="mr-1.5 size-3.5" />
            {t("dashboard.createAgent")}
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Bot className="size-4" />}
          title={t("dashboard.statAgents")}
          value={onlineAgents}
          subtitle={`${t("dashboard.total")} ${agents?.length ?? 0}`}
        />
        <StatCard
          icon={<Zap className="size-4" />}
          title={t("dashboard.statSkills")}
          value={skills?.length ?? 0}
        />
        <StatCard
          icon={<ListTodo className="size-4" />}
          title={t("dashboard.statTasks")}
          value={activeTasks}
          subtitle={`${t("dashboard.total")} ${tasks?.length ?? 0}`}
        />
        <StatCard
          icon={<MessageSquare className="size-4" />}
          title={t("dashboard.statSessions")}
          value={openSessions}
          subtitle={`${t("dashboard.total")} ${sessions?.length ?? 0}`}
        />
      </div>

      {/* 系统状态 */}
      <SystemStatus />

      {/* 左右分栏 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ActivityFeed />
        </div>
        <div className="space-y-6 lg:col-span-5">
          <AgentOverview />
          <TaskDistribution />
        </div>
      </div>
    </div>
  )
}
