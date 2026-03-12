import { defineConfig } from 'drizzle-kit'
import { join } from 'node:path'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: join(process.env.HOME ?? '.', '.omnia', 'omnia.db'),
  },
})
