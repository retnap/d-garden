"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { SearchX } from "lucide-react";

import BookCard from "@/components/explore/BookCard";
import ReaderArticleCard from "@/components/explore/ReaderArticleCard";
import FeaturedBook from "@/components/explore/FeaturedBook";
import PublicGardenCard from "@/components/explore/PublicGardenCard";
import { EmptyState, Notice } from "@/components/garden/ui";
import { COMMUNITY_BOOKS } from "@/lib/social/demo-data";
import {
    ARTICLE_KIND_LABELS,
    articleHref,
    gardenAnchorId,
    getBook,
    getLatestGardenUpdate,
    getUser,
    getVisibleArticles,
    getVisibleGardens,
    matchesSearch,
} from "@/lib/social/selectors";
import { useSocialSnapshot } from "@/lib/social/store";

const categories = [
    "Tümü",
    "Roman",
    "Bilim",
    "Felsefe",
    "Psikoloji",
    "Tarih",
];

type ContentType = "all" | "articles" | "books" | "gardens";

/** `param`, `/explore?tur=...` değeridir; bildirim bağlantıları da bunu kullanır. */
const contentTypes: { value: ContentType; label: string; param?: string }[] = [
    { value: "all", label: "Tümü" },
    { value: "articles", label: "Yazılar", param: "yazilar" },
    { value: "books", label: "Kitaplar", param: "kitaplar" },
    { value: "gardens", label: "Public Bahçeler", param: "bahceler" },
];

const featuredBook = COMMUNITY_BOOKS[2];

const pillClass = (active: boolean) =>
    `rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D42] ${
        active
            ? "border-[#1F5D42] bg-[#1F5D42] text-white"
            : "border-[#DCE8E1] bg-white text-[#65766D] hover:border-[#1F5D42] hover:text-[#1F5D42]"
    }`;

function SectionHeading({ id, eyebrow, title, description }: { id: string; eyebrow: string; title: string; description: string }) {
    return (
        <div className="mb-6">
            <p className="text-sm font-medium tracking-wide text-[#1F5D42]">{eyebrow}</p>
            <h2 id={id} className="mt-2 font-display text-3xl font-semibold">{title}</h2>
            <p className="mt-3 max-w-2xl leading-7 text-[#65766D]">{description}</p>
        </div>
    );
}

