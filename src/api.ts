import type { ApiErrorShape, AuthResponse } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5082/api'
const SESSION_KEY = 'erms_session'

/** Backend'in standart hata gövdesini HTTP durum koduyla birlikte taşır. */
export class ApiError extends Error {
  constructor(public status: number, public data: ApiErrorShape) {
    super(data.message)
  }
}

const getSession = (): AuthResponse | null => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null')
  } catch {
    return null
  }
}

const saveSession = (session: AuthResponse) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  window.dispatchEvent(new Event('erms-auth'))
}

/**
 * Bütün HTTP çağrılarının tek giriş noktasıdır.
 * Token ekleme, 401'de bir kez yenileme ve hata mesajı dönüştürme burada yapılır.
 */
export async function api<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const session = getSession()
  const headers = new Headers(init.headers)
  if (!(init.body instanceof FormData)) headers.set('Content-Type', 'application/json')
  if (session?.accessToken) headers.set('Authorization', `Bearer ${session.accessToken}`)

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers })
  } catch {
    // fetch ağ hatalarında HTTP cevabı üretmez. Kullanıcıya tarayıcının belirsiz
    // "Failed to fetch" metni yerine çalıştırma yönlendirmesi gösteriyoruz.
    throw new ApiError(0, {
      code: 'NETWORK_ERROR',
      message: 'Backend sunucusuna bağlanılamadı. ERMS_BASLAT.bat dosyasını çalıştırıp tekrar deneyin.'
    })
  }

  if (response.status === 401 && retry && session?.refreshToken) {
    try {
      const refreshed = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: session.refreshToken })
      })
      if (refreshed.ok) {
        saveSession(await refreshed.json())
        return api<T>(path, init, false)
      }
    } catch {
      // Aşağıdaki oturum temizleme aynı sonucu güvenli biçimde ele alır.
    }
    localStorage.removeItem(SESSION_KEY)
    window.dispatchEvent(new Event('erms-auth'))
  }

  if (!response.ok) {
    let data: ApiErrorShape = { code: 'HTTP_ERROR', message: 'İşlem tamamlanamadı.' }
    try { data = await response.json() } catch { /* JSON olmayan sunucu hatası */ }
    throw new ApiError(response.status, data)
  }

  if (response.status === 204) return undefined as T
  return response.json()
}

/** Yetkili dosya indirme yanıtını geçici tarayıcı bağlantısı üzerinden kaydeder. */
export async function download(path: string, fileName: string) {
  const session = getSession()
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${session?.accessToken ?? ''}` }
  })
  if (!response.ok) throw new Error('Dosya indirilemedi.')
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}
