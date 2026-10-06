-- ==============================================================================
-- ALL-IN-ONE MIGRATION SCRIPT FOR LOCAL POSTGRESQL
-- Monitoring Kualitas Data BPS Kabupaten Tuban
--
-- Usage with psql:
--   psql -U postgres -d <your_database_name> -f database/migrate.sql
--
-- Or execute entire script inside pgAdmin / DBeaver Query Tool
-- ==============================================================================

BEGIN;

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. BETTER AUTH TABLES (Authentication & Authorization)
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

-- 3. CORE APPLICATION & MONITORING TABLES

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

-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_user_email ON "user" (email);
CREATE INDEX IF NOT EXISTS idx_user_username ON "user" (username);
CREATE INDEX IF NOT EXISTS idx_session_token ON "session" (token);
CREATE INDEX IF NOT EXISTS idx_session_user_id ON "session" ("userId");
CREATE INDEX IF NOT EXISTS idx_account_user_id ON "account" ("userId");

CREATE INDEX IF NOT EXISTS idx_kbli_checks_assignment_id ON kbli_checks (assignment_id);
CREATE INDEX IF NOT EXISTS idx_kbli_checks_user_id ON kbli_checks (user_id);
CREATE INDEX IF NOT EXISTS idx_kbli_checks_status ON kbli_checks (status);
CREATE INDEX IF NOT EXISTS idx_kbli_checks_kbli_akhir ON kbli_checks (kbli_akhir);

CREATE INDEX IF NOT EXISTS idx_negative_ntb_checks_assignment_id ON negative_ntb_checks (assignment_id);
CREATE INDEX IF NOT EXISTS idx_negative_ntb_checks_user_id ON negative_ntb_checks (user_id);
CREATE INDEX IF NOT EXISTS idx_negative_ntb_checks_tahun ON negative_ntb_checks (tahun_operasi);

