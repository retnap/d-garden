"use client";

import { useState } from "react";

type Book = {
  id: number;
  title: string;
  author: string;
  category: string;
  cover: string;
  description: string;
  publishedYear: number;
  pageCount: number;
  language: string;
};

const book: Book = {
  id: 1,
  title: "Suç ve Ceza",
  author: "Fyodor Dostoyevski",
  category: "Roman",
  cover: "https://covers.openlibrary.org/b/isbn/9780140449136-L.jpg",
  description:
    "Yoksul bir öğrenci olan Raskolnikov'un işlediği suçun ardından yaşadığı vicdan azabı, iç çatışmalar ve ahlaki sorgulamalar üzerinden insan psikolojisini ele alan klasik bir eser.",
  publishedYear: 1866,
  pageCount: 671,
  language: "Türkçe",
};


export default function BookDetailPage() {
    const [isInReadingList, setIsInReadingList] = useState(false);
    const [isRead, setIsRead] = useState(false);

  return (
    <main className="min-h-screen bg-white px-5 py-10 text-[#193128] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <p className="mb-8 text-sm text-[#65766D]">
          Keşfet / Kitaplar / {book.title}
        </p>

        <section className="grid gap-10 md:grid-cols-[280px_1fr] lg:grid-cols-[340px_1fr] lg:gap-16">
          {/* Kitap kapağı */}
          <div className="mx-auto w-full max-w-[280px]">
            <div className="overflow-hidden rounded-2xl bg-[#F4FAF6] shadow-lg">
              <img
                src={book.cover}
                alt={`${book.title} kitap kapağı`}
                className="aspect-[3/4] w-full object-cover"
              />
            </div>
          </div>

          {/* Kitap bilgileri */}
          <div className="flex flex-col justify-center">
            <span className="w-fit rounded-full bg-[#DDEFE5] px-3 py-1 text-sm font-medium text-[#1F5D42]">
              {book.category}
            </span>

            <h1 className="mt-5 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              {book.title}
            </h1>

            <p className="mt-4 text-lg text-[#65766D]">
              {book.author}
            </p>

            <p className="mt-6 max-w-2xl text-base leading-8 text-[#65766D]">
              {book.description}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 border-y border-[#DCE8E1] py-5 sm:grid-cols-3">
              <div>
                <p className="text-xs text-[#65766D]">Yayın yılı</p>
                <p className="mt-1 font-semibold">{book.publishedYear}</p>
              </div>

              <div>
                <p className="text-xs text-[#65766D]">Sayfa sayısı</p>
                <p className="mt-1 font-semibold">{book.pageCount}</p>
              </div>

              <div>
                <p className="text-xs text-[#65766D]">Dil</p>
                <p className="mt-1 font-semibold">{book.language}</p>
              </div>
            </div>

            {/* Eylemler sonraki adımda eklenecek */}
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsInReadingList((previous) => !previous)}
                className={`rounded-full px-6 py-3 text-sm font-medium transition ${
                    isInReadingList
                    ? "border border-[#1F5D42] bg-[#DDEFE5] text-[#1F5D42]"
                    : "bg-[#1F5D42] text-white hover:bg-[#153D2D]"
                }`}
                >
                {isInReadingList ? "✓ Okuma listemde" : "Okuma listeme ekle"}
              </button>

              <button
                type="button"
                onClick={() => setIsRead((previous) => !previous)}
                aria-pressed={isRead}
                className={`rounded-full border px-6 py-3 text-sm font-medium transition ${
                    isRead
                    ? "border-[#1F5D42] bg-[#DDEFE5] text-[#1F5D42]"
                    : "border-[#DCE8E1] text-[#1F5D42] hover:bg-[#F4FAF6]"
                }`}
                >
                {isRead ? "✓ Okundu" : "Okudum"}
              </button>
            </div>
          </div>
        </section>


        {/* Okuyucu yazıları */}
        <section className="mt-20 border-t border-[#DCE8E1] pt-12">
        <div className="mb-8">
            <p className="text-sm font-medium tracking-wide text-[#1F5D42]">
            OKUYUCU TOPLULUĞU
            </p>

            <h2 className="mt-2 font-display text-3xl font-semibold">
            Bu kitap hakkında ne düşünüyorlar?
            </h2>

            <p className="mt-3 max-w-2xl leading-7 text-[#65766D]">
            Farklı okuyucuların yorumlarını ve kitaptan çıkardıkları
            anlamları keşfet.
            </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
            <article className="rounded-2xl border border-[#DCE8E1] bg-[#F4FAF6] p-6">
            <span className="rounded-full bg-[#DDEFE5] px-3 py-1 text-xs font-medium text-[#1F5D42]">
                Karakter Analizi
            </span>

            <h3 className="mt-4 text-lg font-semibold">
                Raskolnikov&apos;un vicdanıyla yüzleşmesi
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#65766D]">
                Bir insan kendi doğrularını toplumun kurallarının
                üstünde gördüğünde, vicdanından gerçekten kaçabilir mi?
            </p>

            <div className="mt-5 border-t border-[#DCE8E1] pt-4">
                <p className="text-sm font-medium">Deniz Yılmaz</p>
                <p className="mt-1 text-xs text-[#65766D]">
                5 dk okuma
                </p>
            </div>
            </article>

            <article className="rounded-2xl border border-[#DCE8E1] bg-[#F4FAF6] p-6">
            <span className="rounded-full bg-[#DDEFE5] px-3 py-1 text-xs font-medium text-[#1F5D42]">
                Kişisel Yorum
            </span>

            <h3 className="mt-4 text-lg font-semibold">
                Suç, ceza ve insan doğası
            </h3>

            <p className="mt-3 text-sm leading-7 text-[#65766D]">
                Dostoyevski, insanın kendi içinde verdiği mücadeleyi
                ve ahlaki sınırların anlamını sorgulamamızı sağlıyor.
            </p>

            <div className="mt-5 border-t border-[#DCE8E1] pt-4">
                <p className="text-sm font-medium">Ece Demir</p>
                <p className="mt-1 text-xs text-[#65766D]">
                4 dk okuma
                </p>
            </div>
            </article>
        </div>
        </section>

        {/* Benzer kitaplar */}
        <section className="mt-20 border-t border-[#DCE8E1] pt-12">
        <div className="mb-8">
            <p className="text-sm font-medium tracking-wide text-[#1F5D42]">
            KEŞFETMEYE DEVAM ET
            </p>

            <h2 className="mt-2 font-display text-3xl font-semibold">
            Benzer kitaplar
            </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[
            {
                id: 2,
                title: "Kürk Mantolu Madonna",
                author: "Sabahattin Ali",
                cover: "https://covers.openlibrary.org/b/isbn/9789753638029-L.jpg",
            },
            {
                id: 3,
                title: "İnsanın Anlam Arayışı",
                author: "Viktor E. Frankl",
                cover: "https://covers.openlibrary.org/b/isbn/9780807014271-L.jpg",
            },
            {
                id: 4,
                title: "Küçük Prens",
                author: "Antoine de Saint-Exupéry",
                cover: "https://covers.openlibrary.org/b/isbn/9780156012195-L.jpg",
            },
            {
                id: 5,
                title: "Devlet",
                author: "Platon",
                cover: "https://covers.openlibrary.org/b/isbn/9780140449143-L.jpg",
            },
            ].map((relatedBook) => (
            <article
                key={relatedBook.id}
                className="group overflow-hidden rounded-2xl border border-[#DCE8E1] bg-white transition hover:-translate-y-1 hover:shadow-lg"
            >
                <div className="aspect-[3/4] overflow-hidden bg-[#F4FAF6]">
                <img
                    src={relatedBook.cover}
                    alt={`${relatedBook.title} kitap kapağı`}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                />
                </div>

                <div className="p-4">
                <h3 className="font-semibold leading-6">
                    {relatedBook.title}
                </h3>

                <p className="mt-2 text-sm text-[#65766D]">
                    {relatedBook.author}
                </p>
                </div>
            </article>
            ))}
        </div>
        </section>

      </div>
    </main>
  );
}

