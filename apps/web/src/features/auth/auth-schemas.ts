import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "E-posta adresi zorunludur.")
  .max(320, "E-posta adresi en fazla 320 karakter olabilir.")
  .email("Geçerli bir e-posta adresi girin.");

const passwordSchema = z
  .string()
  .min(12, "Şifre en az 12 karakter olmalıdır.")
  .max(72, "Şifre en fazla 72 karakter olabilir.")
  .refine(
    (password) => new TextEncoder().encode(password).length <= 72,
    "Şifre UTF-8 biçiminde en fazla 72 bayt olabilir.",
  );

const nameSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(2, `${label} en az 2 karakter olmalıdır.`)
    .max(100, `${label} en fazla 100 karakter olabilir.`);

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z.object({
  firstName: nameSchema("Ad"),
  lastName: nameSchema("Soyad"),
  email: emailSchema,
  password: passwordSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
