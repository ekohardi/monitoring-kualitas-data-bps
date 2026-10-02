import { boolean, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  username: text('username').unique(),
  role: text('role').notNull().default('Petugas Lapangan'),
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
})

export const negativeNtbChecks = pgTable('negative_ntb_checks', {
  id: integer('id').primaryKey(),
  level2FullCode: text('level_2_full_code'),
  level6FullCode: text('level_6_full_code'),
  assignmentId: text('assignment_id'),
  namaPrincipal: text('nama_principal'),
  kategori: text('kategori'),
  kbliAkhir: text('kbli_akhir'),
  tahunOperasi: integer('tahun_operasi'),
  catatan: text('catatan'),
  r27aOmzet: text('r27a_omzet'),
  r26cBiayaPembelian: text('r26c_biaya_pembelian'),
  r26bBiayaProduksi: text('r26b_biaya_produksi'),
  r26dBiayaOperasional: text('r26d_biaya_operasional'),
  nilaiTambah: text('nilai_tambah'),
  linkFasih: text('link_fasih'),
  sourceFile: text('source_file'),
  sourceFolder: text('source_folder'),
})

export const managedUser = user
export type ManagedUser = typeof user.$inferSelect
