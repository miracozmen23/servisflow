import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/features/auth/login-form";

export const metadata: Metadata = {
  title: "Giriş yap",
  description: "ServisFlow hesabınıza giriş yapın.",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Hesabınıza giriş yapın"
      description="Servis taleplerinizi ve cihazınızın güncel durumunu görüntüleyin."
      footer={
        <p>
          Hesabınız yok mu?{" "}
          <Link
            className="font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4"
            href="/register"
          >
            Hesap oluşturun
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
