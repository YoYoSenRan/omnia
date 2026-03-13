import { z } from 'zod'

export const SkillCreateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().nullish(),
  source: z.enum(['local', 'registry']).optional(),
  sourceRef: z.string().nullish(),
  contentHash: z.string().nullish(),
})

export const SkillUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  contentHash: z.string().nullable().optional(),
  sourceRef: z.string().nullable().optional(),
})

export type SkillCreateInput = z.infer<typeof SkillCreateSchema>
export type SkillUpdateInput = z.infer<typeof SkillUpdateSchema>
