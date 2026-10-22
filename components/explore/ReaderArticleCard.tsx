import Link from "next/link";
import { BookOpen } from "lucide-react";
import FollowButton from "@/components/explore/FollowButton";
import { DemoBadge, formatDate } from "@/components/garden/ui";

type ReaderArticleCardProps = {
  href: string;
  title: string;
  authorId: string;
  author: string;
  /** İçerik türü etiketi: Blog yazısı, Kitap incelemesi, Okur düşüncesi */
  kindLabel: string;
  excerpt: string;
  readTime: number;
  publishedAt: string;
  bookTitle?: string;
  bookAuthor?: string;
  /** Bildirim simülasyonuyla bu tarayıcıda yayımlanmış sayıldı */
  isSimulated?: boolean;
};

export default function ReaderArticleCard({
  href,
  title,
  authorId,
  author,
  kindLabel,
  excerpt,
  readTime,
  publishedAt,
  bookTitle,
  bookAuthor,
  isSimulated,
}: ReaderArticleCardProps) {
  return (
    <article className="flex flex-col rounded-2xl border border-[#DCE8E1] bg-[#F4FAF6] p-5 transition hover:-translate-y-1 hover:shadow-md motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-fit rounded-full bg-[#DDEFE5] px-3 py-1 text-xs font-medium text-[#1F5D42]">
          {kindLabel}
        </span>
        <DemoBadge>{isSimulated ? "Örnek · simüle edildi" : "Örnek"}</DemoBadge>
      </div>

      <h3 className="mt-4 text-lg font-semibold leading-7">
        <Link
          href={href}
          className="rounded-sm transition-colors hover:text-[#1F5D42] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D42]"
        >
          {title}
        </Link>
      </h3>

      <p className="mt-3 flex-1 text-sm leading-6 text-[#65766D]">
        {excerpt}
      </p>

      {bookTitle && (
        <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#65766D]">
          <BookOpen size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-[#1F5D42]" />
          <span>
            <span className="sr-only">İlişkili kitap: </span>
            <span className="font-medium text-[#193128]">{bookTitle}</span>
            {bookAuthor && ` · ${bookAuthor}`}
          </span>
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#DCE8E1] pt-4">
        <div className="min-w-0">
          <p className="text-sm font-medium">{author}</p>
          <p className="mt-1 text-xs text-[#65766D]">
            <time dateTime={publishedAt}>{formatDate(publishedAt)}</time> · {readTime} dk okuma
          </p>
        </div>

        <FollowButton userId={authorId} />
      </div>
    </article>
  );
}
