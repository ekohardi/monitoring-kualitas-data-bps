import { db, pool } from '@/lib/db'
import { kbliChecks, negativeNtbChecks } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const fallbackCrossTable = [
  {
    assignmentId: 'TBN-00124',
    namaPrincipal: 'Warung Sumber Rejeki',
    ntbKbliAkhir: '47111',
    ntbKategori: 'Perdagangan',
    ntbCatatan: 'Omzet belum terisi lengkap',
    ntbNilaiTambah: '0',
    ntbLinkFasih: 'https://fasih.bps.go.id/survey/TBN-00124',
    ntbId: 101,
    ntbLevel2FullCode: '52',
    ntbLevel6FullCode: '5260101001',
    ntbTahunOperasi: 2024,
    ntbOmzet: '0',
    ntbBiayaPembelian: '0',
    ntbBiayaProduksi: '0',
    ntbBiayaOperasional: '0',
    ntbSourceFile: 'ntb_2025.csv',
    ntbSourceFolder: 'Tuban/01',

    kbliId: 1,
    kbliAssignmentId: 'TBN-00124',
    kbliNamaUsaha: 'Warung Sumber Rejeki',
    kbliAkhir: '47111',
    kbliNamaPrelist: 'Warung Sumber Rejeki',
    kbliKategori: 'Perdagangan',
    kbliStatus: 'Selesai Dicek',
    kbliKegUtama: 'Jual sembako dan kebutuhan harian',
    kbliLinkFasih: 'https://fasih.bps.go.id/survey/TBN-00124',
    kbliLevel3FullCode: 'G.47',
    kbliLevel3Name: 'Perdagangan Eceran',
    kbliLevel4FullCode: '471',
    kbliLevel4Name: 'Perdagangan Eceran di Toko',
    kbliLevel6FullCode: '47111',
    kbliLevel6Name: 'Perdagangan Eceran Berbagai Barang yang Utamanya Makanan di Toko',
    kbliAssignmentStatusAlias: 'Aktif',
    kbliKategori2025: 'Perdagangan',
    kbliIndex1: 'Negatif',
  },
  {
    assignmentId: 'TBN-00125',
    namaPrincipal: 'Bengkel Maju Jaya',
    ntbKbliAkhir: '45201',
    ntbKategori: 'Jasa',
    ntbCatatan: 'Perlu konfirmasi biaya pembelian spare part',
    ntbNilaiTambah: '3.600.000',
    ntbLinkFasih: 'https://fasih.bps.go.id/survey/TBN-00125',
    ntbId: 102,
    ntbLevel2FullCode: '52',
    ntbLevel6FullCode: '5260101002',
    ntbTahunOperasi: 2023,
    ntbOmzet: '12.000.000',
    ntbBiayaPembelian: '4.500.000',
    ntbBiayaProduksi: '1.800.000',
    ntbBiayaOperasional: '2.100.000',
    ntbSourceFile: 'ntb_2025.csv',
    ntbSourceFolder: 'Tuban/01',

    kbliId: 2,
    kbliAssignmentId: 'TBN-00125',
    kbliNamaUsaha: 'Bengkel Maju Jaya',
    kbliAkhir: '45201',
    kbliNamaPrelist: 'Bengkel Maju Jaya',
    kbliKategori: 'Jasa',
    kbliStatus: 'Perlu Konfirmasi',
    kbliKegUtama: 'Bengkel perbaikan mesin & ganti oli kendaraan',
    kbliLinkFasih: 'https://fasih.bps.go.id/survey/TBN-00125',
    kbliLevel3FullCode: 'S.95',
    kbliLevel3Name: 'Reparasi Komputer & Barang Keperluan Pribadi',
    kbliLevel4FullCode: '452',
    kbliLevel4Name: 'Reparasi dan Perawatan Mobil',
    kbliLevel6FullCode: '45201',
    kbliLevel6Name: 'Reparasi Mobil dan Mesin Kendaraan Bermotor',
    kbliAssignmentStatusAlias: 'Aktif',
    kbliKategori2025: 'Jasa Reparasi',
    kbliIndex1: 'Positif',
  },
  {
    assignmentId: 'TBN-00126',
    namaPrincipal: 'Toko Berkah',
    ntbKbliAkhir: '47112',
    ntbKategori: 'Perdagangan',
    ntbCatatan: 'Data lengkap dan valid sesuai kuisioner',
    ntbNilaiTambah: '4.400.000',
    ntbLinkFasih: 'https://fasih.bps.go.id/survey/TBN-00126',
    ntbId: 103,
    ntbLevel2FullCode: '52',
    ntbLevel6FullCode: '5260101003',
    ntbTahunOperasi: 2024,
    ntbOmzet: '8.600.000',
    ntbBiayaPembelian: '2.100.000',
    ntbBiayaProduksi: '900.000',
    ntbBiayaOperasional: '1.100.000',
    ntbSourceFile: 'ntb_2025.csv',
    ntbSourceFolder: 'Tuban/02',

    kbliId: 3,
    kbliAssignmentId: 'TBN-00126',
    kbliNamaUsaha: 'Toko Berkah',
    kbliAkhir: '47112',
    kbliNamaPrelist: 'Toko Berkah',
    kbliKategori: 'Perdagangan',
    kbliStatus: 'Belum Dicek',
    kbliKegUtama: 'Penjualan eceran sembako dan kelontong',
    kbliLinkFasih: 'https://fasih.bps.go.id/survey/TBN-00126',
    kbliLevel3FullCode: 'G.47',
    kbliLevel3Name: 'Perdagangan Eceran',
    kbliLevel4FullCode: '471',
    kbliLevel4Name: 'Perdagangan Eceran',
    kbliLevel6FullCode: '47112',
    kbliLevel6Name: 'Minimarket dan Toko Kelontong',
    kbliAssignmentStatusAlias: 'Aktif',
    kbliKategori2025: 'Perdagangan',
    kbliIndex1: 'Positif',
  },
  {
    assignmentId: 'TBN-00127',
    namaPrincipal: 'Roti Bu Tini',
    ntbKbliAkhir: '10710',
    ntbKategori: 'Industri',
    ntbCatatan: 'NTB normal di atas rata-rata klaster',
    ntbNilaiTambah: '7.500.000',
    ntbLinkFasih: 'https://fasih.bps.go.id/survey/TBN-00127',
    ntbId: 104,
    ntbLevel2FullCode: '52',
    ntbLevel6FullCode: '5260101004',
    ntbTahunOperasi: 2022,
    ntbOmzet: '24.500.000',
    ntbBiayaPembelian: '11.000.000',
    ntbBiayaProduksi: '3.200.000',
    ntbBiayaOperasional: '2.800.000',
    ntbSourceFile: 'ntb_2025.csv',
    ntbSourceFolder: 'Tuban/02',

    kbliId: 4,
    kbliAssignmentId: 'TBN-00127',
    kbliNamaUsaha: 'Roti Bu Tini',
    kbliAkhir: '10710',
    kbliNamaPrelist: 'Roti Bu Tini',
    kbliKategori: 'Industri',
    kbliStatus: 'Selesai Dicek',
    kbliKegUtama: 'Produksi roti manis dan aneka kue basah',
    kbliLinkFasih: 'https://fasih.bps.go.id/survey/TBN-00127',
    kbliLevel3FullCode: 'C.10',
    kbliLevel3Name: 'Industri Makanan',
    kbliLevel4FullCode: '107',
    kbliLevel4Name: 'Industri Makanan Lainnya',
    kbliLevel6FullCode: '10710',
    kbliLevel6Name: 'Industri Produk Roti dan Kue',
    kbliAssignmentStatusAlias: 'Aktif',
    kbliKategori2025: 'Industri Pengolahan',
    kbliIndex1: 'Positif',
  },
  {
    assignmentId: 'TBN-00128',
    namaPrincipal: 'RM Ikan Bakar Tuban',
    ntbKbliAkhir: '56101',
    ntbKategori: 'Akomodasi & Makan Minum',
    ntbCatatan: 'Biaya pembelian bahan baku melebihi estimasi omzet',
    ntbNilaiTambah: '-800.000',
    ntbLinkFasih: 'https://fasih.bps.go.id/survey/TBN-00128',
    ntbId: 105,
    ntbLevel2FullCode: '52',
    ntbLevel6FullCode: '5260101005',
    ntbTahunOperasi: 2021,
    ntbOmzet: '18.000.000',
    ntbBiayaPembelian: '14.200.000',
    ntbBiayaProduksi: '2.100.000',
    ntbBiayaOperasional: '2.500.000',
    ntbSourceFile: 'ntb_2025.csv',
    ntbSourceFolder: 'Tuban/03',

    kbliId: 5,
    kbliAssignmentId: 'TBN-00128',
    kbliNamaUsaha: 'RM Ikan Bakar Tuban',
    kbliAkhir: '56101',
    kbliNamaPrelist: 'RM Ikan Bakar Tuban',
    kbliKategori: 'Akomodasi & Makan Minum',
    kbliStatus: 'Perlu Konfirmasi',
    kbliKegUtama: 'Warung makan ikan bakar dan sari laut',
    kbliLinkFasih: 'https://fasih.bps.go.id/survey/TBN-00128',
    kbliLevel3FullCode: 'I.56',
    kbliLevel3Name: 'Penyediaan Makanan dan Minuman',
    kbliLevel4FullCode: '561',
    kbliLevel4Name: 'Restoran dan Rumah Makan',
    kbliLevel6FullCode: '56101',
    kbliLevel6Name: 'Restoran/Rumah Makan Tradisional',
    kbliAssignmentStatusAlias: 'Aktif',
    kbliKategori2025: 'Penyediaan Makan Minum',
    kbliIndex1: 'Negatif',
  },
]

