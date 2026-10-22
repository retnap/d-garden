import type { Metadata } from 'next';
import Link from 'next/link';
import { Sprout } from 'lucide-react';

export const metadata: Metadata = { title: 'Sayfa bulunamadı' };

export default function NotFound() {
  return (
    <main className="flex min-h-[70dvh] items-center justify-center bg-mist px-4 py-16 text-ink">
      <div className="flex max-w-md flex-col items-center text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-mint text-forest">
          <Sprout size={28} aria-hidden="true" />
        </span>
        <p className="mt-6 text-sm font-semibold tracking-widest text-forest">404</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl">Bu sayfa henüz filizlenmedi</h1>
        <p className="mt-3 text-sm leading-6 text-ink-light">
          Aradığın sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-xl bg-forest px-5 text-sm font-semibold text-white hover:bg-forest-deep"
          >
            Ana sayfa
          </Link>
          <Link
            href="/garden"
            className="inline-flex min-h-11 items-center rounded-xl border border-line bg-white px-5 text-sm font-semibold text-forest hover:bg-mist"
          >
            Bahçeme git
          </Link>
        </div>
      </div>
    </main>
  );
}
