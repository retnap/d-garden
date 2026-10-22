type FeaturedBookProps = {
  title: string;
  author: string;
  category: string;
  cover: string;
  description: string;
};

export default function FeaturedBook({
  title,
  author,
  category,
  cover,
  description,
}: FeaturedBookProps) {
  return (
    <section className="mt-16 mb-20 overflow-hidden rounded-3xl bg-[#153D2D] text-white">
      <div className="grid md:grid-cols-[1fr_1.2fr]">
        <div className="flex items-center justify-center bg-white/5 p-8 sm:p-12">
          <div className="w-40 overflow-hidden rounded-xl shadow-2xl sm:w-48">
            <img
              src={cover}
              alt={`${title} kitap kapağı`}
              className="aspect-[3/4] w-full object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-14">
          <span className="text-xs font-semibold tracking-[0.2em] text-[#8FB9A3]">
            ÖNE ÇIKAN KİTAP
          </span>

          <h2 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">
            {title}
          </h2>

          <p className="mt-3 text-sm text-[#DDEFE5]">
            {author}
          </p>

          <p className="mt-5 max-w-lg text-sm leading-7 text-white/75">
            {description}
          </p>

          <span className="mt-6 w-fit rounded-full border border-white/20 px-4 py-2 text-xs text-[#DDEFE5]">
            {category}
          </span>
        </div>
      </div>
    </section>
  );
}
