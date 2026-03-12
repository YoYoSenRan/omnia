import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '@/api/client'
import { useProjectStore } from '@/stores/project-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Project } from '@omnia/types'

export function Welcome() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setCurrentProject = useProjectStore((s) => s.setCurrentProject)
  const [name, setName] = useState('')
  const [gatewayUrl, setGatewayUrl] = useState('ws://localhost:18789')
  const [token, setToken] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !gatewayUrl.trim()) return

    setSubmitting(true)
    setError('')

    try {
      const project = await api.post<Project>('/api/projects', {
        name: name.trim(),
        gatewayUrl: gatewayUrl.trim(),
        token: token.trim() || undefined,
      })

      // Activate the project (connects + sets last active)
      await api.post(`/api/projects/${project.id}/activate`)
      setCurrentProject({ ...project, isLastActive: true })
      navigate(`/p/${project.id}`, { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t('project.welcome')}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('project.welcomeDesc')}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{t('project.projectName')}</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('project.projectNamePlaceholder')}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">{t('project.gatewayUrl')}</label>
              <Input
                value={gatewayUrl}
                onChange={(e) => setGatewayUrl(e.target.value)}
                placeholder="ws://localhost:18789"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">
                {t('project.token')}{' '}
                <span className="text-muted-foreground">({t('project.optional')})</span>
              </label>
              <Input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" disabled={submitting || !name.trim() || !gatewayUrl.trim()}>
              {submitting ? t('project.creating') : t('project.createProject')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
