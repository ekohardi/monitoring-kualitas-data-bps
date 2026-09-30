import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { asc, eq } from 'drizzle-orm'

async function adminSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || session.user.role !== 'Administrator') return null
  return session
}

export async function GET() {
  if (!await adminSession()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const users = await db.select({ id: user.id, name: user.name, email: user.email, username: user.username, role: user.role, createdAt: user.createdAt }).from(user).orderBy(asc(user.name))
  return NextResponse.json(users)
}

export async function DELETE(request: Request) {
  const session = await adminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await request.json()
  if (id === session.user.id) return NextResponse.json({ error: 'Akun administrator aktif tidak dapat dihapus.' }, { status: 400 })
  await db.delete(user).where(eq(user.id, String(id)))
  return NextResponse.json({ ok: true })
}
