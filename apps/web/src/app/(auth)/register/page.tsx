import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "@/features/auth/register-form";

export const metadata: Metadata = {
  title: "Hesap oluştur",
  description: "ServisFlow müşteri hesabınızı oluşturun.",
};

export default function RegisterPage() {
  return (
    <AuthShell
      title="Müşteri hesabınızı oluşturun"
      description="Garanti kapsamını kontrol edin ve servis sürecinizi tek yerden takip edin."
      footer={
        <p>
          Zaten hesabınız var mı?{" "}
          <Link
            className="font-medium text-foreground underline underline-offset-4"
            href="/login"
          >
            Giriş yapın
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
