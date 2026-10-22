/* eslint-disable @next/next/no-img-element */

function Last_Articles() {
    return (
        <section className="bg-[#F4FAF6] px-4 py-12 text-[#193128] sm:px-6 sm:py-14 md:px-8 md:py-16">

            {/* Başlıklar */}
            <div className="mx-auto max-w-[1440px]">
                <h2 className="font-display text-[28px] font-normal leading-tight text-[#193128] sm:text-[32px] md:text-[36px]">
                    Bahçe Günlüklerinden Son Yazılar
                </h2>

                <p className="mt-3 max-w-2xl text-sm font-light leading-6 text-[#65766D] sm:text-base">
                    Topluluktan seçilmiş yansıma, deneme ve bahçe günlükleri
                </p>
            </div>

            {/* Kartlar */}
            <div className="mx-auto mt-8 grid max-w-[1440px] grid-cols-1 gap-5 sm:mt-10 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">

                {/* Kart 1 */}
                <article className="overflow-hidden rounded-2xl border border-[#DCE8E1] bg-white">
                    <div className="h-[200px] w-full overflow-hidden bg-[#DDEFE5] sm:h-[210px]">
                        <img
                            src="/images/article1.png"
                            alt="Yavaş Okuma Sanatı: Bir Kitapla Gerçekten Vakit Geçirmek"
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                    </div>

                    <div className="p-4 sm:p-5 lg:p-6">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1F5D42]">
                            Deneme
                        </span>

                        <h3 className="mt-3 font-display text-[18px] font-normal leading-[1.35] text-[#193128]">
                            Yavaş Okuma Sanatı: Bir Kitapla Gerçekten Vakit Geçirmek
                        </h3>

                        <p className="mt-4 text-sm font-light leading-[1.7] text-[#65766D]">
                            Hız çağında okuyucu olmak neredeyse bir direniş eylemine dönüştü. Bir kitabı yavaş, derin ve bütünüyle okumak bu çağın en özgün edimi.
                        </p>

                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#DCE8E1] pt-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#1F5D42] text-[11px] font-semibold text-white">
                                    A
                                </div>

                                <div className="min-w-0">
                                    <p className="text-[12px] font-semibold text-[#193128]">
                                        Ayşe Karan
                                    </p>
                                    <p className="text-[10px] font-light leading-5 text-[#65766D] sm:text-[11px]">
                                        4 Eylül 2026 · 6 dk okuma
                                    </p>
                                </div>
                            </div>

                            <span className="shrink-0 text-xl font-light text-[#8FB9A3]">
                                →
                            </span>
                        </div>
                    </div>
                </article>

                {/* Kart 2 */}
                <article className="overflow-hidden rounded-2xl border border-[#DCE8E1] bg-white">
                    <div className="h-[200px] w-full overflow-hidden bg-[#DDEFE5] sm:h-[210px]">
                        <img
                            src="/images/article2.png"
                            alt="Dostoyevski'nin Karamazov Kardeşler'inden Aldıklarım"
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                    </div>

                    <div className="p-4 sm:p-5 lg:p-6">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1F5D42]">
                            Yansıma
                        </span>

                        <h3 className="mt-3 font-display text-[18px] font-normal leading-[1.35] text-[#193128]">
                            Dostoyevski&apos;nin Karamazov Kardeşler&apos;inden Aldıklarım
                        </h3>

                        <p className="mt-4 text-sm font-light leading-[1.7] text-[#65766D]">
                            Bir roman sizi değiştiriyorsa, okuma bitmeden önce bile bunu hissedersiniz. Bu kitapla tam olarak öyle oldu.
                        </p>

                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#DCE8E1] pt-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#1F5D42] text-[11px] font-semibold text-white">
                                    M
                                </div>

                                <div className="min-w-0">
                                    <p className="text-[12px] font-semibold text-[#193128]">
                                        Mehmet Yıldız
                                    </p>
                                    <p className="text-[10px] font-light leading-5 text-[#65766D] sm:text-[11px]">
                                        28 Ağustos 2026 · 9 dk okuma
                                    </p>
                                </div>
                            </div>

                            <span className="shrink-0 text-xl font-light text-[#8FB9A3]">
                                →
                            </span>
                        </div>
                    </div>
                </article>

                {/* Kart 3 */}
                <article className="overflow-hidden rounded-2xl border border-[#DCE8E1] bg-white">
                    <div className="h-[200px] w-full overflow-hidden bg-[#DDEFE5] sm:h-[210px]">
                        <img
                            src="/images/article3.png"
                            alt="D-Garden'da Altı Ay: Okuduklarım, Yazdıklarım, Büyüdüklerim"
                            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                    </div>

                    <div className="p-4 sm:p-5 lg:p-6">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1F5D42]">
                            Bahçe Günlüğü
                        </span>

                        <h3 className="mt-3 font-display text-[18px] font-normal leading-[1.35] text-[#193128]">
                            D-Garden&apos;da Altı Ay: Okuduklarım, Yazdıklarım, Büyüdüklerim
                        </h3>

                        <p className="mt-4 text-sm font-light leading-[1.7] text-[#65766D]">
                            Dijital bahçemi oluşturduğumdan bu yana hem okuduğum kitap sayısı hem de kaleme aldığım eser sayısı ikiye katlandı.
                        </p>

                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#DCE8E1] pt-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#1F5D42] text-[11px] font-semibold text-white">
                                    S
                                </div>

                                <div className="min-w-0">
                                    <p className="text-[12px] font-semibold text-[#193128]">
                                        Selin Demir
                                    </p>
                                    <p className="text-[10px] font-light leading-5 text-[#65766D] sm:text-[11px]">
                                        20 Ağustos 2026 · 5 dk okuma
                                    </p>
                                </div>
                            </div>

                            <span className="shrink-0 text-xl font-light text-[#8FB9A3]">
                                →
                            </span>
                        </div>
                    </div>
                </article>

            </div>
        </section>
    );
}

export default Last_Articles;
