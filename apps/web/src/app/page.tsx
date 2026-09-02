import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleCheckBig,
  ClipboardCheck,
  Cpu,
  Gauge,
  HardDrive,
  Laptop,
  LockKeyhole,
  MessageSquareText,
  MonitorSmartphone,
  Search,
  ShieldCheck,
  Smartphone,
  Wrench,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";

const services = [
  {
    description:
      "Cihaz ve fatura bilgileriyle servis kaydınızı birkaç adımda oluşturun.",
    icon: ClipboardCheck,
    number: "01",
    title: "Talep oluşturma",
  },
  {
    description:
      "Satın alma tarihine göre garanti durumunuz anında belirlensin.",
    icon: ShieldCheck,
    number: "02",
    title: "Garanti kontrolü",
  },
  {
    description:
      "Teşhis, onarım ve kalite kontrol adımlarını tek zaman çizelgesinden izleyin.",
    icon: Wrench,
    number: "03",
    title: "Servis takibi",
  },
  {
    description:
      "Kapanış özetini ve müşteriye açık gelişmeleri güvenli hesabınızda görüntüleyin.",
    icon: MessageSquareText,
    number: "04",
    title: "Şeffaf sonuç",
  },
];

const capabilities = [
  {
    icon: Laptop,
    label: "Dizüstü bilgisayar",
    text: "Model ve seri numarasıyla izlenebilir servis kaydı.",
  },
  {
    icon: Smartphone,
    label: "Mobil cihaz",
    text: "Garanti kararı ve servis hareketleri tek ekranda.",
  },
  {
    icon: HardDrive,
    label: "Elektronik donanım",
    text: "Teknik ekip için kontrollü operasyon akışı.",
  },
  {
    icon: MonitorSmartphone,
    label: "Çoklu cihaz takibi",
    text: "Bütün talepler için merkezi müşteri görünümü.",
  },
  {
    icon: LockKeyhole,
    label: "Güvenli erişim",
    text: "Servis taleplerinize yalnızca hesabınız üzerinden erişin.",
  },
  {
    icon: Search,
    label: "Hızlı sorgulama",
    text: "RMA veya seri numarası üzerinden kolay arama.",
  },
];

const workflow = [
  {
    number: "01",
    title: "Kaydı açın",
    text: "Ürün, fatura ve arıza bilgilerini girerek RMA numaranızı alın.",
  },
  {
    number: "02",
    title: "Süreci izleyin",
    text: "Cihaz kabulünden teşhise kadar müşteriye açık tüm gelişmeleri görün.",
  },
  {
    number: "03",
    title: "Sonucu alın",
    text: "Onarım tamamlandığında teknik ekibin kapanış özetine ulaşın.",
  },
];

