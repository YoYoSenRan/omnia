import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Layout } from "@/layouts"
import { Dashboard } from "@/views/dashboard"
import { AgentsView } from "@/views/agents"
import { AgentDetailView } from "@/views/agents/detail"
import { Skills } from "@/views/skills"
import { Tasks } from "@/views/tasks"
import { Sessions } from "@/views/sessions"

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="agents" element={<AgentsView />} />
          <Route path="agents/:agentId" element={<AgentDetailView />} />
          <Route path="skills" element={<Skills />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="sessions" element={<Sessions />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
