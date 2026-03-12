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
import { Puzzle, Download, MoreHorizontal, RefreshCw, Trash2 } from 'lucide-react'
import type { Skill } from '@omnia/types'

export function Skills() {
  const { data: skills, isLoading, error } = useQuery({
    queryKey: ['skills'],
    queryFn: () => api.get<Skill[]>('/api/skills'),
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Skills</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse and manage installed skills
          </p>
        </div>
        <Button>
          <Download data-icon="inline-start" />
          Install Skill
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
            <p className="text-sm text-destructive">Failed to load skills.</p>
          </CardContent>
        </Card>
      )}

      {skills && skills.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20">
          <Puzzle size={40} className="text-muted-foreground" strokeWidth={1.2} />
          <p className="mt-4 text-sm text-muted-foreground">No skills installed</p>
        </div>
      )}

      {skills && skills.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {skills.map((skill) => (
            <Card
              key={skill.name}
              className="group transition-colors hover:border-muted-foreground/20"
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">{skill.name}</h3>
                    {skill.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {skill.description}
                      </p>
                    )}
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
                          <RefreshCw data-icon="inline-start" />
                          Update
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 data-icon="inline-start" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge variant="secondary">{skill.source}</Badge>
                  {skill.version && (
                    <span className="text-xs text-muted-foreground">v{skill.version}</span>
                  )}
                  <span className={`ml-auto size-1.5 rounded-full ${skill.enabled ? 'bg-success' : 'bg-muted-foreground'}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
