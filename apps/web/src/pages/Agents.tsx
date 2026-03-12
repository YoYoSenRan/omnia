import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Bot, Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { staggerContainer, staggerItem, cardHover } from '@/lib/motion'
import type { Agent, AgentsListResponse } from '@omnia/types'

const statusBadge: Record<string, string> = {
  idle: 'bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30',
  running: 'bg-success/15 text-success border-success/30',
  error: 'bg-destructive/15 text-destructive border-destructive/30',
}

export function Agents() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [formOpen, setFormOpen] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Agent | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')
  const [model, setModel] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get<AgentsListResponse>('/api/agents'),
  })
  const agents = data?.agents

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['agents'] })

  const createMutation = useMutation({
    mutationFn: (params: { name: string; emoji?: string; model?: string }) =>
      api.post('/api/agents', params),
    onSuccess: () => {
      invalidate()
      closeForm()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...params }: { id: string; name?: string; emoji?: string; model?: string }) =>
      api.put(`/api/agents/${id}`, params),
    onSuccess: () => {
      invalidate()
      closeForm()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/agents/${id}`),
    onSuccess: () => {
      invalidate()
      setDeleteTarget(null)
    },
  })

  const saveMutation = editingAgent ? updateMutation : createMutation

  function openCreate() {
    setEditingAgent(null)
    setName('')
    setEmoji('')
    setModel('')
    setFormOpen(true)
  }

  function openEdit(agent: Agent) {
    setEditingAgent(agent)
    setName(agent.name)
    setEmoji(agent.emoji ?? '')
    setModel(agent.model ?? '')
    setFormOpen(true)
  }

  function closeForm() {
    setFormOpen(false)
    setEditingAgent(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = {
      name,
      emoji: emoji || undefined,
      model: model || undefined,
    }
    if (editingAgent) {
      updateMutation.mutate({ id: editingAgent.id, ...params })
    } else {
      createMutation.mutate(params)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t('agents.title')}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('agents.subtitle')}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus data-icon="inline-start" />
          {t('agents.newAgent')}
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="size-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      )}

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">
                {t('agents.loadError')}
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {agents && agents.length === 0 && (
        <motion.div
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Bot size={40} className="text-muted-foreground" strokeWidth={1.2} />
          <p className="mt-4 text-sm text-muted-foreground">{t('agents.empty')}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('agents.emptyDesc')}
          </p>
        </motion.div>
      )}

      {agents && agents.length > 0 && (
        <motion.div
          className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {agents.map((agent) => (
            <motion.div key={agent.id} variants={staggerItem} {...cardHover}>
              <Card className="group transition-colors hover:border-muted-foreground/20">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-10 rounded-lg">
                        <AvatarFallback className="rounded-lg bg-primary/10 text-lg">
                          {agent.emoji ?? '🤖'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-sm font-medium text-foreground">{agent.name}</h3>
                        {agent.status && (
                          <Badge variant="outline" className={`mt-1 ${statusBadge[agent.status] ?? statusBadge.idle}`}>
                            {agent.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="opacity-0 group-hover:opacity-100"
                        >
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem onClick={() => openEdit(agent)}>
                            <Pencil data-icon="inline-start" />
                            {t('common.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteTarget(agent)}
                          >
                            <Trash2 data-icon="inline-start" />
                            {t('common.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {agent.model && (
                    <p className="mt-3 text-xs text-muted-foreground">
                      {t('agents.model', { model: agent.model })}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) closeForm() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAgent ? t('agents.editAgent') : t('agents.newAgent')}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{t('agents.name')}</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('agents.namePlaceholder')}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{t('agents.emoji')}</label>
              <Input
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder={t('agents.emojiPlaceholder')}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{t('agents.model', { model: '' }).replace(': ', '')}</label>
              <Input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. gpt-4o"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeForm}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? t('common.saving') : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('agents.deleteAgent')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t('agents.deleteConfirm', { name: deleteTarget?.name })}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {t('common.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {t('common.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
