import { ArrowRight, FilePlus2, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import { Empty, ErrorNotice, formatDate, PageHeader, StatusBadge } from '../components/Ui'
import type { Paged, RequestItem, RequestType, Status } from '../types'

/** [FR-25..29] Rol kapsamındaki talepleri arama, filtre ve sayfalama ile gösterir. */
export default function RequestsPage() {
  const { session } = useAuth()
  const [data, setData] = useState<Paged<RequestItem>>({ page: 1, pageSize: 10, totalCount: 0, items: [] })
  const [types, setTypes] = useState<RequestType[]>([])
  const [status, setStatus] = useState('')
  const [typeId, setTypeId] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { api<RequestType[]>('/request-types').then(setTypes).catch(() => {}) }, [])
  useEffect(() => {
    setLoading(true)
    setError('')
    const params = new URLSearchParams({ page: String(page), pageSize: '10' })
    if (status) params.set('status', status)
    if (typeId) params.set('typeId', typeId)
    if (from) params.set('from', new Date(`${from}T00:00:00Z`).toISOString())
    if (to) params.set('to', new Date(`${to}T23:59:59Z`).toISOString())
    if (query) params.set('search', query)
    api<Paged<RequestItem>>(`/requests?${params}`)
      .then(setData)
      .catch(error => setError(error.message))
      .finally(() => setLoading(false))
  }, [status, typeId, from, to, query, page])

  // Bu sayılar yalnızca o anda görüntülenen sayfanın kısa özetidir.
  const counts = useMemo(() => ({
    pending: data.items.filter(item => item.status === 'Pending').length,
    approved: data.items.filter(item => item.status === 'Approved').length,
    draft: data.items.filter(item => item.status === 'Draft').length
  }), [data])
  const resetPage = () => setPage(1)
  const title = session!.user.role === 'Admin' ? 'Tüm talepler' : 'Taleplerim'
  const firstVisible = data.totalCount === 0 ? 0 : (page - 1) * 10 + 1

  return <>
    <PageHeader eyebrow="TALEP MERKEZİ" title={title}
      description={session!.user.role === 'Admin' ? 'Kurum genelindeki talepleri durum, tür ve kullanıcı bazında izleyin.' : 'Taleplerinizi oluşturun, filtreleyin ve süreç durumunu izleyin.'}
      action={session!.user.role !== 'Admin' ? <Link className="button primary" to="/requests/new"><FilePlus2 size={18}/>Yeni talep</Link> : undefined}/>
    <div className="stats">
      <div><span>Toplam kayıt</span><strong>{data.totalCount}</strong><small>Filtrelenen sonuç</small></div>
      <div><span>Beklemede</span><strong>{counts.pending}</strong><small>Bu sayfada</small></div>
      <div><span>Onaylandı</span><strong>{counts.approved}</strong><small>Bu sayfada</small></div>
      <div><span>Taslak</span><strong>{counts.draft}</strong><small>Bu sayfada</small></div>
    </div>
    <section className="card">
      <div className="filters">
        <form className="search" onSubmit={event => { event.preventDefault(); resetPage(); setQuery(search) }}>
          <Search size={18}/><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Talep başlığında ara..."/>
        </form>
        <select value={status} onChange={event => { setStatus(event.target.value); resetPage() }}>
          <option value="">Tüm durumlar</option>{(['Draft','Pending','Approved','Rejected','Cancelled'] as Status[]).map(item => <option key={item}>{item}</option>)}
        </select>
        <select value={typeId} onChange={event => { setTypeId(event.target.value); resetPage() }}>
          <option value="">Tüm türler</option>{types.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <input aria-label="Başlangıç tarihi filtresi" title="Başlangıç tarihi" type="date" value={from} onChange={event => { setFrom(event.target.value); resetPage() }}/>
        <input aria-label="Bitiş tarihi filtresi" title="Bitiş tarihi" type="date" value={to} min={from} onChange={event => { setTo(event.target.value); resetPage() }}/>
      </div>
      {error && <ErrorNotice message={error}/>}
      {loading ? <div className="loading">Talepler yükleniyor…</div> : data.items.length === 0 ?
        <Empty title="Talep bulunamadı">Filtreleri değiştirin veya yeni bir talep oluşturun.</Empty> :
        <div className="table-wrap"><table><thead><tr><th>Talep</th>{session!.user.role === 'Admin' && <th>Talep sahibi</th>}<th>Tür</th><th>Öncelik</th><th>Durum</th><th>Oluşturulma</th><th/></tr></thead><tbody>
          {data.items.map(item => <tr key={item.id}><td><strong>#{String(item.id).padStart(4,'0')} · {item.title}</strong></td>{session!.user.role === 'Admin' && <td>{item.requester}</td>}<td>{item.type}</td><td><span className={`priority ${item.priority.toLowerCase()}`}>{item.priority}</span></td><td><StatusBadge status={item.status}/></td><td>{formatDate(item.createdAt)}</td><td><Link className="icon-link" to={`/requests/${item.id}`}><ArrowRight size={18}/></Link></td></tr>)}
        </tbody></table></div>}
      <div className="pagination"><span>{data.totalCount} kayıttan {firstVisible}-{Math.min(page * 10, data.totalCount)}</span><div><button disabled={page === 1} onClick={() => setPage(value => value - 1)}>Önceki</button><button disabled={page * 10 >= data.totalCount} onClick={() => setPage(value => value + 1)}>Sonraki</button></div></div>
    </section>
  </>
}
