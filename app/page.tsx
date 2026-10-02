'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { BarChart3, CheckCircle2, ChevronDown, Database, Download, ExternalLink, Eye, FileCheck2, LayoutDashboard, LogOut, Menu, MoreHorizontal, Pencil, Plus, RotateCw, Search, Settings, ShieldCheck, Trash2, Upload, UserRoundCheck, Users, UserRoundX, X } from 'lucide-react'

type Tab = 'dashboard' | 'stage3' | 'negative' | 'kbli' | 'users'

const negativeColumns = ['level_2_full_code','level_6_full_code','assignment_id','nama_principal','kategori','kbli_akhir','tahun_operasi','catatan','r27a_omzet','r26c_biaya_pembelian','r26b_biaya_produksi','r26d_biaya_operasional','nilai_tambah','link_fasih','source_file','source_folder']
const kbliColumns = ['level_3_full_code','level_3_name','level_4_full_code','level_4_name','level_6_full_code','level_6_name','assignment_status_alias','nama_di_prelist','nama_usaha','kategori','kategori_2025','kbli_akhir','keg_utama','index1','link_fasih']

const sampleNegative = [
  ['52','5260101001','TBN-00124','Warung Sumber Rejeki','Perdagangan','47111','2024','Omzet belum terisi','0','0','0','0','0','Lihat','ntb_2025.csv','Tuban/01'],
  ['52','5260101002','TBN-00125','Bengkel Maju Jaya','Jasa','45201','2023','Perlu konfirmasi biaya','12000000','4500000','1800000','2100000','3600000','Lihat','ntb_2025.csv','Tuban/01'],
  ['52','5260101003','TBN-00126','Toko Berkah','Perdagangan','47112','2024','Data lengkap','8600000','2100000','900000','1100000','4400000','Lihat','ntb_2025.csv','Tuban/02'],
]

