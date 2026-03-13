import { z } from "zod"

export const AgentCreateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  emoji: z.string().nullish(),
  role: z.enum(["agent", "coordinator", "reviewer"]).nullish(),
  model: z.string().nullish(),
  workspace: z.string().nullish(),
  source: z.enum(["gateway", "local", "config"]).optional(),
  sourceRef: z.string().nullish(),
  soul: z.string().nullish(),
  config: z.unknown().optional(),
})

export const AgentUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  emoji: z.string().nullable().optional(),
  role: z.enum(["agent", "coordinator", "reviewer"]).nullable().optional(),
  model: z.string().nullable().optional(),
  workspace: z.string().nullable().optional(),
  status: z.enum(["idle", "busy", "error", "offline"]).optional(),
  soul: z.string().nullable().optional(),
  config: z.unknown().optional(),
})

export const AgentSoulSchema = z.object({
  soul: z.string(),
})

export type AgentCreateInput = z.infer<typeof AgentCreateSchema>
export type AgentUpdateInput = z.infer<typeof AgentUpdateSchema>
