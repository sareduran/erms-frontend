import { FormEvent, useState } from 'react'
import { ArrowRight, KeyRound, LogOut, ShieldCheck } from 'lucide-react'
import { useAuth } from '../auth'

export default function ChangePasswordPage(){
  const {session,changePassword,logout}=useAuth()
  const [currentPassword,setCurrentPassword]=useState('')
  const [newPassword,setNewPassword]=useState('')
  const [confirmation,setConfirmation]=useState('')
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)

  const submit=async(e:FormEvent)=>{
    e.preventDefault()
    setError('')
    if(newPassword.length<8){setError('Yeni parola en az 8 karakter olmalıdır.');return}
    if(newPassword!==confirmation){setError('Yeni parola ve tekrarı aynı değil.');return}
    setLoading(true)
    try{await changePassword(currentPassword,newPassword)}
    catch(err){setError(err instanceof Error?err.message:'Parola değiştirilemedi.')}
    finally{setLoading(false)}
  }

  return <main className="password-change-page">
    <section className="password-change-card">
      <div className="password-change-icon"><ShieldCheck size={28}/></div>
      <span className="eyebrow">İLK GİRİŞ GÜVENLİĞİ</span>
      <h1>Geçici parolanızı değiştirin</h1>
      <p>Merhaba {session!.user.fullName}. Hesabınıza devam etmek için yalnızca sizin bildiğiniz yeni bir parola belirleyin.</p>
      {error&&<div className="notice error">{error}</div>}
      <form onSubmit={submit}>
        <label>Adminin verdiği geçici parola<input type="password" autoComplete="current-password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} required/></label>
        <label>Yeni parola<input type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={e=>setNewPassword(e.target.value)} required/><small>En az 8 karakter kullanın.</small></label>
        <label>Yeni parola tekrarı<input type="password" autoComplete="new-password" minLength={8} value={confirmation} onChange={e=>setConfirmation(e.target.value)} required/></label>
        <button className="button primary wide" disabled={loading}><KeyRound size={18}/>{loading?'Değiştiriliyor…':'Parolayı değiştir'}<ArrowRight size={18}/></button>
      </form>
      <button className="password-logout" onClick={logout}><LogOut size={16}/>Başka hesapla giriş yap</button>
    </section>
  </main>
}
