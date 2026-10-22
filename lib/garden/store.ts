/**
 * Kişisel bahçenin tek veri kaynağı.
 *
 * Şu an veriler yalnızca bu tarayıcıda (localStorage) tutulur. Bütün okuma/yazma bu
 * modülden geçtiği için backend'e geçişte yalnızca `readStored` / `persist` ve aksiyonların
 * içi değişir; bileşenler `useGarden()` ve aksiyonları kullanmaya devam eder.
 *
 * TODO(backend): Aksiyonları Server Action / API çağrılarına bağla, `useGarden` için
 * sunucudan gelen ilk veriyi kullan.
 */
import { useSyncExternalStore } from 'react';
import { createDemoData } from './demo-data';
import { createMockEvaluator, type SummaryEvaluator } from './evaluation';
import { COVER_COLORS } from './constants';
import type {
  BookSummary,
  GardenData,
  LibraryBook,
  Preferences,
  Profile,
  ReadingStatus,
  Work,
} from './types';

const STORAGE_KEY = 'dgarden-garden-v1';
const BACKUP_KEY = `${STORAGE_KEY}-unreadable-backup`;

export type StorageHealth = 'ok' | 'unavailable' | 'recovered';

export type GardenSnapshot = {
  data: GardenData;
  /** unavailable: tarayıcı depolaması kapalı/dolu; recovered: bozuk kayıt yedeklenip örnek veriye dönüldü */
  storage: StorageHealth;
};

export type GardenEvent = {
  type: 'evaluation-finished';
  bookId: string;
  bookTitle: string;
  outcome: 'verified' | 'needs-improvement' | 'failed';
};

let snapshot: GardenSnapshot | null = null;
const listeners = new Set<() => void>();
const eventListeners = new Set<(event: GardenEvent) => void>();

/* ---------- okuma / yazma ---------- */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isGardenData(value: unknown): value is GardenData {
  return (
    isRecord(value) &&
    value.version === 1 &&
    Array.isArray(value.books) &&
    Array.isArray(value.works) &&
    isRecord(value.profile) &&
    isRecord(value.preferences)
  );
}

/** Sayfa değerlendirme sırasında kapatıldıysa özet "bekliyor" durumuna döner. */
function normalize(data: GardenData): GardenData {
  const defaults = createDemoData().preferences;
  return {
    ...data,
    preferences: { ...defaults, ...data.preferences },
    books: data.books.map((b) =>
      b.summary?.status === 'evaluating' ? { ...b, summary: { ...b.summary, status: 'pending' } } : b,
    ),
  };
}

function readStored(): GardenSnapshot {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { data: createDemoData(), storage: 'unavailable' };
  }
  if (raw === null) return { data: createDemoData(), storage: 'ok' };

  try {
    const parsed: unknown = JSON.parse(raw);
    if (isGardenData(parsed)) return { data: normalize(parsed), storage: 'ok' };
  } catch {
    // aşağıda yedeklenir
  }
  try {
    localStorage.setItem(BACKUP_KEY, raw);
  } catch {
    // yedek de yazılamıyorsa yapılacak bir şey yok
  }
  return { data: createDemoData(), storage: 'recovered' };
}

function persist(data: GardenData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

function emit() {
  listeners.forEach((l) => l());
}

function current(): GardenSnapshot {
  if (!snapshot) snapshot = readStored();
  return snapshot;
}

function commit(update: (data: GardenData) => GardenData): boolean {
  const prev = current();
  const data = update(prev.data);
  if (data === prev.data) return true;
  const ok = persist(data);
  snapshot = { data, storage: ok ? (prev.storage === 'recovered' ? 'recovered' : 'ok') : 'unavailable' };
  emit();
  return ok;
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  snapshot = readStored();
  emit();
}

let resumed = false;

/**
 * Sayfa değerlendirme sürerken yenilendiyse bekleyen özetleri yeniden kuyruğa al.
 * (Gerçek backend'de değerlendirme sunucuda sürer; burada demo karşılığı.)
 */
function resumePendingEvaluations() {
  if (resumed) return;
  resumed = true;
  for (const b of current().data.books) {
    if (b.status === 'completed' && b.summary?.status === 'pending') void runEvaluation(b.id);
  }
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener('storage', onStorage);
  queueMicrotask(resumePendingEvaluations);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('storage', onStorage);
  };
}

const getServerSnapshot = () => null;

/** Sunucuda ve hydration sırasında `null` döner; bileşenler bu sırada yükleniyor durumu gösterir. */
export function useGardenSnapshot(): GardenSnapshot | null {
  return useSyncExternalStore(subscribe, current, getServerSnapshot);
}

/** Yalnızca `GardenShell` veri yüklendikten sonra render ettiği bileşenlerde kullanılır. */
export function useGarden(): GardenData {
  const snap = useGardenSnapshot();
  if (!snap) throw new Error('useGarden, bahçe verisi yüklenmeden çağrıldı.');
  return snap.data;
}

