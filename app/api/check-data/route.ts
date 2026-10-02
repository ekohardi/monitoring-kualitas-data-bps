import { pool } from '@/lib/db'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Seed data inserted into database only if both tables are completely empty
const initialSeedKbli = [
  {
    assignment_id: 'TBN-00124',
    nama_usaha: 'Warung Sumber Rejeki',
    nama_di_prelist: 'Warung Sumber Rejeki',
    kbli_akhir: '47111',
    kategori: 'Perdagangan',
    kategori_2025: 'Perdagangan Eceran',
    keg_utama: 'Penjualan sembako, beras, minyak goreng, dan kebutuhan pokok harian',
    status: 'Selesai Dicek',
    assignment_status_alias: 'Aktif',
    level_3_full_code: 'G.47',
    level_3_name: 'Perdagangan Eceran',
    level_4_full_code: '471',
    level_4_name: 'Perdagangan Eceran di Toko',
    level_6_full_code: '47111',
    level_6_name: 'Perdagangan Eceran Berbagai Barang yang Utamanya Makanan di Toko',
    index1: 'Negatif',
    link_fasih: 'https://fasih.bps.go.id/survey/TBN-00124',
  },
  {
    assignment_id: 'TBN-00125',
    nama_usaha: 'Bengkel Maju Jaya',
    nama_di_prelist: 'Bengkel Maju Jaya',
    kbli_akhir: '45201',
    kategori: 'Jasa',
    kategori_2025: 'Jasa Reparasi',
    keg_utama: 'Reparasi dan pemeliharaan sepeda motor roda dua serta ganti oli',
    status: 'Perlu Konfirmasi',
    assignment_status_alias: 'Aktif',
    level_3_full_code: 'S.95',
    level_3_name: 'Reparasi Komputer & Keperluan Pribadi',
    level_4_full_code: '452',
    level_4_name: 'Reparasi Kendaraan Bermotor',
    level_6_full_code: '45201',
    level_6_name: 'Reparasi Mesin dan Kendaraan Bermotor Roda Dua',
    index1: 'Positif',
    link_fasih: 'https://fasih.bps.go.id/survey/TBN-00125',
  },
  {
    assignment_id: 'TBN-00126',
    nama_usaha: 'Toko Berkah',
    nama_di_prelist: 'Toko Berkah',
    kbli_akhir: '47112',
    kategori: 'Perdagangan',
    kategori_2025: 'Perdagangan Eceran',
    keg_utama: 'Minimarket kelontong dan penjualan barang konsumsi sehari-hari',
    status: 'Belum Dicek',
    assignment_status_alias: 'Aktif',
    level_3_full_code: 'G.47',
    level_3_name: 'Perdagangan Eceran',
    level_4_full_code: '471',
    level_4_name: 'Perdagangan Eceran',
    level_6_full_code: '47112',
    level_6_name: 'Minimarket dan Toko Kelontong Modern',
    index1: 'Positif',
    link_fasih: 'https://fasih.bps.go.id/survey/TBN-00126',
  },
  {
    assignment_id: 'TBN-00127',
    nama_usaha: 'Roti Bu Tini',
    nama_di_prelist: 'Roti Bu Tini',
    kbli_akhir: '10710',
    kategori: 'Industri',
    kategori_2025: 'Industri Pengolahan',
    keg_utama: 'Produksi aneka roti manis, kue basah, dan jajanan pasar',
    status: 'Selesai Dicek',
    assignment_status_alias: 'Aktif',
    level_3_full_code: 'C.10',
    level_3_name: 'Industri Makanan',
    level_4_full_code: '107',
    level_4_name: 'Industri Makanan Lainnya',
    level_6_full_code: '10710',
    level_6_name: 'Industri Produk Roti dan Kue',
    index1: 'Positif',
    link_fasih: 'https://fasih.bps.go.id/survey/TBN-00127',
  },
  {
    assignment_id: 'TBN-00128',
    nama_usaha: 'RM Ikan Bakar Tuban',
    nama_di_prelist: 'RM Ikan Bakar Tuban',
    kbli_akhir: '56101',
    kategori: 'Akomodasi & Makan Minum',
    kategori_2025: 'Penyediaan Makan Minum',
    keg_utama: 'Rumah makan tradisional olahan ikan laut dan aneka seafood',
    status: 'Perlu Konfirmasi',
    assignment_status_alias: 'Aktif',
    level_3_full_code: 'I.56',
    level_3_name: 'Penyediaan Makanan dan Minuman',
    level_4_full_code: '561',
    level_4_name: 'Restoran dan Rumah Makan',
    level_6_full_code: '56101',
    level_6_name: 'Restoran dan Rumah Makan Tradisional Pesisir',
    index1: 'Negatif',
    link_fasih: 'https://fasih.bps.go.id/survey/TBN-00128',
  },
  {
    assignment_id: 'TBN-00129',
    nama_usaha: 'Batik Tulis Tenun Gedog',
    nama_di_prelist: 'Batik Tulis Tenun Gedog',
    kbli_akhir: '13121',
    kategori: 'Industri',
    kategori_2025: 'Industri Pengolahan',
    keg_utama: 'Pembuatan kain tenun gedog dan batik tulis khas Tuban',
    status: 'Selesai Dicek',
    assignment_status_alias: 'Aktif',
    level_3_full_code: 'C.13',
    level_3_name: 'Industri Tekstil',
    level_4_full_code: '131',
    level_4_name: 'Industri Pemintalan & Pertenunan',
    level_6_full_code: '13121',
    level_6_name: 'Industri Pertenunan Kain dan Batik Tradisional',
    index1: 'Positif',
    link_fasih: 'https://fasih.bps.go.id/survey/TBN-00129',
  }
]

