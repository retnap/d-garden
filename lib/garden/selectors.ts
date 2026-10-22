/**
 * Bütün sayaçlar, filtreler ve türetilmiş veriler buradan hesaplanır.
 * Dashboard, istatistikler, başarılar ve listeler aynı fonksiyonları kullanır ki
 * aynı metrik farklı ekranlarda farklı çıkmasın.
 */
import { getStage, STAGES } from '@/lib/garden-tree';
import type { SummaryState } from './constants';
import type { BookSort, GardenData, LibraryBook, ReadingStatus, Work } from './types';

export function getSummaryState(book: LibraryBook): SummaryState {
  return book.summary?.status ?? 'none';
}

/** Ağacı büyüten tek kural: tamamlanmış kitap + doğrulanmış özet. */
export function isVerified(book: LibraryBook): boolean {
  return book.status === 'completed' && book.summary?.status === 'verified';
}

export function getVerifiedAt(book: LibraryBook): string | undefined {
  return isVerified(book) ? book.summary?.evaluation?.evaluatedAt : undefined;
}

export function getReadingProgress(book: LibraryBook): number | null {
  if (book.status === 'completed') return 1;
  if (!book.pageCount || book.currentPage === undefined) return null;
  return Math.min(1, Math.max(0, book.currentPage / book.pageCount));
}

export function getGardenMetrics(data: GardenData) {
  const { books, works } = data;
  const count = (fn: (b: LibraryBook) => boolean) => books.filter(fn).length;
  const completed = books.filter((b) => b.status === 'completed');
  const completedState = (s: SummaryState) => completed.filter((b) => getSummaryState(b) === s).length;

  return {
    totalBooks: books.length,
    readingList: count((b) => b.status === 'reading-list'),
    reading: count((b) => b.status === 'reading'),
    completed: completed.length,
    verified: count(isVerified),
    awaitingEvaluation: completedState('pending') + completedState('evaluating'),
    needsImprovement: completedState('needs-improvement'),
    evaluationFailed: completedState('failed'),
    /** Tamamlanmış ama özeti olmayan ya da taslakta kalan kitaplar */
    withoutSubmittedSummary: completedState('none') + completedState('draft'),
    summaryDrafts: count((b) => b.summary?.status === 'draft'),
    totalWorks: works.length,
    completedWorks: works.filter((w) => w.status === 'completed').length,
    workDrafts: works.filter((w) => w.status === 'draft').length,
  };
}

export type GardenMetrics = ReturnType<typeof getGardenMetrics>;

/* ---------- liste filtreleri ---------- */

export type BookFilters = {
  query: string;
  status: ReadingStatus | 'all';
  category: string | 'all';
  sort: BookSort;
};

const normalize = (s: string) => s.toLocaleLowerCase('tr-TR').trim();

export function matchesQuery(book: LibraryBook, query: string) {
  const q = normalize(query);
  if (!q) return true;
  return normalize(book.title).includes(q) || normalize(book.author).includes(q);
}

export function sortBooks(books: LibraryBook[], sort: BookSort): LibraryBook[] {
  const copy = [...books];
  const collator = new Intl.Collator('tr-TR');
  switch (sort) {
    case 'title':
      return copy.sort((a, b) => collator.compare(a.title, b.title));
    case 'author':
      return copy.sort((a, b) => collator.compare(a.author, b.author) || collator.compare(a.title, b.title));
    case 'progress':
      return copy.sort((a, b) => (getReadingProgress(b) ?? -1) - (getReadingProgress(a) ?? -1));
    default:
      return copy.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
  }
}

export function filterBooks(books: LibraryBook[], filters: BookFilters): LibraryBook[] {
  return sortBooks(
    books.filter(
      (b) =>
        matchesQuery(b, filters.query) &&
        (filters.status === 'all' || b.status === filters.status) &&
        (filters.category === 'all' || b.category === filters.category),
    ),
    filters.sort,
  );
}

export function getCategories(books: LibraryBook[]): string[] {
  return [...new Set(books.map((b) => b.category))].sort((a, b) => a.localeCompare(b, 'tr-TR'));
}

/* ---------- yazılar ---------- */

