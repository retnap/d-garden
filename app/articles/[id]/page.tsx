"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import FollowButton from "@/components/explore/FollowButton";
import { DemoBadge, formatDate } from "@/components/garden/ui";
import {
  ARTICLE_KIND_LABELS,
  articleHref,
  getBook,
  getUser,
  getVisibleArticle,
  getVisibleArticles,
} from "@/lib/social/selectors";
import { useSocialSnapshot } from "@/lib/social/store";

export default function ArticleDetailPage() {
    const { id } = useParams<{ id: string }>();
    const snapshot = useSocialSnapshot();
    const published = snapshot?.data.published ?? {};

    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [likeCount, setLikeCount] = useState(24);

    // Gizli içerikler ve private profiller burada da görünmez (bkz. lib/social/selectors).
    const article = getVisibleArticle(id, published);
    const author = article && getUser(article.authorId);
    const book = getBook(article?.bookId);
    const otherArticles = article
      ? getVisibleArticles(published)
          .filter((a) => a.authorId === article.authorId && a.id !== article.id)
          .slice(0, 2)
      : [];

    if (!article || !author) {
      return (
        <main className="min-h-screen bg-white px-5 pt-24 pb-10 text-[#193128] sm:px-8">
          <div className="mx-auto max-w-4xl" role={snapshot ? undefined : "status"}>
            {snapshot ? (
              <>
                <h1 className="font-display text-3xl font-semibold">Yazı bulunamadı</h1>
                <p className="mt-3 leading-7 text-[#65766D]">
                  Bu yazı kaldırılmış, gizli olarak ayarlanmış ya da hiç yayımlanmamış olabilir.
                </p>
                <Link
                  href="/explore?tur=yazilar"
                  className="mt-6 inline-flex rounded-full bg-[#1F5D42] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#153D2D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D42]"
                >
                  Keşfet&apos;e dön
                </Link>
              </>
            ) : (
              <p className="text-[#65766D]">Yazı yükleniyor…</p>
            )}
          </div>
        </main>
      );
    }

  return (
    <main className="min-h-screen bg-white px-5 pt-24 pb-10 text-[#193128] sm:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Yazı başlığı */}
        <header>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium tracking-wide text-[#1F5D42]">
              {ARTICLE_KIND_LABELS[article.kind].toLocaleUpperCase("tr-TR")}
            </p>
            <DemoBadge>Örnek içerik</DemoBadge>
          </div>

          <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            {article.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#65766D]">
            <span>{author.displayName}</span>
            <FollowButton userId={author.id} />
            <span aria-hidden="true">·</span>
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            <span>{article.readTime} dk okuma</span>
          </div>
        </header>

        {/* İlişkili kitap */}
        {book && (
        <section className="mt-10 flex items-center gap-4 rounded-2xl border border-[#DCE8E1] bg-[#F4FAF6] p-4 sm:p-5">
          <img
            src={book.cover}
            alt={`${book.title} kitap kapağı`}
            className="h-24 w-16 rounded-lg object-cover"
          />

          <div>
            <p className="text-xs font-medium text-[#65766D]">
              YAZININ İLİŞKİLİ OLDUĞU KİTAP
            </p>

            <h2 className="mt-2 font-semibold">
              {book.title}
            </h2>

            <p className="mt-1 text-sm text-[#65766D]">
              {book.author}
            </p>
          </div>
        </section>
        )}

        {/* Yazar bilgisi */}
        <section className="mt-10 flex items-start gap-4">
          <div
            aria-hidden="true"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#DDEFE5] font-semibold text-[#1F5D42]"
          >
            {author.displayName.charAt(0)}
          </div>

          <div>
            <p className="font-semibold">{author.displayName}</p>
            <p className="mt-1 text-sm leading-6 text-[#65766D]">
              {author.bio}
            </p>
          </div>
        </section>

        {/* Yazı içeriği */}
        <article className="mt-10 border-t border-[#DCE8E1] pt-8">
          <div className="space-y-6 text-base leading-8 text-[#3D5147] sm:text-lg sm:leading-9">
            {article.content.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </article>


        {/* Yazı etkileşimleri */}
        <section className="mt-10 flex flex-wrap items-center justify-between gap-4 border-y border-[#DCE8E1] py-5">
            <div className="flex flex-wrap gap-3">
                <button
                type="button"
                aria-pressed={isLiked}
                onClick={() => {
                    setIsLiked((previous) => !previous);
                    setLikeCount((count) => count + (isLiked ? -1 : 1));
                }}
                className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${
                    isLiked
                    ? "border-[#1F5D42] bg-[#DDEFE5] text-[#1F5D42]"
                    : "border-[#DCE8E1] text-[#65766D] hover:bg-[#F4FAF6]"
                }`}
                >
                {isLiked ? "♥ Beğendin" : "♡ Beğen"} · {likeCount}
                </button>

                <button
                type="button"
                aria-pressed={isSaved}
                onClick={() => setIsSaved((previous) => !previous)}
                className={`rounded-full border px-5 py-2.5 text-sm font-medium transition ${
                    isSaved
                    ? "border-[#1F5D42] bg-[#DDEFE5] text-[#1F5D42]"
                    : "border-[#DCE8E1] text-[#65766D] hover:bg-[#F4FAF6]"
                }`}
                >
                {isSaved ? "✓ Kaydedildi" : "Yazıyı kaydet"}
                </button>
            </div>

            <p className="text-sm text-[#65766D]">
                Düşüncelerini paylaş, yeni bakış açıları keşfet.
            </p>
        </section>


        {/* Yazarın diğer yazıları */}
        {otherArticles.length > 0 && (
        <section className="mt-16">
            <p className="text-sm font-medium tracking-wide text-[#1F5D42]">
                OKUMAYA DEVAM ET
            </p>

            <h2 className="mt-2 font-display text-3xl font-semibold">
                Yazarın dünyasını keşfet
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {otherArticles.map((other) => (
                <div key={other.id} className="rounded-2xl border border-[#DCE8E1] bg-[#F4FAF6] p-6">
                    <h3 className="text-lg font-semibold">
                      <Link
                        href={articleHref(other.id)}
                        className="rounded-sm hover:text-[#1F5D42] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D42]"
                      >
                        {other.title}
                      </Link>
                    </h3>

                    <p className="mt-3 text-sm leading-7 text-[#65766D]">
                    {other.excerpt}
                    </p>

                    <p className="mt-4 text-xs text-[#65766D]">
                    {author.displayName} · {other.readTime} dk okuma
                    </p>
                </div>
              ))}
            </div>
        </section>
        )}

      </div>
    </main>
  );
}