const initialSeedNtb = [
  {
    assignment_id: 'TBN-00124',
    nama_principal: 'Warung Sumber Rejeki',
    kategori: 'Perdagangan',
    kbli_akhir: '47111',
    tahun_operasi: 2024,
    catatan: 'Omzet belum terisi lengkap di form Fasih, perlu konfirmasi ulang',
    r27a_omzet: '0',
    r26c_biaya_pembelian: '0',
    r26b_biaya_produksi: '0',
    r26d_biaya_operasional: '0',
    nilai_tambah: '0',
    level_2_full_code: '52',
    level_6_full_code: '5260101001',
    link_fasih: 'https://fasih.bps.go.id/survey/TBN-00124',
    source_file: 'ntb_2025.csv',
    source_folder: 'Tuban/01',
  },
  {
    assignment_id: 'TBN-00125',
    nama_principal: 'Bengkel Maju Jaya',
    kategori: 'Jasa',
    kbli_akhir: '45201',
    tahun_operasi: 2023,
    catatan: 'Perlu konfirmasi rincian biaya pembelian spare part roda dua',
    r27a_omzet: '12.000.000',
    r26c_biaya_pembelian: '4.500.000',
    r26b_biaya_produksi: '1.800.000',
    r26d_biaya_operasional: '2.100.000',
    nilai_tambah: '3.600.000',
    level_2_full_code: '52',
    level_6_full_code: '5260101002',
    link_fasih: 'https://fasih.bps.go.id/survey/TBN-00125',
    source_file: 'ntb_2025.csv',
    source_folder: 'Tuban/01',
  },
  {
    assignment_id: 'TBN-00126',
    nama_principal: 'Toko Berkah',
    kategori: 'Perdagangan',
    kbli_akhir: '47112',
    tahun_operasi: 2024,
    catatan: 'Data penjualan dan pengeluaran lengkap sesuai pembukuan',
    r27a_omzet: '8.600.000',
    r26c_biaya_pembelian: '2.100.000',
    r26b_biaya_produksi: '900.000',
    r26d_biaya_operasional: '1.100.000',
    nilai_tambah: '4.400.000',
    level_2_full_code: '52',
    level_6_full_code: '5260101003',
    link_fasih: 'https://fasih.bps.go.id/survey/TBN-00126',
    source_file: 'ntb_2025.csv',
    source_folder: 'Tuban/02',
  },
  {
    assignment_id: 'TBN-00127',
    nama_principal: 'Roti Bu Tini',
    kategori: 'Industri',
    kbli_akhir: '10710',
    tahun_operasi: 2022,
    catatan: 'NTB normal dan konsisten dengan kapasitas produksi harian',
    r27a_omzet: '24.500.000',
    r26c_biaya_pembelian: '11.000.000',
    r26b_biaya_produksi: '3.200.000',
    r26d_biaya_operasional: '2.800.000',
    nilai_tambah: '7.500.000',
    level_2_full_code: '52',
    level_6_full_code: '5260101004',
    link_fasih: 'https://fasih.bps.go.id/survey/TBN-00127',
    source_file: 'ntb_2025.csv',
    source_folder: 'Tuban/02',
  },
  {
    assignment_id: 'TBN-00128',
    nama_principal: 'RM Ikan Bakar Tuban',
    kategori: 'Akomodasi & Makan Minum',
    kbli_akhir: '56101',
    tahun_operasi: 2021,
    catatan: 'Biaya pembelian ikan dan bumbu laut melebihi estimasi omzet',
    r27a_omzet: '18.000.000',
    r26c_biaya_pembelian: '14.200.000',
    r26b_biaya_produksi: '2.100.000',
    r26d_biaya_operasional: '2.500.000',
    nilai_tambah: '-800.000',
    level_2_full_code: '52',
    level_6_full_code: '5260101005',
    link_fasih: 'https://fasih.bps.go.id/survey/TBN-00128',
    source_file: 'ntb_2025.csv',
    source_folder: 'Tuban/03',
  },
  {
    assignment_id: 'TBN-00129',
    nama_principal: 'Batik Tulis Tenun Gedog',
    kategori: 'Industri',
    kbli_akhir: '13121',
    tahun_operasi: 2023,
    catatan: 'Biaya pembelian benang dan pewarna alami sebanding dengan nilai tambah',
    r27a_omzet: '16.000.000',
    r26c_biaya_pembelian: '5.800.000',
    r26b_biaya_produksi: '2.400.000',
    r26d_biaya_operasional: '1.600.000',
    nilai_tambah: '6.200.000',
    level_2_full_code: '52',
    level_6_full_code: '5260101006',
    link_fasih: 'https://fasih.bps.go.id/survey/TBN-00129',
    source_file: 'ntb_2025.csv',
    source_folder: 'Tuban/03',
  }
]

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

