import { pool } from '@/lib/db'
import { ensureTables, initialSeedKbli, initialSeedNtb } from '@/lib/db/ensure-tables'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Extract value from a row using multiple possible column aliases (snake_case, camelCase, lowercase)
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

// Builds the merged cross-table list from raw rows
function buildCrossRecords(kbliRows: any[], ntbRows: any[], checksRows: any[] = []) {
  const mergedMap = new Map<string, { kbliRow?: any; ntbRow?: any; id: string }>()

  const checksMap = new Map<string, any>()
  for (const c of checksRows) {
    if (c.assignment_id) {
      checksMap.set(c.assignment_id.trim().toLowerCase(), c)
    }
  }

  // Process kbli_checks rows
  for (const k of kbliRows) {
    const aid = getVal(k, ['assignment_id', 'assignmentId', 'kode_assignment', 'id_assignment', 'id']) || `KBLI-${k.id || Math.random()}`
    const key = aid.toLowerCase().trim()
    const entry = mergedMap.get(key) || { id: aid }
    entry.kbliRow = k
    entry.id = aid
    mergedMap.set(key, entry)
  }

  // Process negative_ntb_checks rows
  for (const n of ntbRows) {
    const aid = getVal(n, ['assignment_id', 'assignmentId', 'kode_assignment', 'id_assignment', 'id']) || `NTB-${n.id || Math.random()}`
    const key = aid.toLowerCase().trim()
    const entry = mergedMap.get(key) || { id: aid }
    entry.ntbRow = n
    if (!entry.id || entry.id.startsWith('KBLI-')) {
      entry.id = aid
    }
    mergedMap.set(key, entry)
  }

  // Transform mergedMap into structured cross-check records
  const result: any[] = []

  for (const [, { kbliRow, ntbRow, id }] of mergedMap) {
    const hasKbli = Boolean(kbliRow)
    const hasNtb = Boolean(ntbRow)

    const namaUsaha = getVal(kbliRow, ['nama_usaha', 'namaUsaha', 'nama_di_prelist', 'nama']) ||
                      getVal(ntbRow, ['nama_principal', 'namaPrincipal', 'nama']) || '-'
    const kbliAkhir = getVal(kbliRow, ['kbli_akhir', 'kbliAkhir', 'kbli']) ||
                      getVal(ntbRow, ['kbli_akhir', 'kbliAkhir', 'kbli']) || '-'
    const linkFasih = getVal(kbliRow, ['link_fasih', 'linkFasih', 'link', 'url_fasih']) ||
                      getVal(ntbRow, ['link_fasih', 'linkFasih', 'link', 'url_fasih']) || '-'

    // Extract any extra database columns not in predefined schema
    const kbliExtra: Record<string, any> = {}
    if (kbliRow) {
      const standardKeys = new Set([
        'id', 'assignment_id', 'assignmentid', 'nama_usaha', 'nama_di_prelist', 'kbli_akhir',
        'kategori', 'kategori_2025', 'keg_utama', 'status', 'assignment_status_alias',
        'level_3_full_code', 'level_3_name', 'level_4_full_code', 'level_4_name',
        'level_6_full_code', 'level_6_name', 'index1', 'link_fasih'
      ])
      for (const [col, val] of Object.entries(kbliRow)) {
        if (!standardKeys.has(col.toLowerCase()) && val !== null && val !== undefined) {
          kbliExtra[col] = val
        }
      }
    }

    const ntbExtra: Record<string, any> = {}
    if (ntbRow) {
      const standardKeys = new Set([
        'id', 'assignment_id', 'assignmentid', 'nama_principal', 'kategori', 'kbli_akhir',
        'tahun_operasi', 'catatan', 'r27a_omzet', 'r26c_biaya_pembelian', 'r26b_biaya_produksi',
        'r26d_biaya_operasional', 'nilai_tambah', 'level_2_full_code', 'level_6_full_code',
        'link_fasih', 'source_file', 'source_folder'
      ])
      for (const [col, val] of Object.entries(ntbRow)) {
        if (!standardKeys.has(col.toLowerCase()) && val !== null && val !== undefined) {
          ntbExtra[col] = val
        }
      }
    }

    const keterangan = getVal(kbliRow, ['keterangan', 'catatan', 'note', 'ket']) ||
                       getVal(ntbRow, ['catatan', 'keterangan', 'note']) || '-'
    const perbaikanKbli = getVal(kbliRow, ['perbaikan_kbli', 'perbaikanKbli', 'kbli_perbaikan', 'kbli_revisi', 'revisi_kbli']) ||
                          getVal(ntbRow, ['perbaikan_kbli', 'perbaikanKbli', 'kbli_perbaikan']) || '-'
    const namaDiPrelist = getVal(kbliRow, ['nama_di_prelist', 'namaDiPrelist']) || namaUsaha
    const kategori = getVal(kbliRow, ['kategori']) || getVal(ntbRow, ['kategori']) || '-'
    const kategori2025 = getVal(kbliRow, ['kategori_2025', 'kategori2025']) || '-'
    const kegUtama = getVal(kbliRow, ['keg_utama', 'kegUtama', 'kegiatan_utama']) || '-'

    const checkDb = checksMap.get(id.toLowerCase().trim())
    const isKbli = Boolean(checkDb ? checkDb.check_kbli : (kbliRow?.check_kbli))
    const isNtb = Boolean(checkDb ? checkDb.check_ntb : (kbliRow?.check_ntb))
    const isKewajaran = Boolean(checkDb ? checkDb.check_kewajaran : (kbliRow?.check_kewajaran))
    const checkedBy = (checkDb?.checked_by || kbliRow?.checked_by || '').trim()
    const checkedAt = (checkDb?.checked_at || kbliRow?.checked_at || '').trim()

    let rowStatus = getVal(kbliRow, ['status']) || 'Belum Dicek'
    if (isKbli && isNtb && isKewajaran) {
      rowStatus = 'Selesai Dicek'
    } else if (isKbli || isNtb || isKewajaran) {
      if (!rowStatus || rowStatus.toLowerCase().includes('belum')) {
        rowStatus = 'Sedang Dicek'
      }
    }

    result.push({
      id,
      assignmentId: id,
      namaUsaha,
      namaDiPrelist,
      kategori,
      kategori2025,
      kbliAkhir,
      kegUtama,
      linkFasih,
      hasKbli,
      hasNtb,
      status: rowStatus,
      keterangan,
      perbaikanKbli,
      check: {
        kbli: isKbli,
        ntb: isNtb,
        kewajaran: isKewajaran,
        checkedBy,
        checkedAt,
      },
      kbli: hasKbli ? {
        id: kbliRow.id ?? '-',
        assignmentId: getVal(kbliRow, ['assignment_id', 'assignmentId']) || id,
        namaUsaha: getVal(kbliRow, ['nama_usaha', 'namaUsaha']) || namaUsaha,
        namaDiPrelist,
        kbliAkhir: getVal(kbliRow, ['kbli_akhir', 'kbliAkhir']) || kbliAkhir,
        kategori,
        kategori2025,
        kegUtama,
        status: rowStatus,
        assignmentStatusAlias: getVal(kbliRow, ['assignment_status_alias', 'assignmentStatusAlias']) || 'Aktif',
        level3FullCode: getVal(kbliRow, ['level_3_full_code', 'level3FullCode']) || '-',
        level3Name: getVal(kbliRow, ['level_3_name', 'level3Name']) || '-',
        level4FullCode: getVal(kbliRow, ['level_4_full_code', 'level4FullCode']) || '-',
        level4Name: getVal(kbliRow, ['level_4_name', 'level4Name']) || '-',
        level6FullCode: getVal(kbliRow, ['level_6_full_code', 'level6FullCode']) || '-',
        level6Name: getVal(kbliRow, ['level_6_name', 'level6Name']) || '-',
        index1: getVal(kbliRow, ['index1']) || '-',
        linkFasih: getVal(kbliRow, ['link_fasih', 'linkFasih']) || linkFasih,
        keterangan,
        perbaikanKbli,
        extraFields: kbliExtra,
      } : null,
      ntb: hasNtb ? {
        id: ntbRow.id ?? '-',
        assignmentId: getVal(ntbRow, ['assignment_id', 'assignmentId']) || id,
        namaPrincipal: getVal(ntbRow, ['nama_principal', 'namaPrincipal']) || namaUsaha,
        kategori: getVal(ntbRow, ['kategori']) || '-',
        kbliAkhir: getVal(ntbRow, ['kbli_akhir', 'kbliAkhir']) || kbliAkhir,
        tahunOperasi: getVal(ntbRow, ['tahun_operasi', 'tahunOperasi']) || '-',
        catatan: getVal(ntbRow, ['catatan', 'keterangan']) || keterangan,
        keterangan,
        perbaikanKbli,
        r27aOmzet: getVal(ntbRow, ['r27a_omzet', 'r27aOmzet', 'omzet']) || '-',
        r26cBiayaPembelian: getVal(ntbRow, ['r26c_biaya_pembelian', 'r26cBiayaPembelian', 'biaya_pembelian']) || '-',
        r26bBiayaProduksi: getVal(ntbRow, ['r26b_biaya_produksi', 'r26bBiayaProduksi', 'biaya_produksi']) || '-',
        r26dBiayaOperasional: getVal(ntbRow, ['r26d_biaya_operasional', 'r26dBiayaOperasional', 'biaya_operasional']) || '-',
        nilaiTambah: getVal(ntbRow, ['nilai_tambah', 'nilaiTambah']) || '-',
        level2FullCode: getVal(ntbRow, ['level_2_full_code', 'level2FullCode']) || '-',
        level6FullCode: getVal(ntbRow, ['level_6_full_code', 'level6FullCode']) || '-',
        sourceFile: getVal(ntbRow, ['source_file', 'sourceFile']) || '-',
        sourceFolder: getVal(ntbRow, ['source_folder', 'sourceFolder']) || '-',
        linkFasih: getVal(ntbRow, ['link_fasih', 'linkFasih']) || linkFasih,
        extraFields: ntbExtra,
      } : null,
    })
  }

  // Sort by assignmentId ascending
  result.sort((a, b) => a.assignmentId.localeCompare(b.assignmentId, undefined, { numeric: true }))
  return result
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

      // Fetch all rows from both tables and assignment_checks
      const [kbliRes, ntbRes, checksRes] = await Promise.all([
        pool.query(`SELECT * FROM kbli_checks ORDER BY id ASC LIMIT 2000`).catch(err => {
          console.error('Failed to select from kbli_checks:', err)
          return { rows: [] }
        }),
        pool.query(`SELECT * FROM negative_ntb_checks ORDER BY id ASC LIMIT 2000`).catch(err => {
          console.error('Failed to select from negative_ntb_checks:', err)
          return { rows: [] }
        }),
        pool.query(`SELECT * FROM assignment_checks`).catch(err => {
          console.error('Failed to select from assignment_checks:', err)
          return { rows: [] }
        })
      ])

      if (kbliRes.rows.length > 0 || ntbRes.rows.length > 0) {
        const records = buildCrossRecords(kbliRes.rows, ntbRes.rows, checksRes.rows)
        return NextResponse.json(records, { headers })
      }
    }
  } catch (error) {
    console.error('Error fetching dynamic cross-table from database:', error)
  }

  // Fallback in-memory dataset with distinct records if database is completely offline
  const fallback = buildCrossRecords(initialSeedKbli, initialSeedNtb)
  return NextResponse.json(fallback, { headers })
}

