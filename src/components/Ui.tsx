import type { ReactNode } from 'react'
import type { Status } from '../types'
export const statusText:Record<Status,string>={Draft:'Taslak',Pending:'Beklemede',Approved:'Onaylandı',Rejected:'Reddedildi',Cancelled:'Geri Çekildi'}
export function StatusBadge({status}:{status:Status}){return <span className={`status ${status.toLowerCase()}`}><i/>{statusText[status]}</span>}
export function PageHeader({eyebrow,title,description,action}:{eyebrow:string;title:string;description:string;action?:ReactNode}){return <div className="page-header"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>}
export function Empty({title,children}:{title:string;children:ReactNode}){return <div className="empty"><div className="empty-icon">✓</div><h3>{title}</h3><p>{children}</p></div>}
export function ErrorNotice({message}:{message:string}){return <div className="notice error">{message}</div>}
export const formatDate=(date?:string)=>date?new Intl.DateTimeFormat('tr-TR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(date)):'—'
export const formatMoney=(amount?:number)=>amount==null?'—':new Intl.NumberFormat('tr-TR',{style:'currency',currency:'TRY'}).format(amount)
