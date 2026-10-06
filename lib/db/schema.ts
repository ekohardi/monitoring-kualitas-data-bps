import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  username: text('username').unique(),
  role: text('role').notNull().default('Petugas Lapangan'),
  bidang: text('bidang').default('Distribusi'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull(),
  updatedAt: timestamp('updatedAt').notNull(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt'),
  updatedAt: timestamp('updatedAt'),
})

export const kbliChecks = pgTable('kbli_checks', {
  id: integer('id').primaryKey(),
  userId: text('user_id'),
  assignmentId: text('assignment_id'),
  level3FullCode: text('level_3_full_code'),
  level3Name: text('level_3_name'),
  level4FullCode: text('level_4_full_code'),
  level4Name: text('level_4_name'),
  level6FullCode: text('level_6_full_code'),
  level6Name: text('level_6_name'),
  assignmentStatusAlias: text('assignment_status_alias'),
  status: text('status'),
  namaDiPrelist: text('nama_di_prelist'),
  namaUsaha: text('nama_usaha'),
  kategori: text('kategori'),
  kategori2025: text('kategori_2025'),
  kbliAkhir: text('kbli_akhir'),
  kegUtama: text('keg_utama'),
  index1: text('index1'),
  linkFasih: text('link_fasih'),
  keterangan: text('keterangan'),
  perbaikanKbli: text('perbaikan_kbli'),
  checkKbli: boolean('check_kbli').default(false),
  checkNtb: boolean('check_ntb').default(false),
  checkKewajaran: boolean('check_kewajaran').default(false),
  checkedBy: text('checked_by'),
  checkedAt: text('checked_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const negativeNtbChecks = pgTable('negative_ntb_checks', {
  id: integer('id').primaryKey(),
  userId: text('user_id'),
  assignmentId: text('assignment_id'),
  level2FullCode: text('level_2_full_code'),
  level6FullCode: text('level_6_full_code'),
  namaPrincipal: text('nama_principal'),
  namaDiPrelist: text('nama_di_prelist'),
  kategori: text('kategori'),
  kategori2025: text('kategori_2025'),
  kbliAkhir: text('kbli_akhir'),
  kegUtama: text('keg_utama'),
  tahunOperasi: integer('tahun_operasi'),
  catatan: text('catatan'),
  keterangan: text('keterangan'),
  perbaikanKbli: text('perbaikan_kbli'),
  r27aOmzet: text('r27a_omzet'),
  r26cBiayaPembelian: text('r26c_biaya_pembelian'),
  r26bBiayaProduksi: text('r26b_biaya_produksi'),
  r26dBiayaOperasional: text('r26d_biaya_operasional'),
  nilaiTambah: text('nilai_tambah'),
  linkFasih: text('link_fasih'),
  sourceFile: text('source_file'),
  sourceFolder: text('source_folder'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const assignmentChecks = pgTable('assignment_checks', {
  assignmentId: text('assignment_id').primaryKey(),
  checkKbli: boolean('check_kbli').default(false),
  checkNtb: boolean('check_ntb').default(false),
  checkKewajaran: boolean('check_kewajaran').default(false),
  checkedBy: text('checked_by'),
  checkedAt: text('checked_at'),
  updatedAt: timestamp('updated_at').defaultNow(),
})

export const activityLogs = pgTable('activity_logs', {
  id: integer('id').primaryKey(),
  userInitials: text('user_initials'),
  userName: text('user_name'),
  actionText: text('action_text'),
  createdAt: timestamp('created_at').defaultNow(),
})

export const managedUser = user
export type ManagedUser = typeof user.$inferSelect
export type KbliCheck = typeof kbliChecks.$inferSelect
export type NegativeNtbCheck = typeof negativeNtbChecks.$inferSelect
export type AssignmentCheck = typeof assignmentChecks.$inferSelect
export type ActivityLog = typeof activityLogs.$inferSelect
