import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { FolderOpen, FileText } from 'lucide-react'
import { useState } from 'react'

type WorkspaceFiles = Record<string, string | null>

const FILE_DESCRIPTIONS: Record<string, string> = {
  'AGENTS.md': 'Agent definitions and configurations',
  'SOUL.md': 'Core personality and behavior directives',
  'USER.md': 'User preferences and context',
  'IDENTITY.md': 'Agent identity and introduction',
  'TOOLS.md': 'Tool configurations and permissions',
  'MEMORY.md': 'Accumulated knowledge and memory',
}

export function Workspace() {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  const { data: files, isLoading, error } = useQuery({
    queryKey: ['workspace', 'files'],
    queryFn: () => api.get<WorkspaceFiles>('/api/workspace/files'),
  })

  const fileNames = files ? Object.keys(files) : []
  const activeContent = selectedFile && files ? files[selectedFile] : null

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Workspace</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View and manage OpenClaw workspace files
        </p>
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
              <p className="text-sm text-destructive">Failed to load workspace files.</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {files && (
        <div className="flex gap-4">
          {/* File list */}
          <motion.div
            className="flex w-64 flex-col gap-1"
            initial="initial"
            animate="animate"
            variants={{ animate: { transition: { staggerChildren: 0.03 } } }}
          >
            {fileNames.map((name) => (
              <motion.button
                key={name}
                variants={{
                  initial: { opacity: 0, x: -12 },
                  animate: { opacity: 1, x: 0 },
                }}
                onClick={() => setSelectedFile(name)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                  selectedFile === name
                    ? 'bg-accent text-foreground'
                    : 'text-muted-foreground hover:bg-accent'
                )}
              >
                <FileText size={16} strokeWidth={1.8} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {files[name] === null ? 'Not found' : FILE_DESCRIPTIONS[name] ?? ''}
                  </p>
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* Content viewer */}
          <Card className="flex-1">
            <AnimatePresence mode="wait">
              {!selectedFile && (
                <motion.div
                  key="empty"
                  className="flex flex-col items-center justify-center py-20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <FolderOpen size={40} className="text-muted-foreground" strokeWidth={1.2} />
                  <p className="mt-4 text-sm text-muted-foreground">
                    Select a file to view its contents
                  </p>
                </motion.div>
              )}
              {selectedFile && activeContent === null && (
                <motion.div
                  key="not-found"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">File not found in workspace</p>
                  </CardContent>
                </motion.div>
              )}
              {selectedFile && activeContent !== null && activeContent !== undefined && (
                <motion.div
                  key={selectedFile}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <CardHeader>
                    <CardTitle className="text-sm">{selectedFile}</CardTitle>
                  </CardHeader>
                  <Separator />
                  <CardContent className="pt-4">
                    <ScrollArea className="h-[calc(100vh-20rem)]">
                      <pre className="whitespace-pre-wrap text-xs leading-relaxed text-muted-foreground">
                        {activeContent}
                      </pre>
                    </ScrollArea>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      )}
    </div>
  )
}
