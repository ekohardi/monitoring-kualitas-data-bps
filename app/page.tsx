'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'
import { BarChart3, CheckCircle2, ChevronDown, Database, Eye, FileCheck2, LayoutDashboard, LogOut, Menu, MoreHorizontal, Pencil, Plus, Search, Settings, ShieldCheck, Trash2, Upload, UserRoundCheck, Users, UserRoundX, X } from 'lucide-react'

type Tab = 'dashboard' | 'stage3' | 'negative' | 'kbli' | 'users'

const negativeColumns = ['level_2_full_code','level_6_full_code','assignment_id','nama_principal','kategori','kbli_akhir','tahun_operasi','catatan','r27a_omzet','r26c_biaya_pembelian','r26b_biaya_produksi','r26d_biaya_operasional','nilai_tambah','link_fasih','source_file','source_folder']
const kbliColumns = ['level_3_full_code','level_3_name','level_4_full_code','level_4_name','level_6_full_code','level_6_name','assignment_status_alias','nama_di_prelist','nama_usaha','kategori','kategori_2025','kbli_akhir','keg_utama','index1','link_fasih']

const sampleNegative = [
  ['52','5260101001','TBN-00124','Warung Sumber Rejeki','Perdagangan','47111','2024','Omzet belum terisi','0','0','0','0','0','Lihat','ntb_2025.csv','Tuban/01'],
  ['52','5260101002','TBN-00125','Bengkel Maju Jaya','Jasa','45201','2023','Perlu konfirmasi biaya','12000000','4500000','1800000','2100000','3600000','Lihat','ntb_2025.csv','Tuban/01'],
  ['52','5260101003','TBN-00126','Toko Berkah','Perdagangan','47112','2024','Data lengkap','8600000','2100000','900000','1100000','4400000','Lihat','ntb_2025.csv','Tuban/02'],
]
const sampleKbli = [
  ['G','Perdagangan Besar & Eceran','47','Perdagangan Eceran','47111','Perdagangan eceran di toko','Aktif','Warung Sumber Rejeki','Warung Sumber Rejeki','Perdagangan','Perdagangan','47111','Jual sembako','Negatif','Lihat'],
  ['C','Industri Pengolahan','10','Industri makanan','10710','Industri produk roti','Aktif','Roti Bu Tini','Roti Bu Tini','Industri','Industri','10710','Produksi roti','Positif','Lihat'],
]

function Login({ onLogin }: { onLogin: () => void }) {
  const [identifier, setIdentifier] = useState('admin')
  const [password, setPassword] = useState('admin123')
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
  return <main className="login-shell"><div className="login-art"><div className="brand-mark">BPS</div><div><p className="eyebrow">SISTEM MONITORING</p><h1>Kualitas Data<br /><span>BPS Kabupaten Tuban</span></h1><p className="login-copy">Pantau, validasi, dan tingkatkan kualitas data statistik sektoral secara terintegrasi.</p></div><div className="login-foot">Badan Pusat Statistik Kabupaten Tuban<br />Data berkualitas untuk Tuban yang lebih baik.</div></div><div className="login-card"><div className="mobile-brand">BPS TUBAN</div><p className="eyebrow blue">SELAMAT DATANG</p><h2>Masuk ke Dashboard</h2><p className="muted">Gunakan email atau username untuk melanjutkan.</p><label>Email atau username</label><input value={identifier} onChange={e=>setIdentifier(e.target.value)} placeholder="admin atau nama@bps.go.id" /><label>Password</label><input value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" type="password" />{error&&<p className="error-text">{error}</p>}<button className="primary full" onClick={submit}>Masuk <span>→</span></button><p className="demo-note">Akun utama: admin / admin123</p></div></main>
}

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [tab, setTab] = useState<Tab>('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'Semua'|'Belum dicek'|'Selesai'>('Semua')
  const rows = useMemo(()=>tab === 'kbli' ? sampleKbli : sampleNegative, [tab])
  if (!loggedIn) return <Login onLogin={()=>setLoggedIn(true)} />
  const nav = [{id:'dashboard',label:'Ringkasan',icon:LayoutDashboard},{id:'stage3',label:'Pembagian Stage 3',icon:BarChart3},{id:'kbli',label:'Check Data',icon:Database},{id:'users',label:'Manajemen Pengguna',icon:Users}] as const
  const tableCols = tab === 'kbli' ? kbliColumns : negativeColumns
  return <div className="app-shell"><aside className={mobileOpen?'sidebar open':'sidebar'}><div className="side-brand"><div className="brand-mark small">BPS</div><div><strong>Kualitas Data</strong><span>Kabupaten Tuban</span></div><button className="close-nav" onClick={()=>setMobileOpen(false)}><X /></button></div><div className="side-section">MENU UTAMA</div><nav>{nav.map(item=>{const Icon=item.icon; return <button key={item.id} className={tab===item.id?'nav-item active':'nav-item'} onClick={()=>{setTab(item.id);setMobileOpen(false)}}><Icon />{item.label}{item.id==='negative'&&<b>12</b>}</button>})}</nav><div className="sidebar-bottom"><button className="nav-item"><Settings /> Pengaturan</button><button className="nav-item logout" onClick={()=>setLoggedIn(false)}><LogOut /> Keluar</button></div></aside><div className="main-area"><header><button className="menu-btn" onClick={()=>setMobileOpen(true)}><Menu /></button><div className="crumb">Monitoring <span>/</span> <strong>{nav.find(n=>n.id===tab)?.label}</strong></div><div className="header-actions"><button className="icon-button"><Search /></button><div className="profile"><div className="avatar">AR</div><div><strong>Admin BPS</strong><span>Administrator</span></div><ChevronDown /></div></div></header><main className="content">{tab==='dashboard'?<Dashboard setTab={setTab}/>:tab==='users'?<UsersPage/>:<TablePage tab={tab} columns={tableCols} rows={rows} query={query} setQuery={setQuery} status={status} setStatus={setStatus}/>}</main></div></div>
}

