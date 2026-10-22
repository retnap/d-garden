/* eslint-disable @next/next/no-img-element */

function ExploreGardens() {
  const gardens = [
    {
      name: "Ayşe Karan",
      username: "@ayse.karan",
      image: "/images/ayse-karan.png",
      growth: 35,
      description:
        "Felsefe ve roman okuyucusu. Her kitabın bir düşünce tohumu olduğuna inanıyorum.",
      interests: ["Roman", "Felsefe", "Tarih"],
      books: 68,
      works: 12,
    },
    {
      name: "Mehmet Yıldız",
      username: "@mehmet.yildiz",
      image: "/images/mehmet-yildiz.png",
      growth: 70,
      description:
        "Klasik edebiyat tutkunuyum. Rus edebiyatına özel bir ilgim var.",
      interests: ["Klasikler", "Şiir"],
      books: 134,
      works: 28,
    },
    {
      name: "Selin Demir",
      username: "@selin.demir",
      image: "/images/selin-demir.png",
      growth: 25,
      description:
        "Bilim ve teknoloji kitapları okuyorum. Zaman zaman da şiirle nefes alıyorum.",
      interests: ["Bilim", "Şiir", "Deneme"],
      books: 45,
      works: 8,
    },
  ];

  return (
    <section className="bg-[#F4FAF6] px-4 py-12 text-[#193128] sm:px-6 sm:py-14 md:px-8 md:py-16">
      <div className="mx-auto max-w-[1440px]">
        {/* Başlıklar */}
        <h2 className="font-display text-[28px] font-normal leading-tight text-[#193128] sm:text-[32px] md:text-[36px]">
          Bahçeleri Keşfet
        </h2>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <p className="max-w-2xl text-sm font-light leading-6 text-[#65766D] sm:text-base">
            Topluluğun açık dijital bahçelerine göz at - her kişinin kendi
            ağacı var
          </p>

          <a
            href="#"
            className="inline-flex w-fit shrink-0 items-center gap-1 text-sm font-light text-[#65766D] transition-colors hover:text-[#1F5D42] sm:text-base"
          >
            Tümünü Gör <span aria-hidden="true">→</span>
          </a>
        </div>

        {/* Bahçe Kartları */}
        <div className="mt-7 grid grid-cols-1 gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-5 lg:mt-10 lg:grid-cols-3 lg:gap-6">
          {gardens.map((garden) => (
            <article
              key={garden.username}
              className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#DCE8E1] bg-[#F4FAF6]"
            >
              {/* Profil Header */}
              <div className="border-b border-[#DCE8E1] bg-[#EEF6F1] px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
                <div className="flex min-w-0 items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <img
                      src={garden.image}
                      alt={garden.name}
                      className="h-12 w-12 shrink-0 rounded-xl object-cover sm:h-14 sm:w-14 lg:h-16 lg:w-16 lg:rounded-2xl"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#193128] sm:text-base">
                        {garden.name}
                      </p>

                      <p className="mt-1 truncate text-xs font-normal text-[#8FB9A3] sm:text-[13px]">
                        {garden.username}
                      </p>
                    </div>
                  </div>

                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DDEFE5] text-base sm:h-10 sm:w-10 sm:text-lg"
                    aria-label="Meşe ağacı"
                    role="img"
                  >
                    🌳
                  </div>
                </div>
              </div>

              {/* Ana İçerik */}
              <div className="flex flex-1 flex-col bg-[#FAFDFB] px-4 py-5 sm:px-5 sm:py-6 lg:px-6">
                {/* Bahçe Büyümesi */}
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13px] font-normal text-[#65766D] sm:text-sm">
                      Bahçe büyümesi
                    </span>

                    <span className="shrink-0 text-[13px] font-medium text-[#1F5D42] sm:text-sm">
                      {garden.growth}%
                    </span>
                  </div>

                  <div
                    className="mt-2 h-[6px] w-full overflow-hidden rounded-full bg-[#DDEFE5]"
                    role="progressbar"
                    aria-label={`${garden.name} bahçe büyümesi`}
                    aria-valuenow={garden.growth}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div
                      className="h-full rounded-full bg-[#2D7A56] transition-[width]"
                      style={{ width: `${garden.growth}%` }}
                    />
                  </div>
                </div>

                {/* Açıklama */}
                <p className="mt-5 text-sm font-normal leading-[1.7] text-[#65766D] sm:mt-6 sm:text-base">
                  {garden.description}
                </p>

                {/* İlgi Alanları */}
                <div className="mt-4 flex flex-wrap items-center gap-2 sm:mt-5">
                  {garden.interests.map((interest) => (
                    <span
                      key={interest}
                      className="inline-flex items-center rounded-full border border-[#DCE8E1] bg-white px-2.5 py-1 text-[11px] font-normal text-[#65766D] sm:px-3 sm:text-xs"
                    >
                      {interest}
                    </span>
                  ))}
                </div>

                {/* Alt Bilgi */}
                <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-4 border-t border-[#DCE8E1] pt-4 mt-5">
                  <div className="flex items-start gap-5 sm:gap-7">
                    <div>
                      <p className="font-display text-xl font-semibold leading-none text-[#193128] sm:text-[22px]">
                        {garden.books}
                      </p>

                      <p className="mt-1 text-xs font-normal text-[#65766D]">
                        Kitap
                      </p>
                    </div>

                    <div>
                      <p className="font-display text-xl font-semibold leading-none text-[#193128] sm:text-[22px]">
                        {garden.works}
                      </p>

                      <p className="mt-1 text-xs font-normal text-[#65766D]">
                        Eser
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="whitespace-nowrap rounded-full border border-[#1F5D42] px-3 py-2 text-xs font-medium text-[#1F5D42] transition-colors hover:bg-[#DDEFE5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D42] sm:px-4 sm:text-[13px] lg:px-5"
                  >
                    Bahçeyi Gör →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ExploreGardens;
