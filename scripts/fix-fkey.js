const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

async function main() {
  const env = fs.readFileSync(path.resolve(__dirname, '../.env.local'), 'utf8')
  const match = env.match(/DATABASE_URL=["']?([^"'\r\n]+)/)
  if (!match) {
    console.error('DATABASE_URL not found')
    process.exit(1)
  }

  const pool = new Pool({ connectionString: match[1] })

  console.log('Connecting to database to remove foreign key constraints...')
  await pool.query('ALTER TABLE kbli_checks DROP CONSTRAINT IF EXISTS kbli_checks_user_id_fkey;')
  await pool.query('ALTER TABLE negative_ntb_checks DROP CONSTRAINT IF EXISTS negative_ntb_checks_user_id_fkey;')

  console.log('[OK] Successfully dropped kbli_checks_user_id_fkey and negative_ntb_checks_user_id_fkey!')

  // Also verify constraints on kbli_checks
  const res = await pool.query(`
    SELECT conname, contype, pg_get_constraintdef(c.oid)
    FROM pg_constraint c
    WHERE conrelid = 'kbli_checks'::regclass;
  `)
  console.log('Remaining constraints on kbli_checks:')
  console.table(res.rows)

  await pool.end()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
