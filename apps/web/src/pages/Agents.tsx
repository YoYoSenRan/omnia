import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Bot, Plus, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { Agent } from '@omnia/types'

const statusBadge: Record<string, string> = {
  idle: 'bg-muted-foreground/15 text-muted-foreground border-muted-foreground/30',
  running: 'bg-success/15 text-success border-success/30',
  error: 'bg-destructive/15 text-destructive border-destructive/30',
}

export function Agents() {
  const { data: agents, isLoading, error } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get<Agent[]>('/api/agents'),
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Agents</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your OpenClaw agents
          </p>
        </div>
        <Button>
          <Plus data-icon="inline-start" />
          New Agent
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="size-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      )}

      {error && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">
              Failed to load agents. Make sure the Gateway is connected.
            </p>
          </CardContent>
        </Card>
      )}

      {agents && agents.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20">
          <Bot size={40} className="text-muted-foreground" strokeWidth={1.2} />
          <p className="mt-4 text-sm text-muted-foreground">No agents yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Create your first agent to get started
          </p>
        </div>
      )}

      {agents && agents.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => (
            <Card
              key={agent.id}
              className="group transition-colors hover:border-muted-foreground/20"
            >
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
                      <Badge variant="outline" className={`mt-1 ${statusBadge[agent.status] ?? statusBadge.idle}`}>
                        {agent.status}
                      </Badge>
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
                        <DropdownMenuItem>
                          <Pencil data-icon="inline-start" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 data-icon="inline-start" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {agent.model && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Model: {agent.model}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
