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
      title="Servis takibinizi başlatın"
      description="Hesabınızı oluşturun ve ilk servis talebinizi açın."
      footer={
        <p>
          Zaten hesabınız var mı?{" "}
          <Link
            className="font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4"
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