function Dashboard({setTab}:{setTab:(t:Tab)=>void}) { return <><div className="page-heading"><div><p className="eyebrow blue">OVERVIEW</p><h1>Ringkasan Kualitas Data</h1><p className="muted">Pantau progres validasi data BPS Kabupaten Tuban.</p></div><button className="primary" onClick={()=>setTab('negative')}><Upload /> Import Data</button></div><div className="stats"><Stat title="Total Assignment" value="1.248" change="+12,5%" icon={Database} tone="blue"/><Stat title="Sudah Dicek" value="936" change="75%" icon={CheckCircle2} tone="green"/><Stat title="Perlu Tindak Lanjut" value="312" change="25%" icon={FileCheck2} tone="orange"/></div><div className="grid-two"><section className="panel progress-panel"><div className="panel-head"><div><h3>Progress Validasi</h3><p className="muted">Status pemeriksaan seluruh data</p></div><span className="period">2025 <ChevronDown /></span></div><div className="big-progress"><div className="progress-ring"><strong>75%</strong><span>selesai</span></div><div className="legend"><div><i className="dot blue-dot"/>Sudah dicek <b>936</b></div><div><i className="dot orange-dot"/>Belum dicek <b>312</b></div><div><i className="dot gray-dot"/>Tidak aktif <b>0</b></div></div></div></section><section className="panel stage-panel"><div className="panel-head"><div><h3>Pembagian Stage 3</h3><p className="muted">Distribusi assignment per petugas</p></div><button className="text-button" onClick={()=>setTab('stage3')}>Lihat semua →</button></div>{[['Petugas Lapangan A','186','83%'],['Petugas Lapangan B','154','71%'],['Petugas Lapangan C','128','64%'],['Petugas Lapangan D','96','52%']].map(x=><div className="person-progress" key={x[0]}><div><span>{x[0]}</span><b>{x[1]} data</b></div><div className="bar"><i style={{width:x[2]}}/></div><small>{x[2]}</small></div>)}</section></div><section className="panel activity"><div className="panel-head"><div><h3>Aktivitas Terbaru</h3><p className="muted">Pembaruan data terakhir</p></div><button className="text-button">Lihat log →</button></div><div className="activity-list">{[['AR','Admin Rina','mengunggah 248 data NTB Negatif','8 menit lalu'],['DS','Dwi Santoso','menyelesaikan checklist KBLI','32 menit lalu'],['LP','Lina Putri','ditambahkan ke Stage 3','1 jam lalu']].map(x=><div className="activity-item" key={x[1]}><div className="avatar soft">{x[0]}</div><div><strong>{x[1]}</strong> <span>{x[2]}</span><small>{x[3]}</small></div></div>)}</div></section></> }
function Stat({title,value,change,icon:Icon,tone}:{title:string,value:string,change:string,icon:any,tone:string}){return <div className={'stat stat-'+tone}><div className="stat-icon"><Icon /></div><div><p>{title}</p><h2>{value}</h2><span>{change} <em>dari bulan lalu</em></span></div></div>}
type CheckState = { kbli: boolean; ntb: boolean; kewajaran: boolean; checkedBy?: string; checkedAt?: string }
const combinedChecks: Record<string, CheckState> = {
  'TBN-00124': { kbli: true, ntb: false, kewajaran: false, checkedBy: 'Admin Rina', checkedAt: '30 Sep 2026, 09:42' },
  'TBN-00125': { kbli: true, ntb: true, kewajaran: false, checkedBy: 'Dwi Santoso', checkedAt: '30 Sep 2026, 10:15' },
  'TBN-00126': { kbli: false, ntb: false, kewajaran: false },
}
function TablePage({tab,query,setQuery,status,setStatus,columns,rows}:{tab:Tab,query:string,setQuery:(s:string)=>void,status:string,setStatus:(s:any)=>void,columns:string[],rows:string[][]}) {
  const [checks, setChecks] = useState(combinedChecks)
  const [expandedRow, setExpandedRow] = useState<string|null>(null)
  const [checkData, setCheckData] = useState<string[][]>([])
  const [loading, setLoading] = useState(false)
  const title=tab==='stage3'?'Pembagian Stage 3':tab==='negative'?'Checklist Data NTB Negatif':'Check Data'
  useEffect(() => {
    if (tab !== 'kbli') return
    setLoading(true)
    fetch('/api/check-data').then(response => response.ok ? response.json() : Promise.reject()).then((items: any[]) => {
      setCheckData(items.map(item => [item.kbliId, item.assignmentId, item.kbliNamaUsaha || item.namaPrincipal || '-', item.kbliAkhir || item.ntbKbliAkhir || '-', item.kbliStatus || '-', item.ntbKategori || '-', item.ntbCatatan || '-', item.ntbNilaiTambah || '-', item.kbliLinkFasih || item.ntbLinkFasih || '-']))
    }).catch(() => setCheckData([])).finally(() => setLoading(false))
  }, [tab])
  const sourceRows = tab === 'kbli' ? checkData : sampleNegative
  const data = sourceRows.filter(row => `${row[1]} ${row[2]} ${row[3]}`.toLowerCase().includes(query.toLowerCase()))
  const updateCheck = (id:string, key:keyof Pick<CheckState,'kbli'|'ntb'|'kewajaran'>) => setChecks(current => ({...current, [id]: {...current[id], [key]: !current[id][key], checkedBy: 'Admin BPS', checkedAt: new Date().toLocaleString('id-ID', { dateStyle:'medium', timeStyle:'short' })}}))
  const isComplete = (id:string) => Object.values(checks[id]).slice(0,3).every(Boolean)
  const visible = status==='Semua' ? data : data.filter(row => status==='Selesai' ? isComplete(row[2]) : !isComplete(row[2]))
  return <><div className="page-heading"><div><p className="eyebrow blue">DATA MANAGEMENT</p><h1>{title}</h1><p className="muted">Satu tampilan pengecekan berdasarkan assignment_id.</p></div><button className="primary"><Plus /> Tambah Data</button></div><section className="panel table-panel"><div className="table-toolbar"><div className="search-box"><Search /><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cari assignment, nama usaha, KBLI..." /></div><select value={status} onChange={e=>setStatus(e.target.value)}><option>Semua</option><option>Belum dicek</option><option>Selesai</option></select><button className="outline"><Upload /> Import CSV</button></div><div className="table-wrap combined-table"><table><thead><tr><th>Detail</th><th>assignment_id</th><th>Nama usaha</th><th>KBLI akhir</th><th>Link Fasih</th><th>Pengecekan 1<br/><small>KBLI</small></th><th>Pengecekan 2<br/><small>NTB negatif</small></th><th>Pengecekan 3<br/><small>Kewajaran</small></th><th>Dicek oleh</th><th>Tanggal cek</th></tr></thead><tbody>{loading ? <tr><td colSpan={9} className="empty-users">Memuat data hasil cross join...</td></tr> : visible.map((row, rowIndex)=>{const id=tab==='kbli'?row[1]:row[2], rowKey=`${id}-${rowIndex}`, check=checks[id] || { kbli: false, ntb: false, kewajaran: false }; return <><tr key={rowKey}><td><button className="detail-toggle" aria-label={`Detail ${id}`} aria-expanded={expandedRow===rowKey} onClick={()=>setExpandedRow(expandedRow===rowKey?null:rowKey)}><ChevronDown className={expandedRow===rowKey?'rotated':''}/></button></td><td><strong>{id}</strong></td><td>{tab==='kbli'?row[2]:row[3]}</td><td>{tab==='kbli'?row[3]:row[5]}</td><td>{(tab==='kbli'?row[8]:row[14]) && (tab==='kbli'?row[8]:row[14]) !== '-' ? <a className="fasih-link" href={tab==='kbli'?row[8]:row[14]} target="_blank" rel="noreferrer" aria-label={`Buka tautan Fasih ${id}`} title="Buka tautan Fasih"><Eye /></a> : '-'}</td>{(['kbli','ntb','kewajaran'] as const).map((key,index)=><td key={key}><label className="check-cell"><input type="checkbox" checked={check[key]} onChange={()=>updateCheck(id,key)}/><span>{check[key]?'Sudah':'-'}</span></label></td>)}<td>{check.checkedBy || '-'}</td><td>{check.checkedAt || '-'}</td></tr>{expandedRow===rowKey&&<tr className="details-row" key={`${rowKey}-details`}><td colSpan={9}><div className="details-grid">{(tab==='kbli'?kbliColumns:negativeColumns).map((column,index)=><div key={column}><small>{column}</small><strong>{(tab==='kbli'?sampleKbli[0]:row)[index] || '-'}</strong></div>)}</div></td></tr>}</>})}</tbody></table></div><div className="table-footer"><span>Menampilkan {visible.length} dari {data.length} assignment</span><div><button className="page-btn">←</button><button className="page-btn selected">1</button><button className="page-btn">→</button></div></div></section></>}

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
