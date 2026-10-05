'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { BarChart3, CheckCircle2, ChevronDown, Database, Download, ExternalLink, Eye, FileCheck2, LayoutDashboard, LogOut, Menu, MoreHorizontal, Pencil, Plus, RotateCw, Search, Settings, ShieldCheck, Trash2, Upload, UserRoundCheck, Users, UserRoundX, X } from 'lucide-react'

type Tab = 'dashboard' | 'stage3' | 'negative' | 'kbli' | 'kbli_check' | 'users'

const negativeColumns = ['level_2_full_code','level_6_full_code','assignment_id','nama_principal','kategori','kbli_akhir','tahun_operasi','catatan','r27a_omzet','r26c_biaya_pembelian','r26b_biaya_produksi','r26d_biaya_operasional','nilai_tambah','link_fasih','source_file','source_folder']
const kbliColumns = ['level_3_full_code','level_3_name','level_4_full_code','level_4_name','level_6_full_code','level_6_name','assignment_status_alias','nama_di_prelist','nama_usaha','kategori','kategori_2025','kbli_akhir','keg_utama','index1','link_fasih']

const sampleNegative = [
  ['52','5260101001','TBN-00124','Warung Sumber Rejeki','Perdagangan','47111','2024','Omzet belum terisi','0','0','0','0','0','Lihat','ntb_2025.csv','Tuban/01'],
  ['52','5260101002','TBN-00125','Bengkel Maju Jaya','Jasa','45201','2023','Perlu konfirmasi biaya','12000000','4500000','1800000','2100000','3600000','Lihat','ntb_2025.csv','Tuban/01'],
  ['52','5260101003','TBN-00126','Toko Berkah','Perdagangan','47112','2024','Data lengkap','8600000','2100000','900000','1100000','4400000','Lihat','ntb_2025.csv','Tuban/02'],
]

function Login({ onLogin }: { onLogin: (user: any) => void }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!identifier.trim() || !password) {
      setError('Email/username dan password wajib diisi.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const lookup = await fetch(`/api/users/lookup?identifier=${encodeURIComponent(identifier.trim())}`)
      const account = await lookup.json().catch(() => ({}))
      if (!lookup.ok || !account.email) {
        setError('Username/email atau password tidak valid.')
        setLoading(false)
        return
      }

      const result = await authClient.signIn.email({ email: account.email, password })
      if (result.error) {
        setError('Username/email atau password tidak valid.')
        setLoading(false)
      } else {
        const loggedUser = {
          ...account,
          ...(result.data?.user || {}),
          username: result.data?.user?.username || account.username || identifier.trim().replace(/@.*$/, ''),
          name: result.data?.user?.name || account.name || account.username || identifier.trim(),
          role: result.data?.user?.role || account.role || 'Petugas Lapangan',
        }
        onLogin(loggedUser)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Terjadi kesalahan saat masuk. Coba lagi.')
      setLoading(false)
    }
  }

  return (
    <main className="login-shell">
      <div className="login-art">
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img src="/icon.svg" alt="Logo BPS" style={{ width: 46, height: 46 }} />
          <div className="brand-mark">BPS</div>
        </div>
        <div>
          <p className="eyebrow">SISTEM MONITORING</p>
          <h1>Kualitas Data<br /><span>BPS Kabupaten Tuban</span></h1>
          <p className="login-copy">Pantau, validasi, dan tingkatkan kualitas data statistik sektoral secara terintegrasi.</p>
        </div>
        <div className="login-foot">Badan Pusat Statistik Kabupaten Tuban<br />Data berkualitas untuk Tuban yang lebih baik.</div>
      </div>
      <div className="login-card">
        <div className="mobile-brand">BPS TUBAN</div>
        <p className="eyebrow blue">SELAMAT DATANG</p>
        <h2>Masuk ke Dashboard</h2>
        <p className="muted">Gunakan email atau username untuk melanjutkan.</p>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
          <label>Email atau username</label>
          <input
            value={identifier}
            onChange={e => setIdentifier(e.target.value)}
            placeholder="admin atau nama@bps.go.id"
            autoComplete="username"
            disabled={loading}
          />
          <label>Password</label>
          <input
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
            autoComplete="current-password"
            disabled={loading}
          />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="primary full" disabled={loading}>
            {loading ? 'Memproses...' : <>Masuk <span>→</span></>}
          </button>
        </form>
      </div>
    </main>
  )
}

