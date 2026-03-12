import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { useProjectStore } from '@/stores/project-store'
import { useConnectionStore } from '@/stores/connection-store'
import { AppShell } from './AppShell'
import type { Project, SystemStatus } from '@omnia/types'

export function ProjectShell() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const currentProject = useProjectStore((s) => s.currentProject)
  const setCurrentProject = useProjectStore((s) => s.setCurrentProject)
  const setStatus = useConnectionStore((s) => s.setStatus)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!projectId) {
      navigate('/', { replace: true })
      return
    }

    // Skip if already activated for this project
    if (currentProject?.id === projectId) {
      setReady(true)
      return
    }

    let cancelled = false

    async function activate() {
      try {
        // Fetch the project details first
        const projects = await api.get<Project[]>('/api/projects')
        if (cancelled) return

        const project = projects.find((p) => p.id === projectId)
        if (!project) {
          navigate('/', { replace: true })
          return
        }

        setCurrentProject(project)

        // Try to activate (connect gateway), but don't block on failure
        // Gateway being down is not fatal — UI will show disconnected status
        try {
          await api.post(`/api/projects/${projectId}/activate`)
        } catch {
          // Gateway connection failed, that's fine — continue with disconnected state
        }

        // Sync gateway status to connection store so Header shows correct state
        if (!cancelled) {
          try {
            const status = await api.get<SystemStatus>('/api/status')
            setStatus(status.gateway)
          } catch {
            // ignore
          }
          setReady(true)
        }
      } catch {
        // API itself is down — can't even list projects
        if (!cancelled) {
          navigate('/', { replace: true })
        }
      }
    }

    activate()
    return () => { cancelled = true }
  }, [projectId, currentProject?.id, navigate, setCurrentProject, setStatus])

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    )
  }

  return <AppShell />
}
