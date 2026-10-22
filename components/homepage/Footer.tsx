function Footer() {
  const platformLinks = [
    "Keşfet",
    "Bahçeler",
    "Son Eserler",
    "Blog",
    "Okuma Listeleri",
  ];

  const communityLinks = [
    "Yazarlar",
    "Etkinlikler",
    "Meydan Okumalar",
    "Forum",
  ];

  const companyLinks = [
    "Hakkımızda",
    "Kariyer",
    "Basın",
    "İletişim",
    "Gizlilik",
  ];

  const renderLinks = (links: string[]) => (
    <nav className="mt-4 flex flex-col gap-3 sm:mt-6 sm:gap-4">
      {links.map((link) => (
        <a
          key={link}
          href="#"
          className="w-fit text-sm font-light text-[#65766D] transition-colors hover:text-[#1F5D42] sm:text-[15px]"
        >
          {link}
        </a>
      ))}
    </nav>
  );

  return (
    <footer className="text-[#193128]">
      {/* CTA Bölümü */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#153D2D] to-[#2D7A56] px-4 py-14 sm:px-6 sm:py-16 md:px-8 md:py-20">
        {/* Dekoratif daireler */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 sm:h-[420px] sm:w-[420px]" />

        <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 sm:block" />

        <div className="relative mx-auto flex max-w-[1440px] flex-col items-center text-center">
          {/* Küçük başlık */}
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8FB9A3] sm:text-xs sm:tracking-[0.22em]">
            Okuma yolculuğuna başla
          </span>

          {/* Ana başlık */}
          <h2 className="mt-4 max-w-[750px] font-display text-[clamp(34px,7vw,60px)] font-normal leading-[1.12] text-white sm:mt-5">
            Kendi dijital bahçeni{" "}
            <span className="italic text-[#8FB9A3]">bugün</span> kur.
          </h2>

          {/* Açıklama */}
          <p className="mt-4 max-w-md text-sm font-light leading-6 text-white/70 sm:mt-5 sm:text-base">
            Ücretsiz hesap oluştur, ağacını büyüt, topluluğa katıl.
          </p>

          {/* CTA */}
          <button
            type="button"
            className="mt-7 inline-flex w-full max-w-[290px] items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 text-sm font-semibold text-[#1F5D42] shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(0,0,0,0.18)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:mt-10 sm:w-auto sm:max-w-none sm:px-7"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M19.5 4.5C13.5 4.8 8.2 7.1 6.1 11.1C4.4 14.3 6.1 18.1 9.8 18.1C13.5 18.1 16.8 14.5 17.7 10.5"
                stroke="#2D7A56"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.5 19.5C7.2 16.2 10.1 13.9 14 12.2"
                stroke="#2D7A56"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            Bahçeni Oluştur — Ücretsiz
          </button>
        </div>
      </section>

      {/* Ana Footer */}
      <section className="bg-white px-4 py-12 sm:px-6 sm:py-14 md:px-8 md:py-16 lg:py-20">
        <div className="mx-auto max-w-[1440px]">
          {/* Footer kolonları */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-10 sm:gap-y-12 lg:grid-cols-4 lg:gap-10 xl:gap-12">
            {/* Marka */}
            <div className="col-span-2 min-w-0 lg:col-span-1">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center text-[22px]">
                  🌳
                </div>

                <span className="font-display text-xl font-medium text-[#193128]">
                  D-Garden
                </span>
              </div>

              <p className="mt-4 max-w-[320px] text-sm font-light leading-[1.7] text-[#65766D] sm:mt-5 sm:text-[15px]">
                Kitaplarını oku, düşüncelerini kaydet, kendi dijital bahçeni
                büyüt. Herkes için ücretsiz.
              </p>

              {/* Destek butonu */}
              <button
                type="button"
                className="mt-5 inline-flex max-w-full items-center justify-center gap-2 rounded-xl border border-[#DCE8E1] bg-[#F4FAF6] px-3 py-2.5 text-xs font-medium leading-5 text-[#1F5D42] transition-colors hover:bg-[#DDEFE5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D42] sm:mt-6 sm:px-4 sm:text-sm"
              >
                <svg
                  className="shrink-0"
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M19.5 4.5C13.5 4.8 8.2 7.1 6.1 11.1C4.4 14.3 6.1 18.1 9.8 18.1C13.5 18.1 16.8 14.5 17.7 10.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M5.5 19.5C7.2 16.2 10.1 13.9 14 12.2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>

                <span>D-Garden&apos;ı Büyütmeye Yardım Et</span>
              </button>
            </div>

            {/* Platform */}
            <div className="min-w-0">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#193128] sm:text-xs sm:tracking-[0.16em]">
                Platform
              </h3>

              {renderLinks(platformLinks)}
            </div>

            {/* Topluluk */}
            <div className="min-w-0">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#193128] sm:text-xs sm:tracking-[0.16em]">
                Topluluk
              </h3>

              {renderLinks(communityLinks)}
            </div>

            {/* Şirket */}
            <div className="min-w-0">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#193128] sm:text-xs sm:tracking-[0.16em]">
                Şirket
              </h3>

              {renderLinks(companyLinks)}
            </div>
          </div>

          {/* Alt çizgi ve telif */}
          <div className="mt-10 border-t border-[#DCE8E1] sm:mt-12 lg:mt-14" />

          <div className="flex flex-col items-start gap-3 pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pt-6">
            <p className="text-xs font-light text-[#8FB9A3] sm:text-[13px]">
              © 2026 D-Garden. Tüm hakları saklıdır.
            </p>

            <p className="font-display text-[13px] italic text-[#8FB9A3]">
              &quot;Oku. Düşün. Üret.&quot;
            </p>
          </div>
        </div>
      </section>
    </footer>
  );
}

export default Footer;