function App() {
  const { data: sessionData } = authClient.useSession()
  const [localUser, setLocalUser] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bps_user')
        return saved ? JSON.parse(saved) : null
      } catch {
        return null
      }
    }
    return null
  })
  const [manualLoggedIn, setManualLoggedIn] = useState(false)
  const [tab, setTab] = useState<Tab>('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'Semua'|'Belum dicek'|'Selesai'>('Semua')

  const currentUser = useMemo(() => {
    const raw = sessionData?.user || localUser
    if (!raw && !localUser) return null
    const rawUsername = (sessionData?.user as any)?.username || (localUser as any)?.username || ''
    const rawEmail = sessionData?.user?.email || localUser?.email || ''
    const rawName = sessionData?.user?.name || localUser?.name || ''
    const fallbackUsername = rawEmail ? rawEmail.split('@')[0] : (rawName || 'admin')
    const username = rawUsername || fallbackUsername
    const name = rawName || username
    const role = (sessionData?.user as any)?.role || (localUser as any)?.role || 'Administrator'
    const initials = (name || username || 'U')
      .split(' ')
      .filter(Boolean)
      .map((p: string) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U'

    return {
      ...localUser,
      ...sessionData?.user,
      username,
      name,
      role,
      initials,
    }
  }, [sessionData?.user, localUser])

  const isLoggedIn = Boolean(currentUser || manualLoggedIn)

  const handleLogout = async () => {
    try {
      await authClient.signOut()
    } catch (err) {
      console.error('Sign out error:', err)
    }
    setLocalUser(null)
    setManualLoggedIn(false)
    setProfileOpen(false)
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('bps_user')
      } catch {}
    }
  }

  useEffect(() => {
    if (!profileOpen) return
    const handleClickOutside = () => setProfileOpen(false)
    window.addEventListener('click', handleClickOutside)
    return () => window.removeEventListener('click', handleClickOutside)
  }, [profileOpen])

  const rows = useMemo(()=>tab === 'kbli' ? [] : sampleNegative, [tab])

  if (!isLoggedIn) {
    return (
      <Login
        onLogin={(user) => {
          setLocalUser(user)
          setManualLoggedIn(true)
          if (typeof window !== 'undefined' && user) {
            try {
              localStorage.setItem('bps_user', JSON.stringify(user))
            } catch {}
          }
        }}
      />
    )
  }

  const nav = [
    { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
    { id: 'kbli', label: 'Check Data', icon: Database },
    { id: 'kbli_check', label: 'KBLI Check', icon: FileCheck2 },
    { id: 'users', label: 'Manajemen Pengguna', icon: Users }
  ] as const
  const tableCols = (tab === 'kbli' || tab === 'kbli_check') ? kbliColumns : negativeColumns

  return (
    <div className="app-shell">
      {mobileOpen && <div className="sidebar-backdrop" onClick={()=>setMobileOpen(false)} aria-label="Tutup menu navigasi" />}
      <aside className={mobileOpen?'sidebar open':'sidebar'}>
        <div className="side-brand">
          <img src="/icon.svg" alt="Logo BPS" style={{ width: 34, height: 34, flexShrink: 0 }} />
          <div><strong>Kualitas Data</strong><span>Kabupaten Tuban</span></div>
          <button className="close-nav" onClick={()=>setMobileOpen(false)} aria-label="Tutup navigasi"><X /></button>
        </div>
        <div className="side-section">MENU UTAMA</div>
        <nav>
          {nav.map(item=>{
            const Icon=item.icon;
            return (
              <button
                key={item.id}
                className={tab===item.id?'nav-item active':'nav-item'}
                onClick={()=>{setTab(item.id);setMobileOpen(false)}}
              >
                <Icon />{item.label}{item.id==='negative'&&<b>12</b>}
              </button>
            )
          })}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item"><Settings /> Pengaturan</button>
          <button className="nav-item logout" onClick={handleLogout}><LogOut /> Keluar</button>
        </div>
      </aside>
      <div className="main-area">
        <header>
          <button className="menu-btn" onClick={()=>setMobileOpen(true)} title="Buka menu navigasi" aria-label="Buka menu navigasi"><Menu /></button>
          <div className="crumb">Monitoring <span>/</span> <strong>{nav.find(n=>n.id===tab)?.label}</strong></div>
          <div className="header-actions">
            <button className="icon-button" aria-label="Pencarian"><Search /></button>
            <div className="profile-wrapper" style={{ position: 'relative' }} onClick={e => e.stopPropagation()}>
              <div
                className="profile"
                onClick={() => setProfileOpen(prev => !prev)}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title={`Login sebagai @${currentUser?.username || 'user'}`}
              >
                <div className="avatar">{currentUser?.initials || 'U'}</div>
                <div>
                  <strong>{currentUser?.username || currentUser?.name || 'admin'}</strong>
                  <span>{currentUser?.role || 'Administrator'}</span>
                </div>
                <ChevronDown style={{ transform: profileOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>

              {profileOpen && (
                <div
                  className="profile-dropdown"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '46px',
                    width: '230px',
                    zIndex: 100,
                    background: 'white',
                    border: '1px solid #dbe6f0',
                    borderRadius: '10px',
                    boxShadow: '0 16px 36px #173b5b20',
                    padding: '12px',
                  }}
                >
                  <div style={{ paddingBottom: '10px', borderBottom: '1px solid #edf2f6', marginBottom: '8px' }}>
                    <strong style={{ display: 'block', fontSize: '13px', color: 'var(--ink)' }}>
                      {currentUser?.name || currentUser?.username}
                    </strong>
                    <span style={{ display: 'block', fontSize: '11px', color: '#8a9caf', marginTop: '2px' }}>
                      @{currentUser?.username || 'user'}
                    </span>
                    {currentUser?.email && (
                      <span style={{ display: 'block', fontSize: '11px', color: '#8a9caf', marginTop: '1px' }}>
                        {currentUser.email}
                      </span>
                    )}
                    <span
                      style={{
                        display: 'inline-block',
                        fontSize: '10px',
                        background: '#e6f1fb',
                        color: 'var(--blue)',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        marginTop: '6px',
                        fontWeight: 600,
                      }}
                    >
                      {currentUser?.role || 'Administrator'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      border: 0,
                      background: 'transparent',
                      color: '#b24d4d',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 600,
                      textAlign: 'left',
                    }}
                  >
                    <LogOut style={{ width: 15, height: 15 }} /> Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="content">
          {tab==='dashboard'?<Dashboard setTab={setTab}/>:tab==='users'?<UsersPage/>:<TablePage tab={tab} columns={tableCols} rows={rows} query={query} setQuery={setQuery} status={status} setStatus={setStatus} currentUser={currentUser}/>}
        </main>
      </div>
    </div>
  )
}

function Dashboard({ setTab }: { setTab: (t: Tab) => void }) {
  const [data, setData] = useState<{
    totalAssignment: number
    sudahDicek: number
    belumDicek: number
    perluTindakLanjut: number
    percentComplete: number
    stageOfficers: Array<{ name: string; count: string; percent: string; percentNum?: number }>
    activities: Array<{ initials: string; name: string; action: string; time: string }>
  }>({
    totalAssignment: 0,
    sudahDicek: 0,
    belumDicek: 0,
    perluTindakLanjut: 0,
    percentComplete: 0,
    stageOfficers: [],
    activities: [],
  })
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/dashboard?_t=${Date.now()}`, { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (e) {
      console.error('Failed to load dashboard data:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow blue">OVERVIEW</p>
          <h1>Ringkasan Kualitas Data</h1>
          <p className="muted">Pantau progres validasi data BPS Kabupaten Tuban secara realtime.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className="outline"
            onClick={loadData}
            title="Muat ulang data dari database"
            disabled={loading}
            style={{ cursor: loading ? 'wait' : 'pointer' }}
          >
            <RotateCw className={loading ? 'animate-spin' : ''} style={{ width: 14, height: 14 }} />
            <span>{loading ? 'Memuat...' : 'Refresh'}</span>
          </button>
          <button className="outline" onClick={() => setTab('kbli_check')}>
            <FileCheck2 style={{ width: 15, height: 15 }} /> KBLI Check
          </button>
          <button className="primary" onClick={() => setTab('kbli')}>
            <Database style={{ width: 15, height: 15 }} /> Check Data
          </button>
        </div>
      </div>

      <div className="stats">
        <Stat
          title="Total Assignment"
          value={data.totalAssignment.toLocaleString('id-ID')}
          change={`${data.totalAssignment > 0 ? '+' : ''}${data.totalAssignment}`}
          icon={Database}
          tone="blue"
          subtext="total assignment"
        />
        <Stat
          title="Sudah Dicek"
          value={data.sudahDicek.toLocaleString('id-ID')}
          change={`${data.percentComplete}%`}
          icon={CheckCircle2}
          tone="green"
          subtext="terselesaikan"
        />
        <Stat
          title="Perlu Tindak Lanjut"
          value={data.perluTindakLanjut.toLocaleString('id-ID')}
          change={`${data.perluTindakLanjut}`}
          icon={FileCheck2}
          tone="orange"
          subtext="perlu konfirmasi/NTB"
        />
      </div>

      <section className="panel progress-panel">
        <div className="panel-head">
          <div>
            <h3>Progress Validasi</h3>
            <p className="muted">Status pemeriksaan seluruh data</p>
          </div>
          <span className="period">2025 <ChevronDown /></span>
        </div>
        <div className="big-progress">
          <div
            className="progress-ring"
            style={{
              background: `conic-gradient(var(--blue) ${data.percentComplete}%, #e8eff5 0)`
            }}
          >
            <strong>{data.percentComplete}%</strong>
            <span>selesai</span>
          </div>
          <div className="legend">
            <div>
              <i className="dot blue-dot" />
              Sudah dicek <b>{data.sudahDicek.toLocaleString('id-ID')}</b>
            </div>
            <div>
              <i className="dot orange-dot" />
              Belum dicek <b>{data.belumDicek.toLocaleString('id-ID')}</b>
            </div>
            <div>
              <i className="dot gray-dot" />
              Perlu tindak lanjut <b>{data.perluTindakLanjut.toLocaleString('id-ID')}</b>
            </div>
          </div>
        </div>
      </section>

      <section className="panel activity">
        <div className="panel-head">
          <div>
            <h3>Aktivitas Terbaru</h3>
            <p className="muted">Pembaruan data dari tabel sistem</p>
          </div>
          <button className="text-button" onClick={loadData}>Perbarui log ↻</button>
        </div>
        <div className="activity-list">
          {data.activities && data.activities.length > 0 ? (
            data.activities.map((x, idx) => (
              <div className="activity-item" key={idx}>
                <div className="avatar soft">{x.initials}</div>
                <div>
                  <strong>{x.name}</strong> <span>{x.action}</span>
                  <small>{x.time}</small>
                </div>
              </div>
            ))
          ) : (
            <p className="muted" style={{ padding: '12px 0', fontSize: '12px' }}>
              {loading ? 'Memuat aktivitas dari database...' : 'Belum ada aktivitas tercatat pada tabel database.'}
            </p>
          )}
        </div>
      </section>
    </>
  )
}

function Stat({
  title,
  value,
  change,
  icon: Icon,
  tone,
  subtext = 'dari database',
}: {
  title: string
  value: string
  change: string
  icon: any
  tone: string
  subtext?: string
}) {
  return (
    <div className={'stat stat-' + tone}>
      <div className="stat-icon"><Icon /></div>
      <div>
        <p>{title}</p>
        <h2>{value}</h2>
        <span>{change} <em>{subtext}</em></span>
      </div>
    </div>
  )
}
type CheckState = { kbli: boolean; ntb: boolean; kewajaran: boolean; checkedBy?: string; checkedAt?: string }
const combinedChecks: Record<string, CheckState> = {
  'TBN-00124': { kbli: true, ntb: false, kewajaran: false, checkedBy: 'Admin Rina', checkedAt: '30 Sep 2026, 09:42' },
  'TBN-00125': { kbli: true, ntb: true, kewajaran: false, checkedBy: 'Dwi Santoso', checkedAt: '30 Sep 2026, 10:15' },
  'TBN-00126': { kbli: false, ntb: false, kewajaran: false },
}
type CrossCheckRecord = {
  id: string
  assignmentId: string
  namaUsaha: string
  namaDiPrelist?: string
  kategori?: string
  kategori2025?: string
  kbliAkhir: string
  kegUtama?: string
  linkFasih: string
  hasKbli: boolean
  hasNtb: boolean
  keterangan?: string
  perbaikanKbli?: string
  kbli: {
    id?: number | string
    assignmentId?: string
    namaUsaha?: string
    namaDiPrelist?: string
    kbliAkhir?: string
    kategori?: string
    kategori2025?: string
    kegUtama?: string
    status?: string
    assignmentStatusAlias?: string
    level3FullCode?: string
    level3Name?: string
    level4FullCode?: string
    level4Name?: string
    level6FullCode?: string
    level6Name?: string
    index1?: string
    linkFasih?: string
    keterangan?: string
    perbaikanKbli?: string
    extraFields?: Record<string, any>
  } | null
  ntb: {
    id?: number | string
    assignmentId?: string
    namaPrincipal?: string
    kategori?: string
    kbliAkhir?: string
    tahunOperasi?: number | string
    catatan?: string
    keterangan?: string
    perbaikanKbli?: string
    r27aOmzet?: string
    r26cBiayaPembelian?: string
    r26bBiayaProduksi?: string
    r26dBiayaOperasional?: string
    nilaiTambah?: string
    level2FullCode?: string
    level6FullCode?: string
    sourceFile?: string
    sourceFolder?: string
    linkFasih?: string
    extraFields?: Record<string, any>
  } | null
}

