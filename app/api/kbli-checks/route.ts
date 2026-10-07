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
    await ensureTables().catch(() => null)

    const res = await pool.query(`
        SELECT 
          k.id,
          k.assignment_id,
          k.nama_usaha,
          k.nama_di_prelist,
          k.kategori,
          k.kategori_2025,
          k.kbli_akhir,
          k.keg_utama,
          k.level_3_full_code,
          k.level_3_name,
          k.level_4_full_code,
          k.level_4_name,
          k.level_6_full_code,
          k.level_6_name,
          k.assignment_status_alias,
          k.status,
          k.link_fasih,
          k.keterangan,
          k.perbaikan_kbli,
          k.index1,
          COALESCE(c.check_kbli, k.check_kbli, false) AS check_kbli,
          COALESCE(c.check_ntb, k.check_ntb, false) AS check_ntb,
          COALESCE(c.check_kewajaran, k.check_kewajaran, false) AS check_kewajaran,
          COALESCE(NULLIF(c.checked_by, ''), k.checked_by, '') AS checked_by,
          COALESCE(NULLIF(c.checked_at, ''), k.checked_at, '') AS checked_at
        FROM kbli_checks k
        LEFT JOIN assignment_checks c ON c.assignment_id = k.assignment_id
        ORDER BY k.id ASC;
      `).catch(err => {
        console.error('Failed to select from kbli_checks with join:', err)
        return { rows: [] }
      })

      if (res.rows.length > 0) {
        const records = res.rows.map(row => {
          const aid = getVal(row, ['assignment_id', 'assignmentId', 'id']) || `TBN-${row.id}`

          const isKbli = Boolean(row.check_kbli)
          const isNtb = Boolean(row.check_ntb)
          const isKewajaran = Boolean(row.check_kewajaran)
          const checkedBy = (row.checked_by || '').trim()
          const checkedAt = (row.checked_at || '').trim()

          let status = getVal(row, ['status']) || 'Belum Dicek'
          if (isKbli) {
            status = 'Selesai Dicek'
          } else if (status === 'Selesai Dicek' && !isKbli) {
            status = 'Belum Dicek'
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
    await ensureTables().catch(() => null)
    const body = await request.json()
    const { action, assignmentId, key, value, checkerName, checkerUserId, kbliData, rows } = body

    // Inspect whether kbli_checks has user_id column and ensure it is not blocking inserts
    const userColCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE LOWER(table_name) = 'kbli_checks' AND LOWER(column_name) = 'user_id'
    `).catch(() => ({ rows: [] }))
    const hasUserIdCol = userColCheck.rows.length > 0

    if (hasUserIdCol) {
      await pool.query(`ALTER TABLE kbli_checks ALTER COLUMN user_id DROP NOT NULL`).catch(() => null)
    }

    // Determine fallback user_id from "user" table if needed
    let fallbackUserId: string | null = null
    if (checkerUserId && String(checkerUserId).trim() !== '') {
      const uCheck = await pool.query(`SELECT id FROM "user" WHERE id = $1 LIMIT 1`, [String(checkerUserId).trim()]).catch(() => ({ rows: [] }))
      if (uCheck.rows.length > 0) {
        fallbackUserId = String(uCheck.rows[0].id)
      }
    }
    if (!fallbackUserId) {
      const uRes = await pool.query(`SELECT id FROM "user" ORDER BY "createdAt" ASC LIMIT 1`).catch(() => ({ rows: [] }))
      if (uRes.rows.length > 0 && uRes.rows[0]?.id) {
        fallbackUserId = String(uRes.rows[0].id)
      }
    }
    if (!fallbackUserId) {
      const sysId = 'bps-admin-user'
      await pool.query(`
        INSERT INTO "user" (id, name, email, "emailVerified", role, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        ON CONFLICT (id) DO NOTHING
      `, [sysId, 'Admin BPS Tuban', 'admin@bps.tuban.go.id', true, 'Administrator']).catch(() => null)
      fallbackUserId = sysId
    }

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
      let newStatus = kbliVal ? 'Selesai Dicek' : 'Belum Dicek'


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
      if (hasUserIdCol && fallbackUserId) {
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
            perbaikan_kbli = COALESCE($11, perbaikan_kbli),
            user_id = COALESCE(user_id, $12)
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
          kbliData.perbaikanKbli,
          fallbackUserId
        ])
      } else {
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
      }

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
      if (hasUserIdCol) {
        await pool.query(`
          INSERT INTO kbli_checks (
            user_id, assignment_id, nama_usaha, nama_di_prelist, kbli_akhir, kategori,
            kategori_2025, keg_utama, status, link_fasih, keterangan, perbaikan_kbli
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `, [
          fallbackUserId,
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
      } else {
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
      }

      const byUser = (checkerName || 'Admin BPS').trim()
      const initials = (byUser.replace(/[^a-zA-Z0-9 ]/g, '').split(/\s+/).slice(0, 2).map((s: string) => s[0]).join('') || 'AD').toUpperCase()
      await pool.query(`
        INSERT INTO activity_logs (user_initials, user_name, action_text)
        VALUES ($1, $2, $3)
      `, [initials, byUser, `Menambahkan data KBLI ${assignmentId}`]).catch(() => null)

      return NextResponse.json({ ok: true, message: `Assignment ${assignmentId} berhasil ditambahkan ke tabel kbli_checks.` })
    }

    // 4. Robust Bulk CSV import with field normalization & upsert
    if (action === 'import' && Array.isArray(rows)) {
      let importedCount = 0
      let createdCount = 0
      let updatedCount = 0

      // Helper function to extract fields from any header format
      const extractRowFields = (row: Record<string, any>) => {
        const map = new Map<string, string>()
        for (const [k, v] of Object.entries(row)) {
          if (v !== undefined && v !== null) {
            const normKey = String(k).toLowerCase().replace(/[^a-z0-9]/g, '')
            map.set(normKey, String(v).trim())
          }
        }

        const get = (keys: string[]): string => {
          for (const k of keys) {
            const norm = k.toLowerCase().replace(/[^a-z0-9]/g, '')
            const val = map.get(norm)
            if (val !== undefined && val !== '') return val
          }
          return ''
        }

        let aid = get([
          'assignment_id', 'assignmentid', 'id_assignment', 'kode_assignment', 'assignment',
          'id', 'id_unit', 'kode_sampel', 'no_sampel', 'nobs', 'nus', 'kode', 'no', 'nomor'
        ])
        const namaUsaha = get(['nama_usaha', 'namausaha', 'nama', 'nama_perusahaan', 'perusahaan', 'principal'])
        const namaDiPrelist = get(['nama_di_prelist', 'namadiprelist', 'nama_prelist', 'namaprelist', 'prelist']) || namaUsaha
        const kategori = get(['kategori', 'kategori_usaha', 'sektor', 'bidang_usaha'])
        const kategori2025 = get(['kategori_2025', 'kategori2025'])
        const kbliAkhir = get(['kbli_akhir', 'kbliakhir', 'kbli', 'kode_kbli', 'kodekbli'])
        const kegUtama = get(['keg_utama', 'kegutama', 'kegiatan_utama', 'kegiatanutama', 'uraian_kegiatan', 'deskripsi_kegiatan', 'catatan'])
        const linkFasih = get(['link_fasih', 'linkfasih', 'link', 'url_fasih', 'fasih'])
        const keterangan = get(['keterangan', 'catatan', 'note', 'ket'])
        const perbaikanKbli = get(['perbaikan_kbli', 'perbaikankbli', 'revisi_kbli', 'kbli_perbaikan'])
        const status = get(['status', 'status_pengecekan', 'status_cek'])

        // Fallback aid generator if empty but row has usaha/kbli
        if ((!aid || aid.trim() === '') && (namaUsaha && namaUsaha !== '-')) {
          aid = `TBN-IMP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        }

        // Parse Level 3, Level 4, Level 6
        let level3Code = get(['level_3_full_code', 'level3fullcode', 'level_3_kode', 'level3kode'])
        let level3Name = get(['level_3_name', 'level3name', 'level_3_nama', 'level3nama'])
        const level3Combined = get(['level_3_kode_nama', 'level3kodenama', 'level_3', 'level3'])
        if (level3Combined && (!level3Code || !level3Name)) {
          const parts = level3Combined.split(/\s*[-:]\s*(.+)/)
          if (parts.length >= 2) {
            if (!level3Code) level3Code = parts[0].trim()
            if (!level3Name) level3Name = parts[1].trim()
          } else if (!level3Code) {
            level3Code = level3Combined
          }
        }

        let level4Code = get(['level_4_full_code', 'level4fullcode', 'level_4_kode', 'level4kode'])
        let level4Name = get(['level_4_name', 'level4name', 'level_4_nama', 'level4nama'])
        const level4Combined = get(['level_4_kode_nama', 'level4kodenama', 'level_4', 'level4'])
        if (level4Combined && (!level4Code || !level4Name)) {
          const parts = level4Combined.split(/\s*[-:]\s*(.+)/)
          if (parts.length >= 2) {
            if (!level4Code) level4Code = parts[0].trim()
            if (!level4Name) level4Name = parts[1].trim()
          } else if (!level4Code) {
            level4Code = level4Combined
          }
        }

        let level6Code = get(['level_6_full_code', 'level6fullcode', 'level_6_kode', 'level6kode'])
        let level6Name = get(['level_6_name', 'level6name', 'level_6_nama', 'level6nama'])
        const level6Combined = get(['level_6_kode_nama', 'level6kodenama', 'level_6', 'level6'])
        if (level6Combined && (!level6Code || !level6Name)) {
          const parts = level6Combined.split(/\s*[-:]\s*(.+)/)
          if (parts.length >= 2) {
            if (!level6Code) level6Code = parts[0].trim()
            if (!level6Name) level6Name = parts[1].trim()
          } else if (!level6Code) {
            level6Code = level6Combined
          }
        }

        // Checklist states
        const checkKbliRaw = get(['check_kbli', 'checkkbli', 'pengecekan1', 'pengecekan1kbli'])
        const checkNtbRaw = get(['check_ntb', 'checkntb', 'pengecekan2', 'pengecekan2ntbnegatif'])
        const checkKewajaranRaw = get(['check_kewajaran', 'checkkewajaran', 'pengecekan3', 'pengecekan3kewajaran'])
        const checkedBy = get(['checked_by', 'checkedby', 'dicek_oleh', 'dicekoleh', 'pemeriksa'])
        const checkedAt = get(['checked_at', 'checkedat', 'tanggal_cek', 'tanggalcek'])
        const userId = get(['user_id', 'userid', 'id_user', 'iduser', 'checker_user_id', 'checkeruserid', 'user'])

        const parseBool = (val: string): boolean | null => {
          if (!val) return null
          const lower = val.toLowerCase()
          if (['true', '1', 'ya', 'yes', 'sudah', 'selesai', 'v', 'x'].includes(lower)) return true
          if (['false', '0', 'tidak', 'no', 'belum', '-'].includes(lower)) return false
          return null
        }

        return {
          aid,
          userId: userId || null,
          namaUsaha: namaUsaha || '-',
          namaDiPrelist: namaDiPrelist || namaUsaha || '-',
          kategori: kategori || 'Perdagangan',
          kategori2025: kategori2025 || 'Perdagangan Eceran',
          kbliAkhir: kbliAkhir || '-',
          kegUtama: kegUtama || '-',
          level3Code: level3Code || '-',
          level3Name: level3Name || '-',
          level4Code: level4Code || '-',
          level4Name: level4Name || '-',
          level6Code: level6Code || '-',
          level6Name: level6Name || '-',
          linkFasih: linkFasih || '-',
          keterangan: keterangan || '-',
          perbaikanKbli: perbaikanKbli || '-',
          status: status || 'Belum Dicek',
          checkKbli: parseBool(checkKbliRaw),
          checkNtb: parseBool(checkNtbRaw),
          checkKewajaran: parseBool(checkKewajaranRaw),
          checkedBy,
          checkedAt
        }
      }

      const errors: string[] = []

      // Process in chunks of 20 for optimal concurrency
      const chunkSize = 20
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize)
        await Promise.all(
          chunk.map(async (rawRow) => {
            const item = extractRowFields(rawRow)
            if (!item.aid || item.aid.trim() === '') return
            const rowUserId = item.userId || fallbackUserId

            try {
              const existing = await pool.query(
                `SELECT id, check_kbli, check_ntb, check_kewajaran, checked_by, checked_at, status FROM kbli_checks WHERE LOWER(TRIM(assignment_id)) = LOWER(TRIM($1)) LIMIT 1`,
                [item.aid]
              )

              if (existing.rows.length > 0) {
                const cur = existing.rows[0]
                const newKbli = item.checkKbli !== null ? item.checkKbli : cur.check_kbli
                const newNtb = item.checkNtb !== null ? item.checkNtb : cur.check_ntb
                const newWajar = item.checkKewajaran !== null ? item.checkKewajaran : cur.check_kewajaran
                const newBy = item.checkedBy || cur.checked_by || ''
                const newAt = item.checkedAt || cur.checked_at || ''

                let finalStatus = item.status && item.status !== 'Belum Dicek' ? item.status : cur.status
                if (newKbli) {
                  finalStatus = 'Selesai Dicek'
                } else if (finalStatus === 'Selesai Dicek' && !newKbli) {
                  finalStatus = 'Belum Dicek'
                }

                if (hasUserIdCol) {
                  await pool.query(`
                    UPDATE kbli_checks
                    SET
                      user_id = COALESCE($1, user_id),
                      assignment_id = $2,
                      nama_usaha = COALESCE(NULLIF($3, '-'), nama_usaha),
                      nama_di_prelist = COALESCE(NULLIF($4, '-'), nama_di_prelist),
                      kbli_akhir = COALESCE(NULLIF($5, '-'), kbli_akhir),
                      kategori = COALESCE(NULLIF($6, '-'), kategori),
                      kategori_2025 = COALESCE(NULLIF($7, '-'), kategori_2025),
                      keg_utama = COALESCE(NULLIF($8, '-'), keg_utama),
                      level_3_full_code = COALESCE(NULLIF($9, '-'), level_3_full_code),
                      level_3_name = COALESCE(NULLIF($10, '-'), level_3_name),
                      level_4_full_code = COALESCE(NULLIF($11, '-'), level_4_full_code),
                      level_4_name = COALESCE(NULLIF($12, '-'), level_4_name),
                      level_6_full_code = COALESCE(NULLIF($13, '-'), level_6_full_code),
                      level_6_name = COALESCE(NULLIF($14, '-'), level_6_name),
                      link_fasih = COALESCE(NULLIF($15, '-'), link_fasih),
                      keterangan = COALESCE(NULLIF($16, '-'), keterangan),
                      perbaikan_kbli = COALESCE(NULLIF($17, '-'), perbaikan_kbli),
                      status = $18,
                      check_kbli = $19,
                      check_ntb = $20,
                      check_kewajaran = $21,
                      checked_by = COALESCE(NULLIF($22, ''), checked_by),
                      checked_at = COALESCE(NULLIF($23, ''), checked_at)
                    WHERE id = $24
                  `, [
                    rowUserId, item.aid, item.namaUsaha, item.namaDiPrelist, item.kbliAkhir, item.kategori,
                    item.kategori2025, item.kegUtama, item.level3Code, item.level3Name,
                    item.level4Code, item.level4Name, item.level6Code, item.level6Name,
                    item.linkFasih, item.keterangan, item.perbaikanKbli, finalStatus,
                    newKbli, newNtb, newWajar, newBy, newAt, cur.id
                  ])
                } else {
                  await pool.query(`
                    UPDATE kbli_checks
                    SET
                      assignment_id = $1,
                      nama_usaha = COALESCE(NULLIF($2, '-'), nama_usaha),
                      nama_di_prelist = COALESCE(NULLIF($3, '-'), nama_di_prelist),
                      kbli_akhir = COALESCE(NULLIF($4, '-'), kbli_akhir),
                      kategori = COALESCE(NULLIF($5, '-'), kategori),
                      kategori_2025 = COALESCE(NULLIF($6, '-'), kategori_2025),
                      keg_utama = COALESCE(NULLIF($7, '-'), keg_utama),
                      level_3_full_code = COALESCE(NULLIF($8, '-'), level_3_full_code),
                      level_3_name = COALESCE(NULLIF($9, '-'), level_3_name),
                      level_4_full_code = COALESCE(NULLIF($10, '-'), level_4_full_code),
                      level_4_name = COALESCE(NULLIF($11, '-'), level_4_name),
                      level_6_full_code = COALESCE(NULLIF($12, '-'), level_6_full_code),
                      level_6_name = COALESCE(NULLIF($13, '-'), level_6_name),
                      link_fasih = COALESCE(NULLIF($14, '-'), link_fasih),
                      keterangan = COALESCE(NULLIF($15, '-'), keterangan),
                      perbaikan_kbli = COALESCE(NULLIF($16, '-'), perbaikan_kbli),
                      status = $17,
                      check_kbli = $18,
                      check_ntb = $19,
                      check_kewajaran = $20,
                      checked_by = COALESCE(NULLIF($21, ''), checked_by),
                      checked_at = COALESCE(NULLIF($22, ''), checked_at)
                    WHERE id = $23
                  `, [
                    item.aid, item.namaUsaha, item.namaDiPrelist, item.kbliAkhir, item.kategori,
                    item.kategori2025, item.kegUtama, item.level3Code, item.level3Name,
                    item.level4Code, item.level4Name, item.level6Code, item.level6Name,
                    item.linkFasih, item.keterangan, item.perbaikanKbli, finalStatus,
                    newKbli, newNtb, newWajar, newBy, newAt, cur.id
                  ])
                }

                await pool.query(`
                  INSERT INTO assignment_checks (assignment_id, check_kbli, check_ntb, check_kewajaran, checked_by, checked_at, updated_at)
                  VALUES ($1, $2, $3, $4, $5, $6, NOW())
                  ON CONFLICT (assignment_id) DO UPDATE SET
                    check_kbli = EXCLUDED.check_kbli,
                    check_ntb = EXCLUDED.check_ntb,
                    check_kewajaran = EXCLUDED.check_kewajaran,
                    checked_by = COALESCE(NULLIF(EXCLUDED.checked_by, ''), assignment_checks.checked_by),
                    checked_at = COALESCE(NULLIF(EXCLUDED.checked_at, ''), assignment_checks.checked_at),
                    updated_at = NOW()
                `, [item.aid, newKbli, newNtb, newWajar, newBy, newAt]).catch(() => null)

                updatedCount++
              } else {
                const isKbli = item.checkKbli ?? false
                const isNtb = item.checkNtb ?? false
                const isWajar = item.checkKewajaran ?? false
                const byUser = item.checkedBy || ''
                const atTime = item.checkedAt || ''

                let finalStatus = item.status || 'Belum Dicek'
                if (isKbli) {
                  finalStatus = 'Selesai Dicek'
                }

                if (hasUserIdCol) {
                  await pool.query(`
                    INSERT INTO kbli_checks (
                      user_id,
                      assignment_id, nama_usaha, nama_di_prelist, kbli_akhir, kategori, kategori_2025,
                      keg_utama, level_3_full_code, level_3_name, level_4_full_code, level_4_name,
                      level_6_full_code, level_6_name, link_fasih, keterangan, perbaikan_kbli, status,
                      check_kbli, check_ntb, check_kewajaran, checked_by, checked_at
                    ) VALUES (
                      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
                      $18, $19, $20, $21, $22, $23
                    )
                  `, [
                    rowUserId, item.aid, item.namaUsaha, item.namaDiPrelist, item.kbliAkhir, item.kategori,
                    item.kategori2025, item.kegUtama, item.level3Code, item.level3Name,
                    item.level4Code, item.level4Name, item.level6Code, item.level6Name,
                    item.linkFasih, item.keterangan, item.perbaikanKbli, finalStatus,
                    isKbli, isNtb, isWajar, byUser, atTime
                  ])
                } else {
                  await pool.query(`
                    INSERT INTO kbli_checks (
                      assignment_id, nama_usaha, nama_di_prelist, kbli_akhir, kategori, kategori_2025,
                      keg_utama, level_3_full_code, level_3_name, level_4_full_code, level_4_name,
                      level_6_full_code, level_6_name, link_fasih, keterangan, perbaikan_kbli, status,
                      check_kbli, check_ntb, check_kewajaran, checked_by, checked_at
                    ) VALUES (
                      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
                      $18, $19, $20, $21, $22
                    )
                  `, [
                    item.aid, item.namaUsaha, item.namaDiPrelist, item.kbliAkhir, item.kategori,
                    item.kategori2025, item.kegUtama, item.level3Code, item.level3Name,
                    item.level4Code, item.level4Name, item.level6Code, item.level6Name,
                    item.linkFasih, item.keterangan, item.perbaikanKbli, finalStatus,
                    isKbli, isNtb, isWajar, byUser, atTime
                  ])
                }

                await pool.query(`
                  INSERT INTO assignment_checks (assignment_id, check_kbli, check_ntb, check_kewajaran, checked_by, checked_at, updated_at)
                  VALUES ($1, $2, $3, $4, $5, $6, NOW())
                  ON CONFLICT (assignment_id) DO UPDATE SET
                    check_kbli = EXCLUDED.check_kbli,
                    check_ntb = EXCLUDED.check_ntb,
                    check_kewajaran = EXCLUDED.check_kewajaran,
                    checked_by = COALESCE(NULLIF(EXCLUDED.checked_by, ''), assignment_checks.checked_by),
                    checked_at = COALESCE(NULLIF(EXCLUDED.checked_at, ''), assignment_checks.checked_at),
                    updated_at = NOW()
                `, [item.aid, isKbli, isNtb, isWajar, byUser, atTime]).catch(() => null)

                createdCount++
              }
              importedCount++
            } catch (itemErr: any) {
              console.error(`Error importing row ${item.aid}:`, itemErr)
              errors.push(`${item.aid}: ${itemErr?.message || 'Error simpan'}`)
            }
          })
        )
      }

      if (importedCount === 0) {
        if (errors.length > 0) {
          return NextResponse.json({
            error: `Gagal menyimpan ke database: ${errors[0]}`
          }, { status: 500 })
        } else {
          return NextResponse.json({
            error: 'Tidak ditemukan baris data yang valid dalam CSV. Silakan gunakan template CSV resmi dengan tombol "Unduh Template CSV".'
          }, { status: 400 })
        }
      }

      const byUser = (checkerName || 'Admin BPS').trim()
      const initials = (byUser.replace(/[^a-zA-Z0-9 ]/g, '').split(/\s+/).slice(0, 2).map((s: string) => s[0]).join('') || 'AD').toUpperCase()
      await pool.query(`
        INSERT INTO activity_logs (user_initials, user_name, action_text)
        VALUES ($1, $2, $3)
      `, [initials, byUser, `Mengimpor ${importedCount} data ke tabel kbli_checks (${createdCount} baru, ${updatedCount} diperbarui)`]).catch(() => null)

      return NextResponse.json({
        ok: true,
        count: importedCount,
        created: createdCount,
        updated: updatedCount,
        message: `Berhasil menyimpan ${importedCount} data ke tabel kbli_checks (${createdCount} data baru, ${updatedCount} data diperbarui).`
      })
    }

    return NextResponse.json({ error: 'Aksi tidak dikenal' }, { status: 400 })
  } catch (err: any) {
    console.error('Error in POST /api/kbli-checks:', err)
    return NextResponse.json({ error: err.message || 'Gagal menyimpan perubahan ke database.' }, { status: 500 })
  }
}