export function htmlToText(html: string): string {
  return html
    .replace(/<\/(p|h[1-6]|li|blockquote)>/gi, '$& ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

export function getWorkExcerpt(work: Work, length = 160): string {
  const text = htmlToText(work.content);
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
}

/* ---------- zaman serileri ---------- */

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

export type MonthlyPoint = { key: string; label: string; completed: number; verified: number; works: number };

export function getMonthlyActivity(data: GardenData, months = 6, now = new Date()): MonthlyPoint[] {
  const fmt = new Intl.DateTimeFormat('tr-TR', { month: 'short' });
  const points: MonthlyPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    points.push({ key: monthKey(d), label: fmt.format(d), completed: 0, verified: 0, works: 0 });
  }
  const byKey = new Map(points.map((p) => [p.key, p]));
  const bump = (iso: string | undefined, field: 'completed' | 'verified' | 'works') => {
    if (!iso) return;
    const p = byKey.get(monthKey(new Date(iso)));
    if (p) p[field] += 1;
  };
  for (const b of data.books) {
    if (b.status === 'completed') bump(b.completedAt, 'completed');
    bump(getVerifiedAt(b), 'verified');
  }
  for (const w of data.works) if (w.status === 'completed') bump(w.updatedAt, 'works');
  return points;
}

export type GrowthEvent = { stageName: string; count: number; at: string; bookTitle: string };

/** Doğrulama tarihlerine göre ağacın hangi aşamaya ne zaman geçtiği. */
export function getGrowthHistory(data: GardenData): GrowthEvent[] {
  const verified = data.books
    .map((b) => ({ book: b, at: getVerifiedAt(b) }))
    .filter((x): x is { book: LibraryBook; at: string } => Boolean(x.at))
    .sort((a, b) => a.at.localeCompare(b.at));

  const events: GrowthEvent[] = [];
  let lastStage = getStage(0).index;
  verified.forEach(({ book, at }, i) => {
    const stage = getStage(i + 1);
    if (stage.index > lastStage) {
      events.push({ stageName: stage.name, count: i + 1, at, bookTitle: book.title });
      lastStage = stage.index;
    }
  });
  return events;
}

export function getCategoryDistribution(books: LibraryBook[]) {
  const map = new Map<string, number>();
  for (const b of books) map.set(b.category, (map.get(b.category) ?? 0) + 1);
  return [...map.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count || a.category.localeCompare(b.category, 'tr-TR'));
}

/* ---------- başarılar ---------- */

export type AchievementDef = {
  id: string;
  title: string;
  description: string;
  target: number;
  measure: (data: GardenData) => number;
};

const completedMonths = (data: GardenData) =>
  new Set(data.books.filter((b) => b.status === 'completed' && b.completedAt).map((b) => monthKey(new Date(b.completedAt!)))).size;

const completedCategories = (data: GardenData) =>
  new Set(data.books.filter((b) => b.status === 'completed').map((b) => b.category)).size;

/** Ağaç aşamalarıyla aynı eşik: "Fidan" aşaması */
const SAPLING_AT = STAGES.find((s) => s.name === 'Fidan')?.from ?? 10;

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-book',
    title: 'İlk tohum',
    description: 'Kitaplığına ilk kitabını ekle.',
    target: 1,
    measure: (d) => d.books.length,
  },
  {
    id: 'first-completed',
    title: 'Son sayfa',
    description: 'İlk kitabını tamamla.',
    target: 1,
    measure: (d) => d.books.filter((b) => b.status === 'completed').length,
  },
  {
    id: 'first-verified',
    title: 'İlk filiz',
    description: 'İlk özetin doğrulansın; ağacın filizlensin.',
    target: 1,
    measure: (d) => d.books.filter(isVerified).length,
  },
  {
    id: 'verified-5',
    title: 'Düşünen okur',
    description: '5 kitabın özeti doğrulansın.',
    target: 5,
    measure: (d) => d.books.filter(isVerified).length,
  },
  {
    id: 'verified-sapling',
    title: 'Fidan',
    description: `${SAPLING_AT} doğrulanmış kitapla ağacın fidana dönüşsün.`,
    target: SAPLING_AT,
    measure: (d) => d.books.filter(isVerified).length,
  },
  {
    id: 'regular-reader',
    title: 'Düzenli okur',
    description: '3 farklı ayda kitap tamamla.',
    target: 3,
    measure: completedMonths,
  },
  {
    id: 'explorer',
    title: 'Kaşif',
    description: '3 farklı kategoride kitap tamamla.',
    target: 3,
    measure: completedCategories,
  },
  {
    id: 'first-work',
    title: 'İlk eser',
    description: 'İlk yazını tamamla.',
    target: 1,
    measure: (d) => d.works.filter((w) => w.status === 'completed').length,
  },
  {
    id: 'works-5',
    title: 'Üretken kalem',
    description: '5 yazı tamamla.',
    target: 5,
    measure: (d) => d.works.filter((w) => w.status === 'completed').length,
  },
];

export type AchievementState = AchievementDef & {
  current: number;
  earned: boolean;
  /** Yalnızca örnek veriler sayesinde kazanılmış */
  earnedWithDemoOnly: boolean;
};

export function withoutDemo(data: GardenData): GardenData {
  return {
    ...data,
    books: data.books.filter((b) => !b.isDemo),
    works: data.works.filter((w) => !w.isDemo),
  };
}

export function getAchievements(data: GardenData): AchievementState[] {
  const real = withoutDemo(data);
  return ACHIEVEMENTS.map((a) => {
    const current = a.measure(data);
    const earned = current >= a.target;
    return { ...a, current, earned, earnedWithDemoOnly: earned && a.measure(real) < a.target };
  });
}

export function hasDemoData(data: GardenData): boolean {
  return data.books.some((b) => b.isDemo) || data.works.some((w) => w.isDemo);
}
