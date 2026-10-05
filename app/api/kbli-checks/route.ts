import { pool } from '@/lib/db'
import { ensureTables, initialSeedKbli } from '@/lib/db/ensure-tables'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function getVal(row: Record<string, any> | null | undefined, candidates: string[]): string {
  if (!row) return ''
  for (const c of candidates) {
    if (row[c] !== undefined && row[c] !== null && String(row[c]).trim() !== '') {
      return String(row[c]).trim()
    }
    const lower = c.toLowerCase()
    if (row[lower] !== undefined && row[lower] !== null && String(row[lower]).trim() !== '') {
      return String(row[lower]).trim()
    }
  }
  return ''
}

export async function GET() {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  }

  try {
    if (process.env.DATABASE_URL) {
      await ensureTables()

      const [kbliRes, checksRes] = await Promise.all([
        pool.query(`SELECT * FROM kbli_checks ORDER BY id ASC LIMIT 2000`).catch(err => {
          console.error('Failed to select from kbli_checks:', err)
          return { rows: [] }
        }),
        pool.query(`SELECT * FROM assignment_checks`).catch(err => {
          console.error('Failed to select from assignment_checks:', err)
          return { rows: [] }
        })
      ])

      const checksMap = new Map<string, any>()
      for (const c of checksRes.rows) {
        if (c.assignment_id) {
          checksMap.set(c.assignment_id.trim().toLowerCase(), c)
        }
      }

      if (kbliRes.rows.length > 0) {
        const records = kbliRes.rows.map(row => {
          const aid = getVal(row, ['assignment_id', 'assignmentId', 'id']) || `TBN-${row.id}`
          const checkDb = checksMap.get(aid.trim().toLowerCase())

          const isKbli = Boolean(checkDb ? checkDb.check_kbli : row.check_kbli)
          const isNtb = Boolean(checkDb ? checkDb.check_ntb : row.check_ntb)
          const isKewajaran = Boolean(checkDb ? checkDb.check_kewajaran : row.check_kewajaran)
          const checkedBy = (checkDb?.checked_by || row.checked_by || '').trim()
          const checkedAt = (checkDb?.checked_at || row.checked_at || '').trim()

          let status = getVal(row, ['status']) || 'Belum Dicek'
          if (isKbli && isNtb && isKewajaran) {
            status = 'Selesai Dicek'
          } else if (isKbli || isNtb || isKewajaran) {
            if (!status || status.toLowerCase().includes('belum')) {
              status = 'Sedang Dicek'
            }
          }

          const namaUsaha = getVal(row, ['nama_usaha', 'namaUsaha', 'nama_di_prelist', 'nama']) || '-'
          const namaDiPrelist = getVal(row, ['nama_di_prelist', 'namaDiPrelist']) || namaUsaha
          const kategori = getVal(row, ['kategori']) || '-'
          const kategori2025 = getVal(row, ['kategori_2025', 'kategori2025']) || '-'
          const kbliAkhir = getVal(row, ['kbli_akhir', 'kbliAkhir']) || '-'
          const kegUtama = getVal(row, ['keg_utama', 'kegUtama']) || '-'
          const level3FullCode = getVal(row, ['level_3_full_code', 'level3FullCode']) || '-'
          const level3Name = getVal(row, ['level_3_name', 'level3Name']) || '-'
          const level4FullCode = getVal(row, ['level_4_full_code', 'level4FullCode']) || '-'
          const level4Name = getVal(row, ['level_4_name', 'level4Name']) || '-'
          const level6FullCode = getVal(row, ['level_6_full_code', 'level6FullCode']) || '-'
          const level6Name = getVal(row, ['level_6_name', 'level6Name']) || '-'
          const linkFasih = getVal(row, ['link_fasih', 'linkFasih', 'link']) || '-'
          const keterangan = getVal(row, ['keterangan', 'catatan', 'note']) || '-'
          const perbaikanKbli = getVal(row, ['perbaikan_kbli', 'perbaikanKbli']) || '-'

          return {
            id: row.id,
            assignmentId: aid,
            namaUsaha,
            namaDiPrelist,
            kategori,
            kategori2025,
            kbliAkhir,
            kegUtama,
            level3FullCode,
            level3Name,
            level4FullCode,
            level4Name,
            level6FullCode,
            level6Name,
            linkFasih,
            status,
            keterangan,
            perbaikanKbli,
            check: {
              kbli: isKbli,
              ntb: isNtb,
              kewajaran: isKewajaran,
              checkedBy,
              checkedAt,
            },
            kbli: {
              id: row.id,
              assignmentId: aid,
              namaUsaha,
              namaDiPrelist,
              kategori,
              kategori2025,
              kbliAkhir,
              kegUtama,
              status,
              level3FullCode,
              level3Name,
              level4FullCode,
              level4Name,
              level6FullCode,
              level6Name,
              linkFasih,
              keterangan,
              perbaikanKbli,
            },
            ntb: null
          }
        })

        return NextResponse.json(records, { headers })
      }
    }
  } catch (error) {
    console.error('Error fetching kbli checks:', error)
  }

  // Fallback in-memory
  const fallback = initialSeedKbli.map((k, idx) => ({
    id: idx + 1,
    assignmentId: k.assignment_id,
    namaUsaha: k.nama_usaha,
    namaDiPrelist: k.nama_di_prelist,
    kategori: k.kategori,
    kategori2025: k.kategori_2025,
    kbliAkhir: k.kbli_akhir,
    kegUtama: k.keg_utama,
    level3FullCode: k.level_3_full_code,
    level3Name: k.level_3_name,
    level4FullCode: k.level_4_full_code,
    level4Name: k.level_4_name,
    level6FullCode: k.level_6_full_code,
    level6Name: k.level_6_name,
    linkFasih: k.link_fasih,
    status: k.status,
    keterangan: k.keterangan || '-',
    perbaikanKbli: k.perbaikan_kbli || '-',
    check: {
      kbli: k.status === 'Selesai Dicek' || k.status === 'Perlu Konfirmasi',
      ntb: k.status === 'Selesai Dicek',
      kewajaran: k.status === 'Selesai Dicek',
      checkedBy: 'Admin BPS',
      checkedAt: '30 Sep 2026, 10:00'
    },
    kbli: {
      ...k,
      level3FullCode: k.level_3_full_code,
      level3Name: k.level_3_name,
      level4FullCode: k.level_4_full_code,
      level4Name: k.level_4_name,
      level6FullCode: k.level_6_full_code,
      level6Name: k.level_6_name,
      linkFasih: k.link_fasih,
      namaUsaha: k.nama_usaha,
      namaDiPrelist: k.nama_di_prelist,
      kbliAkhir: k.kbli_akhir,
      kegUtama: k.keg_utama,
      kategori2025: k.kategori_2025,
    },
    ntb: null
  }))

  return NextResponse.json(fallback, { headers })
}

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database tidak terkonfigurasi' }, { status: 500 })
    }

    await ensureTables()
    const body = await request.json()
    const { action, assignmentId, key, value, checkerName, kbliData, rows } = body

    // 1. Toggle single checklist item and persist to database in real-time
    if (action === 'toggle_check' && assignmentId && key) {
      const aid = assignmentId.trim()
      const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
      const byUser = (checkerName || 'Petugas BPS').trim()

      // Fetch existing checks
      const cur = await pool.query(
        `SELECT check_kbli, check_ntb, check_kewajaran, checked_by, checked_at FROM assignment_checks WHERE LOWER(TRIM(assignment_id)) = LOWER(TRIM($1))`,
        [aid]
      ).catch(() => ({ rows: [] }))

      let kbliVal = cur.rows[0]?.check_kbli || false
      let ntbVal = cur.rows[0]?.check_ntb || false
      let kewajaranVal = cur.rows[0]?.check_kewajaran || false

      if (key === 'kbli') kbliVal = Boolean(value)
      if (key === 'ntb') ntbVal = Boolean(value)
      if (key === 'kewajaran') kewajaranVal = Boolean(value)

      // Calculate status
      let newStatus = 'Belum Dicek'
      if (kbliVal && ntbVal && kewajaranVal) {
        newStatus = 'Selesai Dicek'
      } else if (kbliVal || ntbVal || kewajaranVal) {
        newStatus = 'Sedang Dicek'
      }

      // Upsert into assignment_checks
      await pool.query(`
        INSERT INTO assignment_checks (assignment_id, check_kbli, check_ntb, check_kewajaran, checked_by, checked_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (assignment_id) DO UPDATE SET
          check_kbli = EXCLUDED.check_kbli,
          check_ntb = EXCLUDED.check_ntb,
          check_kewajaran = EXCLUDED.check_kewajaran,
          checked_by = EXCLUDED.checked_by,
          checked_at = EXCLUDED.checked_at,
          updated_at = NOW()
      `, [aid, kbliVal, ntbVal, kewajaranVal, byUser, nowStr])

      // Also update kbli_checks directly
      await pool.query(`
        UPDATE kbli_checks
        SET 
          check_kbli = $2,
          check_ntb = $3,
          check_kewajaran = $4,
          checked_by = $5,
          checked_at = $6,
          status = $7
        WHERE LOWER(TRIM(assignment_id)) = LOWER(TRIM($1))
      `, [aid, kbliVal, ntbVal, kewajaranVal, byUser, nowStr, newStatus])

      // Log activity
      const initials = (byUser.replace(/[^a-zA-Z0-9 ]/g, '').split(/\s+/).slice(0, 2).map((s: string) => s[0]).join('') || 'BP').toUpperCase()
      const checkLabel = key === 'kbli' ? 'KBLI' : key === 'ntb' ? 'NTB Negatif' : 'Kewajaran'
      const statusAction = value ? 'menandai selesai' : 'membatalkan tanda'
      await pool.query(`
        INSERT INTO activity_logs (user_initials, user_name, action_text)
        VALUES ($1, $2, $3)
      `, [initials, byUser, `${statusAction} pengecekan ${checkLabel} untuk ${aid}`]).catch(() => null)

      return NextResponse.json({
        ok: true,
        assignmentId: aid,
        status: newStatus,
        check: {
          kbli: kbliVal,
          ntb: ntbVal,
          kewajaran: kewajaranVal,
          checkedBy: byUser,
          checkedAt: nowStr
        }
      })
    }

    // 2. Update KBLI data
    if (action === 'update' && assignmentId && kbliData) {
      await pool.query(`
        UPDATE kbli_checks
        SET 
          nama_usaha = COALESCE($2, nama_usaha),
          nama_di_prelist = COALESCE($3, nama_di_prelist),
          kbli_akhir = COALESCE($4, kbli_akhir),
          kategori = COALESCE($5, kategori),
          kategori_2025 = COALESCE($6, kategori_2025),
          keg_utama = COALESCE($7, keg_utama),
          status = COALESCE($8, status),
          link_fasih = COALESCE($9, link_fasih),
          keterangan = COALESCE($10, keterangan),
          perbaikan_kbli = COALESCE($11, perbaikan_kbli)
        WHERE LOWER(TRIM(assignment_id)) = LOWER(TRIM($1))
      `, [
        assignmentId,
        kbliData.namaUsaha,
        kbliData.namaDiPrelist,
        kbliData.kbliAkhir,
        kbliData.kategori,
        kbliData.kategori2025,
        kbliData.kegUtama,
        kbliData.status,
        kbliData.linkFasih,
        kbliData.keterangan,
        kbliData.perbaikanKbli
      ])

      const byUser = (checkerName || 'Petugas BPS').trim()
      const initials = (byUser.replace(/[^a-zA-Z0-9 ]/g, '').split(/\s+/).slice(0, 2).map((s: string) => s[0]).join('') || 'BP').toUpperCase()
      await pool.query(`
        INSERT INTO activity_logs (user_initials, user_name, action_text)
        VALUES ($1, $2, $3)
      `, [initials, byUser, `Memperbarui data KBLI ${assignmentId} (${kbliData.namaUsaha || ''})`]).catch(() => null)

      return NextResponse.json({ ok: true, message: `Data KBLI ${assignmentId} berhasil diperbarui.` })
    }

    // 3. Create new KBLI assignment
    if (action === 'create' && assignmentId) {
      await pool.query(`
        INSERT INTO kbli_checks (
          assignment_id, nama_usaha, nama_di_prelist, kbli_akhir, kategori,
          kategori_2025, keg_utama, status, link_fasih, keterangan, perbaikan_kbli
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        assignmentId,
        kbliData?.namaUsaha || '-',
        kbliData?.namaDiPrelist || kbliData?.namaUsaha || '-',
        kbliData?.kbliAkhir || '-',
        kbliData?.kategori || 'Perdagangan',
        kbliData?.kategori2025 || 'Perdagangan Eceran',
        kbliData?.kegUtama || '-',
        kbliData?.status || 'Belum Dicek',
        kbliData?.linkFasih || '-',
        kbliData?.keterangan || '-',
        kbliData?.perbaikanKbli || '-'
      ])

      const byUser = (checkerName || 'Admin BPS').trim()
      const initials = (byUser.replace(/[^a-zA-Z0-9 ]/g, '').split(/\s+/).slice(0, 2).map((s: string) => s[0]).join('') || 'AD').toUpperCase()
      await pool.query(`
        INSERT INTO activity_logs (user_initials, user_name, action_text)
        VALUES ($1, $2, $3)
      `, [initials, byUser, `Menambahkan data KBLI ${assignmentId}`]).catch(() => null)

      return NextResponse.json({ ok: true, message: `Assignment ${assignmentId} berhasil ditambahkan ke tabel kbli_checks.` })
    }

    // 4. Bulk CSV import
    if (action === 'import' && Array.isArray(rows)) {
      let importedCount = 0
      for (const r of rows) {
        const aid = r.assignment_id || r.assignmentId
        if (!aid) continue

        await pool.query(`
          INSERT INTO kbli_checks (
            assignment_id, nama_usaha, nama_di_prelist, kbli_akhir, kategori, kategori_2025,
            keg_utama, status, link_fasih, keterangan, perbaikan_kbli
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT DO NOTHING
        `, [
          aid,
          r.nama_usaha || r.namaUsaha || r.nama || '-',
          r.nama_di_prelist || r.namaDiPrelist || '-',
          r.kbli_akhir || r.kbliAkhir || '-',
          r.kategori || '-',
          r.kategori_2025 || r.kategori2025 || '-',
          r.keg_utama || r.kegUtama || '-',
          r.status || 'Belum Dicek',
          r.link_fasih || r.linkFasih || '-',
          r.keterangan || '-',
          r.perbaikan_kbli || r.perbaikanKbli || '-'
        ]).catch(() => null)

        importedCount++
      }

      await pool.query(`
        INSERT INTO activity_logs (user_initials, user_name, action_text)
        VALUES ($1, $2, $3)
      `, ['AD', 'Admin BPS', `Mengimpor ${importedCount} data ke tabel kbli_checks`]).catch(() => null)

      return NextResponse.json({ ok: true, count: importedCount, message: `Berhasil mengimpor ${importedCount} data ke tabel kbli_checks.` })
    }

    return NextResponse.json({ error: 'Aksi tidak dikenal' }, { status: 400 })
  } catch (err: any) {
    console.error('Error in POST /api/kbli-checks:', err)
    return NextResponse.json({ error: err.message || 'Gagal menyimpan perubahan ke database.' }, { status: 500 })
  }
}
