import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/api/client'
import { useProjectStore } from '@/stores/project-store'
import type { Project } from '@omnia/types'

export function ProjectGate() {
  const navigate = useNavigate()
  const setProjects = useProjectStore((s) => s.setProjects)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const projects = await api.get<Project[]>('/api/projects')
        if (cancelled) return

        setProjects(projects)

        if (projects.length === 0) {
          navigate('/welcome', { replace: true })
          return
        }

        // Find last active project, or fall back to first
        const lastActive = projects.find((p) => p.isLastActive) ?? projects[0]
        navigate(`/p/${lastActive.id}`, { replace: true })
      } catch {
        // If API fails, go to welcome
        if (!cancelled) {
          navigate('/welcome', { replace: true })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [navigate, setProjects])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    )
  }

  return null
}
