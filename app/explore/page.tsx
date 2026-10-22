import type { Metadata } from "next";
import { Suspense } from "react";

import ExploreContent from "@/components/explore/ExploreContent";
import NotificationInbox from "@/components/explore/NotificationInbox";

export const metadata: Metadata = {
    title: "Keşfet",
    description: "Okur yazılarını, kitapları ve public bahçeleri keşfet.",
};

// İçerik türü filtresi URL'den (?tur=) okunduğu için ExploreContent bir Suspense sınırı içinde olmalı.
function ExploreFallback() {
    return (
        <div role="status" aria-live="polite" className="space-y-4">
            <span className="sr-only">Keşfet içerikleri yükleniyor…</span>
            <div aria-hidden="true" className="h-14 animate-pulse rounded-2xl bg-[#F4FAF6] motion-reduce:animate-none" />
            <div aria-hidden="true" className="h-10 w-2/3 animate-pulse rounded-full bg-[#F4FAF6] motion-reduce:animate-none" />
            <div aria-hidden="true" className="h-72 animate-pulse rounded-3xl bg-[#F4FAF6] motion-reduce:animate-none" />
        </div>
    );
}

export default function ExplorePage() {
    return (
        <main className="min-h-screen bg-white px-5 pt-24 pb-10 text-[#193128] sm:px-8 lg:px-12">
            <div className="mx-auto max-w-7xl">
                {/* Sayfa Başlığı */}
                <section className="mb-10 flex flex-wrap items-end justify-between gap-6">
                    <div>
                        <p className="mb-3 text-sm font-medium tracking-wide text-[#1F5D42]">
                            OKU · DÜŞÜN · ÜRET
                        </p>

                        <h1 className="font-display text-4xl font-semibold sm:text-5xl">
                            Keşfet
                        </h1>

                        <p className="mt-4 max-w-2xl leading-7 text-[#65766D]">
                            Okurların yazılarını oku, kitaplar hakkındaki düşünceleri keşfet ve herkese açık bahçelere göz at.
                        </p>
                    </div>

                    <NotificationInbox />
                </section>

                <Suspense fallback={<ExploreFallback />}>
                    <ExploreContent />
                </Suspense>
            </div>
        </main>
    );
}
