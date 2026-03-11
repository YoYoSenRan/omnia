import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  GATEWAY_URL: z.string().default('ws://localhost:18789'),
  GATEWAY_TOKEN: z.string().optional(),
  WORKSPACE_PATH: z.string().default(`${process.env.HOME ?? '.'}/.openclaw/workspace`),
})

export const env = envSchema.parse(process.env)
