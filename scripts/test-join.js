const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

async function main() {
  const env = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8')
  const match = env.match(/DATABASE_URL=["']?([^"'\r\n]+)/)
  const pool = new Pool({ connectionString: match[1] })

  console.time('join_query')
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
  `)
  console.timeEnd('join_query')

  console.log(`Fetched ${res.rows.length} joined rows!`)
  console.log('Sample row:', res.rows[0])

  await pool.end()
}

main().catch(console.error)
