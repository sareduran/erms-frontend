import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth'

export default function LoginPage(){
  const {login}=useAuth()
  const navigate=useNavigate()
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)

  const submit=async(e:FormEvent)=>{
    e.preventDefault()
    setLoading(true)
    setError('')
    try{
      await login(email,password)
      navigate('/')
    }catch(err){
      setError(err instanceof Error?err.message:'Giriş yapılamadı.')
    }finally{
      setLoading(false)
    }
  }

  return <div className="login-page">
    <section className="login-story">
      <div className="brand brand-login"><img src="/assets/oyak-dijital-erms-dark.png" alt="OYAK Dijital ERMS"/></div>
      <div className="story-copy">
        <span className="eyebrow">ERMS · Kurumsal İş Akışı</span>
        <h1>Talebiniz kaybolmaz.<br/>Süreciniz görünür kalır.</h1>
        <p>İzin, masraf, donanım ve genel taleplerinizi tek noktadan yönetin; her adımı güvenle takip edin.</p>
        <div className="story-points"><span><ShieldCheck/> Rol bazlı erişim</span><span><LockKeyhole/> Güvenli token yönetimi</span></div>
      </div>
      <small>OYAK Dijital · İç Kullanım</small>
    </section>
    <section className="login-panel">
      <form className="login-card" onSubmit={submit}>
        <span className="eyebrow">HOŞ GELDİNİZ</span>
        <h2>Hesabınıza giriş yapın</h2>
        <p>Kurumsal e-posta adresinizi kullanın.</p>
        {error&&<div className="notice error">{error}</div>}
        <label>E-posta adresi<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="ad.soyad@oyakdijital.com"/></label>
        <label>Parola<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>
        <button className="button primary wide" disabled={loading}>{loading?'Giriş yapılıyor…':<>Giriş yap <ArrowRight size={18}/></>}</button>
      </form>
    </section>
  </div>
}
