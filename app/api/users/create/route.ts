import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || session.user.role !== 'Administrator') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const name = String(body.name ?? '').trim()
  const email = String(body.email ?? '').trim().toLowerCase()
  const username = String(body.username ?? '').trim().toLowerCase()
  const bidang = String(body.bidang ?? '')
  const password = String(body.password ?? '')
  const role = String(body.role ?? 'Petugas Lapangan')
  if (!name || !email || !password || password.length < 8) return NextResponse.json({ error: 'Nama, email, dan password minimal 8 karakter wajib diisi.' }, { status: 400 })
  const result = await auth.api.signUpEmail({ body: { name, email, password, username, role } })
  // Check if Better Auth returned an error
  if (result.error) {
    return NextResponse.json({ error: result.error.message || 'Gagal mendaftarkan akun.' }, { status: 400 })
  }
  return NextResponse.json({ user: result.user })
}
