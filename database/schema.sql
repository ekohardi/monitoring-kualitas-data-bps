-- ==============================================================================
-- DATABASE SCHEMA: Monitoring Kualitas Data BPS Kabupaten Tuban
-- Target: PostgreSQL 14+ / Local PostgreSQL
-- Compatible with: Better Auth + Drizzle ORM + Next.js
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. BETTER AUTH TABLES (Authentication & Authorization)
-- Note: "user", "session", "account", and "verification" are managed by Better Auth.
-- Note: "user" table is enclosed in double quotes because user is a reserved word.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS "user" (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
    image TEXT,
    username TEXT UNIQUE,
    role TEXT NOT NULL DEFAULT 'Petugas Lapangan',
    bidang TEXT DEFAULT 'Distribusi',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "session" (
    id TEXT PRIMARY KEY,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    token TEXT NOT NULL UNIQUE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
    id TEXT PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP WITH TIME ZONE,
    "refreshTokenExpiresAt" TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    password TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "verification" (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,
    value TEXT NOT NULL,
    "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 3. CORE APPLICATION & MONITORING TABLES
-- ==============================================================================

-- Tabel Pemeriksaan Klasifikasi Baku Lapangan Usaha Indonesia (KBLI)
CREATE TABLE IF NOT EXISTS kbli_checks (
    id SERIAL PRIMARY KEY,
    user_id TEXT,
    assignment_id TEXT,
    level_3_full_code TEXT,
    level_3_name TEXT,
    level_4_full_code TEXT,
    level_4_name TEXT,
    level_6_full_code TEXT,
    level_6_name TEXT,
    assignment_status_alias TEXT,
    status TEXT DEFAULT 'Belum Dicek',
    nama_di_prelist TEXT,
    nama_usaha TEXT,
    kategori TEXT,
    kategori_2025 TEXT,
    kbli_akhir TEXT,
    keg_utama TEXT,
    index1 TEXT,
    link_fasih TEXT,
    keterangan TEXT,
    perbaikan_kbli TEXT,
    check_kbli BOOLEAN DEFAULT FALSE,
    check_ntb BOOLEAN DEFAULT FALSE,
    check_kewajaran BOOLEAN DEFAULT FALSE,
    checked_by TEXT,
    checked_at TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Pemeriksaan Anomali Nilai Tambah Bruto (NTB Negatif)
CREATE TABLE IF NOT EXISTS negative_ntb_checks (
    id SERIAL PRIMARY KEY,
    user_id TEXT,
    assignment_id TEXT,
    level_2_full_code TEXT,
    level_6_full_code TEXT,
    nama_principal TEXT,
    nama_di_prelist TEXT,
    kategori TEXT,
    kategori_2025 TEXT,
    kbli_akhir TEXT,
    keg_utama TEXT,
    tahun_operasi INTEGER,
    catatan TEXT,
    keterangan TEXT,
    perbaikan_kbli TEXT,
    r27a_omzet TEXT,
    r26c_biaya_pembelian TEXT,
    r26b_biaya_produksi TEXT,
    r26d_biaya_operasional TEXT,
    nilai_tambah TEXT,
    link_fasih TEXT,
    source_file TEXT,
    source_folder TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Checklist Assignment (Status Verifikasi & Pemeriksa)
CREATE TABLE IF NOT EXISTS assignment_checks (
    assignment_id TEXT PRIMARY KEY,
    check_kbli BOOLEAN DEFAULT FALSE,
    check_ntb BOOLEAN DEFAULT FALSE,
    check_kewajaran BOOLEAN DEFAULT FALSE,
    checked_by TEXT,
    checked_at TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabel Log Aktivitas Pengguna (Audit Trail & Timeline Aktivitas Terbaru)
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_initials TEXT,
    user_name TEXT,
    action_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 4. PERFORMANCE INDEXES
-- ==============================================================================

-- Better Auth Indexes
CREATE INDEX IF NOT EXISTS idx_user_email ON "user" (email);
CREATE INDEX IF NOT EXISTS idx_user_username ON "user" (username);
CREATE INDEX IF NOT EXISTS idx_session_token ON "session" (token);
CREATE INDEX IF NOT EXISTS idx_session_user_id ON "session" ("userId");
CREATE INDEX IF NOT EXISTS idx_account_user_id ON "account" ("userId");

-- Application Query Indexes
CREATE INDEX IF NOT EXISTS idx_kbli_checks_assignment_id ON kbli_checks (assignment_id);
CREATE INDEX IF NOT EXISTS idx_kbli_checks_user_id ON kbli_checks (user_id);
CREATE INDEX IF NOT EXISTS idx_kbli_checks_status ON kbli_checks (status);
CREATE INDEX IF NOT EXISTS idx_kbli_checks_kbli_akhir ON kbli_checks (kbli_akhir);

CREATE INDEX IF NOT EXISTS idx_negative_ntb_checks_assignment_id ON negative_ntb_checks (assignment_id);
CREATE INDEX IF NOT EXISTS idx_negative_ntb_checks_user_id ON negative_ntb_checks (user_id);
CREATE INDEX IF NOT EXISTS idx_negative_ntb_checks_tahun ON negative_ntb_checks (tahun_operasi);

CREATE INDEX IF NOT EXISTS idx_assignment_checks_aid ON assignment_checks (assignment_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs (created_at DESC);

-- ==============================================================================
-- 5. AUTOMATIC TIMESTAMP TRIGGERS (Auto-update updated_at / "updatedAt")
-- ==============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_user_updatedat_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kbli_checks_updated_at ON kbli_checks;
CREATE TRIGGER trg_kbli_checks_updated_at
BEFORE UPDATE ON kbli_checks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_negative_ntb_checks_updated_at ON negative_ntb_checks;
CREATE TRIGGER trg_negative_ntb_checks_updated_at
BEFORE UPDATE ON negative_ntb_checks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_assignment_checks_updated_at ON assignment_checks;
CREATE TRIGGER trg_assignment_checks_updated_at
BEFORE UPDATE ON assignment_checks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_user_updatedat ON "user";
CREATE TRIGGER trg_user_updatedat
BEFORE UPDATE ON "user"
FOR EACH ROW EXECUTE FUNCTION update_user_updatedat_column();
