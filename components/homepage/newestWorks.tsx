function NewestWorks() {
    const works = [
        {
            category: "Roman",
            rating: 84,
            title: "Sessiz Orman",
            description:
                "Kuzeyin ücra bir köyünde, sözcüklerle örülmüş gizemli bir sükût hikâyesi...",
            author: "Elif Arı",
            initial: "E",
            pages: "312 sayfa",
        },
        {
            category: "Şiir",
            rating: 210,
            title: "Yağmur Alfabesi",
            description:
                "Her damla bir harf, her fırtına bir cümle kurar yeryüzüne.",
            author: "Can Güler",
            initial: "C",
            pages: "32 sayfa",
        },
        {
            category: "Deneme",
            rating: 147,
            title: "Okumak Bir Ev Kurmaktır",
            description:
                "Okuduğumuz kitaplar bizi o kadar da terk etmiyor aslında.",
            author: "Defne Şahin",
            initial: "D",
            pages: "96 sayfa",
        },
        {
            category: "Kısa Hikaye",
            rating: 63,
            title: "Camın Öte Yüzü",
            description:
                "Yedi yıl aynı kafeden aynı sahneye baktı. Bugün sahne değişti.",
            author: "Tarık Öz",
            initial: "T",
            pages: "24 sayfa",
        },
    ];

    return (
        <section className="bg-[#F4FAF6] px-4 py-12 text-[#193128] sm:px-6 sm:py-14 md:px-8 md:py-16">
            <div className="mx-auto max-w-[1440px]">

                {/* Başlıklar */}
                <h2 className="font-display text-[28px] font-normal leading-tight text-[#193128] sm:text-[32px] md:text-[36px]">
                    En Yeni Eserler
                </h2>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-light leading-6 text-[#65766D] sm:text-base">
                        D-Garden yazarlarından roman, şiir, deneme ve kısa hikâyeler
                    </p>

                    <a
                        href="#"
                        className="inline-flex w-fit items-center gap-1 text-sm font-medium text-[#1F5D42] transition-colors hover:text-[#153D2D] sm:text-base"
                    >
                        Tümünü Gör
                        <span aria-hidden="true">→</span>
                    </a>
                </div>

                {/* Eser Kartları */}
                <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
                    {works.map((work) => (
                        <article
                            key={work.title}
                            className="min-w-0 overflow-hidden rounded-2xl border border-[#DCE8E1] bg-white"
                        >
                            <div className="flex h-full flex-col p-4 sm:p-5 lg:p-6">

                                {/* Kategori ve Puan */}
                                <div className="flex items-center justify-between gap-3">
                                    <span className="inline-flex max-w-[70%] items-center rounded-full bg-[#EEF4F0] px-3 py-1 text-[11px] font-semibold text-[#1F5D42] sm:text-xs">
                                        {work.category}
                                    </span>

                                    <div
                                        className="flex shrink-0 items-center gap-1.5 text-[#65766D]"
                                        aria-label={`${work.rating} puan`}
                                    >
                                        <svg
                                            width="16"
                                            height="16"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M12 3.5L14.63 8.83L20.5 9.68L16.25 13.83L17.25 19.68L12 16.92L6.75 19.68L7.75 13.83L3.5 9.68L9.37 8.83L12 3.5Z"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>

                                        <span className="text-[13px] font-normal">
                                            {work.rating}
                                        </span>
                                    </div>
                                </div>

                                {/* Eser Bilgileri */}
                                <div className="flex-1">
                                    <h3 className="mt-4 font-display text-[18px] font-normal leading-[1.35] text-[#193128]">
                                        {work.title}
                                    </h3>

                                    <p className="mt-3 text-sm font-light leading-[1.7] text-[#65766D]">
                                        {work.description}
                                    </p>
                                </div>

                                {/* Alt Bilgi */}
                                <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#DCE8E1] pt-3">
                                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                                        <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#1F5D42] text-[11px] font-semibold text-white">
                                            {work.initial}
                                        </div>

                                        <p className="truncate text-[12px] font-semibold text-[#193128]">
                                            {work.author}
                                        </p>
                                    </div>

                                    <span className="shrink-0 text-[11px] font-medium text-[#65766D] sm:text-[13px]">
                                        {work.pages}
                                    </span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default NewestWorks;