const faqs = [
  {
    question: "Garanti sonucu nasıl hesaplanıyor?",
    answer:
      "Satın alma tarihine 24 takvim ayı eklenir ve bitiş günü kapsam içinde kabul edilir. Ürün veya satıcıya özel ek koşullar bu otomatik kontrole dahil değildir.",
  },
  {
    question: "Servis talebimi kimler görebilir?",
    answer:
      "Müşteri yalnızca kendi taleplerini görür. Teknik ekip bütün servis kayıtlarına erişebilir; dahili teknik notlar hiçbir zaman müşteri görünümüne gönderilmez.",
  },
  {
    question: "RMA numarası ne işe yarar?",
    answer:
      "Her talebe yıl ve sıra numarasından oluşan benzersiz bir RMA atanır. Bu numara hem arama hem de servis kaydını ayırt etmek için kullanılır.",
  },
  {
    question: "Hangi gelişmeler müşteriye gösterilir?",
    answer:
      "Durum değişiklikleri, müşteriye gönderilen servis mesajları, garanti sonucu ve talep tamamlandığında çözüm özeti servis geçmişinde görünür.",
  },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-sidebar text-sidebar-foreground">
      <div className="mx-auto max-w-[96rem] bg-background text-foreground shadow-2xl shadow-black/15">
        <section className="relative bg-sidebar text-sidebar-foreground">
          <header className="relative z-30 mx-auto flex h-24 max-w-[86rem] items-center gap-8 px-5 sm:px-8 lg:px-12">
            <Brand inverse />

            <nav
              aria-label="Ana navigasyon"
              className="ml-auto hidden items-center gap-7 text-xs font-semibold text-sidebar-foreground/72 lg:flex"
            >
              <a className="transition-colors hover:text-white" href="#hakkimizda">
                Kurumsal
              </a>
              <a className="transition-colors hover:text-white" href="#hizmetler">
                Hizmetler
              </a>
              <a className="transition-colors hover:text-white" href="#surec">
                Nasıl çalışır?
              </a>
              <a className="transition-colors hover:text-white" href="#sss">
                SSS
              </a>
              <Link className="transition-colors hover:text-white" href="/login">
                Giriş yap
              </Link>
            </nav>

            <Button asChild className="ml-auto lg:ml-0" size="sm">
              <Link href="/register">
                <span className="sm:hidden">Talep oluştur</span>
                <span className="hidden sm:inline">Servis talebi oluştur</span>
                <ArrowRight />
              </Link>
            </Button>
          </header>

          <div className="relative mx-auto max-w-[86rem] px-0 sm:px-8 lg:px-12">
            <div className="relative min-h-[35rem] overflow-hidden sm:rounded-t-md lg:min-h-[43rem]">
              <Image
                alt="Elektronik cihaz üzerinde çalışan teknik servis uzmanı"
                className="object-cover"
                fill
                priority
                sizes="(max-width: 1536px) 100vw, 1376px"
                src="/images/laptop-repair.jpg"
              />
              <div className="absolute inset-0 bg-black/55" />
              <div className="absolute inset-0 bg-linear-to-r from-black/80 via-black/35 to-transparent" />

              <div className="relative z-10 flex min-h-[35rem] max-w-2xl flex-col justify-center px-5 pb-28 pt-14 sm:px-10 lg:min-h-[43rem] lg:px-20 lg:pb-36">
                <p className="sf-kicker mb-5 text-white/65">
                  Elektronik servis yönetimi
                </p>
                <h1 className="sf-display max-w-xl text-5xl leading-[0.96] text-white sm:text-6xl lg:text-[5rem]">
                  Uzman servis.
                  <br />
                  Şeffaf takip.
                </h1>
                <p className="mt-6 max-w-lg text-sm leading-7 text-white/72 sm:text-base">
                  Cihaz sorunlarının sizi yavaşlatmasına izin vermeyin. Garanti
                  kontrolünden kapanış özetine kadar bütün süreci tek RMA kaydıyla
                  takip edin.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link href="/register">
                      Talep oluştur
                      <ArrowRight />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    className="border-white/45 text-white hover:border-white hover:bg-white hover:text-sidebar"
                    size="lg"
                    variant="outline"
                  >
                    <a href="#hakkimizda">Bizi tanıyın</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative bg-primary px-5 pb-20 text-primary-foreground sm:px-8 lg:px-12 lg:pb-24 lg:pt-36">
          <div className="relative z-10 -mx-5 grid max-w-[76rem] gap-px bg-sidebar/15 sm:-mx-8 sm:grid-cols-2 lg:absolute lg:inset-x-0 lg:top-0 lg:mx-auto lg:-translate-y-1/2 lg:grid-cols-4">
            {services.map(({ description, icon: Icon, number, title }) => (
              <article
                className="group flex min-h-64 flex-col bg-white p-6 text-foreground sm:p-7"
                key={title}
              >
                <div className="flex items-start justify-between gap-4">
                  <Icon className="size-6 text-primary" strokeWidth={1.7} />
                  <span className="font-mono text-[0.65rem] text-muted-foreground">
                    / {number}
                  </span>
                </div>
                <h2 className="sf-display mt-10 text-xl">{title}</h2>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  {description}
                </p>
                <Link
                  className="mt-auto flex items-center gap-2 pt-6 text-xs font-semibold text-primary"
                  href="/register"
                >
                  Talep oluştur
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </article>
            ))}
          </div>

          <div className="mx-auto mt-16 grid max-w-[72rem] items-end gap-10 lg:mt-0 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div>
              <p className="sf-kicker text-white/65">Nasıl çalışıyoruz?</p>
              <h2 className="sf-display mt-5 max-w-3xl text-3xl leading-[1.05] text-white sm:text-4xl lg:text-[2.75rem]">
                ServisFlow, elektronik cihaz servis sürecini müşteriler ve teknik
                ekip için tek, güvenli bir kayıt üzerinde buluşturur.
              </h2>
              <Button
                asChild
                className="mt-8 border-white/55 text-white hover:bg-white hover:text-primary"
                variant="outline"
              >
                <Link href="/register">
                  Hemen başlayın
                  <ArrowRight />
                </Link>
              </Button>
            </div>

            <div className="relative hidden aspect-square lg:block" aria-hidden="true">
              <span className="absolute inset-2 rounded-full border border-white/35" />
              <span className="absolute right-0 bottom-3 size-40 rounded-full bg-white" />
              <span className="absolute top-10 left-2 size-40 rounded-full border border-white/70 bg-[repeating-linear-gradient(0deg,transparent,transparent_5px,rgba(255,255,255,.65)_5px,rgba(255,255,255,.65)_6px)]" />
            </div>
          </div>
        </section>

        <section
          className="bg-white px-5 py-20 sm:px-8 lg:px-12 lg:py-28"
          id="hakkimizda"
        >
          <div className="mx-auto grid max-w-[76rem] items-center gap-14 lg:grid-cols-[0.88fr_1.12fr] lg:gap-24">
            <div>
              <p className="sf-kicker text-muted-foreground">Hakkımızda / Biz kimiz?</p>
              <h2 className="sf-display mt-5 text-4xl leading-none sm:text-5xl">
                Ne sunuyoruz?
              </h2>
              <p className="mt-6 max-w-lg text-sm leading-7 text-muted-foreground">
                Servis kayıtlarının kaybolmadığı, garanti kararının açık olduğu ve
                her rolün yalnızca görmesi gereken bilgiye eriştiği bir elektronik
                servis deneyimi sunuyoruz.
              </p>
              <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground">
                Talebinizi oluşturduğunuz anda benzersiz bir RMA numarası alır,
                cihazınızın servis adımlarını aynı kayıt üzerinden izlersiniz.
              </p>
              <Button asChild className="mt-8" variant="outline">
                <a href="#surec">
                  Süreci inceleyin
                  <ArrowRight />
                </a>
              </Button>
            </div>

            <div className="relative mx-auto w-full max-w-xl pb-8 pl-8">
              <div className="absolute bottom-0 left-0 h-[72%] w-[72%] bg-primary" />
              <div className="sf-image-zoom relative aspect-[4/3] overflow-hidden rounded-sm">
                <Image
                  alt="Teknik servis çalışanı elektronik cihazı inceliyor"
                  className="object-cover"
                  fill
                  sizes="(max-width: 1024px) 90vw, 560px"
                  src="/images/electronics-workbench.jpg"
                />
              </div>
            </div>
          </div>
        </section>

        <section
          className="border-t border-foreground/15 bg-white px-5 py-20 sm:px-8 lg:px-12 lg:py-28"
          id="hizmetler"
        >
          <div className="mx-auto max-w-[76rem]">
            <div className="grid gap-8 border-b border-foreground/20 pb-12 lg:grid-cols-2 lg:items-end">
              <div>
                <p className="sf-kicker text-muted-foreground">Hizmetler</p>
                <h2 className="sf-display mt-5 text-4xl leading-none sm:text-5xl">
                  Size nasıl yardımcı oluruz?
                </h2>
              </div>
              <p className="max-w-lg text-sm leading-7 text-muted-foreground lg:justify-self-end">
                Elektronik servis operasyonundaki en önemli bilgileri sade,
                güvenli ve izlenebilir bir arayüzde bir araya getiriyoruz.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3">
              {capabilities.map(({ icon: Icon, label, text }, index) => (
                <article
                  className="group border-b border-foreground/15 py-9 sm:px-7 sm:even:border-l lg:border-l lg:px-8 lg:first:border-l-0"
                  key={label}
                >
                  <div className="flex items-center justify-between">
                    <Icon className="size-7 text-primary" strokeWidth={1.6} />
                    <span className="font-mono text-[0.65rem] text-muted-foreground">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="sf-display mt-10 text-2xl">{label}</h3>
                  <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">
                    {text}
                  </p>
                  <Link
                    className="mt-8 inline-flex items-center gap-2 text-xs font-semibold text-primary"
                    href="/register"
                  >
                    Talep oluştur
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-sidebar px-5 py-20 text-sidebar-foreground sm:px-8 lg:px-12 lg:py-28">
          <div className="sf-rule-grid absolute inset-0 opacity-25" />
          <div className="relative mx-auto grid max-w-[76rem] items-center gap-14 lg:grid-cols-[1.06fr_0.94fr] lg:gap-20">
            <div className="sf-image-zoom relative aspect-[5/4] overflow-hidden rounded-sm">
              <Image
                alt="Dizüstü bilgisayar üzerinde onarım yapan teknisyen"
                className="object-cover"
                fill
                sizes="(max-width: 1024px) 90vw, 610px"
                src="/images/service-workshop.jpg"
              />
            </div>
            <div>
              <p className="sf-kicker text-white/55">ServisFlow yaklaşımı</p>
              <h2 className="sf-display mt-5 text-5xl leading-[0.95] text-white sm:text-6xl">
                Hızlı.
                <br />
                Şeffaf.
                <br />
                Güvenilir.
              </h2>
              <p className="mt-7 max-w-lg text-sm leading-7 text-white/62">
                Teknik ekip cihazın servis adımlarını yönetir; müşteri yalnızca
                kendi talebine ait paylaşılabilir gelişmeleri görür. Yapılan her
                işlem servis geçmişine eklenir.
              </p>
              <Button asChild className="mt-8" size="lg">
                <Link href="/register">
                  Hesap oluşturun
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section
          className="bg-white px-5 py-20 sm:px-8 lg:px-12 lg:py-28"
          id="surec"
        >
          <div className="mx-auto max-w-[76rem]">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-end">
              <div>
                <p className="sf-kicker text-muted-foreground">Servis süreci</p>
                <h2 className="sf-display mt-5 text-4xl leading-none sm:text-5xl">
                  Üç adımda başlayın.
                </h2>
              </div>
              <p className="max-w-lg text-sm leading-7 text-muted-foreground lg:justify-self-end">
                Karmaşık telefon trafiği yerine kayıtlı ve anlaşılır bir servis
                süreci oluşturun.
              </p>
            </div>

            <div className="mt-14 grid border-t border-foreground/20 md:grid-cols-3">
              {workflow.map(({ number, text, title }) => (
                <article
                  className="border-b border-foreground/20 py-10 md:border-b-0 md:border-l md:px-8 md:first:border-l-0 md:first:pl-0"
                  key={number}
                >
                  <span className="font-mono text-xs text-primary">/ {number}</span>
                  <h3 className="sf-display mt-12 text-2xl">{title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary px-5 py-20 text-white sm:px-8 lg:px-12 lg:py-24">
          <div className="mx-auto grid max-w-[76rem] gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <p className="sf-kicker text-white/60">Ne yapıyoruz?</p>
              <h2 className="sf-display mt-5 max-w-xl text-4xl leading-[1.02] sm:text-5xl">
                Cihaz servis akışının her aşamasını görünür hale getiriyoruz.
              </h2>
            </div>
            <div className="grid gap-px bg-white/25 sm:grid-cols-2">
              {[
                ["Garanti", "Satın alma tarihine göre otomatik kontrol"],
                ["Gizlilik", "Talepler yalnızca hesap sahibine açık"],
                ["RMA", "Her talep için ayrı takip numarası"],
                ["Geçmiş", "Paylaşılan tüm gelişmeler tek yerde"],
              ].map(([value, label]) => (
                <div className="bg-primary p-7" key={label}>
                  <p className="sf-display text-3xl">{value}</p>
                  <p className="mt-2 text-xs leading-5 text-white/65">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="mx-auto max-w-[76rem]">
            <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
              <div>
                <p className="sf-kicker text-muted-foreground">Platform güvencesi</p>
                <h2 className="sf-display mt-5 text-4xl leading-none sm:text-5xl">
                  Her kullanıcı yalnızca ihtiyacı olan bilgiyi görür.
                </h2>
              </div>
              <div className="grid gap-px border border-foreground/15 bg-foreground/15 sm:grid-cols-2">
                {[
                  [CircleCheckBig, "Açık ve anlaşılır servis adımları"],
                  [ShieldCheck, "Kişiye özel talep görünümü"],
                  [Gauge, "RMA ve seri numarasıyla hızlı arama"],
                  [Cpu, "Her talep için benzersiz takip numarası"],
                ].map(([Icon, text]) => {
                  const FeatureIcon = Icon as typeof CircleCheckBig;

                  return (
                    <div className="bg-white p-7" key={text as string}>
                      <FeatureIcon className="size-6 text-primary" strokeWidth={1.7} />
                      <p className="mt-8 text-sm font-semibold">{text as string}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section
          className="border-t border-foreground/15 bg-white px-5 py-20 sm:px-8 lg:px-12 lg:py-28"
          id="sss"
        >
          <div className="mx-auto grid max-w-[76rem] gap-14 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
            <div>
              <p className="sf-kicker text-muted-foreground">SSS</p>
              <h2 className="sf-display mt-5 text-4xl leading-none sm:text-5xl">
                Sık sorulan sorular.
              </h2>
              <p className="mt-6 text-sm leading-7 text-muted-foreground">
                Garanti kontrolü ve servis takibi hakkında merak edilenler.
              </p>
            </div>

            <div className="border-t border-foreground/25">
              {faqs.map(({ answer, question }) => (
                <details className="group border-b border-foreground/25" key={question}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-7 text-base font-semibold marker:content-none">
                    {question}
                    <span className="grid size-9 shrink-0 place-items-center rounded-full border border-foreground/25 transition-colors group-open:bg-primary group-open:text-white">
                      <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                    </span>
                  </summary>
                  <p className="max-w-2xl pb-7 pr-12 text-sm leading-7 text-muted-foreground">
                    {answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-sidebar px-5 py-20 text-sidebar-foreground sm:px-8 lg:px-12 lg:py-24">
          <div className="sf-rule-grid absolute inset-0 opacity-20" />
          <div className="relative mx-auto grid max-w-[76rem] items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div>
              <p className="sf-kicker text-white/55">Servis desteği</p>
              <h2 className="sf-display mt-5 max-w-3xl text-4xl leading-[1.02] text-white sm:text-5xl">
                Cihazınızın servis sürecini bugün başlatın.
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60">
                Hesabınızı oluşturun, ürün bilgilerini girin ve benzersiz RMA
                numaranızla bütün süreci takip edin.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/register">
                Talep oluşturun
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>

        <footer className="bg-sidebar px-5 pb-8 text-sidebar-foreground sm:px-8 lg:px-12">
          <div className="mx-auto max-w-[76rem] border-t border-sidebar-border pt-12">
            <div className="grid gap-12 pb-14 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
              <div>
                <Brand inverse subtitle="Elektronik servis takibi" />
                <p className="mt-6 max-w-sm text-sm leading-7 text-white/50">
                  Servis talebinizi oluşturun, garanti sonucunu öğrenin ve
                  cihazınızın güncel durumunu takip edin.
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Navigasyon</p>
                <div className="mt-5 grid gap-3 text-sm text-white/50">
                  <a className="hover:text-white" href="#hakkimizda">Hakkımızda</a>
                  <a className="hover:text-white" href="#hizmetler">Hizmetler</a>
                  <a className="hover:text-white" href="#surec">Nasıl çalışır?</a>
                  <a className="hover:text-white" href="#sss">SSS</a>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Portal</p>
                <div className="mt-5 grid gap-3 text-sm text-white/50">
                  <Link className="hover:text-white" href="/login">Giriş yap</Link>
                  <Link className="hover:text-white" href="/register">Hesap oluştur</Link>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-4 border-t border-sidebar-border pt-6 text-[0.68rem] text-white/35 sm:flex-row sm:items-center sm:justify-between">
              <p>© 2026 ServisFlow. Tüm hakları saklıdır.</p>
              <p className="flex items-center gap-2">
                <Check className="size-3.5 text-primary" />
                Elektronik cihaz servis takibi
              </p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
