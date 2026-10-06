# Panduan Migrasi Database PostgreSQL Lokal
### Sistem Monitoring Kualitas Data BPS Kabupaten Tuban

Dokumen ini berisi panduan lengkap struktur database PostgreSQL dan langkah-langkah untuk melakukan migrasi ke PostgreSQL lokal di komputer Anda.

---

## 1. Daftar File Database

File-file berikut telah disiapkan di folder `database/` dan `scripts/`:

| File | Keterangan |
| :--- | :--- |
| `database/schema.sql` | Definisi DDL lengkap (Semua tabel, relasi foreign key, indeks performa, dan trigger update timestamp). |
| `database/seed.sql` | Data awal (Pengguna default admin, data sampel KBLI, data sampel NTB Negatif, dan log aktivitas). |
| `database/migrate.sql` | Script gabungan all-in-one (DDL + Seed) dalam satu transaksi `BEGIN ... COMMIT`. |
| `scripts/migrate.js` | Script otomatis Node.js untuk migrasi langsung via CLI (`npm run db:migrate`). |
| `.env.example` | Template variabel lingkungan koneksi database lokal. |

---

## 2. Struktur Tabel Database

Database ini terdiri dari **8 tabel** utama yang terbagi dalam dua kelompok:

```
                          ┌──────────────────────────┐
                          │         "user"           │
                          ├──────────────────────────┤
                          │ id (PK)                  │
                          │ email (UQ), username (UQ)│
                          │ role, bidang             │
                          └─────────────┬────────────┘
                                        │
           ┌────────────────────────────┼───────────────────────────┐
           │ 1:N                        │ 1:N                       │ 1:N (opsional)
           ▼                            ▼                           ▼
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│      "session"       │     │      "account"       │     │     kbli_checks      │
├──────────────────────┤     ├──────────────────────┤     ├──────────────────────┤
│ id (PK)              │     │ id (PK)              │     │ id (PK)              │
│ userId (FK -> user)  │     │ userId (FK -> user)  │     │ user_id (FK -> user) │
│ token (UQ)           │     │ password (hash)      │     │ assignment_id        │
└──────────────────────┘     └──────────────────────┘     └──────────┬───────────┘
                                                                     │
┌──────────────────────┐     ┌──────────────────────┐                │ (assignment_id)
│     "verification"   │     │ negative_ntb_checks  │                │
├──────────────────────┤     ├──────────────────────┤                ▼
│ id (PK)              │     │ id (PK)              │     ┌──────────────────────┐
│ identifier, value    │     │ assignment_id        │     │  assignment_checks   │
└──────────────────────┘     │ user_id (FK -> user) │     ├──────────────────────┤
                             └──────────────────────┘     │ assignment_id (PK)   │
┌──────────────────────┐                                  │ check_kbli, check_ntb│
│    activity_logs     │                                  │ check_kewajaran      │
├──────────────────────┤                                  └──────────────────────┘
│ id (PK), action_text │
└──────────────────────┘
```

### A. Tabel Autentikasi (Better Auth)
1. **`"user"`** (Menggunakan tanda kutip dua karena `user` adalah kata kunci PostgreSQL):
   - `id` (TEXT, PK): ID unik akun.
   - `name` (TEXT): Nama lengkap petugas / pengguna.
   - `email` (TEXT, UNIQUE): Alamat email resmi BPS.
   - `"emailVerified"` (BOOLEAN): Status verifikasi email.
   - `image` (TEXT): URL foto profil pengguna.
   - `username` (TEXT, UNIQUE): Username untuk login alternatif.
   - `role` (TEXT): Peran pengguna (`Administrator`, `Petugas Kualitas`, `Reviewer`, `Petugas Lapangan`).
   - `bidang` (TEXT): Bidang BPS (`Distribusi`, `Produksi`, `Sosial`, `Nerwilis`, `PLS`, `Umum`).
   - `"createdAt"`, `"updatedAt"` (TIMESTAMP WITH TIME ZONE).

2. **`"session"`**:
   - `id` (TEXT, PK), `token` (TEXT, UNIQUE), `"expiresAt"` (TIMESTAMP WITH TIME ZONE), `"userId"` (FK -> user.id, ON DELETE CASCADE), `"ipAddress"`, `"userAgent"`.

3. **`"account"`**:
   - `id` (TEXT, PK), `"accountId"` (TEXT), `"providerId"` (TEXT), `"userId"` (FK -> user.id, ON DELETE CASCADE), `password` (TEXT, hash password), token provider, dan waktu kedaluwarsa.

4. **`"verification"`**:
   - `id` (TEXT, PK), `identifier` (TEXT), `value` (TEXT), `"expiresAt"` (TIMESTAMP WITH TIME ZONE).

### B. Tabel Monitoring & Kualitas Data
5. **`kbli_checks`**:
   - Menyimpan hasil pemeriksaan klasifikasi lapangan usaha (KBLI).
   - Kolom: `id` (SERIAL PK), `assignment_id`, `user_id` (FK opsional), `level_3_full_code`, `level_3_name`, `level_4_full_code`, `level_4_name`, `level_6_full_code`, `level_6_name`, `assignment_status_alias`, `status` (`Belum Dicek`, `Selesai Dicek`, `Perlu Konfirmasi`), `nama_usaha`, `nama_di_prelist`, `kategori`, `kategori_2025`, `kbli_akhir`, `keg_utama`, `index1`, `link_fasih`, `keterangan`, `perbaikan_kbli`, kolom centang (`check_kbli`, `check_ntb`, `check_kewajaran`, `checked_by`, `checked_at`), serta timestamp.