// Ensures PostgreSQL tables and necessary columns exist
async function ensureTables() {
  if (!process.env.DATABASE_URL) return

  await pool.query(`
    CREATE TABLE IF NOT EXISTS kbli_checks (
      id SERIAL PRIMARY KEY,
      assignment_id TEXT,
      level_3_full_code TEXT,
      level_3_name TEXT,
      level_4_full_code TEXT,
      level_4_name TEXT,
      level_6_full_code TEXT,
      level_6_name TEXT,
      assignment_status_alias TEXT,
      status TEXT,
      nama_di_prelist TEXT,
      nama_usaha TEXT,
      kategori TEXT,
      kategori_2025 TEXT,
      kbli_akhir TEXT,
      keg_utama TEXT,
      index1 TEXT,
      link_fasih TEXT
    );

    CREATE TABLE IF NOT EXISTS negative_ntb_checks (
      id SERIAL PRIMARY KEY,
      assignment_id TEXT,
      level_2_full_code TEXT,
      level_6_full_code TEXT,
      nama_principal TEXT,
      kategori TEXT,
      kbli_akhir TEXT,
      tahun_operasi INTEGER,
      catatan TEXT,
      r27a_omzet TEXT,
      r26c_biaya_pembelian TEXT,
      r26b_biaya_produksi TEXT,
      r26d_biaya_operasional TEXT,
      nilai_tambah TEXT,
      link_fasih TEXT,
      source_file TEXT,
      source_folder TEXT
    );

    ALTER TABLE kbli_checks ADD COLUMN IF NOT EXISTS assignment_id TEXT;
    ALTER TABLE kbli_checks ADD COLUMN IF NOT EXISTS link_fasih TEXT;
    ALTER TABLE kbli_checks ADD COLUMN IF NOT EXISTS nama_usaha TEXT;
    ALTER TABLE kbli_checks ADD COLUMN IF NOT EXISTS kbli_akhir TEXT;
    ALTER TABLE kbli_checks ADD COLUMN IF NOT EXISTS status TEXT;

    ALTER TABLE negative_ntb_checks ADD COLUMN IF NOT EXISTS assignment_id TEXT;
    ALTER TABLE negative_ntb_checks ADD COLUMN IF NOT EXISTS link_fasih TEXT;
    ALTER TABLE negative_ntb_checks ADD COLUMN IF NOT EXISTS nama_principal TEXT;
    ALTER TABLE negative_ntb_checks ADD COLUMN IF NOT EXISTS nilai_tambah TEXT;
    ALTER TABLE negative_ntb_checks ADD COLUMN IF NOT EXISTS catatan TEXT;
  `)

  // Check if tables are completely empty; if so, populate initial seed so database has live data
  const countRes = await pool.query(`
    SELECT 
      (SELECT COUNT(*) FROM kbli_checks) AS kbli_count,
      (SELECT COUNT(*) FROM negative_ntb_checks) AS ntb_count
  `)

  const kbliCount = parseInt(countRes.rows[0]?.kbli_count || '0', 10)
  const ntbCount = parseInt(countRes.rows[0]?.ntb_count || '0', 10)

  if (kbliCount === 0) {
    for (const k of initialSeedKbli) {
      await pool.query(`
        INSERT INTO kbli_checks (
          assignment_id, nama_usaha, nama_di_prelist, kbli_akhir, kategori, kategori_2025,
          keg_utama, status, assignment_status_alias, level_3_full_code, level_3_name,
          level_4_full_code, level_4_name, level_6_full_code, level_6_name, index1, link_fasih
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
      `, [
        k.assignment_id, k.nama_usaha, k.nama_di_prelist, k.kbli_akhir, k.kategori, k.kategori_2025,
        k.keg_utama, k.status, k.assignment_status_alias, k.level_3_full_code, k.level_3_name,
        k.level_4_full_code, k.level_4_name, k.level_6_full_code, k.level_6_name, k.index1, k.link_fasih
      ])
    }
  }

  if (ntbCount === 0) {
    for (const n of initialSeedNtb) {
      await pool.query(`
        INSERT INTO negative_ntb_checks (
          assignment_id, nama_principal, kategori, kbli_akhir, tahun_operasi, catatan,
          r27a_omzet, r26c_biaya_pembelian, r26b_biaya_produksi, r26d_biaya_operasional,
          nilai_tambah, level_2_full_code, level_6_full_code, link_fasih, source_file, source_folder
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      `, [
        n.assignment_id, n.nama_principal, n.kategori, n.kbli_akhir, n.tahun_operasi, n.catatan,
        n.r27a_omzet, n.r26c_biaya_pembelian, n.r26b_biaya_produksi, n.r26d_biaya_operasional,
        n.nilai_tambah, n.level_2_full_code, n.level_6_full_code, n.link_fasih, n.source_file, n.source_folder
      ])
    }
  }
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

      return NextResponse.json({ ok: true, message: `Assignment ${assignmentId} berhasil ditambahkan ke database.` })
    }

    return NextResponse.json({ error: 'Aksi tidak dikenal' }, { status: 400 })
  } catch (err: any) {
    console.error('Error in POST /api/check-data:', err)
    return NextResponse.json({ error: err.message || 'Gagal menyimpan perubahan ke database.' }, { status: 500 })
  }
}
