import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

const defaultDbUrl = 'postgresql://casaos:casaos@10.10.10.195:5432/kualitasdata'
const connectionString = (process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '')
  ? process.env.DATABASE_URL
  : defaultDbUrl

export const pool = new Pool({ connectionString })
export const db = drizzle(pool, { schema })
