import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

export const pool = new Pool({ connectionString: process.env.DATABASE_URL })
export const db = drizzle(pool)

export type ChecklistCheck = {
  assignmentId: string
  kbli: boolean
  ntb: boolean
  kewajaran: boolean
  checkedBy: string | null
  checkedAt: Date | null
}