export function subscribeToGardenEvents(listener: (event: GardenEvent) => void) {
  eventListeners.add(listener);
  return () => {
    eventListeners.delete(listener);
  };
}

/* ---------- yardımcılar ---------- */

const nowIso = () => new Date().toISOString();

export function createId(prefix: string) {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${rand}`;
}

/** Bileşen dışından (olay dinleyicileri vb.) güncel veriyi okumak için */
export function getGardenData(): GardenData {
  return current().data;
}

export function findBook(id: string): LibraryBook | undefined {
  return current().data.books.find((b) => b.id === id);
}

function patchBook(id: string, update: (book: LibraryBook) => LibraryBook): boolean {
  return commit((data) => {
    let changed = false;
    const books = data.books.map((b) => {
      if (b.id !== id) return b;
      const next = update(b);
      if (next !== b) changed = true;
      return next;
    });
    return changed ? { ...data, books } : data;
  });
}

function patchSummary(id: string, update: (summary: BookSummary) => BookSummary) {
  return patchBook(id, (b) => (b.summary ? { ...b, summary: update(b.summary) } : b));
}

/* ---------- kitaplar ---------- */

export type BookInput = {
  title: string;
  author: string;
  category: string;
  status: ReadingStatus;
  pageCount?: number;
  coverColor?: string;
};

function statusTimestamps(book: LibraryBook, status: ReadingStatus): Partial<LibraryBook> {
  const now = nowIso();
  if (status === 'reading-list') return { startedAt: undefined, completedAt: undefined, currentPage: undefined };
  if (status === 'reading')
    return { startedAt: book.startedAt ?? now, completedAt: undefined, currentPage: book.status === 'completed' ? book.currentPage : (book.currentPage ?? 0) };
  return { startedAt: book.startedAt ?? now, completedAt: book.completedAt ?? now, currentPage: book.pageCount ?? book.currentPage };
}

/**
 * Yeni kitap ekler. Tamamlanmış kitap için özet verilirse özet ya taslak olarak
 * kaydedilir ya da (submit) değerlendirmeye gönderilir.
 */
export function addBook(input: BookInput, summary?: { text: string; submit: boolean }): LibraryBook {
  const now = nowIso();
  const index = current().data.books.length;
  const base: LibraryBook = {
    id: createId('book'),
    title: input.title,
    author: input.author,
    category: input.category,
    status: input.status,
    pageCount: input.pageCount,
    coverColor: input.coverColor ?? COVER_COLORS[index % COVER_COLORS.length],
    addedAt: now,
  };
  const book: LibraryBook = {
    ...base,
    ...statusTimestamps(base, input.status),
    ...(input.status === 'completed' && summary?.text
      ? { summary: { text: summary.text, status: 'draft', updatedAt: now, attempts: 0 } }
      : {}),
  };
  commit((data) => ({ ...data, books: [book, ...data.books] }));
  if (book.summary && summary?.submit) submitSummary(book.id, summary.text);
  return book;
}

export function updateBook(id: string, input: Partial<BookInput> & { notes?: string }) {
  return patchBook(id, (b) => {
    const next = { ...b, ...input };
    if (next.pageCount !== undefined && next.currentPage !== undefined) {
      next.currentPage = Math.min(next.currentPage, next.pageCount);
    }
    return next;
  });
}

export function setReadingStatus(id: string, status: ReadingStatus) {
  return patchBook(id, (b) => (b.status === status ? b : { ...b, status, ...statusTimestamps(b, status) }));
}

export function updateProgress(id: string, currentPage: number) {
  return patchBook(id, (b) => {
    const max = b.pageCount ?? Number.MAX_SAFE_INTEGER;
    const page = Math.max(0, Math.min(max, Math.floor(currentPage)));
    return { ...b, currentPage: page, startedAt: b.startedAt ?? nowIso() };
  });
}

export function removeBook(id: string): { book: LibraryBook; index: number } | null {
  const data = current().data;
  const index = data.books.findIndex((b) => b.id === id);
  if (index === -1) return null;
  const book = data.books[index];
  commit((d) => ({
    ...d,
    books: d.books.filter((b) => b.id !== id),
    works: d.works.map((w) => (w.relatedBookId === id ? { ...w, relatedBookId: undefined } : w)),
  }));
  return { book, index };
}

export function restoreBook(book: LibraryBook, index: number) {
  commit((d) => {
    if (d.books.some((b) => b.id === book.id)) return d;
    const books = [...d.books];
    books.splice(Math.min(index, books.length), 0, book);
    return { ...d, books };
  });
}

/* ---------- özet ve değerlendirme ---------- */

let evaluator: SummaryEvaluator = createMockEvaluator({
  shouldFail: () => current().data.preferences.simulateEvaluationFailure,
});

/** Gerçek servis hazır olduğunda (ya da testlerde) değerlendiriciyi değiştirmek için. */
export function setSummaryEvaluator(next: SummaryEvaluator) {
  evaluator = next;
}

const inFlight = new Set<string>();

export function saveSummaryDraft(id: string, text: string) {
  return patchBook(id, (b) => ({
    ...b,
    summary: {
      attempts: 0,
      ...b.summary,
      text,
      status: 'draft',
      updatedAt: nowIso(),
      error: undefined,
    },
  }));
}

/** Silinen bir özet taslağını geri almak için */
export function restoreSummary(id: string, summary: BookSummary) {
  return patchBook(id, (b) => (b.summary ? b : { ...b, summary }));
}

/** Yalnızca taslak özetler silinebilir; gönderilmiş/doğrulanmış özetler korunur. */
export function discardSummaryDraft(id: string) {
  return patchBook(id, (b) => (b.summary?.status === 'draft' ? { ...b, summary: undefined } : b));
}

export function submitSummary(id: string, text: string) {
  const ok = patchBook(id, (b) =>
    b.status !== 'completed'
      ? b
      : {
          ...b,
          summary: {
            attempts: 0,
            ...b.summary,
            text,
            status: 'pending',
            updatedAt: nowIso(),
            submittedAt: nowIso(),
            error: undefined,
          },
        },
  );
  void runEvaluation(id);
  return ok;
}

/** Bekleyen ya da başarısız olmuş bir değerlendirmeyi (yeniden) başlatır. */
export async function runEvaluation(id: string) {
  const book = findBook(id);
  if (!book?.summary || inFlight.has(id)) return;
  if (!['pending', 'failed'].includes(book.summary.status)) return;

  const text = book.summary.text;
  inFlight.add(id);
  patchSummary(id, (s) => ({ ...s, status: 'evaluating', attempts: s.attempts + 1, error: undefined }));

  let outcome: GardenEvent['outcome'];
  try {
    const evaluation = await evaluator.evaluate({ bookTitle: book.title, author: book.author, summary: text });
    outcome = evaluation.outcome;
    patchSummary(id, (s) =>
      // Bu sırada özet düzenlendiyse eski sonucu yazma
      s.status !== 'evaluating' || s.text !== text ? s : { ...s, status: evaluation.outcome, evaluation },
    );
  } catch (error) {
    outcome = 'failed';
    const message = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.';
    patchSummary(id, (s) => (s.status !== 'evaluating' ? s : { ...s, status: 'failed', error: message }));
  } finally {
    inFlight.delete(id);
  }

  const latest = findBook(id);
  if (latest?.summary && latest.summary.text === text) {
    eventListeners.forEach((l) => l({ type: 'evaluation-finished', bookId: id, bookTitle: latest.title, outcome }));
  }
}

/* ---------- yazılar ---------- */

export type WorkInput = Pick<Work, 'title' | 'type' | 'tags' | 'content' | 'status' | 'relatedBookId'>;

export function addWork(input: WorkInput): Work {
  const now = nowIso();
  const work: Work = { ...input, id: createId('work'), createdAt: now, updatedAt: now };
  commit((d) => ({ ...d, works: [work, ...d.works] }));
  return work;
}

export function updateWork(id: string, input: Partial<WorkInput>) {
  return commit((d) => ({
    ...d,
    works: d.works.map((w) => (w.id === id ? { ...w, ...input, updatedAt: nowIso() } : w)),
  }));
}

export function removeWork(id: string): { work: Work; index: number } | null {
  const data = current().data;
  const index = data.works.findIndex((w) => w.id === id);
  if (index === -1) return null;
  const work = data.works[index];
  commit((d) => ({ ...d, works: d.works.filter((w) => w.id !== id) }));
  return { work, index };
}

export function restoreWork(work: Work, index: number) {
  commit((d) => {
    if (d.works.some((w) => w.id === work.id)) return d;
    const works = [...d.works];
    works.splice(Math.min(index, works.length), 0, work);
    return { ...d, works };
  });
}

/* ---------- profil, tercihler ve veri ---------- */

export function updateProfile(profile: Profile) {
  return commit((d) => ({ ...d, profile }));
}

export function updatePreferences(preferences: Partial<Preferences>) {
  return commit((d) => ({ ...d, preferences: { ...d.preferences, ...preferences } }));
}

export function removeDemoData() {
  return commit((d) => {
    const bookIds = new Set(d.books.filter((b) => b.isDemo).map((b) => b.id));
    return {
      ...d,
      books: d.books.filter((b) => !b.isDemo),
      works: d.works
        .filter((w) => !w.isDemo)
        .map((w) => (w.relatedBookId && bookIds.has(w.relatedBookId) ? { ...w, relatedBookId: undefined } : w)),
    };
  });
}

export function resetToDemo() {
  return commit((d) => ({ ...createDemoData(), profile: d.profile, preferences: d.preferences }));
}

export function clearAllBooksAndWorks() {
  return commit((d) => ({ ...d, books: [], works: [] }));
}

export function exportGardenData(): string {
  return JSON.stringify(current().data, null, 2);
}
