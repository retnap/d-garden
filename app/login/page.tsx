"use client";

import { useState } from "react";
import Link from "next/link";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import GoogleButton from "@/components/auth/GoogleButton";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: typeof errors = {};

    if (!email.trim()) {
      nextErrors.email = "E-posta adresini gir.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Geçerli bir e-posta adresi gir.";
    }

    if (!password) {
      nextErrors.password = "Şifreni gir.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    // UI aşaması: Kimlik doğrulama henüz bağlanmadı.
    console.log("Giriş formu doğrulamadan geçti.", {
      email,
      rememberMe,
    });
  }

  return (
    <AuthLayout
      title="Bahçene hoş geldin."
      description="Okuma yolculuğuna kaldığın yerden devam et."
      footerText="Henüz bir hesabın yok mu?"
      footerLinkText="Kaydol"
      footerLinkHref="/register"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <AuthInput
          id="email"
          name="email"
          label="E-posta adresi"
          type="email"
          placeholder="ornek@email.com"
          autoComplete="email"
          value={email}
          onChange={(value) => {
            setEmail(value);
            setErrors((current) => ({ ...current, email: undefined }));
          }}
          error={errors.email}
        />

        <div>
          <AuthInput
            id="password"
            name="password"
            label="Şifre"
            type="password"
            placeholder="Şifreni gir"
            autoComplete="current-password"
            value={password}
            onChange={(value) => {
              setPassword(value);
              setErrors((current) => ({
                ...current,
                password: undefined,
              }));
            }}
            error={errors.password}
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[#65766D]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 rounded border-[#DCE8E1] accent-[#1F5D42] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D42]"
              />
              Beni hatırla
            </label>

            <Link
              href="/forgot-password"
              className="text-sm font-medium text-[#1F5D42] transition-colors hover:text-[#153D2D] hover:underline"
            >
              Şifremi unuttum
            </Link>
          </div>
        </div>

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#1F5D42] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#153D2D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D42]"
        >
          Giriş Yap
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#DCE8E1]" />
        <span className="text-xs text-[#8A9890]">veya</span>
        <div className="h-px flex-1 bg-[#DCE8E1]" />
      </div>

      <GoogleButton />
    </AuthLayout>
  );
}
