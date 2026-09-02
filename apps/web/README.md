# ServisFlow Web

Bu paket, ServisFlow'un Next.js App Router ve React tabanlı kullanıcı arayüzüdür. Herkese açık tanıtım sayfasını, kimlik doğrulama ekranlarını, müşteri portalını ve teknisyen çalışma alanını içerir.

Genel mimari, tam kurulum rehberi, ekran görüntüleri ve canlı ortam bağlantıları için depo kökündeki [ana README](../../README.md) dosyasını inceleyin.

## Temel teknolojiler

- Next.js 16 ve React 19
- TypeScript
- Tailwind CSS 4
- shadcn/ui ve Radix UI
- TanStack Query
- React Hook Form ve Zod
- Lucide React ve Sonner

## Rotalar

| Rota | Erişim | Amaç |
| --- | --- | --- |
| `/` | Herkese açık | Ürün tanıtımı ve servis süreci bilgileri. |
| `/register` | Herkese açık | Müşteri hesabı oluşturma. |
| `/login` | Herkese açık | Müşteri veya teknisyen girişi. |
| `/portal` | Müşteri | Müşterinin kendi servis talepleri. |
| `/portal/requests/new` | Müşteri | Yeni servis talebi oluşturma. |
| `/portal/requests/:id` | Müşteri | Müşteriye özel talep detayı ve servis geçmişi. |
| `/technician` | Teknisyen | Filtrelenebilir ve aranabilir servis kuyruğu. |
| `/technician/requests/:id` | Teknisyen | İş akışı kontrolü, tam geçmiş ve dahili notlar. |

## Geliştirme komutları

Aşağıdaki komutları depo kök dizininden çalıştırın:

```powershell
# Geliştirme sunucusu
npm.cmd run dev:web

# Kontroller
npm.cmd run typecheck --workspace=@servisflow/web
npm.cmd run lint --workspace=@servisflow/web
npm.cmd run build --workspace=@servisflow/web
```

Web uygulaması varsayılan olarak <http://localhost:3000> adresinde çalışır.

## API yönlendirmesi

Tarayıcı istekleri doğrudan ayrı bir backend origin'ine gönderilmez. Next.js, `/api/:path*` isteklerini `API_PROXY_TARGET` ile belirtilen NestJS API adresine yönlendirir. Yerel varsayılan hedef `http://127.0.0.1:3001` adresidir ve örnek yapılandırma [`.env.example`](.env.example) dosyasında bulunur.

Bu yaklaşım üretimde oturum çerezinin Vercel alan adında birinci taraf ve yalnızca `/api` yoluyla sınırlı kalmasını sağlar.
