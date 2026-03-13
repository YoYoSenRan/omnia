import { z } from "zod"

const TASK_STATUSES = [
  "inbox",
  "assigned",
  "in_progress",
  "review",
  "done",
  "failed",
  "cancelled",
] as const

export const TaskCreateSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().nullish(),
  priority: z.number().int().min(1).max(5).optional(),
  assignedTo: z.string().nullish(),
  parentId: z.string().nullish(),
  tags: z.array(z.string()).nullish(),
})

export const TaskUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(TASK_STATUSES).optional(),
  priority: z.number().int().min(1).max(5).optional(),
  assignedTo: z.string().nullable().optional(),
  result: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
})

export type TaskCreateInput = z.infer<typeof TaskCreateSchema>
export type TaskUpdateInput = z.infer<typeof TaskUpdateSchema>
