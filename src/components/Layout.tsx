import { Bell, CheckCheck, ClipboardList, FilePlus2, LogOut, Menu, MessageSquare, ShieldCheck, UsersRound, X, XCircle } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../auth'
import type { NotificationItem, NotificationList, RequestDetail } from '../types'

const roleLabel={Employee:'Çalışan',Manager:'Yönetici',Admin:'Sistem Yöneticisi'}
const notificationDate=(date:string)=>new Intl.DateTimeFormat('tr-TR',{dateStyle:'short',timeStyle:'short'}).format(new Date(date))

export default function Layout(){
  const{session,logout}=useAuth()
  const location=useLocation()
  const[open,setOpen]=useState(false)
  const[notificationOpen,setNotificationOpen]=useState(false)
  const[notifications,setNotifications]=useState<NotificationList>({unreadCount:0,items:[]})
  const[ownsOpenRequest,setOwnsOpenRequest]=useState(false)
  const notificationRef=useRef<HTMLDivElement>(null)
  const user=session!.user
  const requestDetailMatch=location.pathname.match(/^\/requests\/(\d+)$/)
  const links=[
    {to:'/requests',label:user.role==='Admin'?'Tüm Talepler':'Taleplerim',icon:ClipboardList},
    ...(user.role!=='Admin'?[{to:'/requests/new',label:'Yeni Talep',icon:FilePlus2}]:[]),
    ...(user.role==='Manager'?[{to:'/approvals',label:'Onay Kutusu',icon:ShieldCheck}]:[]),
    ...(user.role==='Admin'?[{to:'/admin',label:'Yönetim Merkezi',icon:UsersRound}]:[])
  ]
  const loadNotifications=useCallback(async()=>{
    try{
      const result=await api<NotificationList>('/notifications?pageSize=20')
      setNotifications(result)
      const seenKey=`erms_notifications_seen_${user.id}`
      if(result.unreadCount>0&&!sessionStorage.getItem(seenKey)){
        setNotificationOpen(true)
        sessionStorage.setItem(seenKey,'1')
      }
    }catch{/* Oturum yenilenirken sessizce tekrar denenecek. */}
  },[user.id])
  useEffect(()=>{loadNotifications();const timer=window.setInterval(loadNotifications,30000);return()=>window.clearInterval(timer)},[loadNotifications])
  useEffect(()=>{
    if(!requestDetailMatch){setOwnsOpenRequest(false);return}
    setOwnsOpenRequest(false)
    api<RequestDetail>(`/requests/${requestDetailMatch[1]}`).then(item=>setOwnsOpenRequest(item.requesterId===user.id)).catch(()=>setOwnsOpenRequest(false))
  },[location.pathname,user.id])
  useEffect(()=>{const close=(event:MouseEvent)=>{if(notificationRef.current&&!notificationRef.current.contains(event.target as Node))setNotificationOpen(false)};document.addEventListener('mousedown',close);return()=>document.removeEventListener('mousedown',close)},[])
  const markRead=async(item:NotificationItem)=>{if(!item.isRead){await api(`/notifications/${item.id}/read`,{method:'POST'});setNotifications(current=>({unreadCount:Math.max(0,current.unreadCount-1),items:current.items.map(x=>x.id===item.id?{...x,isRead:true}:x)}))}setNotificationOpen(false)}
  const markAll=async()=>{await api('/notifications/read-all',{method:'POST'});setNotifications(current=>({unreadCount:0,items:current.items.map(x=>({...x,isRead:true}))}))}
  const icon=(type:string)=>type==='Comment'?<MessageSquare size={17}/>:type==='Rejection'?<XCircle size={17}/>:<ShieldCheck size={17}/>
  return <div className={`app-shell role-${user.role.toLowerCase()} ${requestDetailMatch&&!ownsOpenRequest?'request-attachments-readonly':''}`}>
    <button className="mobile-menu" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
    <aside className={open?'sidebar open':'sidebar'}>
      <div className="brand brand-sidebar"><img src="/assets/oyak-dijital-erms-dark.png" alt="OYAK Dijital ERMS"/></div>
      <nav>{links.map(({to,label,icon:Icon})=><NavLink key={to} to={to} onClick={()=>setOpen(false)}><Icon size={19}/><span>{label}</span></NavLink>)}</nav>
      <div className="profile"><div className="avatar">{user.fullName.split(' ').map(x=>x[0]).slice(0,2).join('')}</div><div><strong>{user.fullName}</strong><span>{roleLabel[user.role]} · {user.department}</span></div><button title="Çıkış yap" onClick={logout}><LogOut size={18}/></button></div>
    </aside>
    <main className="main">
      <header className="topbar">
        <div><span className="eyebrow">ERMS</span><strong>İş talepleriniz, tek ve şeffaf bir akışta.</strong></div>
        <div className="topbar-actions">
          <div className="notification-center" ref={notificationRef}>
            <button className={notificationOpen?'notification-button active':'notification-button'} title="Bildirimler" aria-label={`Bildirimler, ${notifications.unreadCount} okunmamış`} onClick={()=>setNotificationOpen(value=>!value)}><Bell size={19}/>{notifications.unreadCount>0&&<span>{notifications.unreadCount>99?'99+':notifications.unreadCount}</span>}</button>
            {notificationOpen&&<div className="notification-popover">
              <div className="notification-head"><div><strong>Bildirimler</strong><span>{notifications.unreadCount} okunmamış</span></div>{notifications.unreadCount>0&&<button onClick={markAll}><CheckCheck size={16}/>Tümünü okundu yap</button>}</div>
              <div className="notification-list">{notifications.items.length===0?<div className="notification-empty"><Bell size={24}/><strong>Henüz bildiriminiz yok</strong><span>Onay, red ve yorumlar burada görünecek.</span></div>:notifications.items.map(item=>{
                const content=<><div className={`notification-type ${item.type.toLowerCase()}`}>{icon(item.type)}</div><div className="notification-copy"><strong>{item.title}</strong><p>{item.message}</p><time>{notificationDate(item.createdAt)}</time></div>{!item.isRead&&<i className="unread-dot"/>}</>
                return item.requestId?<Link key={item.id} className={item.isRead?'notification-item':'notification-item unread'} to={`/requests/${item.requestId}`} onClick={()=>markRead(item)}>{content}</Link>:<button key={item.id} className={item.isRead?'notification-item':'notification-item unread'} onClick={()=>markRead(item)}>{content}</button>
              })}</div>
            </div>}
          </div>
          <div className="secure-pill"><ShieldCheck size={16}/> Güvenli oturum</div>
        </div>
      </header>
      <div className="page"><Outlet/></div>
    </main>
  </div>
}