function Login({ onLogin }: { onLogin: () => void }) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  async function submit() {
    setError('')
    const lookup = await fetch(`/api/users/lookup?identifier=${encodeURIComponent(identifier)}`)
    const account = await lookup.json()
    if (!lookup.ok || !account.email) { setError('Username/email atau password tidak valid.'); return }
    const result = await authClient.signIn.email({ email: account.email, password })
    if (result.error) setError('Username/email atau password tidak valid.')
    else onLogin()
  }
  return <main className="login-shell"><div className="login-art"><div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}><img src="/icon.svg" alt="Logo BPS" style={{ width: 46, height: 46 }} /><div className="brand-mark">BPS</div></div><div><p className="eyebrow">SISTEM MONITORING</p><h1>Kualitas Data<br /><span>BPS Kabupaten Tuban</span></h1><p className="login-copy">Pantau, validasi, dan tingkatkan kualitas data statistik sektoral secara terintegrasi.</p></div><div className="login-foot">Badan Pusat Statistik Kabupaten Tuban<br />Data berkualitas untuk Tuban yang lebih baik.</div></div><div className="login-card"><div className="mobile-brand">BPS TUBAN</div><p className="eyebrow blue">SELAMAT DATANG</p><h2>Masuk ke Dashboard</h2><p className="muted">Gunakan email atau username untuk melanjutkan.</p><label>Email atau username</label><input value={identifier} onChange={e=>setIdentifier(e.target.value)} placeholder="admin atau nama@bps.go.id" /><label>Password</label><input value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" type="password" />{error&&<p className="error-text">{error}</p>}<button className="primary full" onClick={submit}>Masuk <span>→</span></button></div></main>
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [tab, setTab] = useState<Tab>('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'Semua'|'Belum dicek'|'Selesai'>('Semua')
  const rows = useMemo(()=>tab === 'kbli' ? [] : sampleNegative, [tab])
  if (!loggedIn) return <Login onLogin={()=>setLoggedIn(true)} />
  const nav = [{id:'dashboard',label:'Ringkasan',icon:LayoutDashboard},{id:'kbli',label:'Check Data',icon:Database},{id:'users',label:'Manajemen Pengguna',icon:Users}] as const
  const tableCols = tab === 'kbli' ? kbliColumns : negativeColumns
  return <div className="app-shell">{mobileOpen && <div className="sidebar-backdrop" onClick={()=>setMobileOpen(false)} aria-label="Tutup menu navigasi" />}<aside className={mobileOpen?'sidebar open':'sidebar'}><div className="side-brand"><img src="/icon.svg" alt="Logo BPS" style={{ width: 34, height: 34, flexShrink: 0 }} /><div><strong>Kualitas Data</strong><span>Kabupaten Tuban</span></div><button className="close-nav" onClick={()=>setMobileOpen(false)} aria-label="Tutup navigasi"><X /></button></div><div className="side-section">MENU UTAMA</div><nav>{nav.map(item=>{const Icon=item.icon; return <button key={item.id} className={tab===item.id?'nav-item active':'nav-item'} onClick={()=>{setTab(item.id);setMobileOpen(false)}}><Icon />{item.label}{item.id==='negative'&&<b>12</b>}</button>})}</nav><div className="sidebar-bottom"><button className="nav-item"><Settings /> Pengaturan</button><button className="nav-item logout" onClick={()=>setLoggedIn(false)}><LogOut /> Keluar</button></div></aside><div className="main-area"><header><button className="menu-btn" onClick={()=>setMobileOpen(true)} title="Buka menu navigasi" aria-label="Buka menu navigasi"><Menu /></button><div className="crumb">Monitoring <span>/</span> <strong>{nav.find(n=>n.id===tab)?.label}</strong></div><div className="header-actions"><button className="icon-button"><Search /></button><div className="profile"><div className="avatar">AR</div><div><strong>Admin BPS</strong><span>Administrator</span></div><ChevronDown /></div></div></header><main className="content">{tab==='dashboard'?<Dashboard setTab={setTab}/>:tab==='users'?<UsersPage/>:<TablePage tab={tab} columns={tableCols} rows={rows} query={query} setQuery={setQuery} status={status} setStatus={setStatus}/>}</main></div></div>
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
  kbliAkhir: string
  linkFasih: string
  hasKbli: boolean
  hasNtb: boolean
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

function CrossTableDetail({
  item,
  onDownload,
  onEdit
}: {
  item: CrossCheckRecord
  onDownload: () => void
  onEdit?: () => void
}) {
  const kbliMatch = item.kbli && item.ntb ? item.kbli.kbliAkhir === item.ntb.kbliAkhir : null
  const fasihUrl = item.linkFasih && item.linkFasih !== '-' ? item.linkFasih : null

  return (
    <div className="cross-table-container">
      <div className="cross-table-topbar">
        <div className="cross-table-title">
          <strong>Detail Cross Table: {item.assignmentId}</strong>
          {item.hasKbli && item.hasNtb ? (
            <span className="match-badge matched">Terhubung di Kedua Tabel</span>
          ) : item.hasKbli ? (
            <span className="match-badge single">Tercatat di KBLI Checks Saja</span>
          ) : (
            <span className="match-badge single">Tercatat di NTB Negatif Saja</span>
          )}
          {kbliMatch !== null && (
            <span className={`match-badge ${kbliMatch ? 'matched' : 'mismatch'}`}>
              {kbliMatch ? `KBLI Selaras (${item.kbli?.kbliAkhir})` : `KBLI Berbeda: ${item.kbli?.kbliAkhir || '-'} vs ${item.ntb?.kbliAkhir || '-'}`}
            </span>
          )}
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
          <button className="btn-download-row" onClick={onDownload} title="Unduh data baris ini dalam format CSV">
            <Download /> Unduh Baris (CSV)
          </button>
        </div>
      </div>

      <div className="cross-compare-banner">
        <div className="compare-item">
          <span>Assignment ID:</span>
          <strong>{item.assignmentId}</strong>
        </div>
        <div className="compare-item">
          <span>Nama Usaha:</span>
          <strong>{item.namaUsaha}</strong>
        </div>
        <div className="compare-item">
          <span>KBLI Akhir (KBLI vs NTB):</span>
          <strong>{item.kbli?.kbliAkhir || '-'} / {item.ntb?.kbliAkhir || '-'}</strong>
        </div>
        <div className="compare-item">
          <span>Nilai Tambah:</span>
          <strong style={{ color: (item.ntb?.nilaiTambah || '').includes('-') ? '#c43838' : '#19324d' }}>
            {item.ntb?.nilaiTambah || '-'}
          </strong>
        </div>
      </div>

      <div className="cross-cards-grid">
        {/* KBLI CHECKS CARD */}
        <div className="cross-card">
          <div className="cross-card-header">
            <div className="cross-card-title">
              <Database /> Data Tabel KBLI Checks (kbli_checks)
            </div>
            {item.hasKbli ? (
              <span className="badge done">{item.kbli?.status || 'Tersedia'}</span>
            ) : (
              <span className="badge inactive">Tidak Ada Data</span>
            )}
          </div>
          {item.hasKbli && item.kbli ? (
            <div className="cross-fields-grid">
              <div className="cross-field">
                <small>assignment_id</small>
                <strong>{item.kbli.assignmentId || item.assignmentId}</strong>
              </div>
              <div className="cross-field">
                <small>status penugasan</small>
                <strong>{item.kbli.assignmentStatusAlias || '-'}</strong>
              </div>
              <div className="cross-field">
                <small>nama di prelist</small>
                <strong>{item.kbli.namaDiPrelist || '-'}</strong>
              </div>
              <div className="cross-field">
                <small>nama usaha</small>
                <strong>{item.kbli.namaUsaha || '-'}</strong>
              </div>
              <div className="cross-field">
                <small>kategori</small>
                <strong>{item.kbli.kategori || '-'}</strong>
              </div>
              <div className="cross-field">
                <small>kategori 2025</small>
                <strong>{item.kbli.kategori2025 || '-'}</strong>
              </div>
              <div className="cross-field">
                <small>kbli akhir</small>
                <strong>{item.kbli.kbliAkhir || '-'}</strong>
              </div>
              <div className="cross-field">
                <small>index1</small>
                <strong>{item.kbli.index1 || '-'}</strong>
              </div>
              <div className="cross-field full">
                <small>kegiatan utama</small>
                <strong>{item.kbli.kegUtama || '-'}</strong>
              </div>
              <div className="cross-field full">
                <small>level 3 (kode & nama)</small>
                <strong>{item.kbli.level3FullCode ? `${item.kbli.level3FullCode} - ${item.kbli.level3Name}` : '-'}</strong>
              </div>
              <div className="cross-field full">
                <small>level 4 (kode & nama)</small>
                <strong>{item.kbli.level4FullCode ? `${item.kbli.level4FullCode} - ${item.kbli.level4Name}` : '-'}</strong>
              </div>
              <div className="cross-field full">
                <small>level 6 (kode & nama)</small>
                <strong>{item.kbli.level6FullCode ? `${item.kbli.level6FullCode} - ${item.kbli.level6Name}` : '-'}</strong>
              </div>
              <div className="cross-field full">
                <small>link fasih</small>
                <strong>{item.kbli.linkFasih || '-'}</strong>
              </div>
              {item.kbli.extraFields && Object.keys(item.kbli.extraFields).length > 0 && (
                <div className="cross-field full">
                  <small>kolom tambahan database (kbli)</small>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginTop: '6px' }}>
                    {Object.entries(item.kbli.extraFields).map(([col, val]) => (
                      <div key={col} style={{ background: '#f5f9fc', padding: '6px 8px', borderRadius: '5px', border: '1px solid #dce8f4' }}>
                        <small style={{ color: '#748ca4', fontSize: '9px', display: 'block' }}>{col}</small>
                        <strong style={{ fontSize: '11px', color: '#1a334d' }}>{String(val || '-')}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="cross-card-empty">Catatan tidak ditemukan di tabel kbli_checks untuk assignment ini.</div>
          )}
        </div>

        {/* NEGATIVE NTB CHECKS CARD */}
        <div className="cross-card">
          <div className="cross-card-header">
            <div className="cross-card-title">
              <FileCheck2 /> Data Tabel NTB Negatif (negative_ntb_checks)
            </div>
            {item.hasNtb ? (
              <span className="badge done">NTB: {item.ntb?.nilaiTambah || 'Tersedia'}</span>
            ) : (
              <span className="badge inactive">Tidak Ada Data</span>
            )}
          </div>
          {item.hasNtb && item.ntb ? (
            <div className="cross-fields-grid">
              <div className="cross-field">
                <small>assignment_id</small>
                <strong>{item.ntb.assignmentId || item.assignmentId}</strong>
              </div>
              <div className="cross-field">
                <small>nama principal</small>
                <strong>{item.ntb.namaPrincipal || '-'}</strong>
              </div>
              <div className="cross-field">
                <small>kategori</small>
                <strong>{item.ntb.kategori || '-'}</strong>
              </div>
              <div className="cross-field">
                <small>kbli akhir</small>
                <strong>{item.ntb.kbliAkhir || '-'}</strong>
              </div>
              <div className="cross-field">
                <small>tahun operasi</small>
                <strong>{item.ntb.tahunOperasi || '-'}</strong>
              </div>
              <div className="cross-field">
                <small>nilai tambah</small>
                <strong style={{ color: (item.ntb?.nilaiTambah || '').includes('-') ? '#c43838' : '#19324d' }}>
                  {item.ntb?.nilaiTambah || '-'}
                </strong>
              </div>
              <div className="cross-field">
                <small>r27a (omzet)</small>
                <strong>{item.ntb.r27aOmzet || '-'}</strong>
              </div>
              <div className="cross-field">
                <small>r26c (biaya pembelian)</small>
                <strong>{item.ntb.r26cBiayaPembelian || '-'}</strong>
              </div>
              <div className="cross-field">
                <small>r26b (biaya produksi)</small>
                <strong>{item.ntb.r26bBiayaProduksi || '-'}</strong>
              </div>
              <div className="cross-field">
                <small>r26d (biaya operasional)</small>
                <strong>{item.ntb.r26dBiayaOperasional || '-'}</strong>
              </div>
              <div className="cross-field full">
                <small>catatan</small>
                <strong>{item.ntb.catatan || '-'}</strong>
              </div>
              <div className="cross-field">
                <small>level 2 code</small>
                <strong>{item.ntb.level2FullCode || '-'}</strong>
              </div>
              <div className="cross-field">
                <small>level 6 code</small>
                <strong>{item.ntb.level6FullCode || '-'}</strong>
              </div>
              <div className="cross-field full">
                <small>source file & folder</small>
                <strong>{item.ntb.sourceFile ? `${item.ntb.sourceFile} (${item.ntb.sourceFolder || '-'})` : '-'}</strong>
              </div>
              <div className="cross-field full">
                <small>link fasih</small>
                <strong>{item.ntb.linkFasih || '-'}</strong>
              </div>
              {item.ntb.extraFields && Object.keys(item.ntb.extraFields).length > 0 && (
                <div className="cross-field full">
                  <small>kolom tambahan database (ntb)</small>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginTop: '6px' }}>
                    {Object.entries(item.ntb.extraFields).map(([col, val]) => (
                      <div key={col} style={{ background: '#f5f9fc', padding: '6px 8px', borderRadius: '5px', border: '1px solid #dce8f4' }}>
                        <small style={{ color: '#748ca4', fontSize: '9px', display: 'block' }}>{col}</small>
                        <strong style={{ fontSize: '11px', color: '#1a334d' }}>{String(val || '-')}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="cross-card-empty">Catatan tidak ditemukan di tabel negative_ntb_checks untuk assignment ini.</div>
          )}
        </div>
      </div>
    </div>
  )
}

function TablePage({tab,query,setQuery,status,setStatus,columns,rows}:{tab:Tab,query:string,setQuery:(s:string)=>void,status:string,setStatus:(s:any)=>void,columns:string[],rows:string[][]}) {
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
  const title = tab==='stage3' ? 'Pembagian Stage 3' : tab==='negative' ? 'Checklist Data NTB Negatif' : 'Check Data'

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

  const fetchCheckData = () => {
    setLoading(true)
    fetch(`/api/check-data?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
      .then(response => response.ok ? response.json() : Promise.reject())
      .then((items: CrossCheckRecord[]) => {
        setCrossData(items)
      })
      .catch(err => {
        console.error('Failed to load check data:', err)
        setCrossData([])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (tab === 'kbli') {
      fetchCheckData()
    }
  }, [tab])

  const updateCheck = (id:string, key:keyof Pick<CheckState,'kbli'|'ntb'|'kewajaran'>) => {
    setChecks(current => {
      const next = {
        ...current,
        [id]: {
          ...current[id],
          [key]: !current[id]?.[key],
          checkedBy: 'Admin BPS',
          checkedAt: new Date().toLocaleString('id-ID', { dateStyle:'medium', timeStyle:'short' })
        }
      }
      if (typeof window !== 'undefined') {
        try { localStorage.setItem('monitoring_checks', JSON.stringify(next)) } catch {}
      }
      return next
    })
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
    if (tab === 'kbli') {
      const headers = [
        'assignment_id',
        'nama_usaha_kbli',
        'nama_principal_ntb',
        'kbli_akhir_kbli',
        'kbli_akhir_ntb',
        'kategori_kbli',
        'kategori_ntb',
        'status_kbli',
        'nilai_tambah_ntb',
        'r27a_omzet',
        'r26c_biaya_pembelian',
        'r26b_biaya_produksi',
        'r26d_biaya_operasional',
        'catatan_ntb',
        'level_3_name',
        'level_6_name',
        'link_fasih'
      ]
      const exportRows = filteredCrossData.map(item => [
        item.assignmentId,
        item.kbli?.namaUsaha || '-',
        item.ntb?.namaPrincipal || '-',
        item.kbli?.kbliAkhir || '-',
        item.ntb?.kbliAkhir || '-',
        item.kbli?.kategori || '-',
        item.ntb?.kategori || '-',
        item.kbli?.status || '-',
        item.ntb?.nilaiTambah || '-',
        item.ntb?.r27aOmzet || '-',
        item.ntb?.r26cBiayaPembelian || '-',
        item.ntb?.r26bBiayaProduksi || '-',
        item.ntb?.r26dBiayaOperasional || '-',
        item.ntb?.catatan || '-',
        item.kbli?.level3Name || '-',
        item.kbli?.level6Name || '-',
        item.linkFasih
      ])
      exportToCsv('cross_table_kbli_checks_negative_ntb.csv', headers, exportRows)
    } else {
      exportToCsv(`${tab}_data.csv`, columns, filteredRows)
    }
  }

  const downloadSingleRow = (item: CrossCheckRecord) => {
    const headers = ['tabel', 'assignment_id', 'nama', 'kbli_akhir', 'kategori', 'keterangan_atau_catatan', 'nilai_tambah', 'omzet', 'biaya_beli', 'biaya_produksi', 'biaya_operasional', 'link_fasih']
    const exportRows = [
      [
        'kbli_checks',
        item.kbli?.assignmentId || item.assignmentId,
        item.kbli?.namaUsaha || '-',
        item.kbli?.kbliAkhir || '-',
        item.kbli?.kategori || '-',
        item.kbli?.kegUtama || '-',
        '-',
        '-',
        '-',
        '-',
        '-',
        item.kbli?.linkFasih || item.linkFasih
      ],
      [
        'negative_ntb_checks',
        item.ntb?.assignmentId || item.assignmentId,
        item.ntb?.namaPrincipal || '-',
        item.ntb?.kbliAkhir || '-',
        item.ntb?.kategori || '-',
        item.ntb?.catatan || '-',
        item.ntb?.nilaiTambah || '-',
        item.ntb?.r27aOmzet || '-',
        item.ntb?.r26cBiayaPembelian || '-',
        item.ntb?.r26bBiayaProduksi || '-',
        item.ntb?.r26dBiayaOperasional || '-',
        item.ntb?.linkFasih || item.linkFasih
      ]
    ]
    exportToCsv(`cross_data_${item.assignmentId}.csv`, headers, exportRows)
  }

  const handleSaveEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editItem) return
    setFormLoading(true)
    const formData = new FormData(e.currentTarget)
    const payload = {
      action: 'update',
      assignmentId: editItem.assignmentId,
      kbliData: {
        namaUsaha: formData.get('namaUsaha') as string,
        kbliAkhir: formData.get('kbliAkhir') as string,
        kategori: formData.get('kategori') as string,
        kegUtama: formData.get('kegUtama') as string,
        status: formData.get('status') as string,
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
      const res = await fetch('/api/check-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error()
      setEditItem(null)
      fetchCheckData()
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

    const payload = {
      action: 'create',
      assignmentId: aid,
      kbliData: {
        namaUsaha: formData.get('namaUsaha') as string,
        kbliAkhir: formData.get('kbliAkhir') as string,
        kategori: formData.get('kategori') as string,
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
      const res = await fetch('/api/check-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error()
      setShowAddModal(false)
      fetchCheckData()
    } catch {
      alert('Gagal menambahkan assignment ke database.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (evt) => {
      const text = evt.target?.result as string
      if (!text) return
      const lines = text.split(/\r?\n/).filter(l => l.trim() !== '')
      if (lines.length < 2) {
        alert('File CSV kosong atau tidak memiliki baris data.')
        return
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase())
      const rows = lines.slice(1).map(line => {
        const parts = line.split(',').map(p => p.trim().replace(/^["']|["']$/g, ''))
        const obj: Record<string, string> = {}
        headers.forEach((h, idx) => {
          obj[h] = parts[idx] || ''
        })
        return obj
      })

      try {
        setLoading(true)
        const res = await fetch('/api/check-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'import', rows })
        })
        const result = await res.json()
        if (res.ok) {
          alert(result.message || 'Import data berhasil!')
          fetchCheckData()
        } else {
          alert(result.error || 'Gagal mengimpor data ke database.')
        }
      } catch {
        alert('Gagal menghubungi server untuk import.')
      } finally {
        setLoading(false)
        if (e.target) e.target.value = ''
      }
    }
    reader.readAsText(file)
  }

  const activeCount = tab === 'kbli' ? filteredCrossData.length : filteredRows.length
  const totalCount = tab === 'kbli' ? crossData.length : rows.length
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
            {tab === 'kbli'
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
          {tab === 'kbli' && (
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
          {tab === 'kbli' && (
            <button className="outline" onClick={fetchCheckData} title="Segarkan data dari database">
              <RotateCw className={loading ? 'rotated' : ''} /> Segarkan
            </button>
          )}
          <button className="outline" onClick={downloadAllData} title="Unduh data tabel dalam format CSV">
            <Download /> Unduh Data ({activeCount})
          </button>
          {tab === 'kbli' && (
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
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="empty-users">Memuat data live dari database PostgreSQL...</td>
                </tr>
              ) : tab === 'kbli' ? (
                paginatedCrossData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="empty-users">Data tidak ditemukan di database.</td>
                  </tr>
                ) : (
                  paginatedCrossData.map((item, rowIndex) => {
                    const id = item.assignmentId
                    const rowKey = `${id}-${rowIndex}`
                    const check = checks[id] || { kbli: false, ntb: false, kewajaran: false }
                    const isExpanded = expandedRow === rowKey

                    return (
                      <Fragment key={rowKey}>
                        <tr>
                          <td>
                            <button
                              className="detail-toggle"
                              aria-label={`Detail cross table ${id}`}
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
                        </tr>
                        {isExpanded && (
                          <tr className="details-row" key={`${rowKey}-details`}>
                            <td colSpan={10}>
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
                <label>KBLI Akhir
                  <input name="kbliAkhir" defaultValue={editItem.kbliAkhir} />
                </label>
                <label>Kategori
                  <input name="kategori" defaultValue={editItem.kbli?.kategori || editItem.ntb?.kategori || ''} />
                </label>
              </div>
              <div className="form-grid">
                <label>Nilai Tambah (NTB)
                  <input name="nilaiTambah" defaultValue={editItem.ntb?.nilaiTambah || '0'} />
                </label>
                <label>R27A Omzet
                  <input name="r27aOmzet" defaultValue={editItem.ntb?.r27aOmzet || '0'} />
                </label>
              </div>
              <div className="form-grid">
                <label>Status KBLI
                  <select name="status" defaultValue={editItem.kbli?.status || 'Belum Dicek'}>
                    <option value="Belum Dicek">Belum Dicek</option>
                    <option value="Perlu Konfirmasi">Perlu Konfirmasi</option>
                    <option value="Selesai Dicek">Selesai Dicek</option>
                  </select>
                </label>
                <label>Link Fasih (URL)
                  <input name="linkFasih" defaultValue={editItem.linkFasih} />
                </label>
              </div>
              <label>Kegiatan Utama (KBLI)
                <input name="kegUtama" defaultValue={editItem.kbli?.kegUtama || ''} />
              </label>
              <label>Catatan Pemeriksaan (NTB)
                <input name="catatan" defaultValue={editItem.ntb?.catatan || ''} />
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
    </>
  )
}

function UsersPage(){
  type UserObj = { id: string; initials: string; name: string; email: string; role: string; status: string; bidang: string }
  const [users,setUsers]=useState<UserObj[]>([])
  const [query,setQuery]=useState(''); const [role,setRole]=useState('Semua peran'); const [modal,setModal]=useState(false); const [editing,setEditing]=useState<number|null>(null); const [menu,setMenu]=useState<number|null>(null)
  const [form,setForm]=useState({name:'',email:'',username:'',password:'',bidang:'',role:'Petugas Lapangan',status:'Aktif'})
  useEffect(()=>{fetch('/api/users').then(async response=>{if(!response.ok)throw new Error('Gagal memuat pengguna'); const data=await response.json(); setUsers(data.map((u:any)=>({
    id: u.id,
    initials: u.name.slice(0,2).toUpperCase(),
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status || 'Aktif',
    bidang: u.bidang || 'Distribusi'
  })))
                                                          }).catch(()=>window.alert('Daftar pengguna gagal dimuat dari database.'))},[])

  const visible=users.filter(u=>(role==='Semua peran'||u.role===role)&&`${u.name} ${u.email} ${u.initials}`.toLowerCase().includes(query.toLowerCase()))
  function openForm(index?:UserObj){
    if(index===undefined){
      setEditing(null);
      setForm({name:'',email:'',username:'',password:'',bidang:'Distribusi',role:'Petugas Lapangan',status:'Aktif'})
    }else{
      setEditing(index);
      const u=users[index];
      // Safely map object keys directly avoiding index mismatch bugs
      setForm({
        name:u.name,
        email:u.email,
        username:'',
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
    if(!form.name.trim()||!form.email.trim()||editing===null&&!form.password.trim())return;
    if(editing===null){
      if(form.password.length<8){window.alert('Password minimal 8 karakter.');return} const response=await fetch('/api/users/create',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(form)
      });
      if(!response.ok){
        const result=await response.json().catch(()=>null);
        window.alert(result?.error||'Pengguna gagal disimpan ke database.');
        return;
      }
      const created=await response.json();
      const initials=form.name.split(' ').map(v=>v[0]).join('').slice(0,2).toUpperCase();
      //setUsers(current=>[...current,[initials,form.name,form.email,form.role,form.status,created.user?.id||created.id]])}
    setUsers(current=>[...current,{id: created.user?.id||created.id, initials, name: form.name, email: form.email, role: form.role, status: form.status, bidang: form.bidang}])
  }else{
    // Add your update logic here if editing API is implemented
  }
setModal(false)
  }
  function toggle(index:number){
    //setUsers(users.map((u,i)=>i===index?[u[0],u[1],u[2],u[3],u[4]==='Aktif'?'Nonaktif':'Aktif',u[5],u[6]]:u));
    setUsers(users.map((u,i)=>i===index?{...u, status: u.status==='Aktif'?'Nonaktif':'Aktif'}:u));
    setMenu(null)
  }
  async function remove(index:number){
    const response=await fetch('/api/users',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:users[index].id})});
    if(!response.ok){const result=await response.json().catch(()=>null);window.alert(result?.error||'Pengguna gagal dihapus.');return}
    setUsers(users.filter((_,i)=>i!==index));
    setMenu(null)
  }
  return <><div className="page-heading"><div><p className="eyebrow blue">ADMINISTRASI</p><h1>Manajemen Pengguna</h1><p className="muted">Kelola akses, peran, dan pembagian tugas pengguna.</p></div><button className="primary" onClick={()=>openForm()}><Plus /> Tambah Pengguna</button></div><section className="panel table-panel"><div className="table-toolbar"><div className="search-box"><Search /><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari nama atau email..." /></div><select value={role} onChange={e=>setRole(e.target.value)}><option>Semua peran</option><option>Administrator</option><option>Petugas Kualitas</option><option>Reviewer</option></select></div><div className="users-list">{visible.map((x)=><div className="user-row" key={x.email}><div className="avatar">{x.initials}</div><div className="user-main"><strong>{x.name}</strong><span>{x.email}</span></div><span className="role">{x.role}</span><span className={x.status==='Aktif'?'badge done':'badge inactive'}>{x.status}</span><div className="user-actions"><button className="more" aria-label={`Aksi ${x.name}`} onClick={()=>setMenu(menu===users.indexOf(x)?null:users.indexOf(x))}><MoreHorizontal /></button>{menu===users.indexOf(x)&&<div className="user-menu"><button onClick={()=>openForm(users.indexOf(x))}><Pencil /> Edit pengguna</button><button onClick={()=>toggle(users.indexOf(x))}>{x.status==='Aktif'?<UserRoundX />:<UserRoundCheck />} {x.status==='Aktif'?'Nonaktifkan':'Aktifkan'}</button><button className="danger" onClick={()=>remove(users.indexOf(x))}><Trash2 /> Hapus pengguna</button></div>}</div></div>)}</div>{visible.length===0&&<p className="empty-users">Pengguna tidak ditemukan.</p>}<div className="table-footer"><span>Menampilkan {visible.length} dari {users.length} pengguna</span><span className="muted">Perubahan tersimpan ke daftar pengguna</span></div></section>{modal&&<div className="modal-backdrop" onClick={()=>setModal(false)}><div className="user-modal" onClick={e=>e.stopPropagation()}><div className="modal-head"><div><p className="eyebrow blue">AKUN PENGGUNA</p><h2>{editing===null?'Tambah Pengguna':'Edit Pengguna'}</h2></div><button className="close-modal" onClick={()=>setModal(false)}><X /></button></div><label>Nama lengkap<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Contoh: Dwi Santoso" /></label><label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="nama@bps.go.id" /></label><label>Bidang<select value={form.bidang} onChange={e=>setForm({...form,bidang:e.target.value})}><option>Distribusi</option><option>Produksi</option><option>Sosial</option><option>Nerwilis</option><option>PLS</option><option>Umum</option></select></label><label>Password<input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Minimal 8 karakter" type="password" minLength={8} required={editing===null} /></label><div className="form-grid"><label>Peran<select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option>Administrator</option><option>Petugas Kualitas</option><option>Reviewer</option></select></label><label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}><option>Aktif</option><option>Nonaktif</option></select></label></div><div className="modal-actions"><button className="outline" onClick={()=>setModal(false)}>Batal</button><button className="primary" onClick={save}>Simpan Pengguna</button></div></div></div>}</>}


export default App