export async function GET() {
  // Method 1: Query database using pool with fallback raw query for maximum column resilience
  try {
    if (process.env.DATABASE_URL) {
      const rawJoinResult = await pool.query(`
        SELECT 
          COALESCE(k.assignment_id, n.assignment_id) AS "assignmentId",
          COALESCE(k.nama_usaha, n.nama_principal, k.nama_di_prelist) AS "namaUsaha",
          COALESCE(k.kbli_akhir, n.kbli_akhir) AS "kbliAkhir",
          COALESCE(k.link_fasih, n.link_fasih) AS "linkFasih",
          
          -- KBLI fields
          k.id AS "kbliId",
          k.assignment_id AS "kbliAssignmentId",
          k.nama_usaha AS "kbliNamaUsaha",
          k.nama_di_prelist AS "kbliNamaPrelist",
          k.kategori AS "kbliKategori",
          k.kategori_2025 AS "kbliKategori2025",
          k.kbli_akhir AS "kbliAkhirKbli",
          k.keg_utama AS "kbliKegUtama",
          k.index1 AS "kbliIndex1",
          k.status AS "kbliStatus",
          k.assignment_status_alias AS "kbliAssignmentStatusAlias",
          k.level_3_full_code AS "kbliLevel3FullCode",
          k.level_3_name AS "kbliLevel3Name",
          k.level_4_full_code AS "kbliLevel4FullCode",
          k.level_4_name AS "kbliLevel4Name",
          k.level_6_full_code AS "kbliLevel6FullCode",
          k.level_6_name AS "kbliLevel6Name",
          k.link_fasih AS "kbliLinkFasih",

          -- NTB fields
          n.id AS "ntbId",
          n.assignment_id AS "ntbAssignmentId",
          n.nama_principal AS "namaPrincipal",
          n.kategori AS "ntbKategori",
          n.kbli_akhir AS "ntbKbliAkhir",
          n.tahun_operasi AS "ntbTahunOperasi",
          n.catatan AS "ntbCatatan",
          n.r27a_omzet AS "ntbOmzet",
          n.r26c_biaya_pembelian AS "ntbBiayaPembelian",
          n.r26b_biaya_produksi AS "ntbBiayaProduksi",
          n.r26d_biaya_operasional AS "ntbBiayaOperasional",
          n.nilai_tambah AS "ntbNilaiTambah",
          n.level_2_full_code AS "ntbLevel2FullCode",
          n.level_6_full_code AS "ntbLevel6FullCode",
          n.source_file AS "ntbSourceFile",
          n.source_folder AS "ntbSourceFolder",
          n.link_fasih AS "ntbLinkFasih"
        FROM kbli_checks k
        FULL OUTER JOIN negative_ntb_checks n 
          ON TRIM(LOWER(k.assignment_id)) = TRIM(LOWER(n.assignment_id))
        ORDER BY COALESCE(k.assignment_id, n.assignment_id) ASC
        LIMIT 1000
      `)

      if (rawJoinResult.rows && rawJoinResult.rows.length > 0) {
        return NextResponse.json(rawJoinResult.rows)
      }
    }
  } catch (errRaw) {
    console.error('Raw join query error, attempting Drizzle join:', errRaw)
  }

  // Method 2: Try Drizzle ORM select
  try {
    const rows = await db
      .select({
        assignmentId: negativeNtbChecks.assignmentId,
        namaPrincipal: negativeNtbChecks.namaPrincipal,
        ntbKbliAkhir: negativeNtbChecks.kbliAkhir,
        ntbKategori: negativeNtbChecks.kategori,
        ntbCatatan: negativeNtbChecks.catatan,
        ntbNilaiTambah: negativeNtbChecks.nilaiTambah,
        ntbLinkFasih: negativeNtbChecks.linkFasih,
        ntbId: negativeNtbChecks.id,
        ntbLevel2FullCode: negativeNtbChecks.level2FullCode,
        ntbLevel6FullCode: negativeNtbChecks.level6FullCode,
        ntbTahunOperasi: negativeNtbChecks.tahunOperasi,
        ntbOmzet: negativeNtbChecks.r27aOmzet,
        ntbBiayaPembelian: negativeNtbChecks.r26cBiayaPembelian,
        ntbBiayaProduksi: negativeNtbChecks.r26bBiayaProduksi,
        ntbBiayaOperasional: negativeNtbChecks.r26dBiayaOperasional,
        ntbSourceFile: negativeNtbChecks.sourceFile,
        ntbSourceFolder: negativeNtbChecks.sourceFolder,

        kbliId: kbliChecks.id,
        kbliAssignmentId: kbliChecks.assignmentId,
        kbliNamaUsaha: kbliChecks.namaUsaha,
        kbliAkhir: kbliChecks.kbliAkhir,
        kbliNamaPrelist: kbliChecks.namaDiPrelist,
        kbliKategori: kbliChecks.kategori,
        kbliStatus: kbliChecks.status,
        kbliKegUtama: kbliChecks.kegUtama,
        kbliLinkFasih: kbliChecks.linkFasih,
        kbliLevel3FullCode: kbliChecks.level3FullCode,
        kbliLevel3Name: kbliChecks.level3Name,
        kbliLevel4FullCode: kbliChecks.level4FullCode,
        kbliLevel4Name: kbliChecks.level4Name,
        kbliLevel6FullCode: kbliChecks.level6FullCode,
        kbliLevel6Name: kbliChecks.level6Name,
        kbliAssignmentStatusAlias: kbliChecks.assignmentStatusAlias,
        kbliKategori2025: kbliChecks.kategori2025,
        kbliIndex1: kbliChecks.index1,
      })
      .from(negativeNtbChecks)
      .fullJoin(kbliChecks, eq(negativeNtbChecks.assignmentId, kbliChecks.assignmentId))
      .limit(1000)

    if (rows && rows.length > 0) {
      return NextResponse.json(rows)
    }
  } catch (error) {
    console.error('Error querying check-data cross-table with Drizzle:', error)
  }

  // Method 3: Query both tables separately and join in JS to avoid SQL join syntax issues
  try {
    if (process.env.DATABASE_URL) {
      const [kbliRes, ntbRes] = await Promise.all([
        pool.query(`SELECT * FROM kbli_checks LIMIT 1000`).catch(() => ({ rows: [] })),
        pool.query(`SELECT * FROM negative_ntb_checks LIMIT 1000`).catch(() => ({ rows: [] }))
      ])

      if (kbliRes.rows.length > 0 || ntbRes.rows.length > 0) {
        const mergedMap = new Map<string, any>()

        for (const k of kbliRes.rows) {
          const id = (k.assignment_id || `KBLI-${k.id}`).trim()
          mergedMap.set(id.toLowerCase(), {
            assignmentId: id,
            namaUsaha: k.nama_usaha || k.nama_di_prelist,
            kbliAkhir: k.kbli_akhir,
            linkFasih: k.link_fasih,
            
            kbliId: k.id,
            kbliAssignmentId: k.assignment_id,
            kbliNamaUsaha: k.nama_usaha,
            kbliNamaPrelist: k.nama_di_prelist,
            kbliKategori: k.kategori,
            kbliKategori2025: k.kategori_2025,
            kbliAkhirKbli: k.kbli_akhir,
            kbliKegUtama: k.keg_utama,
            kbliIndex1: k.index1,
            kbliStatus: k.status,
            kbliAssignmentStatusAlias: k.assignment_status_alias,
            kbliLevel3FullCode: k.level_3_full_code,
            kbliLevel3Name: k.level_3_name,
            kbliLevel4FullCode: k.level_4_full_code,
            kbliLevel4Name: k.level_4_name,
            kbliLevel6FullCode: k.level_6_full_code,
            kbliLevel6Name: k.level_6_name,
            kbliLinkFasih: k.link_fasih,
          })
        }

        for (const n of ntbRes.rows) {
          const id = (n.assignment_id || `NTB-${n.id}`).trim()
          const key = id.toLowerCase()
          const existing = mergedMap.get(key) || { assignmentId: id }

          mergedMap.set(key, {
            ...existing,
            assignmentId: existing.assignmentId || id,
            namaUsaha: existing.namaUsaha || n.nama_principal,
            kbliAkhir: existing.kbliAkhir || n.kbli_akhir,
            linkFasih: existing.linkFasih || n.link_fasih,
            
            ntbId: n.id,
            ntbAssignmentId: n.assignment_id,
            namaPrincipal: n.nama_principal,
            ntbKategori: n.kategori,
            ntbKbliAkhir: n.kbli_akhir,
            ntbTahunOperasi: n.tahun_operasi,
            ntbCatatan: n.catatan,
            ntbNilaiTambah: n.nilai_tambah,
            ntbOmzet: n.r27a_omzet,
            ntbBiayaPembelian: n.r26c_biaya_pembelian,
            ntbBiayaProduksi: n.r26b_biaya_produksi,
            ntbBiayaOperasional: n.r26d_biaya_operasional,
            ntbLevel2FullCode: n.level_2_full_code,
            ntbLevel6FullCode: n.level_6_full_code,
            ntbSourceFile: n.source_file,
            ntbSourceFolder: n.source_folder,
            ntbLinkFasih: n.link_fasih,
          })
        }

        const rows = Array.from(mergedMap.values())
        if (rows.length > 0) {
          return NextResponse.json(rows)
        }
      }
    }
  } catch (errSep) {
    console.error('Separate table fetch error:', errSep)
  }

  // Fallback data only if database is offline or both tables are empty
  return NextResponse.json(fallbackCrossTable)
}
