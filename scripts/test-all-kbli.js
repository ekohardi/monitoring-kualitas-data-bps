const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

async function main() {
  const env = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8')
  const match = env.match(/DATABASE_URL=["']?([^"'\r\n]+)/)
  const pool = new Pool({ connectionString: match[1] })

  console.time('fetch_all_kbli')
  const res = await pool.query('SELECT * FROM kbli_checks ORDER BY id ASC')
  console.timeEnd('fetch_all_kbli')

  console.log(`Fetched ${res.rows.length} rows successfully!`)
  const jsonStr = JSON.stringify(res.rows)
  console.log(`Payload size: ${(jsonStr.length / 1024 / 1024).toFixed(2)} MB`)

  await pool.end()
}

main().catch(console.error)
