import { defineConfig } from '@prisma/config'

export default defineConfig({
  schema: {
    kind: 'single',
    filePath: 'prisma/schema.prisma'
  },
  database: {
    url: process.env.DATABASE_URL
  }
})
