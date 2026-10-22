"use client";

import { useState, type FormEvent } from "react";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthInput from "@/components/auth/AuthInput";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setEmailError("");
    setSuccess(false);

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setEmailError("Lütfen e-posta adresini gir.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      setEmailError("Geçerli bir e-posta adresi gir.");
      return;
    }

    // UI aşaması: Gerçek e-posta gönderimi henüz yapılmıyor.
    setEmail(normalizedEmail);
    setSuccess(true);
  }

  return (
    <AuthLayout
      title="Şifreni mi unuttun?"
      description="Endişelenme. E-posta adresini gir, şifreni sıfırlama sürecini birlikte başlatalım."
      footerText="Şifreni hatırladın mı?"
      footerLinkText="Giriş Yap"
      footerLinkHref="/login"
    >
      {success ? (
        <div
          role="status"
          aria-live="polite"
          className="rounded-xl border border-[#DCE8E1] bg-[#F4FAF6] p-5 text-center"
        >
          <div
            aria-hidden="true"
            className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#DDEFE5] text-[#1F5D42]"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m5 12 4 4L19 6" />
            </svg>
          </div>

          <h2 className="mt-4 font-display text-xl text-[#193128]">
            Talebin hazır!
          </h2>

          <p className="mt-2 break-words text-sm leading-6 text-[#65766D]">
            <span className="font-medium text-[#193128]">{email}</span>{" "}
            adresi için arayüz testi başarıyla tamamlandı.
          </p>

          <p className="mt-3 text-xs leading-5 text-[#65766D]">
            Bu aşamada gerçek bir e-posta gönderilmedi. Şifre sıfırlama
            işlemini daha sonra backend ile bağlayacağız.
          </p>

          <button
            type="button"
            onClick={() => {
              setSuccess(false);
              setEmailError("");
            }}
            className="mt-5 text-sm font-semibold text-[#1F5D42] underline-offset-4 transition-colors hover:text-[#153D2D] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1F5D42]"
          >
            Başka bir e-posta dene
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <AuthInput
            id="forgot-password-email"
            name="email"
            label="E-posta adresi"
            type="email"
            placeholder="ornek@email.com"
            autoComplete="email"
            value={email}
            onChange={(value) => {
              setEmail(value);
              setEmailError("");
            }}
            error={emailError}
            required
          />

          <button
            type="submit"
            className="mt-6 flex w-full items-center justify-center rounded-xl bg-[#1F5D42] px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#153D2D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D42] active:scale-[0.99]"
          >
            Şifre sıfırlama bağlantısı gönder
          </button>

          <p className="mt-4 text-center text-xs leading-5 text-[#65766D]">
            Hesabını güvende tutmak için yalnızca kayıtlı e-posta adresini
            kullan.
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
