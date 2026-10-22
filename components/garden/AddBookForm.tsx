'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, ChevronDown, Pencil, Plus, Send } from 'lucide-react';
import {
  BOOK_CATEGORIES,
  COVER_COLORS,
  READING_STATUS_LABELS,
  READING_STATUS_ORDER,
  SUMMARY_MIN_LENGTH,
  SUMMARY_MAX_LENGTH,
} from '@/lib/garden/constants';
import { addBook, getGardenData, updateBook } from '@/lib/garden/store';
import type { LibraryBook, ReadingStatus } from '@/lib/garden/types';
import Modal from './Modal';
import { useToast } from './Toast';
import { Field, buttonStyles, cn, fieldA11y, inputStyles, selectStyles } from './ui';

type Errors = Partial<Record<'title' | 'author' | 'pageCount' | 'summary', string>>;

const normalize = (s: string) => s.toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim();

type BookFormProps = {
  /** Verilirse düzenleme modunda açılır */
  book?: LibraryBook;
  defaultStatus?: ReadingStatus;
  onDone: () => void;
};

function BookForm({ book, defaultStatus = 'reading-list', onDone }: BookFormProps) {
  const router = useRouter();
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const isEdit = Boolean(book);

  const [title, setTitle] = useState(book?.title ?? '');
  const [author, setAuthor] = useState(book?.author ?? '');
  const [category, setCategory] = useState(book?.category ?? 'Roman');
  const [status, setStatus] = useState<ReadingStatus>(book?.status ?? defaultStatus);
  const [pageCount, setPageCount] = useState(book?.pageCount ? String(book.pageCount) : '');
  const [coverColor, setCoverColor] = useState<string>(book?.coverColor ?? COVER_COLORS[0]);
  const [summary, setSummary] = useState('');
  const [summaryLater, setSummaryLater] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const wantsSummary = !isEdit && status === 'completed' && !summaryLater;
  const summaryLength = summary.trim().length;
  const categories: string[] = [...BOOK_CATEGORIES];
  if (book && !categories.includes(book.category)) categories.push(book.category);

  function validate(): Errors {
    const next: Errors = {};
    const t = title.trim();
    const a = author.trim();
    if (!t) next.title = 'Kitap adını yazmalısın.';
    if (!a) next.author = 'Yazar adını yazmalısın.';
    if (t && a) {
      const duplicate = getGardenData().books.some(
        (b) => b.id !== book?.id && normalize(b.title) === normalize(t) && normalize(b.author) === normalize(a),
      );
      if (duplicate) next.title = 'Bu kitap zaten kitaplığında.';
    }
    if (pageCount) {
      const n = Number(pageCount);
      if (!Number.isInteger(n) || n < 1 || n > 20000) next.pageCount = '1 ile 20.000 arasında bir sayı gir.';
    }
    if (wantsSummary && summaryLength < SUMMARY_MIN_LENGTH) {
      next.summary = `Özet en az ${SUMMARY_MIN_LENGTH} karakter olmalı (şu an ${summaryLength}). Ya da “Özeti daha sonra yazacağım”ı seç.`;
    }
    return next;
  }

  function save(submitSummary: boolean) {
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) {
      // İlk hatalı alana odaklan
      const first = (['title', 'author', 'pageCount', 'summary'] as const).find((k) => next[k]);
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    const input = {
      title: title.trim(),
      author: author.trim(),
      category,
      pageCount: pageCount ? Number(pageCount) : undefined,
      coverColor,
    };

    if (book) {
      updateBook(book.id, input);
      toast({ title: 'Kitap bilgileri güncellendi' });
      onDone();
      return;
    }

    const created = addBook(
      { ...input, status },
      wantsSummary ? { text: summary.trim(), submit: submitSummary } : undefined,
    );
    toast({
      title: 'Kitap bahçene eklendi',
      description: wantsSummary
        ? submitSummary
          ? 'Özetin demo değerlendirmeye gönderildi.'
          : 'Özetin taslak olarak kaydedildi.'
        : `“${created.title}” ${READING_STATUS_LABELS[status].toLocaleLowerCase('tr-TR')} olarak eklendi.`,
      action: { label: 'Kitaba git', onClick: () => router.push(`/garden/library/${created.id}`) },
    });
    onDone();
  }

  return (
    <form ref={formRef} noValidate onSubmit={(e) => {
        e.preventDefault();
        save(true);
      }} className="space-y-5">
      <Field id="book-title" label="Kitap adı" error={errors.title}>
        <input
          {...fieldA11y('book-title', { error: errors.title })}
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Örn. Simyacı"
          maxLength={150}
          required
          data-autofocus
          autoComplete="off"
          className={inputStyles}
        />
      </Field>

      <Field id="book-author" label="Yazar" error={errors.author}>
        <input
          {...fieldA11y('book-author', { error: errors.author })}
          name="author"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Örn. Paulo Coelho"
          maxLength={120}
          required
          autoComplete="off"
          className={inputStyles}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="book-category" label="Kategori">
          <div className="relative">
            <select id="book-category" value={category} onChange={(e) => setCategory(e.target.value)} className={selectStyles}>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-light" />
          </div>
        </Field>

        <Field id="book-pages" label="Sayfa sayısı" error={errors.pageCount} hint="İsteğe bağlı; ilerlemeyi takip etmek için.">
          <input
            {...fieldA11y('book-pages', { error: errors.pageCount, hint: true })}
            name="pageCount"
            type="number"
            inputMode="numeric"
            min={1}
            max={20000}
            value={pageCount}
            onChange={(e) => setPageCount(e.target.value)}
            placeholder="Örn. 240"
            className={inputStyles}
          />
        </Field>
      </div>

      {!isEdit && (
        <Field id="book-status" label="Okuma durumu">
          <div className="relative">
            <select
              id="book-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ReadingStatus)}
              className={selectStyles}
            >
              {READING_STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {READING_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-light" />
          </div>
        </Field>
      )}

      <fieldset>
        <legend className="mb-2 text-sm font-medium text-ink">Kapak rengi</legend>
        <div className="flex flex-wrap gap-2">
          {COVER_COLORS.map((color, i) => (
            <label key={color} className="relative cursor-pointer">
              <input
                type="radio"
                name="coverColor"
                value={color}
                checked={coverColor === color}
                onChange={() => setCoverColor(color)}
                className="peer sr-only"
              />
              <span className="sr-only">Renk {i + 1}</span>
              <span
                aria-hidden="true"
                className="block size-9 rounded-xl ring-offset-2 transition peer-checked:ring-2 peer-checked:ring-forest peer-focus-visible:outline-2 peer-focus-visible:outline-forest"
                style={{ backgroundColor: color }}
              />
            </label>
          ))}
        </div>
      </fieldset>

      {!isEdit && status === 'completed' && (
        <div className="space-y-3 rounded-2xl border border-line bg-mist/70 p-4">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={summaryLater}
              onChange={(e) => setSummaryLater(e.target.checked)}
              className="mt-0.5 size-4 accent-forest"
            />
            <span>
              <span className="font-medium">Özeti daha sonra yazacağım</span>
              <span className="block text-xs leading-5 text-ink-light">
                Kitap “tamamlandı” olarak eklenir; özet yazılıp doğrulanana kadar ağacına katkı sağlamaz.
              </span>
            </span>
          </label>

          {wantsSummary && (
            <Field
              id="book-summary"
              label="Kitap özeti"
              error={errors.summary}
              aside={
                <span
                  className={cn(
                    'text-xs tabular-nums',
                    summaryLength >= SUMMARY_MIN_LENGTH ? 'text-forest' : 'text-ink-light',
                  )}
                >
                  {summaryLength} / {SUMMARY_MIN_LENGTH}+ karakter
                </span>
              }
              hint={`En az ${SUMMARY_MIN_LENGTH} karakter. Bu yalnızca form kontrolüdür; AI değerlendirme eşiği değildir.`}
            >
              <textarea
                {...fieldA11y('book-summary', { error: errors.summary, hint: true })}
                name="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Kitabın ana fikrini, önemli olaylarını ve sende bıraktığı düşünceleri kendi cümlelerinle anlat…"
                rows={6}
                maxLength={SUMMARY_MAX_LENGTH}
                className={cn(inputStyles, 'resize-y leading-6')}
              />
            </Field>
          )}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:flex-wrap sm:justify-end">
        <button type="button" onClick={onDone} className={buttonStyles({ variant: 'secondary' })}>
          Vazgeç
        </button>
        {wantsSummary && (
          <button
            type="button"
            onClick={() => save(false)}
            className={buttonStyles({ variant: 'secondary' })}
          >
            Özeti taslak kaydet
          </button>
        )}
        <button type="submit" className={buttonStyles()}>
          {isEdit ? (
            <>
              <Pencil size={17} aria-hidden="true" /> Değişiklikleri kaydet
            </>
          ) : wantsSummary ? (
            <>
              <Send size={17} aria-hidden="true" /> Ekle ve değerlendirmeye gönder
            </>
          ) : (
            <>
              <Plus size={18} aria-hidden="true" /> Kitabı ekle
            </>
          )}
        </button>
      </div>
    </form>
  );
}

type AddBookButtonProps = {
  label?: string;
  defaultStatus?: ReadingStatus;
  variant?: 'primary' | 'secondary';
};

export default function AddBookForm({ label = 'Kitap Ekle', defaultStatus, variant = 'primary' }: AddBookButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonStyles({ variant })}>
        <Plus size={18} aria-hidden="true" />
        {label}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Bahçene kitap ekle"
        description="Kitabını ekle, okuma yolculuğunu takip et."
        icon={<BookOpen size={22} aria-hidden="true" />}
      >
        <BookForm defaultStatus={defaultStatus} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}

export function EditBookButton({ book }: { book: LibraryBook }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonStyles({ variant: 'secondary' })}>
        <Pencil size={16} aria-hidden="true" />
        Düzenle
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Kitap bilgilerini düzenle"
        icon={<Pencil size={20} aria-hidden="true" />}
      >
        <BookForm book={book} onDone={() => setOpen(false)} />
      </Modal>
    </>
  );
}
