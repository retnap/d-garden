import Link from "next/link";

type BookThought = {
  id: string;
  title: string;
  author: string;
  href: string;
};

type BookCardProps = {
  title: string;
  author: string;
  category: string;
  cover: string;
  description: string;
  /** Bu kitap hakkında paylaşılmış public inceleme ve düşünceler */
  thoughts?: BookThought[];
};

export default function BookCard({
  title,
  author,
  category,
  cover,
  description,
  thoughts,
}: BookCardProps) {
  const [firstThought] = thoughts ?? [];

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#DCE8E1] bg-white transition duration-200 hover:-translate-y-1 hover:shadow-lg motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div className="aspect-[3/4] overflow-hidden bg-[#F4FAF6]">
        <img
          src={cover}
          alt={`${title} kitap kapağı`}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </div>

      <div className="flex flex-1 flex-col p-3">
        <span className="text-xs font-medium text-[#1F5D42]">
          {category}
        </span>

        <h3 className="mt-2 line-clamp-2 font-semibold">
          {title}
        </h3>

        <p className="mt-1 text-sm text-[#65766D]">
          {author}
        </p>

        <p className="mt-3 line-clamp-3 text-xs leading-5 text-[#65766D]">
          {description}
        </p>

        {thoughts && (
          <div className="mt-auto pt-3">
            <div className="border-t border-[#DCE8E1] pt-3">
            <p className="text-xs font-medium text-[#193128]">
              {thoughts.length > 0
                ? `${thoughts.length} okur düşüncesi`
                : "Henüz okur düşüncesi yok"}
            </p>
            {firstThought && (
              <Link
                href={firstThought.href}
                className="mt-1 line-clamp-2 block rounded-sm text-xs leading-5 text-[#1F5D42] underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D42]"
              >
                “{firstThought.title}” · {firstThought.author}
              </Link>
            )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
