# ServisFlow API

Bu paket, ServisFlow'un NestJS tabanlı backend uygulamasıdır. Kimlik doğrulama, rol tabanlı yetkilendirme, garanti değerlendirmesi, RMA üretimi, servis iş akışı, dahili teknisyen notları ve işlem geçmişinden sorumludur.

Genel mimari, tam kurulum rehberi ve canlı ortam bağlantıları için depo kökündeki [ana README](../../README.md) dosyasını inceleyin.

## Temel teknolojiler

- NestJS 11 ve Express
- Prisma ORM 7 ile PostgreSQL 17
- class-validator ve class-transformer
- bcryptjs ile parola hash'leme
- Sunucu taraflı, hash'lenerek saklanan oturumlar
- Swagger/OpenAPI
- Jest ve Supertest

## Modüller

| Modül | Sorumluluk |
| --- | --- |
| `AuthModule` | Müşteri kaydı, giriş, çıkış, oturum doğrulama ve rol koruması. |
| `ServiceRequestsModule` | Garanti kararı, RMA numarası, liste/detay erişimi, durum geçişleri ve dahili notlar. |
| `PrismaModule` | PostgreSQL bağlantısının ve üretilmiş Prisma istemcisinin yaşam döngüsü. |
| `HealthModule` | API ile veritabanının erişilebilirliğini doğrulayan sağlık kontrolü. |

## Geliştirme komutları

Aşağıdaki komutları depo kök dizininden çalıştırın:

```powershell
# Geliştirme sunucusu
npm.cmd run dev:api

# Prisma istemcisini üretme
npm.cmd run prisma:generate --workspace=@servisflow/api

# Mevcut migration dosyalarını uygulama
npm.cmd run prisma:migrate:deploy --workspace=@servisflow/api

# Teknisyen hesabını hazırlama/güncelleme
npm.cmd run prisma:seed --workspace=@servisflow/api

# Kontroller
npm.cmd run typecheck --workspace=@servisflow/api
npm.cmd run lint --workspace=@servisflow/api
npm.cmd run test --workspace=@servisflow/api
npm.cmd run test:e2e --workspace=@servisflow/api
npm.cmd run build --workspace=@servisflow/api
```

API varsayılan olarak <http://localhost:3001/api>, Swagger arayüzü ise <http://localhost:3001/api/docs> adresinde çalışır.

## Yapılandırma

API, depo kökündeki `.env` dosyasını kullanır. Gerekli değişkenlerin güvenli yer tutucular içeren listesi [`.env.example`](../../.env.example) dosyasındadır. Gerçek bağlantı adreslerini ve parolaları Git'e eklemeyin.

Üretim ortamında `NODE_ENV=production` olduğunda yerel `.env` okunmaz; yapılandırma dağıtım sağlayıcısının ortam değişkenlerinden alınır.
