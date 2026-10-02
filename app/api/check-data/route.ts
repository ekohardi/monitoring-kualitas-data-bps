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
function buildCrossRecords(kbliRows: any[], ntbRows: any[]) {
  const mergedMap = new Map<string, { kbliRow?: any; ntbRow?: any; id: string }>()

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

    result.push({
      id,
      assignmentId: id,
      namaUsaha,
      kbliAkhir,
      linkFasih,
      hasKbli,
      hasNtb,
      kbli: hasKbli ? {
        id: kbliRow.id ?? '-',
        assignmentId: getVal(kbliRow, ['assignment_id', 'assignmentId']) || id,
        namaUsaha: getVal(kbliRow, ['nama_usaha', 'namaUsaha']) || namaUsaha,
        namaDiPrelist: getVal(kbliRow, ['nama_di_prelist', 'namaDiPrelist']) || '-',
        kbliAkhir: getVal(kbliRow, ['kbli_akhir', 'kbliAkhir']) || kbliAkhir,
        kategori: getVal(kbliRow, ['kategori']) || '-',
        kategori2025: getVal(kbliRow, ['kategori_2025', 'kategori2025']) || '-',
        kegUtama: getVal(kbliRow, ['keg_utama', 'kegUtama', 'kegiatan_utama']) || '-',
        status: getVal(kbliRow, ['status']) || 'Belum Dicek',
        assignmentStatusAlias: getVal(kbliRow, ['assignment_status_alias', 'assignmentStatusAlias']) || 'Aktif',
        level3FullCode: getVal(kbliRow, ['level_3_full_code', 'level3FullCode']) || '-',
        level3Name: getVal(kbliRow, ['level_3_name', 'level3Name']) || '-',
        level4FullCode: getVal(kbliRow, ['level_4_full_code', 'level4FullCode']) || '-',
        level4Name: getVal(kbliRow, ['level_4_name', 'level4Name']) || '-',
        level6FullCode: getVal(kbliRow, ['level_6_full_code', 'level6FullCode']) || '-',
        level6Name: getVal(kbliRow, ['level_6_name', 'level6Name']) || '-',
        index1: getVal(kbliRow, ['index1']) || '-',
        linkFasih: getVal(kbliRow, ['link_fasih', 'linkFasih']) || linkFasih,
        extraFields: kbliExtra,
      } : null,
      ntb: hasNtb ? {
        id: ntbRow.id ?? '-',
        assignmentId: getVal(ntbRow, ['assignment_id', 'assignmentId']) || id,
        namaPrincipal: getVal(ntbRow, ['nama_principal', 'namaPrincipal']) || namaUsaha,
        kategori: getVal(ntbRow, ['kategori']) || '-',
        kbliAkhir: getVal(ntbRow, ['kbli_akhir', 'kbliAkhir']) || kbliAkhir,
        tahunOperasi: getVal(ntbRow, ['tahun_operasi', 'tahunOperasi']) || '-',
        catatan: getVal(ntbRow, ['catatan', 'keterangan']) || '-',
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

      // Fetch all rows from both tables directly with SELECT *
      const [kbliRes, ntbRes] = await Promise.all([
        pool.query(`SELECT * FROM kbli_checks ORDER BY id ASC LIMIT 2000`).catch(err => {
          console.error('Failed to select from kbli_checks:', err)
          return { rows: [] }
        }),
        pool.query(`SELECT * FROM negative_ntb_checks ORDER BY id ASC LIMIT 2000`).catch(err => {
          console.error('Failed to select from negative_ntb_checks:', err)
          return { rows: [] }
        })
      ])

      if (kbliRes.rows.length > 0 || ntbRes.rows.length > 0) {
        const records = buildCrossRecords(kbliRes.rows, ntbRes.rows)
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
    const { action, assignmentId, kbliData, ntbData, rows } = body

    // Bulk CSV import
    if (action === 'import' && Array.isArray(rows)) {
      let importedCount = 0
      for (const r of rows) {
        const aid = r.assignment_id || r.assignmentId
        if (!aid) continue

        // Insert or update kbli_checks
        await pool.query(`
          INSERT INTO kbli_checks (
            assignment_id, nama_usaha, nama_di_prelist, kbli_akhir, kategori, kategori_2025,
            keg_utama, status, link_fasih
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
          r.link_fasih || r.linkFasih || '-'
        ]).catch(() => null)

        // Insert or update negative_ntb_checks
        await pool.query(`
          INSERT INTO negative_ntb_checks (
            assignment_id, nama_principal, kategori, kbli_akhir, catatan,
            nilai_tambah, r27a_omzet, r26c_biaya_pembelian, link_fasih
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT DO NOTHING
        `, [
          aid,
          r.nama_principal || r.namaPrincipal || r.nama_usaha || '-',
          r.kategori || '-',
          r.kbli_akhir || r.kbliAkhir || '-',
          r.catatan || '-',
          r.nilai_tambah || r.nilaiTambah || '0',
          r.r27a_omzet || r.omzet || '0',
          r.r26c_biaya_pembelian || r.biaya_pembelian || '0',
          r.link_fasih || r.linkFasih || '-'
        ]).catch(() => null)

        importedCount++
      }

      await pool.query(`
        INSERT INTO activity_logs (user_initials, user_name, action_text)
        VALUES ($1, $2, $3)
      `, ['AD', 'Admin BPS', `Mengimpor ${importedCount} data assignment ke sistem`]).catch(() => null)

      return NextResponse.json({ ok: true, count: importedCount, message: `Berhasil mengimpor ${importedCount} data.` })
    }

    // Update single assignment
    if (action === 'update' && assignmentId) {
      if (kbliData) {
        await pool.query(`
          UPDATE kbli_checks
          SET 
            nama_usaha = COALESCE($2, nama_usaha),
            kbli_akhir = COALESCE($3, kbli_akhir),
            kategori = COALESCE($4, kategori),
            keg_utama = COALESCE($5, keg_utama),
            status = COALESCE($6, status),
            link_fasih = COALESCE($7, link_fasih)
          WHERE LOWER(TRIM(assignment_id)) = LOWER(TRIM($1))
        `, [
          assignmentId,
          kbliData.namaUsaha,
          kbliData.kbliAkhir,
          kbliData.kategori,
          kbliData.kegUtama,
          kbliData.status,
          kbliData.linkFasih
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
            nilai_tambah = COALESCE($6, nilai_tambah),
            r27a_omzet = COALESCE($7, r27a_omzet),
            link_fasih = COALESCE($8, link_fasih)
          WHERE LOWER(TRIM(assignment_id)) = LOWER(TRIM($1))
        `, [
          assignmentId,
          ntbData.namaPrincipal,
          ntbData.kbliAkhir,
          ntbData.kategori,
          ntbData.catatan,
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
