import { NextResponse } from 'next/server'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const assignmentId = typeof body.assignmentId === 'string' ? body.assignmentId.trim() : ''
    const checkedBy = typeof body.checkedBy === 'string' ? body.checkedBy.trim() : ''
    const checks = body.checks ?? {}

    if (!assignmentId || !checkedBy) {
      return NextResponse.json({ error: 'assignmentId dan checkedBy wajib diisi' }, { status: 400 })
    }

    const kbli = checks.kbli === true
    const ntb = checks.ntb === true
    const kewajaran = checks.kewajaran === true
    const checkedAt = kbli || ntb || kewajaran ? new Date() : null

    await db.execute(sql`
      INSERT INTO checklist_checks (assignment_id, kbli_checked, ntb_checked, kewajaran_checked, checked_by, checked_at, updated_at)
      VALUES (${assignmentId}, ${kbli}, ${ntb}, ${kewajaran}, ${checkedBy}, ${checkedAt}, now())
      ON CONFLICT (assignment_id) DO UPDATE SET
        kbli_checked = EXCLUDED.kbli_checked,
        ntb_checked = EXCLUDED.ntb_checked,
        kewajaran_checked = EXCLUDED.kewajaran_checked,
        checked_by = EXCLUDED.checked_by,
        checked_at = EXCLUDED.checked_at,
        updated_at = now()
    `)

    return NextResponse.json({ assignmentId, kbli, ntb, kewajaran, checkedBy, checkedAt })
  } catch (error) {
    console.error('[v0] Checklist save failed:', error)
    return NextResponse.json({ error: 'Gagal menyimpan checklist' }, { status: 500 })
  }
}
