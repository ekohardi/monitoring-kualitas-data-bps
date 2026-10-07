import { betterAuth } from 'better-auth'
import { pool } from '@/lib/db'

const isV0 = Boolean(process.env.V0_RUNTIME_URL || process.env.V0_DEV_APP_URL || process.env.V0_BUILD_URL || process.env.V0_SANDBOX_URL)

const origins = [
  'http://localhost:*',
  'http://127.0.0.1:*',
  'http://10.*:*',
  'http://192.168.*:*',
  'http://172.*:*',
  'http://localhost:3523',
  'http://127.0.0.1:3523',
  'http://10.10.10.123:3523',
  'http://10.10.10.123:3000',
  'http://10.10.10.123',
  'http://10.10.10.195:3523',
  'http://10.10.10.195:3000',
  'http://10.10.10.128:3523',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'http://10.10.10.128:3000',
  'http://10.10.10.128:3001',
  ...(process.env.BETTER_AUTH_URL ? [process.env.BETTER_AUTH_URL] : []),
  ...(process.env.NODE_ENV === 'development' ? [process.env.V0_RUNTIME_URL, process.env.V0_DEV_APP_URL, process.env.V0_BUILD_URL, process.env.V0_SANDBOX_URL].filter(Boolean) : []),
  ...(process.env.NODE_ENV === 'production' ? [process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`, process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`].filter(Boolean) : []),
] as string[]

export const auth = betterAuth({
  database: pool,
  baseURL: process.env.BETTER_AUTH_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : process.env.V0_RUNTIME_URL ?? 'http://localhost:3523'),
  emailAndPassword: { enabled: true, autoSignIn: true },
  trustedOrigins: origins,
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  user: { additionalFields: { username: { type: 'string', required: false }, role: { type: 'string', required: false, defaultValue: 'Petugas Lapangan' }, bidang: { type: 'string', required: false, defaultValue: 'Distribusi' } } },
  ...(isV0 ? { advanced: { defaultCookieAttributes: { sameSite: 'none' as const, secure: true } } } : {}),
})
