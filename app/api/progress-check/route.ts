import { pool } from '@/lib/db'
import { ensureTables } from '@/lib/db/ensure-tables'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function getInitials(name: string): string {
  if (!name) return 'BP'
  const clean = name.replace(/[^a-zA-Z0-9 ]/g, '').trim()
  const parts = clean.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return clean.slice(0, 2).toUpperCase() || 'BP'
}

export async function GET() {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  }

  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database tidak terkonfigurasi' }, { status: 500 })
    }

    await ensureTables()

    // 1. Total assignments in kbli_checks
    const totalRes = await pool.query('SELECT count(*) as total FROM kbli_checks').catch(() => ({ rows: [{ total: '0' }] }))
    const totalAssignments = parseInt(totalRes.rows[0]?.total || '0', 10)

    // 2. Fetch users from "user" table
    const usersRes = await pool.query(`
      SELECT id, name, username, email, role, bidang, "createdAt"
      FROM "user"
      ORDER BY "createdAt" ASC
    `).catch(() => ({ rows: [] }))

    const rawUsers = usersRes.rows || []
    const userCount = Math.max(1, rawUsers.length)
    const defaultQuota = Math.max(1, Math.round(totalAssignments / userCount))

    // 3. Query deduplicated checker stats across kbli_checks & assignment_checks
    const checkerStatsRes = await pool.query(`
      SELECT 
        LOWER(TRIM(checked_by)) as checker,
        COUNT(DISTINCT assignment_id) as total_touched,
        COUNT(DISTINCT assignment_id) FILTER (WHERE check_kbli = true OR status ILIKE '%selesai%') as selesai,
        COUNT(DISTINCT assignment_id) FILTER (WHERE check_kbli = true) as kbli_done,
        COUNT(DISTINCT assignment_id) FILTER (WHERE check_ntb = true) as ntb_done,
        COUNT(DISTINCT assignment_id) FILTER (WHERE check_kewajaran = true) as kewajaran_done,
        MAX(checked_at) as last_checked_at
      FROM (
        SELECT assignment_id, checked_by, check_kbli, check_ntb, check_kewajaran, status, checked_at 
        FROM kbli_checks 
        WHERE checked_by IS NOT NULL AND checked_by != ''
        UNION
        SELECT assignment_id, checked_by, check_kbli, check_ntb, check_kewajaran, 
               (CASE WHEN check_kbli = true THEN 'Selesai Dicek' ELSE 'Belum Dicek' END) as status, 
               checked_at 
        FROM assignment_checks 
        WHERE checked_by IS NOT NULL AND checked_by != ''
      ) comb
      GROUP BY LOWER(TRIM(checked_by))
    `).catch(() => ({ rows: [] }))

    const checkerStats = checkerStatsRes.rows || []

    // 4. Query assigned count by user_id
    const assignedStatsRes = await pool.query(`
      SELECT user_id, count(*) as count
      FROM kbli_checks
      WHERE user_id IS NOT NULL AND user_id != '' AND user_id != 'SYSTEM'
      GROUP BY user_id
    `).catch(() => ({ rows: [] }))

    const assignedStats = assignedStatsRes.rows || []

    // 5. Unassigned assignments count
    const unassignedRes = await pool.query(`
      SELECT count(*) as count
      FROM kbli_checks
      WHERE user_id IS NULL OR user_id = '' OR user_id = 'SYSTEM'
    `).catch(() => ({ rows: [{ count: '0' }] }))
    const unassignedCount = parseInt(unassignedRes.rows[0]?.count || '0', 10)

    // 6. Distinct Kecamatan / Level 3 options for task allocation
    const kecRes = await pool.query(`
      SELECT 
        level_3_full_code as code, 
        COALESCE(MAX(level_3_name), level_3_full_code) as name, 
        count(*) as total
      FROM kbli_checks
      WHERE level_3_full_code IS NOT NULL AND level_3_full_code != ''
      GROUP BY level_3_full_code
      ORDER BY count DESC
      LIMIT 30
    `).catch(() => ({ rows: [] }))

    // 7. Map each user into a structured progress item
    let totalCheckedAll = 0

    const userProgress = rawUsers.map((u: any) => {
      const uname = (u.username || '').toLowerCase().trim()
      const fullname = (u.name || '').toLowerCase().trim()

      // Match against checkerStats
      const cMatch = checkerStats.find((c: any) => c.checker === uname || c.checker === fullname) || {}
      // Match against assignedStats
      const aMatch = assignedStats.find((a: any) => a.user_id === u.id) || {}

      const assignedDirect = parseInt(aMatch.count || '0', 10)
      const target = assignedDirect > 0 ? assignedDirect : defaultQuota
      const selesai = parseInt(cMatch.selesai || '0', 10)
      totalCheckedAll += selesai

      const pending = Math.max(0, target - selesai)
      const percent = target > 0 ? Math.min(100, Math.round((selesai / target) * 100)) : (selesai > 0 ? 100 : 0)

      let statusPerformance: 'Selesai' | 'Sedang Berjalan' | 'Belum Mulai' = 'Belum Mulai'
      if (percent >= 100 && target > 0) {
        statusPerformance = 'Selesai'
      } else if (selesai > 0) {
        statusPerformance = 'Sedang Berjalan'
      }

      return {
        id: u.id,
        name: u.name,
        username: u.username || u.email.split('@')[0],
        email: u.email,
        role: u.role || 'Petugas Kualitas',
        bidang: u.bidang || 'Distribusi',
        initials: getInitials(u.name || u.username),
        target,
        assignedDirect,
        selesai,
        pending,
        percent,
        checkKbli: parseInt(cMatch.kbli_done || '0', 10),
        checkNtb: parseInt(cMatch.ntb_done || '0', 10),
        checkKewajaran: parseInt(cMatch.kewajaran_done || '0', 10),
        lastCheckedAt: cMatch.last_checked_at || '-',
        statusPerformance,
      }
    })

    const activeOfficersCount = userProgress.filter(u => u.selesai > 0).length
    const overallPercent = totalAssignments > 0 ? Math.min(100, Math.round((totalCheckedAll / totalAssignments) * 100)) : 0

    return NextResponse.json({
      ok: true,
      summary: {
        totalAssignments,
        totalOfficers: rawUsers.length,
        activeOfficers: activeOfficersCount,
        totalChecked: totalCheckedAll,
        totalPending: Math.max(0, totalAssignments - totalCheckedAll),
        unassignedCount,
        overallPercent,
        defaultQuota,
      },
      users: userProgress,
      kecamatanList: kecRes.rows.map((k: any) => ({
        code: k.code,
        name: k.name || k.code,
        total: parseInt(k.total || '0', 10),
      })),
    }, { headers })
  } catch (error: any) {
    console.error('Error fetching progress check:', error)
    return NextResponse.json({ error: error?.message || 'Gagal memuat progress check' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database tidak terkonfigurasi' }, { status: 500 })
    }

    await ensureTables()
    const body = await request.json()
    const { action, userId, count, level3Code, adminName } = body

    if (action === 'allocate' && userId) {
      const allocateCount = Math.max(1, parseInt(count || '500', 10))
      
      // Verify user exists
      const uRes = await pool.query(`SELECT id, name, username FROM "user" WHERE id = $1 LIMIT 1`, [userId])
      if (uRes.rows.length === 0) {
        return NextResponse.json({ error: 'Pengguna tujuan tidak ditemukan' }, { status: 404 })
      }
      const targetUser = uRes.rows[0]

      let query = `
        UPDATE kbli_checks
        SET user_id = $1
        WHERE id IN (
          SELECT id FROM kbli_checks
          WHERE (user_id IS NULL OR user_id = '' OR user_id = 'SYSTEM')
          ${level3Code && level3Code !== 'Semua' ? 'AND level_3_full_code = $3' : ''}
          ORDER BY id ASC
          LIMIT $2
        )
      `
      const params = level3Code && level3Code !== 'Semua' ? [userId, allocateCount, level3Code] : [userId, allocateCount]
      const updateRes = await pool.query(query, params)
      const affected = updateRes.rowCount || 0

      // Log activity
      const byUser = adminName || 'Admin'
      const initials = getInitials(byUser)
      await pool.query(`
        INSERT INTO activity_logs (user_initials, user_name, action_text)
        VALUES ($1, $2, $3)
      `, [initials, byUser, `Mengalokasikan ${affected} tugas ke petugas ${targetUser.name || targetUser.username}`]).catch(() => null)

      return NextResponse.json({
        ok: true,
        message: `Berhasil mengalokasikan ${affected} data ke ${targetUser.name}.`,
        affectedRows: affected,
      })
    }

    return NextResponse.json({ error: 'Aksi tidak dikenali' }, { status: 400 })
  } catch (error: any) {
    console.error('Error allocating tasks:', error)
    return NextResponse.json({ error: error?.message || 'Gagal memproses alokasi tugas' }, { status: 500 })
  }
}
