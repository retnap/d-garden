/* eslint-disable @next/next/no-img-element */
import { CircleCheckBig } from "lucide-react";
import FollowButton from "@/components/explore/FollowButton";
import { DemoBadge, formatDate } from "@/components/garden/ui";

type PublicGardenCardProps = {
  anchorId: string;
  ownerId: string;
  ownerName: string;
  username: string;
  image?: string;
  avatarColor: string;
  intro: string;
  growth: number;
  completedBooks: number;
  readingNow: number;
  verifiedBooks: string[];
  interests: string[];
  latestUpdate?: { text: string; publishedAt: string };
};

/** Homepage'deki "Bahçeleri Keşfet" kartının Keşfet sayfasındaki karşılığı. */
export default function PublicGardenCard({
  anchorId,
  ownerId,
  ownerName,
  username,
  image,
  avatarColor,
  intro,
  growth,
  completedBooks,
  readingNow,
  verifiedBooks,
  interests,
  latestUpdate,
}: PublicGardenCardProps) {
  const hintId = `${anchorId}-hint`;

  return (
    <article
      id={anchorId}
      className="flex min-w-0 scroll-mt-24 flex-col overflow-hidden rounded-2xl border border-[#DCE8E1] bg-[#F4FAF6] target:ring-2 target:ring-[#8FB9A3]"
    >
      {/* Sahip */}
      <div className="flex min-w-0 items-center justify-between gap-3 border-b border-[#DCE8E1] bg-[#EEF6F1] px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          {image ? (
            <img src={image} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: avatarColor }}
            >
              {ownerName.charAt(0)}
            </span>
          )}
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold sm:text-base">{ownerName}</h3>
            <p className="mt-0.5 truncate text-xs text-[#65766D]">@{username}</p>
          </div>
        </div>
        <FollowButton userId={ownerId} />
      </div>

      <div className="flex flex-1 flex-col bg-[#FAFDFB] px-4 py-5 sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#DDEFE5] px-3 py-1 text-xs font-medium text-[#1F5D42]">
            Public bahçe
          </span>
          <DemoBadge />
        </div>

        <p className="mt-4 text-sm leading-6 text-[#65766D]">{intro}</p>

        {/* Okuma ilerlemesi */}
        <div className="mt-5">
          <div className="flex items-center justify-between gap-3 text-[13px]">
            <span className="text-[#65766D]">Bahçe büyümesi</span>
            <span className="font-medium text-[#1F5D42]">%{growth}</span>
          </div>
          <div
            className="mt-2 h-[6px] w-full overflow-hidden rounded-full bg-[#DDEFE5]"
            role="progressbar"
            aria-label={`${ownerName} bahçe büyümesi`}
            aria-valuenow={growth}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="h-full rounded-full bg-[#1F5D42]" style={{ width: `${growth}%` }} />
          </div>
          <p className="mt-2 text-xs text-[#65766D]">
            {completedBooks} kitap tamamlandı · {readingNow} kitap okunuyor
          </p>
        </div>

        {/* Doğrulanmış kitaplar */}
        {verifiedBooks.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-medium text-[#193128]">Özeti doğrulanmış kitaplardan</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {verifiedBooks.map((title) => (
                <li
                  key={title}
                  className="inline-flex items-center gap-1 rounded-full border border-[#BFDCCB] bg-[#EAF5EE] px-2.5 py-1 text-xs text-[#1F5D42]"
                >
                  <CircleCheckBig size={12} aria-hidden="true" />
                  {title}
                </li>
              ))}
            </ul>
          </div>
        )}

        {latestUpdate && (
          <p className="mt-5 rounded-xl border border-[#DCE8E1] bg-white px-3 py-2.5 text-xs leading-5 text-[#65766D]">
            <span className="font-medium text-[#193128]">Son güncelleme: </span>
            {latestUpdate.text}{" "}
            <time dateTime={latestUpdate.publishedAt}>({formatDate(latestUpdate.publishedAt)})</time>
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {interests.map((interest) => (
            <span
              key={interest}
              className="rounded-full border border-[#DCE8E1] bg-white px-2.5 py-1 text-[11px] text-[#65766D]"
            >
              {interest}
            </span>
          ))}
        </div>

        {/* Public bahçe ve profil rotaları henüz yok; bağlantılar pasif gösterilir */}
        <div className="mt-auto pt-5">
          <div className="flex flex-wrap gap-2 border-t border-[#DCE8E1] pt-4">
            <button
              type="button"
              disabled
              aria-describedby={hintId}
              className="rounded-full border border-[#DCE8E1] px-4 py-2 text-xs font-medium text-[#65766D] disabled:cursor-not-allowed"
            >
              Bahçeyi gör
            </button>
            <button
              type="button"
              disabled
              aria-describedby={hintId}
              className="rounded-full border border-[#DCE8E1] px-4 py-2 text-xs font-medium text-[#65766D] disabled:cursor-not-allowed"
            >
              Profili gör
            </button>
          </div>
          <p id={hintId} className="mt-2 text-[11px] leading-4 text-[#65766D]">
            Public bahçe ve profil sayfaları henüz hazır değil.
          </p>
        </div>
      </div>
    </article>
  );
}