export default function ExploreContent() {
    const searchParams = useSearchParams();
    const typeParam = searchParams.get("tur");
    const contentType = contentTypes.find((t) => t.param === typeParam)?.value ?? "all";

    const snapshot = useSocialSnapshot();
    const published = snapshot?.data.published ?? {};

    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("default");
    const [selectedCategory, setSelectedCategory] = useState("Tümü");

    // Next.js, history.replaceState'i useSearchParams ile senkronlar; sunucuya gidilmez.
    const selectContentType = (value: ContentType) => {
        const param = contentTypes.find((t) => t.value === value)?.param;
        window.history.replaceState(null, "", param ? `/explore?tur=${param}` : "/explore");
    };

    const resetFilters = () => {
        setSearch("");
        setSelectedCategory("Tümü");
    };

    const matchesCategory = (...values: (string | undefined)[]) =>
        selectedCategory === "Tümü" || values.includes(selectedCategory);

    const visibleArticles = getVisibleArticles(published);

    const filteredArticles = visibleArticles.filter((article) => {
        const book = getBook(article.bookId);
        const author = getUser(article.authorId);
        return (
            matchesSearch(
                search,
                article.title,
                article.excerpt,
                author?.displayName,
                book?.title,
                book?.author,
                ARTICLE_KIND_LABELS[article.kind],
            ) && matchesCategory(book?.category)
        );
    });

    const filteredBooks = COMMUNITY_BOOKS.filter(
        (book) =>
            matchesSearch(search, book.title, book.author, book.description) &&
            matchesCategory(book.category),
    ).sort((a, b) => {
        if (sortBy === "title") {
            return a.title.localeCompare(b.title, "tr");
        }

        if (sortBy === "author") {
            return a.author.localeCompare(b.author, "tr");
        }

        return 0;
    });

    const filteredGardens = getVisibleGardens().filter((garden) => {
        const owner = getUser(garden.ownerId);
        const verifiedTitles = garden.verifiedBookIds.map((id) => getBook(id)?.title);
        return (
            matchesSearch(search, owner?.displayName, owner?.username, garden.intro, ...garden.interests, ...verifiedTitles) &&
            matchesCategory(...garden.interests)
        );
    });

    const counts: Record<ContentType, number> = {
        all: filteredArticles.length + filteredBooks.length + filteredGardens.length,
        articles: filteredArticles.length,
        books: filteredBooks.length,
        gardens: filteredGardens.length,
    };

    const show = (type: ContentType) => contentType === "all" || contentType === type;
    const hasFilters = search.trim() !== "" || selectedCategory !== "Tümü";

    const emptyState = (title: string) => (
        <EmptyState
            icon={SearchX}
            title={title}
            description={
                hasFilters
                    ? "Aramanı ya da kategori seçimini değiştirerek yeniden dene."
                    : "Bu alanda henüz paylaşılmış public içerik yok."
            }
            action={
                hasFilters ? (
                    <button
                        type="button"
                        onClick={resetFilters}
                        className="rounded-full border border-[#1F5D42] px-4 py-2 text-sm font-medium text-[#1F5D42] transition-colors hover:bg-[#DDEFE5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D42]"
                    >
                        Filtreleri temizle
                    </button>
                ) : undefined
            }
        />
    );

    return (
        <>
            <Notice tone="demo" title="Örnek içerik" className="mb-8">
                Bu sayfadaki okurlar, yazılar, bahçeler, takip ve bildirimler tanıtım amaçlı örnek verilerdir; gerçek
                kullanıcı içeriği değildir. Takip ve bildirimler yalnızca bu tarayıcıda saklanır.
            </Notice>

            {/* Arama Alanı */}
            <section className="mb-8">
                <label htmlFor="explore-search" className="sr-only">
                    Yazı, kitap, okur veya bahçe ara
                </label>

                <div className="flex items-center gap-3 rounded-2xl border border-[#DCE8E1] bg-[#F4FAF6] px-4 py-3 focus-within:border-[#1F5D42] focus-within:ring-2 focus-within:ring-[#DDEFE5]">
                    <span aria-hidden="true" className="text-xl">
                        ⌕
                    </span>

                    <input
                        id="explore-search"
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Yazı, kitap, okur veya bahçe ara..."
                        className="w-full bg-transparent py-1 text-sm outline-none placeholder:text-[#65766D]"
                    />
                </div>
            </section>

            {/* İçerik Türü */}
            <section className="mb-6">
                <h2 id="content-type-title" className="mb-4 text-sm font-semibold">
                    İçerik türü
                </h2>

                <div role="group" aria-labelledby="content-type-title" className="flex flex-wrap gap-2">
                    {contentTypes.map((type) => (
                        <button
                            key={type.value}
                            type="button"
                            aria-pressed={contentType === type.value}
                            onClick={() => selectContentType(type.value)}
                            className={pillClass(contentType === type.value)}
                        >
                            {type.label}
                            <span className="ml-1.5 tabular-nums opacity-80">
                                <span className="sr-only">, </span>
                                {counts[type.value]}
                                <span className="sr-only"> sonuç</span>
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            {/* Kategori Filtreleri */}
            <section>
                <h2 id="category-title" className="mb-4 text-sm font-semibold">
                    Kategoriler
                </h2>

                <div role="group" aria-labelledby="category-title" className="flex flex-wrap gap-2">
                    {categories.map((category) =>
                        <button
                            key={category}
                            type="button"
                            aria-pressed={selectedCategory === category}
                            onClick={() => setSelectedCategory(category)}
                            className={pillClass(selectedCategory === category)}
                        >
                            {category}
                        </button>
                    )}
                </div>
            </section>

            <p role="status" aria-live="polite" className="sr-only">
                {contentTypes.find((t) => t.value === contentType)?.label}: {counts[contentType]} sonuç
            </p>

            {/* Öne çıkan kitap */}
            {contentType === "all" && !hasFilters && (
                <FeaturedBook
                    title={featuredBook.title}
                    author={featuredBook.author}
                    category={featuredBook.category}
                    cover={featuredBook.cover}
                    description={featuredBook.description}
                />
            )}

            {contentType === "all" && hasFilters && counts.all === 0 && (
                <div className="mt-12">{emptyState("Aramana uygun içerik bulunamadı")}</div>
            )}

            {/* Okur yazıları */}
            {show("articles") && (contentType === "articles" || filteredArticles.length > 0) && (
                <section className="mt-14" aria-labelledby="articles-title">
                    <SectionHeading
                        id="articles-title"
                        eyebrow="OKUYUCU TOPLULUĞU"
                        title="Okurlar ne yazıyor?"
                        description="Blog yazıları, kitap incelemeleri ve kitaplar üzerine kişisel düşünceler."
                    />

                    {filteredArticles.length > 0 ? (
                        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                            {filteredArticles.map((article) => {
                                const book = getBook(article.bookId);
                                return (
                                    <ReaderArticleCard
                                        key={article.id}
                                        href={articleHref(article.id)}
                                        title={article.title}
                                        authorId={article.authorId}
                                        author={getUser(article.authorId)?.displayName ?? ""}
                                        kindLabel={ARTICLE_KIND_LABELS[article.kind]}
                                        excerpt={article.excerpt}
                                        readTime={article.readTime}
                                        publishedAt={article.publishedAt}
                                        bookTitle={book?.title}
                                        bookAuthor={book?.author}
                                        isSimulated={article.isSimulated}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        emptyState("Yazı bulunamadı")
                    )}
                </section>
            )}

            {/* Kitaplar ve okur düşünceleri */}
            {show("books") && (contentType === "books" || filteredBooks.length > 0) && (
                <section className="mt-16" aria-labelledby="books-title">
                    <SectionHeading
                        id="books-title"
                        eyebrow="KİTAPLAR"
                        title="Kitaplar ve okur düşünceleri"
                        description="Okuma yolculuğuna ilham verecek eserler ve onlar hakkında paylaşılmış düşünceler."
                    />

                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm text-[#65766D]">
                            {filteredBooks.length} kitap bulundu
                        </p>

                        <div className="flex items-center gap-2">
                            <label htmlFor="book-sort" className="text-sm text-[#65766D]">
                                Sırala:
                            </label>

                            <select
                                id="book-sort"
                                value={sortBy}
                                onChange={(event) => setSortBy(event.target.value)}
                                className="rounded-xl border border-[#DCE8E1] bg-white px-3 py-2 text-sm text-[#193128] outline-none focus:border-[#1F5D42] focus-visible:ring-2 focus-visible:ring-[#DDEFE5]"
                            >
                                <option value="default">Varsayılan</option>
                                <option value="title">Kitap adına göre A-Z</option>
                                <option value="author">Yazara göre A-Z</option>
                            </select>
                        </div>
                    </div>

                    {filteredBooks.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                            {filteredBooks.map((book) => (
                                <BookCard
                                    key={book.id}
                                    title={book.title}
                                    author={book.author}
                                    category={book.category}
                                    cover={book.cover}
                                    description={book.description}
                                    thoughts={visibleArticles
                                        .filter((article) => article.bookId === book.id)
                                        .map((article) => ({
                                            id: article.id,
                                            title: article.title,
                                            author: getUser(article.authorId)?.displayName ?? "",
                                            href: articleHref(article.id),
                                        }))}
                                />
                            ))}
                        </div>
                    ) : (
                        emptyState("Aramana uygun kitap bulunamadı")
                    )}
                </section>
            )}

            {/* Public bahçeler */}
            {show("gardens") && (contentType === "gardens" || filteredGardens.length > 0) && (
                <section className="mt-16" aria-labelledby="gardens-title">
                    <SectionHeading
                        id="gardens-title"
                        eyebrow="PUBLIC BAHÇELER"
                        title="Bahçeleri keşfet"
                        description="Bahçesini herkese açık paylaşmayı seçen okurlar. Özel bahçeler burada görünmez."
                    />

                    {filteredGardens.length > 0 ? (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredGardens.map((garden) => {
                                const owner = getUser(garden.ownerId)!;
                                return (
                                    <PublicGardenCard
                                        key={garden.ownerId}
                                        anchorId={gardenAnchorId(garden.ownerId)}
                                        ownerId={garden.ownerId}
                                        ownerName={owner.displayName}
                                        username={owner.username}
                                        image={owner.image}
                                        avatarColor={owner.avatarColor}
                                        intro={garden.intro}
                                        growth={garden.growth}
                                        completedBooks={garden.completedBooks}
                                        readingNow={garden.readingNow}
                                        verifiedBooks={garden.verifiedBookIds
                                            .map((id) => getBook(id)?.title)
                                            .filter((title): title is string => !!title)}
                                        interests={garden.interests}
                                        latestUpdate={getLatestGardenUpdate(garden.ownerId, published)}
                                    />
                                );
                            })}
                        </div>
                    ) : (
                        emptyState("Public bahçe bulunamadı")
                    )}
                </section>
            )}
        </>
    );
}
