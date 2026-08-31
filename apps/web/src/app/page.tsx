import {
  ArrowRight,
  ClipboardCheck,
  History,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: ShieldCheck,
    title: "Otomatik garanti kontrolü",
    description:
      "Satın alma tarihine göre garanti uygunluğunu talep anında görün.",
  },
  {
    icon: ClipboardCheck,
    title: "Kontrollü servis akışı",
    description:
      "Cihaz kabulünden kalite kontrole kadar her adımı düzenli takip edin.",
  },
  {
    icon: History,
    title: "Şeffaf timeline",
    description:
      "Müşteriyle paylaşılabilir gelişmeleri kronolojik olarak inceleyin.",
  },
];

export default function Home() {
  return (
    <main className="min-h-svh bg-background">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            className="flex items-center gap-2 font-heading font-semibold"
            href="/"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Wrench className="size-4" />
            </span>
            ServisFlow
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost">
              <Link href="/login">Giriş yap</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Hesap oluştur</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="border-b bg-muted/20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-7">
            <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
              Garanti destekli RMA platformu
            </p>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-heading text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-6xl">
                Servis sürecinizi belirsizlikten çıkarın.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                ServisFlow, garanti uygunluğundan cihazın kapanışına kadar her
                adımı tek bir güvenli akışta toplar.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/register">
                  Servis talebi oluştur
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Talebimi takip et</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-8 rounded-full bg-foreground/5 blur-3xl" />
            <Card className="relative border-0 bg-slate-950 text-white shadow-2xl ring-slate-800">
              <CardHeader className="space-y-6 p-7 sm:p-9">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    Örnek servis akışı
                  </span>
                  <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-medium text-emerald-300">
                    Garanti onaylandı
                  </span>
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-xl text-white">
                    RMA-2026-000001
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Lenovo ThinkPad E14 · PF123456
                  </CardDescription>
                </div>
                <ol className="space-y-4 text-sm">
                  {[
                    "Cihaz teslim alındı",
                    "Teknik teşhis",
                    "Onarım",
                    "Kalite kontrol",
                  ].map((step, index) => (
                    <li className="flex items-center gap-3" key={step}>
                      <span
                        className={
                          index < 2
                            ? "grid size-7 place-items-center rounded-full bg-white text-xs font-semibold text-slate-950"
                            : "grid size-7 place-items-center rounded-full border border-slate-700 text-xs text-slate-500"
                        }
                      >
                        {index + 1}
                      </span>
                      <span
                        className={index < 2 ? "text-white" : "text-slate-500"}
                      >
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 max-w-2xl space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            Nasıl çalışır?
          </p>
          <h2 className="font-heading text-3xl font-semibold tracking-tight">
            Sürecin her adımı görünür ve kontrollü.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <Card key={title}>
              <CardHeader>
                <span className="mb-3 grid size-10 place-items-center rounded-xl bg-secondary">
                  <Icon className="size-5" />
                </span>
                <CardTitle>{title}</CardTitle>
                <CardDescription className="leading-6">
                  {description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