// Endpoint to update or add assignment data in the database
export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database tidak terkonfigurasi' }, { status: 500 })
    }

    await ensureTables()
    const body = await request.json()
    const { action, assignmentId, key, value, checkerName, kbliData, ntbData, rows } = body

    // Real-time checklist toggle
    if (action === 'toggle_check' && assignmentId && key) {
      const aid = assignmentId.trim()
      const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
      const byUser = (checkerName || 'Petugas BPS').trim()

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

      let newStatus = 'Belum Dicek'
      if (kbliVal && ntbVal && kewajaranVal) {
        newStatus = 'Selesai Dicek'
      } else if (kbliVal || ntbVal || kewajaranVal) {
        newStatus = 'Sedang Dicek'
      }

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

      await pool.query(`
        UPDATE kbli_checks
        SET check_kbli = $2, check_ntb = $3, check_kewajaran = $4, checked_by = $5, checked_at = $6, status = $7
        WHERE LOWER(TRIM(assignment_id)) = LOWER(TRIM($1))
      `, [aid, kbliVal, ntbVal, kewajaranVal, byUser, nowStr, newStatus])

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

    // Robust Bulk CSV import with field normalization & upsert
    if (action === 'import' && Array.isArray(rows)) {
      let importedCount = 0
      let updatedCount = 0
      let createdCount = 0

      const extractRow = (row: Record<string, any>) => {
        const map = new Map<string, string>()
        for (const [k, v] of Object.entries(row)) {
          if (v !== undefined && v !== null) {
            map.set(String(k).toLowerCase().replace(/[^a-z0-9]/g, ''), String(v).trim())
          }
        }
        const get = (keys: string[]): string => {
          for (const k of keys) {
            const val = map.get(k.toLowerCase().replace(/[^a-z0-9]/g, ''))
            if (val !== undefined && val !== '') return val
          }
          return ''
        }

        const aid = get(['assignment_id', 'assignmentid', 'id_assignment', 'id', 'kode_assignment', 'assignment'])
        const namaUsaha = get(['nama_usaha', 'namausaha', 'nama', 'nama_perusahaan', 'perusahaan', 'nama_principal', 'principal'])
        const namaDiPrelist = get(['nama_di_prelist', 'namadiprelist', 'nama_prelist', 'prelist']) || namaUsaha
        const kategori = get(['kategori', 'kategori_usaha', 'sektor', 'bidang_usaha'])
        const kategori2025 = get(['kategori_2025', 'kategori2025'])
        const kbliAkhir = get(['kbli_akhir', 'kbliakhir', 'kbli', 'kode_kbli', 'kodekbli'])
        const kegUtama = get(['keg_utama', 'kegutama', 'kegiatan_utama', 'kegiatanutama', 'uraian_kegiatan', 'deskripsi_kegiatan', 'catatan'])
        const linkFasih = get(['link_fasih', 'linkfasih', 'link', 'url_fasih', 'fasih'])
        const keterangan = get(['keterangan', 'catatan', 'note', 'ket'])
        const perbaikanKbli = get(['perbaikan_kbli', 'perbaikankbli', 'revisi_kbli', 'kbli_perbaikan'])
        const status = get(['status', 'status_pengecekan', 'status_cek'])
        const nilaiTambah = get(['nilai_tambah', 'nilaitambah', 'ntb'])
        const omzet = get(['r27a_omzet', 'r27aomzet', 'omzet'])
        const biayaBeli = get(['r26c_biaya_pembelian', 'biaya_pembelian', 'biayabeli'])

        return {
          aid,
          namaUsaha: namaUsaha || '-',
          namaDiPrelist: namaDiPrelist || namaUsaha || '-',
          kategori: kategori || 'Perdagangan',
          kategori2025: kategori2025 || 'Perdagangan Eceran',
          kbliAkhir: kbliAkhir || '-',
          kegUtama: kegUtama || '-',
          linkFasih: linkFasih || '-',
          keterangan: keterangan || '-',
          perbaikanKbli: perbaikanKbli || '-',
          status: status || 'Belum Dicek',
          nilaiTambah: nilaiTambah || '0',
          omzet: omzet || '0',
          biayaBeli: biayaBeli || '0'
        }
      }

      const chunkSize = 20
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize)
        await Promise.all(
          chunk.map(async (rawRow) => {
            const item = extractRow(rawRow)
            if (!item.aid || item.aid.trim() === '') return

            try {
              // 1. kbli_checks
              const existingKbli = await pool.query(
                `SELECT id FROM kbli_checks WHERE LOWER(TRIM(assignment_id)) = LOWER(TRIM($1)) LIMIT 1`,
                [item.aid]
              )
              if (existingKbli.rows.length > 0) {
                await pool.query(`
                  UPDATE kbli_checks
                  SET
                    nama_usaha = COALESCE(NULLIF($2, '-'), nama_usaha),
                    nama_di_prelist = COALESCE(NULLIF($3, '-'), nama_di_prelist),
                    kbli_akhir = COALESCE(NULLIF($4, '-'), kbli_akhir),
                    kategori = COALESCE(NULLIF($5, '-'), kategori),
                    kategori_2025 = COALESCE(NULLIF($6, '-'), kategori_2025),
                    keg_utama = COALESCE(NULLIF($7, '-'), keg_utama),
                    link_fasih = COALESCE(NULLIF($8, '-'), link_fasih),
                    keterangan = COALESCE(NULLIF($9, '-'), keterangan),
                    perbaikan_kbli = COALESCE(NULLIF($10, '-'), perbaikan_kbli)
                  WHERE id = $11
                `, [item.aid, item.namaUsaha, item.namaDiPrelist, item.kbliAkhir, item.kategori, item.kategori2025, item.kegUtama, item.linkFasih, item.keterangan, item.perbaikanKbli, existingKbli.rows[0].id])
                updatedCount++
              } else {
                await pool.query(`
                  INSERT INTO kbli_checks (
                    assignment_id, nama_usaha, nama_di_prelist, kbli_akhir, kategori, kategori_2025,
                    keg_utama, status, link_fasih, keterangan, perbaikan_kbli
                  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                `, [item.aid, item.namaUsaha, item.namaDiPrelist, item.kbliAkhir, item.kategori, item.kategori2025, item.kegUtama, item.status, item.linkFasih, item.keterangan, item.perbaikanKbli])
                createdCount++
              }

              // 2. negative_ntb_checks
              const existingNtb = await pool.query(
                `SELECT id FROM negative_ntb_checks WHERE LOWER(TRIM(assignment_id)) = LOWER(TRIM($1)) LIMIT 1`,
                [item.aid]
              )
              if (existingNtb.rows.length > 0) {
                await pool.query(`
                  UPDATE negative_ntb_checks
                  SET
                    nama_principal = COALESCE(NULLIF($2, '-'), nama_principal),
                    kategori = COALESCE(NULLIF($3, '-'), kategori),
                    kbli_akhir = COALESCE(NULLIF($4, '-'), kbli_akhir),
                    catatan = COALESCE(NULLIF($5, '-'), catatan),
                    nilai_tambah = COALESCE(NULLIF($6, '0'), nilai_tambah),
                    r27a_omzet = COALESCE(NULLIF($7, '0'), r27a_omzet),
                    r26c_biaya_pembelian = COALESCE(NULLIF($8, '0'), r26c_biaya_pembelian),
                    link_fasih = COALESCE(NULLIF($9, '-'), link_fasih)
                  WHERE id = $10
                `, [item.aid, item.namaUsaha, item.kategori, item.kbliAkhir, item.kegUtama, item.nilaiTambah, item.omzet, item.biayaBeli, item.linkFasih, existingNtb.rows[0].id])
              } else {
                await pool.query(`
                  INSERT INTO negative_ntb_checks (
                    assignment_id, nama_principal, kategori, kbli_akhir, catatan,
                    nilai_tambah, r27a_omzet, r26c_biaya_pembelian, link_fasih
                  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `, [item.aid, item.namaUsaha, item.kategori, item.kbliAkhir, item.kegUtama, item.nilaiTambah, item.omzet, item.biayaBeli, item.linkFasih])
              }

              importedCount++
            } catch (err) {
              console.error(`Error importing row ${item.aid}:`, err)
            }
          })
        )
      }

      await pool.query(`
        INSERT INTO activity_logs (user_initials, user_name, action_text)
        VALUES ($1, $2, $3)
      `, ['AD', 'Admin BPS', `Mengimpor ${importedCount} data CSV ke database (${createdCount} baru, ${updatedCount} diperbarui)`]).catch(() => null)

      return NextResponse.json({
        ok: true,
        count: importedCount,
        created: createdCount,
        updated: updatedCount,
        message: `Berhasil mengimpor ${importedCount} data (${createdCount} baru, ${updatedCount} diperbarui).`
      })
    }

    // Update single assignment
    if (action === 'update' && assignmentId) {
      if (kbliData) {
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

      if (ntbData) {
        await pool.query(`
          UPDATE negative_ntb_checks
          SET 
            nama_principal = COALESCE($2, nama_principal),
            kbli_akhir = COALESCE($3, kbli_akhir),
            kategori = COALESCE($4, kategori),
            catatan = COALESCE($5, catatan),
            keterangan = COALESCE($5, keterangan),
            perbaikan_kbli = COALESCE($6, perbaikan_kbli),
            nilai_tambah = COALESCE($7, nilai_tambah),
            r27a_omzet = COALESCE($8, r27a_omzet),
            link_fasih = COALESCE($9, link_fasih)
          WHERE LOWER(TRIM(assignment_id)) = LOWER(TRIM($1))
        `, [
          assignmentId,
          ntbData.namaPrincipal,
          ntbData.kbliAkhir,
          ntbData.kategori,
          ntbData.keterangan || ntbData.catatan,
          ntbData.perbaikanKbli,
          ntbData.nilaiTambah,
          ntbData.r27aOmzet,
          ntbData.linkFasih
        ])
      }

      const usahaTitle = kbliData?.namaUsaha || ntbData?.namaPrincipal || assignmentId
      const statusSuffix = kbliData?.status ? ` menjadi "${kbliData.status}"` : ''
      await pool.query(`
        INSERT INTO activity_logs (user_initials, user_name, action_text)
        VALUES ($1, $2, $3)
      `, ['PL', 'Petugas BPS', `Memperbarui data ${usahaTitle}${statusSuffix}`]).catch(() => null)

      return NextResponse.json({ ok: true, message: `Data untuk assignment ${assignmentId} berhasil diperbarui.` })
    }

    // Create new assignment record
    if (action === 'create' && assignmentId) {
      await pool.query(`
        INSERT INTO kbli_checks (
          assignment_id, nama_usaha, nama_di_prelist, kbli_akhir, kategori,
          keg_utama, status, link_fasih
        ) VALUES ($1, $2, $2, $3, $4, $5, $6, $7)
      `, [
        assignmentId,
        kbliData?.namaUsaha || '-',
        kbliData?.kbliAkhir || '-',
        kbliData?.kategori || 'Perdagangan',
        kbliData?.kegUtama || '-',
        kbliData?.status || 'Belum Dicek',
        kbliData?.linkFasih || '-'
      ])

      await pool.query(`
        INSERT INTO negative_ntb_checks (
          assignment_id, nama_principal, kategori, kbli_akhir, catatan,
          nilai_tambah, r27a_omzet, link_fasih
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        assignmentId,
        ntbData?.namaPrincipal || kbliData?.namaUsaha || '-',
        ntbData?.kategori || kbliData?.kategori || 'Perdagangan',
        ntbData?.kbliAkhir || kbliData?.kbliAkhir || '-',
        ntbData?.catatan || '-',
        ntbData?.nilaiTambah || '0',
        ntbData?.r27aOmzet || '0',
        ntbData?.linkFasih || kbliData?.linkFasih || '-'
      ])

      const newUsaha = kbliData?.namaUsaha || assignmentId
      await pool.query(`
        INSERT INTO activity_logs (user_initials, user_name, action_text)
        VALUES ($1, $2, $3)
      `, ['AD', 'Admin BPS', `Menambahkan assignment baru ${assignmentId} (${newUsaha})`]).catch(() => null)

      return NextResponse.json({ ok: true, message: `Assignment ${assignmentId} berhasil ditambahkan ke database.` })
    }

    return NextResponse.json({ error: 'Aksi tidak dikenal' }, { status: 400 })
  } catch (err: any) {
    console.error('Error in POST /api/check-data:', err)
    return NextResponse.json({ error: err.message || 'Gagal menyimpan perubahan ke database.' }, { status: 500 })
  }
}
