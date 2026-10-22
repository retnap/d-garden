"use client";

import { useEffect, useState } from "react";

function Hero() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 0);
        };

        handleScroll();

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    const heroVideo = "/videos/hero-1.mp4";

    return (
        <section className="relative min-h-screen overflow-hidden text-[#193128]">

            {/* Arka Plan Videosu */}
            <video
                className="absolute inset-0 h-full w-full object-cover object-[60%_center] sm:object-center"
                autoPlay
                muted
                loop
                playsInline
            >
                <source src={heroVideo} type="video/mp4" />
            </video>

            {/* Video Overlay */}
            <div
                className={`absolute inset-0 transition-opacity duration-700 ${
                    scrolled ? "opacity-0" : "opacity-100"
                }`}
            >
                <div className="absolute inset-0 bg-[#F4FAF6]/12" />

                <div className="absolute inset-0 bg-gradient-to-r from-[#F4FAF6]/35 via-[#F4FAF6]/10 to-transparent" />
            </div>

            {/* Hero İçeriği */}
            <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1440px] items-center px-4 pt-[88px] pb-12 sm:px-6 sm:pt-[80px] md:px-8 md:pt-[64px] md:pb-0">

                {/* Sol Taraf */}
                <div className="flex w-full max-w-[620px] flex-col gap-6 sm:gap-8">

                    {/* Badge */}
                    <div className="inline-flex self-start">
                        <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-[#DCE8E1] bg-[#DDEFE5]/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#1F5D42] backdrop-blur-sm sm:px-4 sm:text-xs sm:tracking-[0.14em]">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1F5D42]" />
                            DİJİTAL BAHÇEN SENİ BEKLİYOR
                        </span>
                    </div>

                    {/* Başlık */}
                    <div>
                        <h1 className="font-display text-[clamp(46px,10vw,64px)] font-normal leading-[1.02] tracking-tight text-[#193128] md:text-[clamp(52px,5.2vw,80px)]">
                            Oku.{" "}
                            <span className="italic text-[#1F5D42]">
                                Düşün.
                            </span>
                            <br />
                            Üret.
                        </h1>
                    </div>

                    {/* Açıklama */}
                    <div className="max-w-[400px] text-base font-light leading-[1.7] text-[#65766D] sm:text-lg sm:leading-[1.72]">
                        <p>
                            Kitaplarını oku, düşüncelerini kaydet, kendi dijital bahçeni büyüt.
                        </p>
                    </div>

                    {/* Social Proof Card */}
                    <div className="inline-flex w-fit max-w-full items-center gap-3 rounded-2xl border border-[#DCE8E1] bg-white/90 px-3 py-3 shadow-[0_2px_12px_rgba(31,93,66,0.07)] backdrop-blur-sm sm:gap-4 sm:px-[18px] sm:py-[14px]">

                        {/* Avatarlar */}
                        <div className="flex shrink-0 -space-x-2.5">

                            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-white bg-[#1F5D42] text-[12px] font-semibold text-white sm:h-[34px] sm:w-[34px] sm:text-[13px]">
                                A
                            </div>

                            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-white bg-[#2D7A56] text-[12px] font-semibold text-white sm:h-[34px] sm:w-[34px] sm:text-[13px]">
                                M
                            </div>

                            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-white bg-[#8FB9A3] text-[12px] font-semibold text-white sm:h-[34px] sm:w-[34px] sm:text-[13px]">
                                S
                            </div>

                            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-white bg-[#DDEFE5] text-[9px] font-semibold text-[#1F5D42] sm:h-[34px] sm:w-[34px] sm:text-[10px]">
                                +2k
                            </div>

                        </div>

                        {/* Bilgi Yazısı */}
                        <div className="min-w-0">
                            <p className="text-[11px] font-semibold leading-5 text-[#193128] sm:text-xs">
                                2.400+ okuyucu bahçe kuruyor
                            </p>

                            <p className="text-[10px] leading-5 text-[#65766D] sm:text-xs">
                                Bu ay 8.200 kitap tamamlandı
                            </p>
                        </div>

                    </div>

                    {/* Butonlar */}
                    <div className="flex w-full flex-col items-stretch gap-3 min-[420px]:flex-row min-[420px]:items-center sm:gap-[14px]">

                        {/* Birinci Buton */}
                        <button
                            type="button"
                            className="inline-flex w-full items-center justify-center rounded-full bg-[#1F5D42] px-5 py-[14px] text-[13px] font-semibold text-white shadow-[0_4px_16px_rgba(31,93,66,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#153D2D] hover:shadow-[0_8px_28px_rgba(31,93,66,0.28)] min-[420px]:w-auto sm:px-[28px] sm:text-[14px]"
                        >
                            Kendi Bahçeni Oluştur
                        </button>

                        {/* İkinci Buton */}
                        <button
                            type="button"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-[#1F5D42] bg-white/30 px-5 py-[13px] text-[13px] font-medium text-[#1F5D42] backdrop-blur-sm transition-all duration-200 hover:-translate-y-px hover:bg-[#DDEFE5]/80 min-[420px]:w-auto sm:px-[24px] sm:text-[14px]"
                        >
                            Keşfet

                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                                aria-hidden="true"
                            >
                                <path
                                    d="M2 7h10M8 3l4 4-4 4"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>

                    </div>

                </div>

            </div>

        </section>
    );
}

export default Hero;
