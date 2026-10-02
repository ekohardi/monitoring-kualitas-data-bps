import { pool } from './index'

export const initialSeedKbli = [
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

export const initialSeedNtb = [
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

// Ensures PostgreSQL tables, columns, and seed exist in database
export async function ensureTables() {
  if (!process.env.DATABASE_URL) return

  try {
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

      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_initials TEXT,
        user_name TEXT,
        action_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `)

    // Check if tables are completely empty; if so, populate initial seed so database has live data
    const countRes = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM kbli_checks) AS kbli_count,
        (SELECT COUNT(*) FROM negative_ntb_checks) AS ntb_count
    `).catch(() => ({ rows: [{ kbli_count: 0, ntb_count: 0 }] }))

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
        ]).catch(() => null)
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
        ]).catch(() => null)
      }
    }
  } catch (err) {
    console.error('ensureTables error:', err)
  }
}