6. **`negative_ntb_checks`**:
   - Menyimpan pemeriksaan anomali Nilai Tambah Bruto (NTB negatif atau mencurigakan).
   - Kolom: `id` (SERIAL PK), `assignment_id`, `user_id` (FK opsional), kode wilayah, `nama_principal`, `kategori`, `kbli_akhir`, `tahun_operasi`, data keuangan (`r27a_omzet`, `r26c_biaya_pembelian`, `r26b_biaya_produksi`, `r26d_biaya_operasional`, `nilai_tambah`), `catatan`, `link_fasih`, `source_file`, `source_folder`.

7. **`assignment_checks`**:
   - Tabel penghubung checklist verifikasi lintas tabel berdasarkan `assignment_id`.
   - Kolom: `assignment_id` (TEXT PK), `check_kbli` (BOOLEAN), `check_ntb` (BOOLEAN), `check_kewajaran` (BOOLEAN), `checked_by` (TEXT), `checked_at` (TEXT), `updated_at` (TIMESTAMP).

8. **`activity_logs`**:
   - Riwayat aktivitas sistem dan pengguna secara real-time.
   - Kolom: `id` (SERIAL PK), `user_initials` (TEXT), `user_name` (TEXT), `action_text` (TEXT), `created_at` (TIMESTAMP).

---

## 3. Cara Melakukan Migrasi ke PostgreSQL Lokal

### Langkah 1: Buat Database di PostgreSQL Lokal

Pastikan PostgreSQL sudah berjalan di komputer lokal Anda, lalu buka terminal atau pgAdmin:

```sql
CREATE DATABASE monitoring_kualitas_bps;
```

*(Atau via command prompt/terminal: `createdb -U postgres monitoring_kualitas_bps`)*

---

### Langkah 2: Konfigurasi File `.env.local`

Salin file `.env.example` menjadi `.env.local`:

```bash
cp .env.example .env.local
```

Sesuaikan password dan port database lokal Anda di `.env.local`:
```env
DATABASE_URL="postgresql://postgres:PASSWORD_POSTGRES_ANDA@localhost:5432/monitoring_kualitas_bps"
BETTER_AUTH_SECRET="g89h4k2j5b8v9c2m1x4z7q0w3e6r9t2y5u8i1o4p7a0s3d6f"
BETTER_AUTH_URL="http://localhost:3523"
```

---

### Langkah 3: Eksekusi Migrasi (Pilih Salah Satu Metode)

#### **Metode A: Menggunakan Script Otomatis (Direkomendasikan)**
Jalankan perintah berikut di folder proyek:

```bash
npm run db:migrate
```
*Script ini akan otomatis membaca `.env.local`, menyambung ke PostgreSQL, mengeksekusi DDL, membuat indeks, trigger, dan memasukkan data sampel awal.*

---

#### **Metode B: Menggunakan PostgreSQL CLI (`psql`)**
Jika menggunakan command line `psql`:

```bash
psql -U postgres -d monitoring_kualitas_bps -f database/migrate.sql
```

---

#### **Metode C: Menggunakan GUI (pgAdmin / DBeaver / Navicat)**
1. Buka database `monitoring_kualitas_bps` di pgAdmin atau DBeaver.
2. Buka **Query Tool** (SQL Editor).
3. Buka file `database/migrate.sql` (atau `database/schema.sql` diikuti `database/seed.sql`).
4. Klik tombol **Execute** / **Run** (F5).

---

#### **Metode D: Menggunakan Docker (Opsional jika belum punya Postgres terpasang)**
Jika ingin menjalankan PostgreSQL lokal dalam container Docker:

```bash
docker run --name postgres-bps \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=monitoring_kualitas_bps \
  -p 5432:5432 -d postgres:16-alpine
```

Setelah container berjalan:
```bash
npm run db:migrate
```

---

## 4. Pengguna Awal untuk Testing

Setelah migrasi selesai, database sudah terisi akun pengguna awal berikut:

| Nama Pengguna | Username | Email | Password Default | Peran | Bidang |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Admin BPS Tuban** | `admin` | `admin@bps.tuban.go.id` | `admin123` | Administrator | Distribusi |
| **Admin Rina** | `rina` | `rina@bps.tuban.go.id` | `admin123` | Administrator | Produksi |
| **Dwi Santoso** | `dwisantoso` | `dwi.santoso@bps.tuban.go.id` | `admin123` | Petugas Kualitas | Distribusi |
| **Eko Hardi** | `ekohardi` | `eko.hardi@bps.tuban.go.id` | `admin123` | Reviewer | Sosial |

---

## 5. Menjalankan Aplikasi Next.js dengan Database Lokal

Setelah migrasi sukses:

```bash
npm run dev
```

Buka browser di `http://localhost:3523`. Aplikasi kini langsung membaca dan menyimpan data secara persisten ke PostgreSQL lokal Anda.
