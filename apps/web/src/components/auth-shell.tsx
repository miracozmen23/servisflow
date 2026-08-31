import { ClipboardCheck, History, ShieldCheck, Wrench } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
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
  { icon: ShieldCheck, text: "Garanti uygunluğunu anında kontrol edin" },
  { icon: ClipboardCheck, text: "Servis sürecini adım adım takip edin" },
  { icon: History, text: "Tüm hareketleri şeffaf timeline’da görün" },
];

export function AuthShell({
  children,
  description,
  footer,
  title,
}: AuthShellProps) {
  return (
    <main className="grid min-h-svh bg-muted/30 lg:grid-cols-[minmax(0,1fr)_minmax(32rem,0.8fr)]">
      <section className="relative hidden overflow-hidden bg-slate-950 px-12 py-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(148,163,184,0.2),transparent_38%)]" />
        <Link
          className="relative flex items-center gap-3 font-heading text-lg font-semibold"
          href="/"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-white text-slate-950">
            <Wrench className="size-5" />
          </span>
          ServisFlow
        </Link>

        <div className="relative max-w-xl space-y-8">
          <div className="space-y-3">
            <p className="text-sm font-medium tracking-widest text-slate-400 uppercase">
              Garanti ve servis takibi
            </p>
            <h2 className="font-heading text-4xl leading-tight font-semibold text-balance">
              Cihazınızın servis yolculuğu tek bir yerde.
            </h2>
          </div>
          <ul className="space-y-4 text-sm text-slate-300">
            {benefits.map(({ icon: Icon, text }) => (
              <li className="flex items-center gap-3" key={text}>
                <span className="grid size-9 place-items-center rounded-lg bg-white/10">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">
          Güvenli oturum · Rol bazlı erişim · Denetlenebilir süreç
        </p>
      </section>

      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-md space-y-6">
          <Link
            className="flex items-center gap-2 font-heading font-semibold lg:hidden"
            href="/"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Wrench className="size-4" />
            </span>
            ServisFlow
          </Link>

          <Card className="shadow-sm">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
            <CardFooter className="justify-center text-sm text-muted-foreground">
              {footer}
            </CardFooter>
          </Card>
        </div>
      </section>
    </main>
  );
}
