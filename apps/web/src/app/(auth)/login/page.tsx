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
      title="Tekrar hoş geldiniz"
      description="Servis taleplerinizi görüntülemek için hesabınıza giriş yapın."
      footer={
        <p>
          Hesabınız yok mu?{" "}
          <Link
            className="font-medium text-foreground underline underline-offset-4"
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
