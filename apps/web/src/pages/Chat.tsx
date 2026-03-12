import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Send, StopCircle, Bot, User } from 'lucide-react'
import type { Agent, ChatMessage } from '@omnia/types'

export function Chat() {
  const queryClient = useQueryClient()
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: agents } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get<Agent[]>('/api/agents'),
  })

  const selectedAgentData = agents?.find((a) => a.id === selectedAgent)

  const sendMutation = useMutation({
    mutationFn: (message: string) =>
      api.post<{ sessionId: string }>('/api/chat/send', {
        agentId: selectedAgent,
        message,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  const handleSend = () => {
    if (!input.trim() || !selectedAgent) return

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, userMessage])
    sendMutation.mutate(input)
    setInput('')
  }

  return (
    <div className="flex h-full gap-4">
      {/* Agent selector sidebar */}
      <div className="flex w-56 flex-col gap-1">
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Select Agent
        </p>
        {agents?.map((agent) => (
          <button
            key={agent.id}
            onClick={() => {
              setSelectedAgent(agent.id)
              setMessages([])
            }}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
              selectedAgent === agent.id
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:bg-accent'
            )}
          >
            <span>{agent.emoji ?? '🤖'}</span>
            <span className="truncate">{agent.name}</span>
          </button>
        ))}
        {(!agents || agents.length === 0) && (
          <p className="px-3 text-xs text-muted-foreground">No agents available</p>
        )}
      </div>

      {/* Chat area */}
      <Card className="flex flex-1 flex-col overflow-hidden">
        {!selectedAgent ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Select an agent to start chatting
            </p>
          </div>
        ) : (
          <>
            {/* Agent header */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg bg-primary/10">
                  {selectedAgentData?.emoji ?? '🤖'}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-foreground">
                {selectedAgentData?.name ?? 'Agent'}
              </span>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="flex flex-col gap-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center justify-center pt-20">
                    <Bot size={32} className="text-muted-foreground" strokeWidth={1.2} />
                    <p className="mt-3 text-sm text-muted-foreground">
                      Start a conversation
                    </p>
                  </div>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn('flex gap-3', msg.role === 'user' && 'justify-end')}
                  >
                    {msg.role !== 'user' && (
                      <Avatar className="size-7 rounded-lg">
                        <AvatarFallback className="rounded-lg bg-primary/10 text-xs">
                          <Bot size={14} className="text-primary" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div
                      className={cn(
                        'max-w-[70%] rounded-xl px-4 py-2.5 text-sm',
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      )}
                    >
                      {msg.content}
                    </div>
                    {msg.role === 'user' && (
                      <Avatar className="size-7 rounded-lg">
                        <AvatarFallback className="rounded-lg">
                          <User size={14} className="text-muted-foreground" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="border-t border-border p-4">
              <div className="flex items-center gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="Type a message..."
                />
                {sendMutation.isPending ? (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => api.post('/api/chat/abort', { agentId: selectedAgent })}
                  >
                    <StopCircle />
                  </Button>
                ) : (
                  <Button size="icon" onClick={handleSend} disabled={!input.trim()}>
                    <Send />
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
