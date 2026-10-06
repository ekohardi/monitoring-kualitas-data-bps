const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

async function main() {
  const env = fs.readFileSync('.env.local', 'utf8')
  const match = env.match(/DATABASE_URL=["']?([^"'\r\n]+)/)
  const pool = new Pool({ connectionString: match[1] })

  const users = await pool.query('SELECT id, name, email, username FROM "user"')
  console.log('Users in database:', users.rows)

  const constraints = await pool.query(`
    SELECT conname, contype, pg_get_constraintdef(c.oid)
    FROM pg_constraint c
    JOIN pg_namespace n ON n.oid = c.connamespace
    WHERE conrelid = 'kbli_checks'::regclass;
  `)
  console.log('Constraints on kbli_checks:', constraints.rows)

  await pool.end()
}

main().catch(console.error)
