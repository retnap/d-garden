"use client";

import { useState } from "react";
import Link from "next/link";

import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";
import GoogleButton from "@/components/auth/GoogleButton";

type RegisterErrors = {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
};

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [errors, setErrors] = useState<RegisterErrors>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: RegisterErrors = {};

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim();

    if (!normalizedUsername) {
      nextErrors.username = "Kullanıcı adını gir.";
    } else if (normalizedUsername.length < 3) {
      nextErrors.username =
        "Kullanıcı adı en az 3 karakter olmalı.";
    } else if (!/^[a-zA-Z0-9_.]+$/.test(normalizedUsername)) {
      nextErrors.username =
        "Yalnızca harf, rakam, alt çizgi ve nokta kullanabilirsin.";
    }

    if (!normalizedEmail) {
      nextErrors.email = "E-posta adresini gir.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      nextErrors.email = "Geçerli bir e-posta adresi gir.";
    }

    if (!password) {
      nextErrors.password = "Bir şifre belirle.";
    } else if (password.length < 8) {
      nextErrors.password =
        "Şifren en az 8 karakter olmalı.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword =
        "Şifreni tekrar gir.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword =
        "Girdiğin şifreler eşleşmiyor.";
    }

    if (!acceptedTerms) {
      nextErrors.terms =
        "Devam etmek için kullanım koşullarını ve gizlilik politikasını onaylamalısın.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    // UI aşaması: Hesap oluşturma henüz bağlanmadı.
    console.log("Kayıt formu doğrulamadan geçti.", {
      username: normalizedUsername,
      email: normalizedEmail,
      acceptedTerms,
    });
  }

  return (
    <AuthLayout
      title="Kendi bahçeni oluştur."
      description="Aramıza katıl, oku, düşün ve kendi dijital bahçeni büyüt."
      footerText="Zaten bir hesabın var mı?"
      footerLinkText="Giriş Yap"
      footerLinkHref="/login"
    >
      <form
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
      >
        <AuthInput
          id="username"
          name="username"
          label="Kullanıcı adı"
          placeholder="Kullanıcı adını belirle"
          autoComplete="username"
          value={username}
          onChange={(value) => {
            setUsername(value);
            setErrors((current) => ({
              ...current,
              username: undefined,
            }));
          }}
          error={errors.username}
        />

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
            setErrors((current) => ({
              ...current,
              email: undefined,
            }));
          }}
          error={errors.email}
        />

        <AuthInput
          id="password"
          name="password"
          label="Şifre"
          type="password"
          placeholder="En az 8 karakter"
          autoComplete="new-password"
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

        <AuthInput
          id="confirmPassword"
          name="confirmPassword"
          label="Şifre tekrarı"
          type="password"
          placeholder="Şifreni tekrar gir"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(value) => {
            setConfirmPassword(value);
            setErrors((current) => ({
              ...current,
              confirmPassword: undefined,
            }));
          }}
          error={errors.confirmPassword}
        />

        {/* Kullanım koşulları */}
        <div className="pt-1">
          <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-6 text-[#65766D]">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(event) => {
                setAcceptedTerms(event.target.checked);
                setErrors((current) => ({
                  ...current,
                  terms: undefined,
                }));
              }}
              aria-invalid={Boolean(errors.terms)}
              aria-describedby={
                errors.terms ? "terms-error" : undefined
              }
              className="mt-1 h-4 w-4 shrink-0 rounded border-[#DCE8E1] accent-[#1F5D42] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D42]"
            />

            <span>
              <Link
                href="/terms"
                className="font-medium text-[#1F5D42] underline-offset-4 hover:underline"
              >
                Kullanım Koşulları
              </Link>{" "}
              ve{" "}
              <Link
                href="/privacy"
                className="font-medium text-[#1F5D42] underline-offset-4 hover:underline"
              >
                Gizlilik Politikası
              </Link>
              &apos;nı okudum ve kabul ediyorum.
            </span>
          </label>

          {errors.terms && (
            <p
              id="terms-error"
              role="alert"
              className="mt-2 text-xs leading-5 text-red-600"
            >
              {errors.terms}
            </p>
          )}
        </div>

        {/* Hesap oluştur */}
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center rounded-xl bg-[#1F5D42] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#153D2D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D42]"
        >
          Hesap Oluştur
        </button>
      </form>

      {/* Ayırıcı */}
      <div className="my-5 flex items-center gap-3 sm:my-6">
        <div className="h-px flex-1 bg-[#DCE8E1]" />
        <span className="text-xs text-[#8A9890]">veya</span>
        <div className="h-px flex-1 bg-[#DCE8E1]" />
      </div>

      {/* Google ile kayıt */}
      <GoogleButton label="Google ile kaydol" />
    </AuthLayout>
  );
}
