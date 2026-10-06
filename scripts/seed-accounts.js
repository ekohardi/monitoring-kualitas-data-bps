const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

async function run() {
  const { hashPassword } = await import('better-auth/crypto')

  let dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    const envPath = path.resolve(process.cwd(), '.env.local')
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8')
      const match = content.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/)
      if (match) dbUrl = match[1]
    }
  }

  if (!dbUrl) {
    console.error('DATABASE_URL not found')
    process.exit(1)
  }

  const pool = new Pool({ connectionString: dbUrl })
  const defaultPassword = 'admin123'
  const hash = await hashPassword(defaultPassword)

  console.log(`Setting password '${defaultPassword}' for initial accounts...`)

  const accounts = [
    { id: 'acc-admin-01', userId: 'usr-admin-01' },
    { id: 'acc-rina-02', userId: 'usr-rina-02' },
    { id: 'acc-dwi-03', userId: 'usr-dwi-03' },
    { id: 'acc-eko-04', userId: 'usr-eko-04' },
    { id: 'acc-sys-05', userId: 'bps-admin-user' },
  ]

  for (const acc of accounts) {
    await pool.query(
      `
      INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
      VALUES ($1, $2, 'credential', $2, $3, NOW(), NOW())
      ON CONFLICT (id) DO UPDATE 
      SET password = EXCLUDED.password, "accountId" = EXCLUDED."accountId", "userId" = EXCLUDED."userId";
    `,
      [acc.id, acc.userId, hash]
    )
    console.log(`[OK] Account seeded for user ID: ${acc.userId}`)
  }

  const res = await pool.query(`
    SELECT u.name, u.email, u.username, u.role, a.password IS NOT NULL as has_password
    FROM "user" u
    LEFT JOIN "account" a ON a."userId" = u.id AND a."providerId" = 'credential';
  `)

  console.log('\nVerified users and password status in database:')
  console.table(res.rows)

  await pool.end()
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
