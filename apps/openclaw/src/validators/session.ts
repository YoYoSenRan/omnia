import { z } from "zod"

export const SessionCreateSchema = z.object({
  id: z.string().optional(),
  agentId: z.string().min(1),
  metadata: z.unknown().optional(),
})

export type SessionCreateInput = z.infer<typeof SessionCreateSchema>
