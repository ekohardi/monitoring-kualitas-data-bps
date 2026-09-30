import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const identifier = new URL(request.url).searchParams.get('identifier')?.trim().toLowerCase()
  if (!identifier || identifier.includes('@')) return NextResponse.json({ email: identifier })
  const found = await db.select({ email: user.email }).from(user).where(eq(user.username, identifier)).limit(1)
  return found[0] ? NextResponse.json(found[0]) : NextResponse.json({ error: 'User not found' }, { status: 404 })
}
