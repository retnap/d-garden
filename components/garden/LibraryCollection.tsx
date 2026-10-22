'use client';

import { useState, type ReactNode } from 'react';
import { ArrowUpDown, ChevronDown, Search, SearchX, SlidersHorizontal, Tags } from 'lucide-react';
import { BOOK_SORT_LABELS, READING_STATUS_LABELS, READING_STATUS_ORDER } from '@/lib/garden/constants';
import { filterBooks, getCategories, type BookFilters } from '@/lib/garden/selectors';
import { useGarden } from '@/lib/garden/store';
import type { BookSort, LibraryBook } from '@/lib/garden/types';
import BookCard from './BookCard';
import { EmptyState, buttonStyles, cn, inputStyles, selectStyles } from './ui';

type LibraryCollectionProps = {
  /** Gösterilecek kitaplar; liste her zaman store'dan türetilmiş olmalı */
  books: LibraryBook[];
  title?: string;
  description?: string;
  showStatusFilter?: boolean;
  /** Hiç kitap yokken (filtreden bağımsız) gösterilecek boş durum */
  empty: ReactNode;
  renderItem?: (book: LibraryBook) => ReactNode;
  layout?: 'grid' | 'list';
};

function SelectWithIcon({
  icon: Icon,
  label,
  value,
  onChange,
  children,
}: {
  icon: typeof Search;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative min-w-0">
      <Icon size={16} aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-light" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className={cn(selectStyles, 'pl-9')}
      >
        {children}
      </select>
      <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-light" />
    </div>
  );
}

export default function LibraryCollection({
  books,
  title,
  description,
  showStatusFilter = false,
  empty,
  renderItem,
  layout = 'grid',
}: LibraryCollectionProps) {
  const { preferences } = useGarden();
  const [filters, setFilters] = useState<BookFilters>({
    query: '',
    status: 'all',
    category: 'all',
    sort: preferences.librarySort,
  });
  const set = <K extends keyof BookFilters>(key: K, value: BookFilters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const categories = getCategories(books);
  const visible = filterBooks(books, filters);
  const isFiltered = filters.query.trim() !== '' || filters.status !== 'all' || filters.category !== 'all';

  return (
    <section aria-label={title ?? 'Kitaplar'} className="rounded-3xl border border-line bg-white p-4 sm:p-7">
      {title && (
        <div className="mb-5">
          <h2 className="font-display text-2xl text-ink">{title}</h2>
          {description && <p className="mt-1.5 text-sm leading-6 text-ink-light">{description}</p>}
        </div>
      )}

      {books.length === 0 ? (
        empty
      ) : (
        <>
          <div
            className={cn(
              'grid grid-cols-1 gap-3 sm:grid-cols-2',
              showStatusFilter ? 'lg:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]' : 'lg:grid-cols-[minmax(0,2fr)_repeat(2,minmax(0,1fr))]',
            )}
          >
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search size={18} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-light" />
              <input
                type="search"
                value={filters.query}
                onChange={(e) => set('query', e.target.value)}
                placeholder="Kitap adı veya yazar ara…"
                aria-label="Kitap adı veya yazara göre ara"
                className={cn(inputStyles, 'bg-mist pl-11')}
              />
            </div>

            {showStatusFilter && (
              <SelectWithIcon
                icon={SlidersHorizontal}
                label="Okuma durumuna göre filtrele"
                value={filters.status}
                onChange={(v) => set('status', v as BookFilters['status'])}
              >
                <option value="all">Tüm durumlar</option>
                {READING_STATUS_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {READING_STATUS_LABELS[s]}
                  </option>
                ))}
              </SelectWithIcon>
            )}

            <SelectWithIcon icon={Tags} label="Kategoriye göre filtrele" value={filters.category} onChange={(v) => set('category', v)}>
              <option value="all">Tüm kategoriler</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectWithIcon>

            <SelectWithIcon icon={ArrowUpDown} label="Sırala" value={filters.sort} onChange={(v) => set('sort', v as BookSort)}>
              {(Object.keys(BOOK_SORT_LABELS) as BookSort[]).map((s) => (
                <option key={s} value={s}>
                  {BOOK_SORT_LABELS[s]}
                </option>
              ))}
            </SelectWithIcon>
          </div>

          <p aria-live="polite" className="mt-4 text-xs text-ink-light">
            {visible.length === books.length
              ? `${books.length} kitap`
              : `${books.length} kitaptan ${visible.length} tanesi gösteriliyor`}
          </p>

          {visible.length === 0 ? (
            <EmptyState
              className="mt-4"
              icon={SearchX}
              title="Aramana uygun kitap bulunamadı"
              description="Farklı bir kelime dene ya da filtreleri temizle."
              action={
                isFiltered && (
                  <button
                    type="button"
                    className={buttonStyles({ variant: 'secondary' })}
                    onClick={() => setFilters((f) => ({ ...f, query: '', status: 'all', category: 'all' }))}
                  >
                    Filtreleri temizle
                  </button>
                )
              }
            />
          ) : layout === 'grid' ? (
            <ul className="mt-4 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {visible.map((book) => (
                <li key={book.id} className="flex">
                  <div className="flex w-full flex-col [&>article]:flex-1">{renderItem ? renderItem(book) : <BookCard book={book} />}</div>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="mt-4 space-y-3">
              {visible.map((book) => (
                <li key={book.id}>{renderItem ? renderItem(book) : <BookCard book={book} />}</li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
