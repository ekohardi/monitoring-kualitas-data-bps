#!/usr/bin/env node

/**
 * Migration runner for Local PostgreSQL
 * Usage:
 *   node scripts/migrate.js
 *   npm run db:migrate
 */

const fs = require('fs')
const path = require('path')
const { Pool } = require('pg')

// Load environment variables from .env.local or .env if present
function loadEnv() {
  const envFiles = ['.env.local', '.env']
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file)
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8')
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim()
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIdx = trimmed.indexOf('=')
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim()
            let val = trimmed.slice(eqIdx + 1).trim()
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1)
            }
            if (!process.env[key]) {
              process.env[key] = val
            }
          }
        }
      })
      console.log(`[info] Loaded environment configuration from: ${file}`)
      break
    }
  }
}

loadEnv()

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('\n[ERROR] DATABASE_URL is not defined!')
  console.error('Please create a .env or .env.local file with your PostgreSQL connection URL.')
  console.error('Example:')
  console.error('DATABASE_URL="postgresql://postgres:postgres@localhost:5432/monitoring_kualitas_bps"\n')
  process.exit(1)
}

const pool = new Pool({
  connectionString: databaseUrl,
})

async function runMigration() {
  console.log('\n======================================================')
  console.log('   MIGRASI STRUKTUR DATABASE POSTGRESQL LOKAL')
  console.log('   Sistem Monitoring Kualitas Data - BPS Tuban')
  console.log('======================================================\n')
  console.log(`[connecting] Target database URL: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`)

  const sqlFilePath = path.resolve(__dirname, '../database/migrate.sql')
  if (!fs.existsSync(sqlFilePath)) {
    console.error(`[ERROR] File migrasi tidak ditemukan: ${sqlFilePath}`)
    process.exit(1)
  }

  const sqlContent = fs.readFileSync(sqlFilePath, 'utf8')

  try {
    const client = await pool.connect()
    console.log('[connected] Berhasil terhubung ke server PostgreSQL!')
    console.log('[executing] Menjalankan DDL schema dan data awal (database/migrate.sql)...')

    await client.query(sqlContent)

    // Verify created tables
    const tableRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `)

    console.log('\n[success] Migrasi PostgreSQL berhasil diselesaikan!')
    console.log('[info] Daftar tabel di database public:')
    tableRes.rows.forEach(r => console.log(`  - ${r.table_name}`))

    client.release()
  } catch (err) {
    console.error('\n[ERROR] Terjadi kesalahan saat migrasi:')
    console.error(err.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runMigration()
