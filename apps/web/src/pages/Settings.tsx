import { useState } from 'react'
import { motion } from 'framer-motion'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { staggerContainer, staggerItem } from '@/lib/motion'
import { Plus, MoreHorizontal, Pencil, Trash2, Power, PowerOff, Star } from 'lucide-react'
import type { ConnectionProfile, SystemStatus } from '@omnia/types'

type ConnectionWithStatus = ConnectionProfile & {
  status: string
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  connected: 'default',
  connecting: 'secondary',
  authenticating: 'secondary',
  disconnected: 'outline',
}

function ConnectionForm({
  initial,
  onSubmit,
  onCancel,
  loading,
}: {
  initial?: { name: string; gatewayUrl: string; token?: string }
  onSubmit: (data: { name: string; gatewayUrl: string; token?: string }) => void
  onCancel: () => void
  loading: boolean
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [gatewayUrl, setGatewayUrl] = useState(initial?.gatewayUrl ?? 'ws://localhost:18789')
  const [token, setToken] = useState(initial?.token ?? '')

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit({ name, gatewayUrl, token: token || undefined })
      }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Local Dev"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">Gateway URL</label>
        <Input
          value={gatewayUrl}
          onChange={(e) => setGatewayUrl(e.target.value)}
          placeholder="ws://localhost:18789"
          required
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">Token</label>
        <Input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Optional"
        />
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function Settings() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ConnectionWithStatus | null>(null)

  const { data: connections = [] } = useQuery({
    queryKey: ['connections'],
    queryFn: () => api.get<ConnectionWithStatus[]>('/api/connections'),
    refetchInterval: 3000,
  })

  const { data: status } = useQuery({
    queryKey: ['status'],
    queryFn: () => api.get<SystemStatus>('/api/status'),
    refetchInterval: 5000,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['connections'] })

  const createMutation = useMutation({
    mutationFn: (data: { name: string; gatewayUrl: string; token?: string }) =>
      api.post('/api/connections', data),
    onSuccess: () => { invalidate(); setDialogOpen(false) },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; gatewayUrl?: string; token?: string }) =>
      api.put(`/api/connections/${id}`, data),
    onSuccess: () => { invalidate(); setEditing(null) },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/connections/${id}`),
    onSuccess: invalidate,
  })

  const connectMutation = useMutation({
    mutationFn: (id: string) => api.post(`/api/connections/${id}/connect`),
    onSuccess: invalidate,
  })

  const disconnectMutation = useMutation({
    mutationFn: (id: string) => api.post(`/api/connections/${id}/disconnect`),
    onSuccess: invalidate,
  })

  const activateMutation = useMutation({
    mutationFn: (id: string) => api.post(`/api/connections/${id}/activate`),
    onSuccess: invalidate,
  })

  return (
    <motion.div
      className="flex flex-col gap-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage gateway connections and system configuration
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} size="sm">
          <Plus className="mr-1.5 h-4 w-4" />
          Add Connection
        </Button>
      </div>

      {/* Connection list */}
      <motion.div variants={staggerItem} className="flex flex-col gap-3">
        {connections.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No connections configured. Add one to get started.
            </CardContent>
          </Card>
        )}
        {connections.map((conn) => (
          <Card
            key={conn.id}
            className={conn.isActive ? 'ring-1 ring-primary/50' : undefined}
          >
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{conn.name}</span>
                  {conn.isActive && (
                    <Badge variant="default" className="text-[10px]">Active</Badge>
                  )}
                  <Badge variant={statusVariant[conn.status] ?? 'outline'}>
                    {conn.status}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">{conn.gatewayUrl}</span>
              </div>

              <div className="flex items-center gap-2">
                {conn.status === 'disconnected' ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => connectMutation.mutate(conn.id)}
                    disabled={connectMutation.isPending}
                  >
                    <Power className="mr-1 h-3.5 w-3.5" />
                    Connect
                  </Button>
                ) : conn.status === 'connected' ? (
                  <>
                    {!conn.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => activateMutation.mutate(conn.id)}
                        disabled={activateMutation.isPending}
                      >
                        <Star className="mr-1 h-3.5 w-3.5" />
                        Activate
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => disconnectMutation.mutate(conn.id)}
                      disabled={disconnectMutation.isPending}
                    >
                      <PowerOff className="mr-1 h-3.5 w-3.5" />
                      Disconnect
                    </Button>
                  </>
                ) : null}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditing(conn)}>
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteMutation.mutate(conn.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-3.5 w-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* About */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Version</span>
                <span className="text-sm text-foreground">0.0.1</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Platform</span>
                <span className="text-sm text-foreground">OpenClaw Web Console</span>
              </div>
              {status && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Server Uptime</span>
                  <span className="text-sm text-foreground">
                    {Math.floor(status.uptime)}s
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Connection</DialogTitle>
          </DialogHeader>
          <ConnectionForm
            onSubmit={(data) => createMutation.mutate(data)}
            onCancel={() => setDialogOpen(false)}
            loading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editing} onOpenChange={(open) => { if (!open) setEditing(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Connection</DialogTitle>
          </DialogHeader>
          {editing && (
            <ConnectionForm
              initial={{
                name: editing.name,
                gatewayUrl: editing.gatewayUrl,
              }}
              onSubmit={(data) => updateMutation.mutate({ id: editing.id, ...data })}
              onCancel={() => setEditing(null)}
              loading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
