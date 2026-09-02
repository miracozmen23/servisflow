import { ArrowLeft, Check, ClipboardCheck, History, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Brand } from "@/components/brand";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthShellProps {
  children: ReactNode;
  description: string;
  footer: ReactNode;
  title: string;
}

const benefits = [
  { icon: ShieldCheck, text: "Garanti sonucu talep anında hesaplanır" },
  { icon: ClipboardCheck, text: "Bütün servis adımları tek kayıtta tutulur" },
  { icon: History, text: "Servis gelişmeleri hesabınızda görünür" },
];

export function AuthShell({
  children,
  description,
  footer,
  title,
}: AuthShellProps) {
  return (
    <main className="grid min-h-svh bg-white lg:grid-cols-[minmax(0,1.08fr)_minmax(30rem,0.92fr)]">
      <section className="relative hidden min-h-svh overflow-hidden bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
        <Image
          alt="Teknik servis çalışanı bir elektronik cihazı inceliyor"
          className="object-cover"
          fill
          priority
          sizes="46vw"
          src="/images/laptop-repair.jpg"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/30 to-sidebar/35" />

        <div className="relative flex h-full min-h-svh flex-col px-10 py-9 xl:px-16 xl:py-11">
          <Brand inverse subtitle="Elektronik servis takibi" />

          <div className="my-auto max-w-xl py-20">
            <p className="sf-kicker text-white/60">Elektronik servis yönetimi</p>
            <h2 className="sf-display mt-5 text-5xl leading-[0.95] text-white xl:text-6xl">
              Uzman servis.
              <br />
              Şeffaf takip.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-sidebar-foreground/65">
              Garanti kararından kapanış özetine kadar her önemli gelişmeye,
              hesabınızdan kolayca ulaşın.
            </p>

            <ol className="mt-10 grid gap-px border border-white/20 bg-white/20">
              {benefits.map(({ icon: Icon, text }, index) => (
                <li
                  className="flex items-center gap-4 bg-black/35 px-5 py-4 backdrop-blur-sm"
                  key={text}
                >
                  <span className="grid size-8 shrink-0 place-items-center bg-primary text-primary-foreground">
                    <Icon className="size-3.5" />
                  </span>
                  <span className="text-sm font-semibold text-sidebar-foreground/80">
                    {text}
                  </span>
                  <span className="ml-auto font-mono text-[0.6rem] text-white/35">
                    0{index + 1}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="relative flex items-center gap-2 border-t border-sidebar-border pt-5 text-[0.68rem] text-sidebar-foreground/45">
            <Check className="size-3.5 text-primary" />
            Servis kayıtlarınız yalnızca hesabınıza özeldir
          </div>
        </div>
      </section>

      <section className="relative flex min-h-svh items-center justify-center bg-white px-5 py-10 sm:px-8 lg:px-12">
        <div className="relative w-full max-w-[31rem]">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <Brand subtitle="Elektronik servis takibi" />
            <Link
              className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground"
              href="/"
            >
              <ArrowLeft className="size-3.5" />
              Ana sayfa
            </Link>
          </div>

          <Link
            className="mb-8 hidden w-fit items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground lg:flex"
            href="/"
          >
            <ArrowLeft className="size-3.5" />
            Ana sayfaya dön
          </Link>

          <Card className="border-foreground/20 bg-white">
            <CardHeader className="space-y-3 px-6 pt-7 sm:px-9 sm:pt-9">
              <p className="sf-kicker text-primary">ServisFlow portalı</p>
              <CardTitle className="sf-display text-3xl leading-tight sm:text-[2.15rem]">
                {title}
              </CardTitle>
              <CardDescription className="max-w-md leading-6">
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-6 sm:px-9">{children}</CardContent>
            <CardFooter className="justify-center px-6 py-4 text-sm text-muted-foreground sm:px-9">
              {footer}
            </CardFooter>
          </Card>

        </div>
      </section>
    </main>
  );
}