function exportToCsv(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""'
    const str = String(val).replace(/"/g, '""')
    return `"${str}"`
  }
  const content = [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(','))
  ].join('\r\n')

  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[]; delimiter: string } {
  // Strip UTF-8 BOM if present
  let cleanText = text.replace(/^\uFEFF/, '').trim()
  if (!cleanText) return { headers: [], rows: [], delimiter: ',' }

  // Auto-detect delimiter from first non-empty line
  const firstLine = cleanText.split(/\r?\n/).find(l => l.trim() !== '') || ''
  let delimiter = ','
  const commaCount = (firstLine.match(/,/g) || []).length
  const semiCount = (firstLine.match(/;/g) || []).length
  const tabCount = (firstLine.match(/\t/g) || []).length
  if (semiCount > commaCount && semiCount >= tabCount) {
    delimiter = ';'
  } else if (tabCount > commaCount && tabCount > semiCount) {
    delimiter = '\t'
  }

  // Parse fields respecting quotes and line breaks
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ''
  let inQuotes = false

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i]
    const nextChar = cleanText[i + 1]

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        currentField += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === delimiter) {
        currentRow.push(currentField.trim())
        currentField = ''
      } else if (char === '\r') {
        // ignore CR
      } else if (char === '\n') {
        currentRow.push(currentField.trim())
        if (currentRow.some(f => f !== '')) {
          rows.push(currentRow)
        }
        currentRow = []
        currentField = ''
      } else {
        currentField += char
      }
    }
  }

  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField.trim())
    if (currentRow.some(f => f !== '')) {
      rows.push(currentRow)
    }
  }

  if (rows.length === 0) return { headers: [], rows: [], delimiter }

  const rawHeaders = rows[0].map(h => h.replace(/^["']|["']$/g, '').trim())
  const dataRows = rows.slice(1)

  const parsedObjects: Record<string, string>[] = []
  for (const r of dataRows) {
    const obj: Record<string, string> = {}
    rawHeaders.forEach((h, idx) => {
      if (h) {
        obj[h] = (r[idx] ?? '').replace(/^["']|["']$/g, '').trim()
      }
    })
    parsedObjects.push(obj)
  }

  return { headers: rawHeaders, rows: parsedObjects, delimiter }
}

function CrossTableDetail({
  item,
  onDownload,
  onEdit
}: {
  item: CrossCheckRecord
  onDownload: () => void
  onEdit?: () => void
}) {
  const level3 = item.kbli?.level3FullCode && item.kbli?.level3Name
    ? `${item.kbli.level3FullCode} - ${item.kbli.level3Name}`
    : (item.kbli?.level3FullCode || item.kbli?.level3Name || '-')

  const level4 = item.kbli?.level4FullCode && item.kbli?.level4Name
    ? `${item.kbli.level4FullCode} - ${item.kbli.level4Name}`
    : (item.kbli?.level4FullCode || item.kbli?.level4Name || '-')

  const level6 = item.kbli?.level6FullCode && item.kbli?.level6Name
    ? `${item.kbli.level6FullCode} - ${item.kbli.level6Name}`
    : (item.kbli?.level6FullCode || item.kbli?.level6Name || item.ntb?.level6FullCode || '-')

  const keterangan = item.kbli?.keterangan && item.kbli.keterangan !== '-'
    ? item.kbli.keterangan
    : (item.keterangan && item.keterangan !== '-'
      ? item.keterangan
      : (item.ntb?.catatan && item.ntb.catatan !== '-'
        ? item.ntb.catatan
        : (item.ntb?.keterangan || '-')))

  const perbaikanKbli = item.kbli?.perbaikanKbli && item.kbli.perbaikanKbli !== '-'
    ? item.kbli.perbaikanKbli
    : (item.perbaikanKbli && item.perbaikanKbli !== '-'
      ? item.perbaikanKbli
      : (item.ntb?.perbaikanKbli || '-'))

  const detailsList = [
    { label: 'nama di prelist', value: item.kbli?.namaDiPrelist || item.namaDiPrelist || item.namaUsaha || '-', spanClass: '' },
    { label: 'nama usaha', value: item.kbli?.namaUsaha || item.namaUsaha || item.ntb?.namaPrincipal || '-', spanClass: '' },
    { label: 'kategori', value: item.kbli?.kategori || item.kategori || item.ntb?.kategori || '-', spanClass: '' },
    { label: 'kategori 2025', value: item.kbli?.kategori2025 || item.kategori2025 || '-', spanClass: '' },
    { label: 'kbli akhir', value: item.kbli?.kbliAkhir || item.kbliAkhir || item.ntb?.kbliAkhir || '-', spanClass: '' },
    { label: 'kegiatan utama', value: item.kbli?.kegUtama || item.kegUtama || item.ntb?.catatan || '-', spanClass: 'span-3' },
    { label: 'level 3 (kode & nama)', value: level3, spanClass: 'span-2' },
    { label: 'level 4 (kode & nama)', value: level4, spanClass: 'span-2' },
    { label: 'level 6 (kode & nama)', value: level6, spanClass: 'span-2' },
    { label: 'keterangan', value: keterangan, spanClass: 'span-2' },
    { label: 'perbaikan kbli', value: perbaikanKbli, spanClass: 'span-full accent' },
  ]

  const fasihUrl = item.linkFasih && item.linkFasih !== '-' ? item.linkFasih : null

  return (
    <div className="cross-table-container">
      <div className="cross-table-topbar">
        <div className="cross-table-title">
          <strong>Detail Assignment: {item.assignmentId}</strong>
        </div>
        <div className="cross-table-actions">
          {fasihUrl && (
            <a className="btn-fasih-external" href={fasihUrl} target="_blank" rel="noreferrer" title="Buka tautan Fasih">
              <ExternalLink /> Buka Fasih
            </a>
          )}
          {onEdit && (
            <button className="btn-edit-row" onClick={onEdit} title="Edit data baris ini di database">
              <Pencil /> Edit Baris
            </button>
          )}
          {onDownload && (
            <button className="btn-download-row" onClick={onDownload} title="Unduh data baris ini dalam format CSV">
              <Download /> Unduh Baris (CSV)
            </button>
          )}
        </div>
      </div>

      <div className="check-data-details-grid">
        {detailsList.map(field => (
          <div key={field.label} className={`check-detail-field ${field.spanClass || ''}`}>
            <small>{field.label}</small>
            <strong>{field.value}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

function TablePage({tab,query,setQuery,status,setStatus,columns,rows,currentUser}:{tab:Tab,query:string,setQuery:(s:string)=>void,status:string,setStatus:(s:any)=>void,columns:string[],rows:string[][],currentUser?:any}) {
  const [checks, setChecks] = useState<Record<string, CheckState>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('monitoring_checks')
      if (saved) {
        try { return JSON.parse(saved) } catch {}
      }
    }
    return combinedChecks
  })
  const [expandedRow, setExpandedRow] = useState<string|null>(null)
  const [crossData, setCrossData] = useState<CrossCheckRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [editItem, setEditItem] = useState<CrossCheckRecord|null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [selectedKategori, setSelectedKategori] = useState('Semua Kategori')
  const [pageSize, setPageSize] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  interface ImportPreviewData {
    fileName: string
    delimiter: string
    totalRows: number
    validRows: any[]
    previewRows: any[]
    targetTable: string
  }
  const [importPreview, setImportPreview] = useState<ImportPreviewData | null>(null)
  const [importLoading, setImportLoading] = useState(false)

  const isLiveTab = tab === 'kbli' || tab === 'kbli_check'
  const title = tab === 'stage3'
    ? 'Pembagian Stage 3'
    : tab === 'negative'
    ? 'Checklist Data NTB Negatif'
    : tab === 'kbli_check'
    ? 'KBLI Check'
    : 'Check Data'

  useEffect(() => {
    setCurrentPage(1)
  }, [query, status, selectedKategori, pageSize, tab])

  const availableCategories = useMemo(() => {
    const set = new Set<string>()
    crossData.forEach(item => {
      const k1 = item.kbli?.kategori?.trim()
      const k2 = item.ntb?.kategori?.trim()
      const k3 = item.kbli?.kategori2025?.trim()
      if (k1 && k1 !== '-') set.add(k1)
      if (k2 && k2 !== '-') set.add(k2)
      if (k3 && k3 !== '-') set.add(k3)
    })
    return Array.from(set).sort()
  }, [crossData])

  const fetchData = (showLoading = false) => {
    if (showLoading) setLoading(true)
    const endpoint = tab === 'kbli_check' ? '/api/kbli-checks' : '/api/check-data'
    fetch(`${endpoint}?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
      .then(response => response.ok ? response.json() : Promise.reject())
      .then((items: CrossCheckRecord[]) => {
        setCrossData(items)
        const checksFromDb: Record<string, CheckState> = {}
        items.forEach(it => {
          if (it.check) {
            checksFromDb[it.assignmentId] = it.check
          }
        })
        setChecks(prev => ({ ...prev, ...checksFromDb }))
      })
      .catch(err => {
        if (showLoading) {
          console.error('Failed to load data:', err)
          setCrossData([])
        }
      })
      .finally(() => {
        if (showLoading) setLoading(false)
      })
  }

  useEffect(() => {
    if (!isLiveTab) return

    fetchData(true)

    // Real-time polling every 4 seconds for multi-user live status
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchData(false)
      }
    }, 4000)

    const onFocus = () => {
      fetchData(false)
    }
    window.addEventListener('focus', onFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [tab])

  const updateCheck = async (id: string, key: keyof Pick<CheckState, 'kbli' | 'ntb' | 'kewajaran'>) => {
    const checkerName = currentUser?.username || currentUser?.name || 'Admin BPS'
    const curVal = Boolean(checks[id]?.[key])
    const newVal = !curVal
    const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })

    // Optimistic UI update
    setChecks(current => ({
      ...current,
      [id]: {
        ...current[id],
        [key]: newVal,
        checkedBy: checkerName,
        checkedAt: nowStr
      }
    }))

    setCrossData(prev => prev.map(item => {
      if (item.assignmentId !== id) return item
      const itemKbli = key === 'kbli' ? newVal : Boolean(item.check?.kbli ?? checks[id]?.kbli)
      const itemNtb = key === 'ntb' ? newVal : Boolean(item.check?.ntb ?? checks[id]?.ntb)
      const itemWajar = key === 'kewajaran' ? newVal : Boolean(item.check?.kewajaran ?? checks[id]?.kewajaran)
      const newStatus = (itemKbli && itemNtb && itemWajar) ? 'Selesai Dicek' : (itemKbli || itemNtb || itemWajar) ? 'Sedang Dicek' : 'Belum Dicek'
      return {
        ...item,
        status: newStatus,
        check: {
          kbli: itemKbli,
          ntb: itemNtb,
          kewajaran: itemWajar,
          checkedBy: checkerName,
          checkedAt: nowStr
        }
      }
    }))

    // Persist to database in real-time
    const endpoint = tab === 'kbli_check' ? '/api/kbli-checks' : '/api/check-data'
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_check',
          assignmentId: id,
          key,
          value: newVal,
          checkerName
        })
      })
      if (res.ok) {
        const json = await res.json()
        if (json.check) {
          setChecks(current => ({ ...current, [id]: json.check }))
          setCrossData(prev => prev.map(item => item.assignmentId === id ? { ...item, status: json.status, check: json.check } : item))
        }
      }
    } catch (err) {
      console.error('Failed to save check to database:', err)
    }
  }

  const isComplete = (id:string) => {
    const c = checks[id]
    return c ? (c.kbli && c.ntb && c.kewajaran) : false
  }

  const filteredCrossData = useMemo(() => {
    return crossData.filter(item => {
      const matchQuery = `${item.assignmentId} ${item.namaUsaha} ${item.kbliAkhir} ${item.kbli?.kategori || ''} ${item.ntb?.catatan || ''}`.toLowerCase().includes(query.toLowerCase())
      if (!matchQuery) return false

      if (selectedKategori !== 'Semua Kategori') {
        const catKbli = (item.kbli?.kategori || '').toLowerCase()
        const catNtb = (item.ntb?.kategori || '').toLowerCase()
        const cat2025 = (item.kbli?.kategori2025 || '').toLowerCase()
        const target = selectedKategori.toLowerCase()
        if (catKbli !== target && catNtb !== target && cat2025 !== target && !catKbli.includes(target) && !catNtb.includes(target)) {
          return false
        }
      }

      if (status === 'Semua') return true
      const complete = isComplete(item.assignmentId)
      return status === 'Selesai' ? complete : !complete
    })
  }, [crossData, query, status, selectedKategori, checks])

  const filteredRows = useMemo(() => {
    return rows.filter(row => {
      const id = row[2] || row[0]
      const text = row.join(' ').toLowerCase()
      if (!text.includes(query.toLowerCase())) return false
      if (status === 'Semua') return true
      const complete = isComplete(id)
      return status === 'Selesai' ? complete : !complete
    })
  }, [rows, query, status, checks])

  const downloadAllData = () => {
    if (isLiveTab) {
      const headers = [
        'assignment_id',
        'nama_di_prelist',
        'nama_usaha',
        'kategori',
        'kategori_2025',
        'kbli_akhir',
        'kegiatan_utama',
        'level_3_kode_nama',
        'level_4_kode_nama',
        'level_6_kode_nama',
        'keterangan',
        'perbaikan_kbli',
        'link_fasih'
      ]
      const exportRows = filteredCrossData.map(item => {
        const level3 = item.kbli?.level3FullCode && item.kbli?.level3Name
          ? `${item.kbli.level3FullCode} - ${item.kbli.level3Name}`
          : (item.kbli?.level3FullCode || item.kbli?.level3Name || '-')

        const level4 = item.kbli?.level4FullCode && item.kbli?.level4Name
          ? `${item.kbli.level4FullCode} - ${item.kbli.level4Name}`
          : (item.kbli?.level4FullCode || item.kbli?.level4Name || '-')

        const level6 = item.kbli?.level6FullCode && item.kbli?.level6Name
          ? `${item.kbli.level6FullCode} - ${item.kbli.level6Name}`
          : (item.kbli?.level6FullCode || item.kbli?.level6Name || item.ntb?.level6FullCode || '-')

        const keterangan = item.kbli?.keterangan && item.kbli.keterangan !== '-'
          ? item.kbli.keterangan
          : (item.keterangan && item.keterangan !== '-'
            ? item.keterangan
            : (item.ntb?.catatan && item.ntb.catatan !== '-'
              ? item.ntb.catatan
              : (item.ntb?.keterangan || '-')))

        const perbaikanKbli = item.kbli?.perbaikanKbli && item.kbli.perbaikanKbli !== '-'
          ? item.kbli.perbaikanKbli
          : (item.perbaikanKbli && item.perbaikanKbli !== '-'
            ? item.perbaikanKbli
            : (item.ntb?.perbaikanKbli || '-'))

        return [
          item.assignmentId,
          item.kbli?.namaDiPrelist || item.namaDiPrelist || item.namaUsaha || '-',
          item.kbli?.namaUsaha || item.namaUsaha || item.ntb?.namaPrincipal || '-',
          item.kbli?.kategori || item.kategori || item.ntb?.kategori || '-',
          item.kbli?.kategori2025 || item.kategori2025 || '-',
          item.kbli?.kbliAkhir || item.kbliAkhir || item.ntb?.kbliAkhir || '-',
          item.kbli?.kegUtama || item.kegUtama || item.ntb?.catatan || '-',
          level3,
          level4,
          level6,
          keterangan,
          perbaikanKbli,
          item.linkFasih
        ]
      })
      exportToCsv(`${tab === 'kbli_check' ? 'kbli_checks' : 'check_data'}_kualitas.csv`, headers, exportRows)
    } else {
      exportToCsv(`${tab}_data.csv`, columns, filteredRows)
    }
  }

  const downloadSingleRow = (item: CrossCheckRecord) => {
    const level3 = item.kbli?.level3FullCode && item.kbli?.level3Name
      ? `${item.kbli.level3FullCode} - ${item.kbli.level3Name}`
      : (item.kbli?.level3FullCode || item.kbli?.level3Name || '-')

    const level4 = item.kbli?.level4FullCode && item.kbli?.level4Name
      ? `${item.kbli.level4FullCode} - ${item.kbli.level4Name}`
      : (item.kbli?.level4FullCode || item.kbli?.level4Name || '-')

    const level6 = item.kbli?.level6FullCode && item.kbli?.level6Name
      ? `${item.kbli.level6FullCode} - ${item.kbli.level6Name}`
      : (item.kbli?.level6FullCode || item.kbli?.level6Name || item.ntb?.level6FullCode || '-')

    const keterangan = item.kbli?.keterangan && item.kbli.keterangan !== '-'
      ? item.kbli.keterangan
      : (item.keterangan && item.keterangan !== '-'
        ? item.keterangan
        : (item.ntb?.catatan && item.ntb.catatan !== '-'
          ? item.ntb.catatan
          : (item.ntb?.keterangan || '-')))

    const perbaikanKbli = item.kbli?.perbaikanKbli && item.kbli.perbaikanKbli !== '-'
      ? item.kbli.perbaikanKbli
      : (item.perbaikanKbli && item.perbaikanKbli !== '-'
        ? item.perbaikanKbli
        : (item.ntb?.perbaikanKbli || '-'))

    const headers = [
      'nama di prelist',
      'nama usaha',
      'kategori',
      'kategori 2025',
      'kbli akhir',
      'kegiatan utama',
      'level 3 (kode & nama)',
      'level 4 (kode & nama)',
      'level 6 (kode & nama)',
      'keterangan',
      'perbaikan kbli'
    ]
    const exportRows = [
      [
        item.kbli?.namaDiPrelist || item.namaDiPrelist || item.namaUsaha || '-',
        item.kbli?.namaUsaha || item.namaUsaha || item.ntb?.namaPrincipal || '-',
        item.kbli?.kategori || item.kategori || item.ntb?.kategori || '-',
        item.kbli?.kategori2025 || item.kategori2025 || '-',
        item.kbli?.kbliAkhir || item.kbliAkhir || item.ntb?.kbliAkhir || '-',
        item.kbli?.kegUtama || item.kegUtama || item.ntb?.catatan || '-',
        level3,
        level4,
        level6,
        keterangan,
        perbaikanKbli
      ]
    ]
    exportToCsv(`check_data_${item.assignmentId}.csv`, headers, exportRows)
  }

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editItem) return
    setFormLoading(true)
    const formData = new FormData(e.currentTarget)
    const endpoint = tab === 'kbli_check' ? '/api/kbli-checks' : '/api/check-data'
    const payload = {
      action: 'update',
      assignmentId: editItem.assignmentId,
      checkerName: currentUser?.username || currentUser?.name || 'Petugas BPS',
      kbliData: {
        namaUsaha: formData.get('namaUsaha') as string,
        namaDiPrelist: formData.get('namaDiPrelist') as string,
        kbliAkhir: formData.get('kbliAkhir') as string,
        kategori: formData.get('kategori') as string,
        kategori2025: formData.get('kategori2025') as string,
        kegUtama: formData.get('kegUtama') as string,
        status: formData.get('status') as string,
        linkFasih: formData.get('linkFasih') as string,
        keterangan: formData.get('keterangan') as string,
        perbaikanKbli: formData.get('perbaikanKbli') as string,
      },
      ntbData: {
        namaPrincipal: formData.get('namaUsaha') as string,
        namaDiPrelist: formData.get('namaDiPrelist') as string,
        kbliAkhir: formData.get('kbliAkhir') as string,
        kategori: formData.get('kategori') as string,
        kategori2025: formData.get('kategori2025') as string,
        catatan: formData.get('keterangan') as string,
        keterangan: formData.get('keterangan') as string,
        perbaikanKbli: formData.get('perbaikanKbli') as string,
        linkFasih: formData.get('linkFasih') as string,
      }
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error()
      setEditItem(null)
      fetchData(false)
    } catch {
      alert('Gagal menyimpan perubahan ke database.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleAddAssignment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormLoading(true)
    const formData = new FormData(e.currentTarget)
    const aid = (formData.get('assignmentId') as string || '').trim()
    if (!aid) {
      alert('Assignment ID wajib diisi.')
      setFormLoading(false)
      return
    }

    const endpoint = tab === 'kbli_check' ? '/api/kbli-checks' : '/api/check-data'
    const payload = {
      action: 'create',
      assignmentId: aid,
      checkerName: currentUser?.username || currentUser?.name || 'Admin BPS',
      kbliData: {
        namaUsaha: formData.get('namaUsaha') as string,
        kbliAkhir: formData.get('kbliAkhir') as string,
        kategori: formData.get('kategori') as string,
        kategori2025: (formData.get('kategori2025') as string) || 'Perdagangan Eceran',
        kegUtama: formData.get('kegUtama') as string,
        status: 'Belum Dicek',
        linkFasih: formData.get('linkFasih') as string,
      },
      ntbData: {
        namaPrincipal: formData.get('namaUsaha') as string,
        kbliAkhir: formData.get('kbliAkhir') as string,
        kategori: formData.get('kategori') as string,
        catatan: formData.get('catatan') as string,
        nilaiTambah: formData.get('nilaiTambah') as string,
        r27aOmzet: formData.get('r27aOmzet') as string,
        linkFasih: formData.get('linkFasih') as string,
      }
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error()
      setShowAddModal(false)
      fetchData(false)
    } catch {
      alert('Gagal menambahkan assignment ke database.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const inputEl = e.target
    const reader = new FileReader()
    reader.onload = async (evt) => {
      const text = evt.target?.result as string
      if (!text || text.trim() === '') {
        alert('File CSV kosong atau tidak terbaca.')
        inputEl.value = ''
        return
      }

      const { rows, delimiter } = parseCsv(text)
      if (rows.length === 0) {
        alert('File CSV tidak memiliki baris data.')
        inputEl.value = ''
        return
      }

      // Filter rows that have a valid assignment_id
      const validRows = rows.filter(r => {
        const map = new Map<string, string>()
        for (const [k, v] of Object.entries(r)) {
          map.set(k.toLowerCase().replace(/[^a-z0-9]/g, ''), String(v))
        }
        const aid = map.get('assignmentid') || map.get('idassignment') || map.get('kodeassignment') || map.get('id') || map.get('assignment')
        return aid && aid.trim() !== ''
      })

      if (validRows.length === 0) {
        alert('Tidak ditemukan kolom "assignment_id" yang valid pada baris header file CSV.\nPastikan kolom "assignment_id" tersedia di baris pertama.')
        inputEl.value = ''
        return
      }

      const delimiterName = delimiter === ';' ? 'Titik Koma (;)' : delimiter === '\t' ? 'Tab (\\t)' : 'Koma (,)'
      setImportPreview({
        fileName: file.name,
        delimiter: delimiterName,
        totalRows: validRows.length,
        validRows,
        previewRows: validRows.slice(0, 5),
        targetTable: tab === 'kbli_check' ? 'kbli_checks' : 'kbli_checks & negative_ntb_checks'
      })
      inputEl.value = ''
    }
    reader.readAsText(file)
  }

  const executeImport = async () => {
    if (!importPreview || importPreview.validRows.length === 0) return
    setImportLoading(true)
    const endpoint = tab === 'kbli_check' ? '/api/kbli-checks' : '/api/check-data'
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import',
          rows: importPreview.validRows,
          checkerName: currentUser?.username || currentUser?.name || 'Admin BPS'
        })
      })
      const result = await res.json()
      if (res.ok) {
        setImportPreview(null)
        alert(result.message || `Berhasil mengimpor ${importPreview.totalRows} data ke database!`)
        fetchData(false)
      } else {
        alert(result.error || 'Gagal menyimpan data ke database.')
      }
    } catch {
      alert('Gagal menghubungi server untuk import data.')
    } finally {
      setImportLoading(false)
    }
  }

  const activeCount = isLiveTab ? filteredCrossData.length : filteredRows.length
  const totalCount = isLiveTab ? crossData.length : rows.length
  const totalPages = Math.max(1, Math.ceil(activeCount / pageSize))
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages)
  const startIndex = (safeCurrentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, activeCount)

  const paginatedCrossData = useMemo(() => {
    return filteredCrossData.slice(startIndex, endIndex)
  }, [filteredCrossData, startIndex, endIndex])

  const paginatedRows = useMemo(() => {
    return filteredRows.slice(startIndex, endIndex)
  }, [filteredRows, startIndex, endIndex])

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow blue">DATA MANAGEMENT</p>
          <h1>{title}</h1>
          <p className="muted">
            {tab === 'kbli_check'
              ? 'Pengecekan data KBLI BPS Kabupaten Tuban langsung dari tabel kbli_checks (sinkronisasi database real-time).'
              : tab === 'kbli'
              ? 'Pengecekan cross table hasil penggabungan kbli_checks dan negative_ntb_checks dari database PostgreSQL.'
              : 'Satu tampilan pengecekan berdasarkan assignment_id.'}
          </p>
        </div>
        <button className="primary" onClick={() => setShowAddModal(true)}>
          <Plus /> Tambah Data
        </button>
      </div>

      <section className="panel table-panel">
        <div className="table-toolbar">
          <div className="search-box">
            <Search />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Cari assignment, nama usaha, KBLI, catatan..."
            />
          </div>
          <select value={status} onChange={e => setStatus(e.target.value)}>
            <option>Semua</option>
            <option>Belum dicek</option>
            <option>Selesai</option>
          </select>
          {isLiveTab && (
            <select
              value={selectedKategori}
              onChange={e => setSelectedKategori(e.target.value)}
              title="Filter berdasarkan kategori usaha"
            >
              <option value="Semua Kategori">Semua Kategori</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
          {isLiveTab && (
            <div className="live-sync-indicator" title="Sinkronisasi otomatis dengan database PostgreSQL setiap 4 detik">
              <span className="live-dot" />
              <span>Real-time Sync</span>
            </div>
          )}
          {isLiveTab && (
            <button className="outline" onClick={() => fetchData(true)} title="Segarkan data dari database">
              <RotateCw className={loading ? 'rotated' : ''} /> Segarkan
            </button>
          )}
          <button className="outline" onClick={downloadAllData} title="Unduh data tabel dalam format CSV">
            <Download /> Unduh Data ({activeCount})
          </button>
          {isLiveTab && (
            <>
              <input
                id="csv-file-input"
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleCsvImport}
              />
              <button
                className="outline"
                onClick={() => document.getElementById('csv-file-input')?.click()}
                title="Import data CSV ke database PostgreSQL"
              >
                <Upload /> Import CSV
              </button>
            </>
          )}
        </div>

        <div className="table-wrap combined-table">
          <table>
            <thead>
              <tr>
                <th>Detail</th>
                <th>assignment_id</th>
                <th>Nama usaha</th>
                <th>KBLI akhir</th>
                <th>Link Fasih</th>
                <th>Pengecekan 1<br/><small>KBLI</small></th>
                <th>Pengecekan 2<br/><small>NTB negatif</small></th>
                <th>Pengecekan 3<br/><small>Kewajaran</small></th>
                <th>Dicek oleh</th>
                <th>Tanggal cek</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && crossData.length === 0 ? (
                <tr>
                  <td colSpan={11} className="empty-users">Memuat data live dari database PostgreSQL...</td>
                </tr>
              ) : isLiveTab ? (
                paginatedCrossData.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="empty-users">Data tidak ditemukan di database.</td>
                  </tr>
                ) : (
                  paginatedCrossData.map((item, rowIndex) => {
                    const id = item.assignmentId
                    const rowKey = `${id}-${rowIndex}`
                    const check = checks[id] || item.check || { kbli: false, ntb: false, kewajaran: false }
                    const isExpanded = expandedRow === rowKey
                    const rowStatus = item.status || (isComplete(id) ? 'Selesai Dicek' : 'Belum Dicek')

                    return (
                      <Fragment key={rowKey}>
                        <tr>
                          <td>
                            <button
                              className="detail-toggle"
                              aria-label={`Detail ${id}`}
                              aria-expanded={isExpanded}
                              onClick={() => setExpandedRow(isExpanded ? null : rowKey)}
                            >
                              <ChevronDown className={isExpanded ? 'rotated' : ''} />
                            </button>
                          </td>
                          <td><strong>{id}</strong></td>
                          <td>{item.namaUsaha}</td>
                          <td>{item.kbliAkhir}</td>
                          <td>
                            {item.linkFasih && item.linkFasih !== '-' ? (
                              <a
                                className="fasih-link"
                                href={item.linkFasih}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`Buka tautan Fasih ${id}`}
                                title="Buka tautan Fasih"
                              >
                                <Eye />
                              </a>
                            ) : '-'}
                          </td>
                          {(['kbli', 'ntb', 'kewajaran'] as const).map(key => (
                            <td key={key}>
                              <label className="check-cell">
                                <input
                                  type="checkbox"
                                  checked={Boolean(check[key])}
                                  onChange={() => updateCheck(id, key)}
                                />
                                <span>{check[key] ? 'Sudah' : '-'}</span>
                              </label>
                            </td>
                          ))}
                          <td>{check.checkedBy || '-'}</td>
                          <td>{check.checkedAt || '-'}</td>
                          <td>
                            <span className={`status-badge ${
                              rowStatus.toLowerCase().includes('selesai') ? 'selesai' :
                              rowStatus.toLowerCase().includes('sedang') ? 'sedang' :
                              rowStatus.toLowerCase().includes('perlu') ? 'konfirmasi' : 'belum'
                            }`}>
                              {rowStatus}
                            </span>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="details-row" key={`${rowKey}-details`}>
                            <td colSpan={11}>
                              <CrossTableDetail
                                item={item}
                                onEdit={() => setEditItem(item)}
                                onDownload={() => downloadSingleRow(item)}
                              />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })
                )
              ) : (
                paginatedRows.map((row, rowIndex) => {
                  const id = row[2] || row[0]
                  const rowKey = `${id}-${rowIndex}`
                  const check = checks[id] || { kbli: false, ntb: false, kewajaran: false }
                  const isExpanded = expandedRow === rowKey

                  return (
                    <Fragment key={rowKey}>
                      <tr>
                        <td>
                          <button
                            className="detail-toggle"
                            aria-label={`Detail ${id}`}
                            aria-expanded={isExpanded}
                            onClick={() => setExpandedRow(isExpanded ? null : rowKey)}
                          >
                            <ChevronDown className={isExpanded ? 'rotated' : ''} />
                          </button>
                        </td>
                        <td><strong>{id}</strong></td>
                        <td>{row[3] || row[1]}</td>
                        <td>{row[5] || row[3]}</td>
                        <td>
                          {row[13] && row[13] !== '-' ? (
                            <a
                              className="fasih-link"
                              href={row[13]}
                              target="_blank"
                              rel="noreferrer"
                              aria-label={`Buka tautan Fasih ${id}`}
                              title="Buka tautan Fasih"
                            >
                              <Eye />
                            </a>
                          ) : '-'}
                        </td>
                        {(['kbli', 'ntb', 'kewajaran'] as const).map(key => (
                          <td key={key}>
                            <label className="check-cell">
                              <input
                                type="checkbox"
                                checked={Boolean(check[key])}
                                onChange={() => updateCheck(id, key)}
                              />
                              <span>{check[key] ? 'Sudah' : '-'}</span>
                            </label>
                          </td>
                        ))}
                        <td>{check.checkedBy || '-'}</td>
                        <td>{check.checkedAt || '-'}</td>
                      </tr>
                      {isExpanded && (
                        <tr className="details-row" key={`${rowKey}-details`}>
                          <td colSpan={10}>
                            <div className="details-grid">
                              {columns.map((column, colIdx) => (
                                <div key={column}>
                                  <small>{column}</small>
                                  <strong>{row[colIdx] || '-'}</strong>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <span>
              Menampilkan {activeCount === 0 ? 0 : startIndex + 1} - {endIndex} dari {activeCount} assignment
              {activeCount !== totalCount && ` (total ${totalCount})`}
            </span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <label htmlFor="pageSizeSelect" style={{ fontSize: '11px', color: '#667d93' }}>Tampilkan:</label>
              <select
                id="pageSizeSelect"
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value))
                  setCurrentPage(1)
                }}
                style={{
                  border: '1px solid #d3dfe9',
                  borderRadius: '6px',
                  padding: '3px 8px',
                  fontSize: '11px',
                  background: 'white',
                  color: 'var(--ink)',
                  cursor: 'pointer'
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span style={{ fontSize: '11px', color: '#667d93' }}>per halaman</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              className="page-btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={safeCurrentPage <= 1}
              title="Halaman Sebelumnya"
              style={{ opacity: safeCurrentPage <= 1 ? 0.4 : 1, cursor: safeCurrentPage <= 1 ? 'not-allowed' : 'pointer', width: 'auto', padding: '0 8px' }}
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - safeCurrentPage) <= 1)
              .reduce<(number | string)[]>((acc, p, idx, arr) => {
                if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                  acc.push('...')
                }
                acc.push(p)
                return acc
              }, [])
              .map((p, idx) => {
                if (p === '...') {
                  return <span key={`ellipsis-${idx}`} style={{ padding: '0 4px', color: '#889eb2', fontSize: '11px' }}>...</span>
                }
                return (
                  <button
                    key={`page-${p}`}
                    className={`page-btn ${safeCurrentPage === p ? 'selected' : ''}`}
                    onClick={() => setCurrentPage(Number(p))}
                    style={{ cursor: 'pointer' }}
                  >
                    {p}
                  </button>
                )
              })
            }
            <button
              className="page-btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={safeCurrentPage >= totalPages}
              title="Halaman Berikutnya"
              style={{ opacity: safeCurrentPage >= totalPages ? 0.4 : 1, cursor: safeCurrentPage >= totalPages ? 'not-allowed' : 'pointer', width: 'auto', padding: '0 8px' }}
            >
              Next →
            </button>
          </div>
        </div>
      </section>

      {/* MODAL EDIT DATA BARIS */}
      {editItem && (
        <div className="modal-backdrop" onClick={() => setEditItem(null)}>
          <div className="user-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="modal-head">
              <div>
                <p className="eyebrow blue">PERBARUI DATABASE</p>
                <h2>Edit Data: {editItem.assignmentId}</h2>
              </div>
              <button className="close-modal" onClick={() => setEditItem(null)}><X /></button>
            </div>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-grid">
                <label>Assignment ID
                  <input value={editItem.assignmentId} disabled style={{ background: '#f5f7fa', color: '#688096' }} />
                </label>
                <label>Nama Usaha *
                  <input name="namaUsaha" required defaultValue={editItem.namaUsaha} />
                </label>
              </div>
              <div className="form-grid">
                <label>Nama di Prelist
                  <input name="namaDiPrelist" defaultValue={editItem.kbli?.namaDiPrelist || editItem.namaDiPrelist || ''} />
                </label>
                <label>KBLI Akhir
                  <input name="kbliAkhir" defaultValue={editItem.kbliAkhir} />
                </label>
              </div>
              <div className="form-grid">
                <label>Kategori
                  <input name="kategori" defaultValue={editItem.kbli?.kategori || editItem.kategori || editItem.ntb?.kategori || ''} />
                </label>
                <label>Kategori 2025
                  <input name="kategori2025" defaultValue={editItem.kbli?.kategori2025 || editItem.kategori2025 || ''} />
                </label>
              </div>
              <div className="form-grid">
                <label>Perbaikan KBLI
                  <input name="perbaikanKbli" defaultValue={editItem.kbli?.perbaikanKbli || editItem.perbaikanKbli || ''} placeholder="Contoh: 47111" />
                </label>
                <label>Status KBLI
                  <select name="status" defaultValue={editItem.kbli?.status || 'Belum Dicek'}>
                    <option value="Belum Dicek">Belum Dicek</option>
                    <option value="Perlu Konfirmasi">Perlu Konfirmasi</option>
                    <option value="Selesai Dicek">Selesai Dicek</option>
                  </select>
                </label>
              </div>
              <label>Kegiatan Utama
                <input name="kegUtama" defaultValue={editItem.kbli?.kegUtama || editItem.kegUtama || ''} />
              </label>
              <label>Keterangan
                <input name="keterangan" defaultValue={editItem.kbli?.keterangan || editItem.keterangan || editItem.ntb?.catatan || ''} />
              </label>
              <label>Link Fasih (URL)
                <input name="linkFasih" defaultValue={editItem.linkFasih} />
              </label>
              <div className="modal-actions">
                <button type="button" className="outline" onClick={() => setEditItem(null)}>Batal</button>
                <button type="submit" className="primary" disabled={formLoading}>
                  {formLoading ? 'Menyimpan...' : 'Perbarui Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH DATA ASSIGNMENT */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="user-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <div className="modal-head">
              <div>
                <p className="eyebrow blue">DATA BARU</p>
                <h2>Tambah Assignment ke Database</h2>
              </div>
              <button className="close-modal" onClick={() => setShowAddModal(false)}><X /></button>
            </div>
            <form onSubmit={handleAddAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-grid">
                <label>Assignment ID *
                  <input name="assignmentId" required placeholder="Contoh: TBN-00130" />
                </label>
                <label>Nama Usaha *
                  <input name="namaUsaha" required placeholder="Contoh: Toko Berkah Baru" />
                </label>
              </div>
              <div className="form-grid">
                <label>KBLI Akhir
                  <input name="kbliAkhir" placeholder="Contoh: 47111" />
                </label>
                <label>Kategori
                  <input name="kategori" defaultValue="Perdagangan" placeholder="Contoh: Perdagangan" />
                </label>
              </div>
              <div className="form-grid">
                <label>Nilai Tambah (NTB)
                  <input name="nilaiTambah" defaultValue="0" placeholder="Contoh: 2.500.000 atau 0" />
                </label>
                <label>R27A Omzet
                  <input name="r27aOmzet" defaultValue="0" placeholder="Contoh: 10.000.000" />
                </label>
              </div>
              <label>Kegiatan Utama (KBLI)
                <input name="kegUtama" placeholder="Deskripsi aktivitas usaha" />
              </label>
              <label>Catatan (NTB)
                <input name="catatan" placeholder="Catatan konfirmasi atau validasi lapangan" />
              </label>
              <label>Link Fasih (URL)
                <input name="linkFasih" placeholder="https://fasih.bps.go.id/survey/..." />
              </label>
              <div className="modal-actions">
                <button type="button" className="outline" onClick={() => setShowAddModal(false)}>Batal</button>
                <button type="submit" className="primary" disabled={formLoading}>
                  {formLoading ? 'Menyimpan...' : 'Simpan ke Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PREVIEW IMPORT CSV */}
      {importPreview && (
        <div className="modal-backdrop" onClick={() => !importLoading && setImportPreview(null)}>
          <div className="user-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '780px', width: '95%' }}>
            <div className="modal-head">
              <div>
                <p className="eyebrow blue">IMPORT CSV DATABASE</p>
                <h2>Import Data ke Tabel {tab === 'kbli_check' ? 'kbli_checks' : 'Database'}</h2>
              </div>
              {!importLoading && (
                <button className="close-modal" onClick={() => setImportPreview(null)} aria-label="Tutup modal import"><X /></button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="import-summary-grid">
                <div className="import-stat-card">
                  <span className="stat-label">Nama File</span>
                  <strong className="stat-value">{importPreview.fileName}</strong>
                </div>
                <div className="import-stat-card">
                  <span className="stat-label">Format Pemisah</span>
                  <strong className="stat-value">{importPreview.delimiter}</strong>
                </div>
                <div className="import-stat-card">
                  <span className="stat-label">Baris Valid</span>
                  <strong className="stat-value accent">{importPreview.totalRows} Assignment</strong>
                </div>
                <div className="import-stat-card">
                  <span className="stat-label">Target Tabel</span>
                  <strong className="stat-value blue">Tabel {importPreview.targetTable}</strong>
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px', fontSize: '12px', color: '#475569' }}>
                <strong style={{ color: '#0f172a' }}>Info Sinkronisasi: </strong>
                Data akan disimpan langsung ke tabel <code>{tab === 'kbli_check' ? 'kbli_checks' : 'database'}</code>. Jika <code>assignment_id</code> sudah ada di database, baris tersebut akan <strong>diperbarui (update)</strong>. Jika belum ada, akan <strong>ditambahkan (insert)</strong> sebagai baris baru.
              </div>

              <div>
                <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
                  Preview Data ({Math.min(5, importPreview.previewRows.length)} dari {importPreview.totalRows} baris):
                </p>
                <div className="preview-table-wrap">
                  <table className="preview-mini-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>assignment_id</th>
                        <th>Nama Usaha</th>
                        <th>KBLI Akhir</th>
                        <th>Kategori</th>
                        <th>Kegiatan Utama / Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.previewRows.map((r, idx) => {
                        const map = new Map<string, string>()
                        for (const [k, v] of Object.entries(r)) {
                          map.set(k.toLowerCase().replace(/[^a-z0-9]/g, ''), String(v))
                        }
                        const aid = map.get('assignmentid') || map.get('id') || '-'
                        const nama = map.get('namausaha') || map.get('nama') || '-'
                        const kbli = map.get('kbliakhir') || map.get('kbli') || '-'
                        const kat = map.get('kategori') || map.get('kategori2025') || '-'
                        const ket = map.get('kegiatanutama') || map.get('kegutama') || map.get('keterangan') || map.get('catatan') || '-'
                        return (
                          <tr key={idx}>
                            <td>{idx + 1}</td>
                            <td><strong>{aid}</strong></td>
                            <td>{nama}</td>
                            <td>{kbli}</td>
                            <td>{kat}</td>
                            <td><small>{ket}</small></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '6px' }}>
                <button
                  type="button"
                  className="outline"
                  disabled={importLoading}
                  onClick={() => setImportPreview(null)}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="primary"
                  disabled={importLoading}
                  onClick={executeImport}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {importLoading ? (
                    <>
                      <RotateCw className="rotated" />
                      <span>Menyimpan ke {tab === 'kbli_check' ? 'kbli_checks' : 'database'}...</span>
                    </>
                  ) : (
                    <>
                      <Upload />
                      <span>Simpan {importPreview.totalRows} Data ke Database</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function UsersPage(){
  type UserObj = { id: string; initials: string; name: string; email: string; username?: string; role: string; status: string; bidang: string }
  const [users,setUsers]=useState<UserObj[]>([])
  const [query,setQuery]=useState(''); const [role,setRole]=useState('Semua peran'); const [modal,setModal]=useState(false); const [editing,setEditing]=useState<number|null>(null); const [menu,setMenu]=useState<number|null>(null)
  const [form,setForm]=useState({name:'',email:'',username:'',password:'',bidang:'Distribusi',role:'Petugas Lapangan',status:'Aktif'})
  useEffect(()=>{
    fetch('/api/users').then(async response=>{
      if(!response.ok)throw new Error('Gagal memuat pengguna');
      const data=await response.json();
      setUsers(data.map((u:any)=>({
        id: u.id,
        initials: (u.name || u.username || 'U').slice(0,2).toUpperCase(),
        name: u.name,
        email: u.email,
        username: u.username || u.email.split('@')[0],
        role: u.role,
        status: u.status || 'Aktif',
        bidang: u.bidang || 'Distribusi'
      })))
    }).catch(()=>window.alert('Daftar pengguna gagal dimuat dari database.'))
  },[])

  const visible=users.filter(u=>(role==='Semua peran'||u.role===role)&&`${u.name} ${u.email} ${u.username || ''} ${u.initials}`.toLowerCase().includes(query.toLowerCase()))
  function openForm(index?:number){
    if(index===undefined){
      setEditing(null);
      setForm({name:'',email:'',username:'',password:'',bidang:'Distribusi',role:'Petugas Lapangan',status:'Aktif'})
    }else{
      setEditing(index);
      const u=users[index];
      setForm({
        name:u.name,
        email:u.email,
        username:u.username||'',
        password:'',
        role:u.role,
        status:u.status,
        bidang:u.bidang||'Distribusi'
      })
    }
    setMenu(null);
    setModal(true)
  }
  async function save(){
    if(!form.name.trim()||!form.email.trim()||(editing===null&&!form.password.trim()))return;
    const finalUsername = form.username.trim() || form.email.split('@')[0];
    const payload = { ...form, username: finalUsername };
    if(editing===null){
      if(form.password.length<8){window.alert('Password minimal 8 karakter.');return}
      const response=await fetch('/api/users/create',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)
      });
      if(!response.ok){
        const result=await response.json().catch(()=>null);
        window.alert(result?.error||'Pengguna gagal disimpan ke database.');
        return;
      }
      const created=await response.json();
      const initials=form.name.split(' ').map(v=>v[0]).join('').slice(0,2).toUpperCase();
      setUsers(current=>[...current,{id: created.user?.id||created.id, initials, name: form.name, email: form.email, username: finalUsername, role: form.role, status: form.status, bidang: form.bidang}])
    }else{
      // Add your update logic here if editing API is implemented
    }
    setModal(false)
  }
  function toggle(index:number){
    setUsers(users.map((u,i)=>i===index?{...u, status: u.status==='Aktif'?'Nonaktif':'Aktif'}:u));
    setMenu(null)
  }
  async function remove(index:number){
    const response=await fetch('/api/users',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:users[index].id})});
    if(!response.ok){const result=await response.json().catch(()=>null);window.alert(result?.error||'Pengguna gagal dihapus.');return}
    setUsers(users.filter((_,i)=>i!==index));
    setMenu(null)
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow blue">ADMINISTRASI</p>
          <h1>Manajemen Pengguna</h1>
          <p className="muted">Kelola akses, peran, dan pembagian tugas pengguna.</p>
        </div>
        <button className="primary" onClick={()=>openForm()}><Plus /> Tambah Pengguna</button>
      </div>
      <section className="panel table-panel">
        <div className="table-toolbar">
          <div className="search-box">
            <Search />
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari nama, username, atau email..." />
          </div>
          <select value={role} onChange={e=>setRole(e.target.value)}>
            <option>Semua peran</option>
            <option>Administrator</option>
            <option>Petugas Kualitas</option>
            <option>Reviewer</option>
          </select>
        </div>
        <div className="users-list">
          {visible.map((x)=>(
            <div className="user-row" key={x.email}>
              <div className="avatar">{x.initials}</div>
              <div className="user-main">
                <strong>{x.name}</strong>
                <span>{x.email}{x.username ? ` • @${x.username}` : ''}</span>
              </div>
              <span className="role">{x.role}</span>
              <span className={x.status==='Aktif'?'badge done':'badge inactive'}>{x.status}</span>
              <div className="user-actions">
                <button className="more" aria-label={`Aksi ${x.name}`} onClick={()=>setMenu(menu===users.indexOf(x)?null:users.indexOf(x))}>
                  <MoreHorizontal />
                </button>
                {menu===users.indexOf(x)&&(
                  <div className="user-menu">
                    <button onClick={()=>openForm(users.indexOf(x))}><Pencil /> Edit pengguna</button>
                    <button onClick={()=>toggle(users.indexOf(x))}>{x.status==='Aktif'?<UserRoundX />:<UserRoundCheck />} {x.status==='Aktif'?'Nonaktifkan':'Aktifkan'}</button>
                    <button className="danger" onClick={()=>remove(users.indexOf(x))}><Trash2 /> Hapus pengguna</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {visible.length===0&&<p className="empty-users">Pengguna tidak ditemukan.</p>}
        <div className="table-footer">
          <span>Menampilkan {visible.length} dari {users.length} pengguna</span>
          <span className="muted">Perubahan tersimpan ke daftar pengguna</span>
        </div>
      </section>
      {modal&&(
        <div className="modal-backdrop" onClick={()=>setModal(false)}>
          <div className="user-modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <p className="eyebrow blue">AKUN PENGGUNA</p>
                <h2>{editing===null?'Tambah Pengguna':'Edit Pengguna'}</h2>
              </div>
              <button className="close-modal" onClick={()=>setModal(false)}><X /></button>
            </div>
            <label>Nama lengkap<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Contoh: Dwi Santoso" /></label>
            <label>Username<input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="Contoh: dwisantoso" /></label>
            <label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="nama@bps.go.id" /></label>
            <label>Bidang
              <select value={form.bidang} onChange={e=>setForm({...form,bidang:e.target.value})}>
                <option>Distribusi</option>
                <option>Produksi</option>
                <option>Sosial</option>
                <option>Nerwilis</option>
                <option>PLS</option>
                <option>Umum</option>
              </select>
            </label>
            <label>Password<input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Minimal 8 karakter" type="password" minLength={8} required={editing===null} /></label>
            <div className="form-grid">
              <label>Peran
                <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                  <option>Administrator</option>
                  <option>Petugas Kualitas</option>
                  <option>Reviewer</option>
                </select>
              </label>
              <label>Status
                <select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
                  <option>Aktif</option>
                  <option>Nonaktif</option>
                </select>
              </label>
            </div>
            <div className="modal-actions">
              <button className="outline" onClick={()=>setModal(false)}>Batal</button>
              <button className="primary" onClick={save}>Simpan Pengguna</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


export default App
