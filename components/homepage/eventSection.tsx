function EventSection() {
    return (
        <section className="border-y border-[#DCE8E1] bg-white">
            <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between md:px-8">

                {/* Sol Taraf */}
                <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">

                    {/* Etkinlik Badge */}
                    <div className="inline-flex shrink-0">
                        <span className="inline-flex items-center gap-2 rounded-full border border-[#DCE8E1] bg-[#DDEFE5] px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#1F5D42] sm:text-xs sm:tracking-[0.14em]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#1F5D42]" />
                            ETKİNLİK
                        </span>
                    </div>

                    {/* Etkinlik Metni */}
                    <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
                        <p className="text-sm font-medium leading-5 text-[#193128]">
                            Eylül Okuma Meydan Okuması başladı
                        </p>

                        <span className="text-xs leading-5 text-[#65766D] sm:text-sm">
                            — Bu ay 4 kitap oku
                        </span>
                    </div>

                </div>

                {/* Sağ Taraf */}
                <div className="flex items-center justify-between gap-4 pl-1 md:justify-end md:pl-0">

                    {/* Slider Göstergeleri */}
                    <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-6 rounded-full bg-[#1F5D42]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#8FB9A3]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#8FB9A3]" />
                    </div>

                    {/* Tümü */}
                    <a
                        href="#"
                        className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-[#1F5D42] transition-colors hover:text-[#153D2D]"
                    >
                        Tümü

                        <svg
                            className="h-4 w-4"
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
                    </a>

                </div>

            </div>
        </section>
    );
}

export default EventSection;
