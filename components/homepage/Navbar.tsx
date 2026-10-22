"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { UserRound, Menu, X } from "lucide-react";

function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 0;

            setScrolled(isScrolled);

            if (!isScrolled) {
                setProfileOpen(false);
            }
        };

        handleScroll();

        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;

            if (!target.closest("[data-profile-menu]")) {
                setProfileOpen(false);
            }

            if (!target.closest("[data-mobile-menu]")) {
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const mobileLinkClass =
        "block rounded-xl px-4 py-3 text-sm font-medium text-[#193128] transition-colors duration-200 hover:bg-[#DDEFE5] hover:text-[#1F5D42]";

    return (
        <header
            className={`fixed left-0 top-0 z-50 w-full border-b transition-all duration-300 ${
                scrolled
                    ? "border-[#DCE8E1] bg-[#F4FAF6]/90 backdrop-blur-md"
                    : "border-transparent bg-transparent"
            }`}
        >
            <nav className="relative mx-auto flex h-[64px] max-w-[1440px] items-center justify-between px-4 md:px-8">

                {/* Masaüstü Sol Navigasyon */}
                <div className="hidden flex-1 items-center gap-9 md:flex">
                    <Link
                        href="/"
                        className="text-[13px] font-medium tracking-[0.01em] text-[#193128] transition-colors duration-200 hover:text-[#1F5D42]"
                    >
                        Anasayfa
                    </Link>

                    <Link
                        href="/explore"
                        className="text-[13px] font-medium tracking-[0.01em] text-[#65766D] transition-colors duration-200 hover:text-[#1F5D42]"
                    >
                        Keşfet
                    </Link>
                </div>

                {/* Mobil Logo */}
                <div className="flex items-center md:hidden">
                    <Link
                        href="/"
                        className="font-display text-[23px] font-medium tracking-[-0.025em] text-[#193128] transition-colors duration-200 hover:text-[#1F5D42]"
                    >
                        D-Garden
                    </Link>
                </div>

                {/* Masaüstü Logo */}
                <div className="hidden flex-1 justify-center md:flex">
                    <Link
                        href="/"
                        className="font-display text-[23px] font-medium tracking-[-0.025em] text-[#193128] transition-colors duration-200 hover:text-[#1F5D42]"
                    >
                        D-Garden
                    </Link>
                </div>

                {/* Sağ Alan */}
                <div
                    className="relative flex items-center justify-end gap-3 md:flex-1"
                    data-profile-menu
                    data-mobile-menu
                >
                    {/* Mobil Menü Butonu */}
                    <button
                        type="button"
                        onClick={() =>
                            setMobileMenuOpen((prev) => !prev)
                        }
                        aria-label={
                            mobileMenuOpen
                                ? "Menüyü kapat"
                                : "Menüyü aç"
                        }
                        aria-expanded={mobileMenuOpen}
                        aria-controls="mobile-navigation"
                        className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#DCE8E1] bg-[#EEF6F1] text-[#1F5D42] transition-all duration-200 hover:border-[#8FB9A3] hover:bg-[#DDEFE5] md:hidden"
                    >
                        {mobileMenuOpen ? (
                            <X
                                className="size-[20px]"
                                strokeWidth={1.7}
                            />
                        ) : (
                            <Menu
                                className="size-[20px]"
                                strokeWidth={1.7}
                            />
                        )}
                    </button>

                    {/* Masaüstü Profil Butonu */}
                    {scrolled && (
                        <div className="relative hidden md:block">
                            <button
                                type="button"
                                onClick={() =>
                                    setProfileOpen((prev) => !prev)
                                }
                                aria-label="Profil menüsü"
                                aria-expanded={profileOpen}
                                className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[#DCE8E1] bg-[#EEF6F1] text-[#1F5D42] transition-all duration-200 hover:border-[#8FB9A3] hover:bg-[#DDEFE5]"
                            >
                                <UserRound
                                    className="size-[18px]"
                                    strokeWidth={1.7}
                                />
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 top-[52px] w-[170px] overflow-hidden rounded-2xl border border-[#DCE8E1] bg-[#F4FAF6] p-2 shadow-[0_10px_35px_rgba(25,49,40,0.10)]">
                                    <Link
                                        href="/login"
                                        onClick={() =>
                                            setProfileOpen(false)
                                        }
                                        className={mobileLinkClass}
                                    >
                                        Giriş Yap
                                    </Link>

                                    <Link
                                        href="/register"
                                        onClick={() =>
                                            setProfileOpen(false)
                                        }
                                        className={mobileLinkClass}
                                    >
                                        Kaydol
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobil Açılır Panel */}
                {mobileMenuOpen && (
                    <div
                        id="mobile-navigation"
                        className="absolute left-0 right-0 top-[64px] border-b border-[#DCE8E1] bg-[#F4FAF6]/95 p-3 shadow-[0_12px_30px_rgba(25,49,40,0.08)] backdrop-blur-md md:hidden"
                        data-mobile-menu
                    >
                        <div className="flex flex-col gap-1">
                            <Link
                                href="/"
                                onClick={() => setMobileMenuOpen(false)}
                                className={mobileLinkClass}
                            >
                                Anasayfa
                            </Link>

                            <Link
                                href="/explore"
                                onClick={() => setMobileMenuOpen(false)}
                                className={mobileLinkClass}
                            >
                                Keşfet
                            </Link>

                            <div className="my-1 border-t border-[#DCE8E1]" />

                            <div className="flex gap-3 px-1 pt-1">
                                <Link
                                    href="/login"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex-1 rounded-xl border border-[#DCE8E1] bg-white px-4 py-3 text-center text-sm font-medium text-[#193128] transition-colors duration-200 hover:bg-[#DDEFE5]"
                                >
                                    Giriş Yap
                                </Link>

                                <Link
                                    href="/register"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="flex-1 rounded-xl bg-[#1F5D42] px-4 py-3 text-center text-sm font-medium text-white transition-colors duration-200 hover:bg-[#153D2D]"
                                >
                                    Kaydol
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
}

export default Navbar;