CREATE INDEX IF NOT EXISTS idx_assignment_checks_aid ON assignment_checks (assignment_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs (created_at DESC);

-- 5. AUTOMATIC TIMESTAMP TRIGGERS
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

-- 6. INITIAL SEED DATA

-- Initial Users
INSERT INTO "user" (id, name, email, "emailVerified", username, role, bidang, "createdAt", "updatedAt")
VALUES 
    ('usr-admin-01', 'Admin BPS Tuban', 'admin@bps.tuban.go.id', true, 'admin', 'Administrator', 'Distribusi', NOW(), NOW()),
    ('usr-rina-02', 'Admin Rina', 'rina@bps.tuban.go.id', true, 'rina', 'Administrator', 'Produksi', NOW(), NOW()),
    ('usr-dwi-03', 'Dwi Santoso', 'dwi.santoso@bps.tuban.go.id', true, 'dwisantoso', 'Petugas Kualitas', 'Distribusi', NOW(), NOW()),
    ('usr-eko-04', 'Eko Hardi', 'eko.hardi@bps.tuban.go.id', true, 'ekohardi', 'Reviewer', 'Sosial', NOW(), NOW())
ON CONFLICT (id) DO UPDATE 
SET 
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    username = EXCLUDED.username,
    role = EXCLUDED.role,
    bidang = EXCLUDED.bidang;

INSERT INTO "user" (id, name, email, "emailVerified", username, role, bidang, "createdAt", "updatedAt")
VALUES ('bps-admin-user', 'Admin BPS Tuban', 'admin.system@bps.tuban.go.id', true, 'bpsadmin', 'Administrator', 'Distribusi', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Initial User Credentials (Default password: admin123)
-- Hash generated by Better Auth scrypt algorithm
INSERT INTO "account" (id, "accountId", "providerId", "userId", password, "createdAt", "updatedAt")
VALUES 
    ('acc-admin-01', 'usr-admin-01', 'credential', 'usr-admin-01', '4dd92f9150f20ea014e5b128a3e55f51:7d34ff278bca18ee81c4bb2ed508cccf007510f5a75b7f56b45a92341fbdff5912386b1eae640eabe5e6e712aa7d13430c7c68e25e4e50bf03164fb2742234f7', NOW(), NOW()),
    ('acc-rina-02', 'usr-rina-02', 'credential', 'usr-rina-02', '4dd92f9150f20ea014e5b128a3e55f51:7d34ff278bca18ee81c4bb2ed508cccf007510f5a75b7f56b45a92341fbdff5912386b1eae640eabe5e6e712aa7d13430c7c68e25e4e50bf03164fb2742234f7', NOW(), NOW()),
    ('acc-dwi-03', 'usr-dwi-03', 'credential', 'usr-dwi-03', '4dd92f9150f20ea014e5b128a3e55f51:7d34ff278bca18ee81c4bb2ed508cccf007510f5a75b7f56b45a92341fbdff5912386b1eae640eabe5e6e712aa7d13430c7c68e25e4e50bf03164fb2742234f7', NOW(), NOW()),
    ('acc-eko-04', 'usr-eko-04', 'credential', 'usr-eko-04', '4dd92f9150f20ea014e5b128a3e55f51:7d34ff278bca18ee81c4bb2ed508cccf007510f5a75b7f56b45a92341fbdff5912386b1eae640eabe5e6e712aa7d13430c7c68e25e4e50bf03164fb2742234f7', NOW(), NOW()),
    ('acc-sys-05', 'bps-admin-user', 'credential', 'bps-admin-user', '4dd92f9150f20ea014e5b128a3e55f51:7d34ff278bca18ee81c4bb2ed508cccf007510f5a75b7f56b45a92341fbdff5912386b1eae640eabe5e6e712aa7d13430c7c68e25e4e50bf03164fb2742234f7', NOW(), NOW())
ON CONFLICT (id) DO UPDATE 
SET password = EXCLUDED.password, "accountId" = EXCLUDED."accountId", "userId" = EXCLUDED."userId";

-- Initial KBLI Checks (If empty)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM kbli_checks LIMIT 1) THEN
        INSERT INTO kbli_checks (
            assignment_id, nama_usaha, nama_di_prelist, kbli_akhir, kategori, kategori_2025,
            keg_utama, status, assignment_status_alias, level_3_full_code, level_3_name,
            level_4_full_code, level_4_name, level_6_full_code, level_6_name, index1, link_fasih,
            keterangan, perbaikan_kbli, check_kbli, check_ntb, check_kewajaran, checked_by, checked_at
        ) VALUES 
        (
            'TBN-00124', 'Warung Sumber Rejeki', 'Warung Sumber Rejeki', '47111', 'Perdagangan', 'Perdagangan Eceran',
            'Penjualan sembako, beras, minyak goreng, dan kebutuhan pokok harian', 'Selesai Dicek', 'Aktif',
            'G.47', 'Perdagangan Eceran', '471', 'Perdagangan Eceran di Toko', '47111', 'Perdagangan Eceran Berbagai Barang yang Utamanya Makanan di Toko',
            'Negatif', 'https://fasih.bps.go.id/survey/TBN-00124', 'Perlu konfirmasi omzet dan sinkronisasi data', '47111',
            true, false, false, 'Admin Rina', '30 Sep 2026, 09:42'
        ),
        (
            'TBN-00125', 'Bengkel Maju Jaya', 'Bengkel Maju Jaya', '45201', 'Jasa', 'Jasa Reparasi',
            'Reparasi dan pemeliharaan sepeda motor roda dua serta ganti oli', 'Perlu Konfirmasi', 'Aktif',
            'S.95', 'Reparasi Komputer & Keperluan Pribadi', '452', 'Reparasi Kendaraan Bermotor', '45201', 'Reparasi Mesin dan Kendaraan Bermotor Roda Dua',
            'Positif', 'https://fasih.bps.go.id/survey/TBN-00125', 'KBLI sudah sesuai bengkel motor', '45201',
            true, true, false, 'Dwi Santoso', '30 Sep 2026, 10:15'
        ),
        (
            'TBN-00126', 'Toko Berkah', 'Toko Berkah', '47112', 'Perdagangan', 'Perdagangan Eceran',
            'Minimarket kelontong dan penjualan barang konsumsi sehari-hari', 'Belum Dicek', 'Aktif',
            'G.47', 'Perdagangan Eceran', '471', 'Perdagangan Eceran', '47112', 'Minimarket dan Toko Kelontong Modern',
            'Positif', 'https://fasih.bps.go.id/survey/TBN-00126', 'Kelontong modern minimarket', '47112',
            false, false, false, '', ''
        ),
        (
            'TBN-00127', 'Roti Bu Tini', 'Roti Bu Tini', '10710', 'Industri', 'Industri Pengolahan',
            'Produksi aneka roti manis, kue basah, dan jajanan pasar', 'Selesai Dicek', 'Aktif',
            'C.10', 'Industri Makanan', '107', 'Industri Makanan Lainnya', '10710', 'Industri Produk Roti dan Kue',
            'Positif', 'https://fasih.bps.go.id/survey/TBN-00127', 'Industri roti dan kue basah skala mikro', '10710',
            true, true, true, 'Eko Hardi', '01 Okt 2026, 14:20'
        ),
        (
            'TBN-00128', 'RM Ikan Bakar Tuban', 'RM Ikan Bakar Tuban', '56101', 'Akomodasi & Makan Minum', 'Penyediaan Makan Minum',
            'Rumah makan tradisional olahan ikan laut dan aneka seafood', 'Perlu Konfirmasi', 'Aktif',
            'I.56', 'Penyediaan Makanan dan Minuman', '561', 'Restoran dan Rumah Makan', '56101', 'Restoran dan Rumah Makan Tradisional Pesisir',
            'Negatif', 'https://fasih.bps.go.id/survey/TBN-00128', 'Perlu verifikasi pengeluaran bahan baku', '56101',
            true, false, false, 'Dwi Santoso', '02 Okt 2026, 11:05'
        ),
        (
            'TBN-00129', 'Batik Tulis Tenun Gedog', 'Batik Tulis Tenun Gedog', '13121', 'Industri', 'Industri Pengolahan',
            'Pembuatan kain tenun gedog dan batik tulis khas Tuban', 'Selesai Dicek', 'Aktif',
            'C.13', 'Industri Tekstil', '131', 'Industri Pemintalan & Pertenunan', '13121', 'Industri Pertenunan Kain dan Batik Tradisional',
            'Positif', 'https://fasih.bps.go.id/survey/TBN-00129', 'Pengrajin tenun gedog dan batik tulis', '13121',
            true, true, true, 'Admin Rina', '03 Okt 2026, 16:30'
        );
    END IF;
END $$;

-- Initial Negative NTB Checks (If empty)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM negative_ntb_checks LIMIT 1) THEN
        INSERT INTO negative_ntb_checks (
            assignment_id, nama_principal, kategori, kbli_akhir, tahun_operasi, catatan,
            r27a_omzet, r26c_biaya_pembelian, r26b_biaya_produksi, r26d_biaya_operasional,
            nilai_tambah, level_2_full_code, level_6_full_code, link_fasih, source_file, source_folder
        ) VALUES 
        (
            'TBN-00124', 'Warung Sumber Rejeki', 'Perdagangan', '47111', 2024,
            'Omzet belum terisi lengkap di form Fasih, perlu konfirmasi ulang',
            '0', '0', '0', '0', '0', '52', '5260101001', 'https://fasih.bps.go.id/survey/TBN-00124', 'ntb_2025.csv', 'Tuban/01'
        ),
        (
            'TBN-00125', 'Bengkel Maju Jaya', 'Jasa', '45201', 2023,
            'Perlu konfirmasi rincian biaya pembelian spare part roda dua',
            '12.000.000', '4.500.000', '1.800.000', '2.100.000', '3.600.000', '52', '5260101002', 'https://fasih.bps.go.id/survey/TBN-00125', 'ntb_2025.csv', 'Tuban/01'
        ),
        (
            'TBN-00126', 'Toko Berkah', 'Perdagangan', '47112', 2024,
            'Data penjualan dan pengeluaran lengkap sesuai pembukuan',
            '8.600.000', '2.100.000', '900.000', '1.100.000', '4.400.000', '52', '5260101003', 'https://fasih.bps.go.id/survey/TBN-00126', 'ntb_2025.csv', 'Tuban/02'
        ),
        (
            'TBN-00127', 'Roti Bu Tini', 'Industri', '10710', 2022,
            'NTB normal dan konsisten dengan kapasitas produksi harian',
            '24.500.000', '11.000.000', '3.200.000', '2.800.000', '7.500.000', '52', '5260101004', 'https://fasih.bps.go.id/survey/TBN-00127', 'ntb_2025.csv', 'Tuban/02'
        ),
        (
            'TBN-00128', 'RM Ikan Bakar Tuban', 'Akomodasi & Makan Minum', '56101', 2021,
            'Biaya pembelian ikan dan bumbu laut melebihi estimasi omzet',
            '18.000.000', '14.200.000', '2.100.000', '2.500.000', '-800.000', '52', '5260101005', 'https://fasih.bps.go.id/survey/TBN-00128', 'ntb_2025.csv', 'Tuban/03'
        ),
        (
            'TBN-00129', 'Batik Tulis Tenun Gedog', 'Industri', '13121', 2023,
            'Biaya pembelian benang dan pewarna alami sebanding dengan nilai tambah',
            '16.000.000', '5.800.000', '2.400.000', '1.600.000', '6.200.000', '52', '5260101006', 'https://fasih.bps.go.id/survey/TBN-00129', 'ntb_2025.csv', 'Tuban/03'
        );
    END IF;
