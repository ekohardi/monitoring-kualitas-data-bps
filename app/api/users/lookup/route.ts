import { pool } from '@/lib/db'
import { ensureTables } from '@/lib/db/ensure-tables'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  const identifier = new URL(request.url).searchParams.get('identifier')?.trim()
  if (!identifier) {
    return NextResponse.json({ error: 'Identifier is required' }, { status: 400 })
  }

  const cleanId = identifier.toLowerCase()
  const isEmail = cleanId.includes('@')

  try {
    await ensureTables().catch(() => null)

    const foundRes = await pool.query(
      `SELECT id, email, username, name, role, bidang FROM "user" 
       WHERE LOWER(TRIM(username)) = $1 OR LOWER(TRIM(email)) = $1 OR id = $1
       LIMIT 1`,
      [cleanId]
    ).catch(() => ({ rows: [] }))

    if (foundRes.rows && foundRes.rows.length > 0) {
      const u = foundRes.rows[0]
      return NextResponse.json({
        id: u.id,
        email: u.email,
        username: u.username || (u.email ? u.email.split('@')[0] : identifier),
        name: u.name,
        role: u.role,
        bidang: u.bidang || 'Distribusi',
      })
    }

    // Default accounts fallback
    if (cleanId === 'admin' || cleanId === 'admin@bps.tuban.go.id') {
      return NextResponse.json({
        id: 'usr-admin-01',
        email: 'admin@bps.tuban.go.id',
        username: 'admin',
        name: 'Admin BPS Tuban',
        role: 'Administrator',
        bidang: 'Distribusi',
      })
    }
    if (cleanId === 'distribusi' || cleanId === 'distribusi@bps.tuban.go.id') {
      return NextResponse.json({
        id: 'nIE0SUkNIpW5dlZVax7sul1Gn1qf92Ru',
        email: 'distribusi@bps.tuban.go.id',
        username: 'distribusi',
        name: 'distribusi',
        role: 'Petugas Kualitas',
        bidang: 'Distribusi',
      })
    }
    if (cleanId === 'ekohardi' || cleanId === 'eko.hardi@bps.tuban.go.id') {
      return NextResponse.json({
        id: 'usr-eko-04',
        email: 'eko.hardi@bps.tuban.go.id',
        username: 'ekohardi',
        name: 'Eko Hardi',
        role: 'Reviewer',
        bidang: 'Sosial',
      })
    }
    if (cleanId === 'nerwilis' || cleanId === 'nerwilis@bps.tuban.go.id') {
      return NextResponse.json({
        id: 'xlh1OYNSAyzuTRlJMqPADUgsPA7RU0yT',
        email: 'nerwilis@bps.tuban.go.id',
        username: 'nerwilis',
        name: 'nerwilis',
        role: 'Petugas Kualitas',
        bidang: 'Nerwilis',
      })
    }

    if (isEmail) {
      return NextResponse.json({
        id: `user-${Date.now()}`,
        email: identifier,
        username: identifier.split('@')[0],
        name: identifier.split('@')[0],
        role: 'Petugas Lapangan',
      })
    }

    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  } catch (error) {
    console.error('Error during user lookup:', error)
    if (cleanId === 'admin' || cleanId === 'admin@bps.tuban.go.id') {
      return NextResponse.json({
        id: 'usr-admin-01',
        email: 'admin@bps.tuban.go.id',
        username: 'admin',
        name: 'Admin BPS Tuban',
        role: 'Administrator',
        bidang: 'Distribusi',
      })
    }
    if (cleanId === 'distribusi' || cleanId === 'distribusi@bps.tuban.go.id') {
      return NextResponse.json({
        id: 'nIE0SUkNIpW5dlZVax7sul1Gn1qf92Ru',
        email: 'distribusi@bps.tuban.go.id',
        username: 'distribusi',
        name: 'distribusi',
        role: 'Petugas Kualitas',
        bidang: 'Distribusi',
      })
    }
    if (isEmail) {
      return NextResponse.json({
        id: `user-${Date.now()}`,
        email: identifier,
        username: identifier.split('@')[0],
        name: identifier.split('@')[0],
        role: 'Petugas Lapangan',
      })
    }
    return NextResponse.json({ error: 'Database lookup error' }, { status: 500 })
  }
}

