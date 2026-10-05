import { db } from '@/lib/db'
import { user } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const identifier = new URL(request.url).searchParams.get('identifier')?.trim().toLowerCase()
  if (!identifier) {
    return NextResponse.json({ error: 'Identifier is required' }, { status: 400 })
  }

  try {
    const isEmail = identifier.includes('@')
    const found = await db
      .select({
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
      })
      .from(user)
      .where(isEmail ? eq(user.email, identifier) : eq(user.username, identifier))
      .limit(1)

    if (found[0]) {
      return NextResponse.json({
        id: found[0].id,
        email: found[0].email,
        username: found[0].username || (found[0].email ? found[0].email.split('@')[0] : identifier),
        name: found[0].name,
        role: found[0].role,
      })
    }

    if (isEmail) {
      return NextResponse.json({
        email: identifier,
        username: identifier.split('@')[0],
        name: identifier.split('@')[0],
        role: 'Petugas Lapangan',
      })
    }

    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  } catch (error) {
    console.error('Error during user lookup:', error)
    if (identifier.includes('@')) {
      return NextResponse.json({
        email: identifier,
        username: identifier.split('@')[0],
        name: identifier.split('@')[0],
        role: 'Petugas Lapangan',
      })
    }
    return NextResponse.json({ error: 'Database lookup error' }, { status: 500 })
  }
}

