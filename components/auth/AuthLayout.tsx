import Link from "next/link";
import type { ReactNode } from "react";

type AuthLayoutProps = {
    title: string;
    description: string;
    children: ReactNode;
    footerText: string;
    footerLinkText: string;
    footerLinkHref: string;
};

export default function AuthLayout ({
    title,
    description,
    children,
    footerText,
    footerLinkText,
    footerLinkHref,
}: AuthLayoutProps) {
    return (
        <main className="relative flex min-h-screen flex-1 flex-col items-center justify-center overflow-hidden bg-[#F4FAF6] px-4 py-8 sm:px-6 sm:py-12">
            {/* Dekoratif Arka Plan */}
            <div 
                aria-hidden="true"
                className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full border border-[#DCE8E1] sm:h-96 sm:w-96"
            />

            <div
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-40 -right-32 h-80 w-80 rounded-full border border-[#DCE8E1] sm:h-[28rem] sm:w-[28rem]"
            />

            {/* Ana İçerik */}
            <div className="relative z-10 my-auto flex w-full max-w-[420px] flex-col items-center">
                {/* Logo */}
                <Link
                    href="/"
                    aria-label="D-Garden ana sayfa"
                    className="mb-7 inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1F5D42] sm:mb-9"
                >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DDEFE5] text-2xl">
                        🌳
                    </span>

                    <span className="font-display text-[26px] font-medium tracking-tight text-[#193128]">
                        D-Garden
                    </span>
                </Link>

                {/* Form kartı */}
                <section className="w-full rounded-2xl border border-[#DCE8E1] bg-white p-5 shadow-[0_12px_40px_rgba(25,49,40,0.04)] sm:p-8">
                <header className="mb-7 text-center sm:mb-8">
                    <h1 className="font-display text-[30px] font-normal leading-tight text-[#193128] sm:text-[34px]">
                    {title}
                    </h1>

                    <p className="mx-auto mt-3 max-w-[320px] text-sm font-normal leading-6 text-[#65766D]">
                    {description}
                    </p>
                </header>

                {children}

                {/* Giriş / kayıt geçişi */}
                <p className="mt-6 text-center text-sm leading-6 text-[#65766D]">
                    {footerText}{" "}
                    <Link
                    href={footerLinkHref}
                    className="font-semibold text-[#1F5D42] underline-offset-4 transition-colors hover:text-[#153D2D] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D42]"
                    >
                    {footerLinkText}
                    </Link>
                </p>
                </section>
            </div>
        </main>
    )
}