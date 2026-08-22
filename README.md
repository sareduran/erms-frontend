# ERMS Frontend

ERMS API'sinden bağımsız dağıtılabilen React + TypeScript + Vite arayüzüdür. Kırmızı/beyaz, ölçülü OYAK Dijital görsel dili; masaüstü ve mobil uyumlu düzen içerir.

## Çalıştırma

```powershell
pnpm install
Copy-Item .env.example .env.local
pnpm dev
```

Varsayılan API adresi `http://localhost:5082/api` değeridir. Farklı backend için `.env.local` içinde:

```env
VITE_API_URL=https://api.example.com/api
```

Üretim derlemesi:

```powershell
pnpm build
```

## Rol ekranları

- Employee: taleplerim, filtreleme, yeni talep/taslak, düzenleme, gönderme, bekleyen talebi geri çekme, yorum ve dosya.
- Manager: çalışan özelliklerine ek olarak bağlı ekip talepleri ve onay/red kutusu.
- Admin: tüm talepler, kullanıcı ekleme/pasife alma, departman ve talep türü yönetimi, audit logları.

Access ve refresh token bilgileri istemci oturumunda tutulur. API 401 döndürdüğünde refresh token ile tek seferlik yenileme denenir.

## Ayrı GitHub deposu

```powershell
cd frontend
git init
git add .
git commit -m "feat: ERMS role-based frontend"
```