END $$;

-- Initial Assignment Checks
INSERT INTO assignment_checks (assignment_id, check_kbli, check_ntb, check_kewajaran, checked_by, checked_at)
VALUES 
    ('TBN-00124', true, false, false, 'Admin Rina', '30 Sep 2026, 09:42'),
    ('TBN-00125', true, true, false, 'Dwi Santoso', '30 Sep 2026, 10:15'),
    ('TBN-00126', false, false, false, '', ''),
    ('TBN-00127', true, true, true, 'Eko Hardi', '01 Okt 2026, 14:20'),
    ('TBN-00128', true, false, false, 'Dwi Santoso', '02 Okt 2026, 11:05'),
    ('TBN-00129', true, true, true, 'Admin Rina', '03 Okt 2026, 16:30')
ON CONFLICT (assignment_id) DO UPDATE
SET 
    check_kbli = EXCLUDED.check_kbli,
    check_ntb = EXCLUDED.check_ntb,
    check_kewajaran = EXCLUDED.check_kewajaran,
    checked_by = EXCLUDED.checked_by,
    checked_at = EXCLUDED.checked_at;

-- Initial Activity Logs
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM activity_logs LIMIT 1) THEN
        INSERT INTO activity_logs (user_initials, user_name, action_text, created_at)
        VALUES 
            ('AR', 'Admin Rina', 'Verifikasi KBLI assignment TBN-00124 selesai', NOW() - INTERVAL '3 days'),
            ('DS', 'Dwi Santoso', 'Pemeriksaan NTB Bengkel Maju Jaya (TBN-00125)', NOW() - INTERVAL '2 days'),
            ('EH', 'Eko Hardi', 'Selesai pemeriksaan menyeluruh Roti Bu Tini (TBN-00127)', NOW() - INTERVAL '1 day'),
            ('AD', 'Admin BPS Tuban', 'Inisialisasi sistem database pemantauan kualitas data', NOW());
    END IF;
END $$;

COMMIT;
