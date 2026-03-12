import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { staggerContainer, staggerItem } from '@/lib/motion'
import { Pencil, Trash2, Sun, Moon, Monitor } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { useThemeStore } from '@/stores/theme-store'
import type { Project, SystemStatus } from '@omnia/types'

type ProjectWithStatus = Project & { status: string }

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  connected: 'default',
  connecting: 'secondary',
  authenticating: 'secondary',
  disconnected: 'outline',
}

export function Settings() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)
  const currentProject = useProjectStore((s) => s.currentProject)
  const setCurrentProject = useProjectStore((s) => s.setCurrentProject)
  const [editingProject, setEditingProject] = useState(false)
  const [editingConnection, setEditingConnection] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  // Project name editing state
  const [projectName, setProjectName] = useState('')
  // Connection editing state
  const [gatewayUrl, setGatewayUrl] = useState('')
  const [token, setToken] = useState('')

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.get<ProjectWithStatus[]>('/api/projects'),
    refetchInterval: 3000,
  })

  const { data: status } = useQuery({
    queryKey: ['status'],
    queryFn: () => api.get<SystemStatus>('/api/status'),
    refetchInterval: 5000,
  })

  const currentWithStatus = projects.find((p) => p.id === currentProject?.id)

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['projects'] })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; gatewayUrl?: string; token?: string }) =>
      api.put(`/api/projects/${id}`, data),
    onSuccess: (_, vars) => {
      invalidate()
      if (currentProject && vars.name) {
        setCurrentProject({ ...currentProject, name: vars.name })
      }
      setEditingProject(false)
      setEditingConnection(false)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/projects/${id}`),
    onSuccess: () => {
      setDeleteConfirm(false)
      navigate('/', { replace: true })
    },
  })

  const reconnectMutation = useMutation({
    mutationFn: (id: string) => api.post(`/api/projects/${id}/activate`),
    onSuccess: invalidate,
  })

  return (
    <motion.div
      className="flex flex-col gap-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{t('settings.title')}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t('settings.subtitle')}
        </p>
      </div>

      {/* Project Settings */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('project.projectSettings')}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setProjectName(currentProject?.name ?? '')
                setEditingProject(true)
              }}
            >
              <Pencil className="mr-1 h-3.5 w-3.5" />
              {t('common.edit')}
            </Button>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('project.projectName')}</span>
                <span className="text-sm text-foreground">{currentProject?.name ?? '—'}</span>
              </div>
            </div>
            <div className="mt-6">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteConfirm(true)}
              >
                <Trash2 className="mr-1 h-3.5 w-3.5" />
                {t('project.deleteProject')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Current Connection */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('project.currentConnection')}</CardTitle>
            <div className="flex items-center gap-2">
              {currentWithStatus && (
                <Badge variant={statusVariant[currentWithStatus.status] ?? 'outline'}>
                  {t(`status.${currentWithStatus.status}`, currentWithStatus.status)}
                </Badge>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setGatewayUrl(currentProject?.gatewayUrl ?? '')
                  setToken('')
                  setEditingConnection(true)
                }}
              >
                <Pencil className="mr-1 h-3.5 w-3.5" />
                {t('common.edit')}
              </Button>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('settings.gatewayUrl')}</span>
                <span className="text-sm text-foreground">{currentProject?.gatewayUrl ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('settings.token')}</span>
                <span className="text-sm text-foreground">
                  {currentProject?.token ? '••••••••' : '—'}
                </span>
              </div>
            </div>
            {currentWithStatus?.status === 'disconnected' && (
              <div className="mt-4">
                <Button
                  size="sm"
                  onClick={() => currentProject && reconnectMutation.mutate(currentProject.id)}
                  disabled={reconnectMutation.isPending}
                >
                  {t('common.connect')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Theme */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.theme')}</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <p className="mb-4 text-sm text-muted-foreground">{t('settings.themeDesc')}</p>
            <div className="flex gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('light')}
              >
                <Sun className="mr-1 h-3.5 w-3.5" />
                {t('settings.light')}
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('dark')}
              >
                <Moon className="mr-1 h-3.5 w-3.5" />
                {t('settings.dark')}
              </Button>
              <Button
                variant={theme === 'system' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTheme('system')}
              >
                <Monitor className="mr-1 h-3.5 w-3.5" />
                {t('settings.system')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Language */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.language')}</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <p className="mb-4 text-sm text-muted-foreground">{t('settings.languageDesc')}</p>
            <div className="flex gap-2">
              <Button
                variant={i18n.language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => i18n.changeLanguage('en')}
              >
                English
              </Button>
              <Button
                variant={i18n.language === 'zh' ? 'default' : 'outline'}
                size="sm"
                onClick={() => i18n.changeLanguage('zh')}
              >
                中文
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* About */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.about')}</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('settings.version')}</span>
                <span className="text-sm text-foreground">0.0.1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t('settings.platform')}</span>
                <span className="text-sm text-foreground">{t('settings.platformValue')}</span>
              </div>
              {status && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{t('settings.serverUptime')}</span>
                  <span className="text-sm text-foreground">
                    {Math.floor(status.uptime)}s
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Edit Project Name Dialog */}
      <Dialog open={editingProject} onOpenChange={setEditingProject}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('project.editProject')}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (currentProject) {
                updateMutation.mutate({ id: currentProject.id, name: projectName })
              }
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{t('project.projectName')}</label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingProject(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? t('common.saving') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Connection Dialog */}
      <Dialog open={editingConnection} onOpenChange={setEditingConnection}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('settings.editConnection')}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (currentProject) {
                updateMutation.mutate({
                  id: currentProject.id,
                  gatewayUrl,
                  token: token || undefined,
                })
              }
            }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{t('settings.gatewayUrl')}</label>
              <Input
                value={gatewayUrl}
                onChange={(e) => setGatewayUrl(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{t('settings.token')}</label>
              <Input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder={t('settings.optional')}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingConnection(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? t('common.saving') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('project.deleteProject')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t('project.deleteConfirm')}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => currentProject && deleteMutation.mutate(currentProject.id)}
              disabled={deleteMutation.isPending}
            >
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
