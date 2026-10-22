'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, CircleCheckBig, Save, X } from 'lucide-react';
import RichTextEditor from '@/components/write/RichTextEditor';
import { sanitizeRichText } from '@/components/write/editorExtensions';
import { MAX_WORK_TAGS, WORK_TYPE_LABELS } from '@/lib/garden/constants';
import { countWords, htmlToText } from '@/lib/garden/selectors';
import { addWork, updateWork, useGarden } from '@/lib/garden/store';
import type { Work, WorkStatus, WorkType } from '@/lib/garden/types';
import { useToast } from './Toast';
import { Field, buttonStyles, cn, fieldA11y, inputStyles, selectStyles } from './ui';

type WorkEditorProps = {
  work?: Work;
  defaultBookId?: string;
};

export default function WorkEditor({ work, defaultBookId }: WorkEditorProps) {
  const router = useRouter();
  const toast = useToast();
  const { books } = useGarden();

  const [title, setTitle] = useState(work?.title ?? '');
  const [type, setType] = useState<WorkType>(work?.type ?? (defaultBookId ? 'review' : 'essay'));
  const [relatedBookId, setRelatedBookId] = useState(
    work?.relatedBookId ?? (books.some((b) => b.id === defaultBookId) ? defaultBookId : undefined) ?? '',
  );
  const [tags, setTags] = useState<string[]>(work?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [content, setContent] = useState(work?.content ?? '');
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  const current = JSON.stringify([title, type, relatedBookId, tags, content]);
  // İlk değerler "kaydedilmiş" kabul edilir; yalnızca kullanıcı değiştirince uyarı verilir
  const [savedSnapshot, setSavedSnapshot] = useState(current);

  const words = countWords(htmlToText(content));
  const dirty = current !== savedSnapshot;

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  function addTag() {
    const t = tagInput.trim().replace(/^#+/, '').slice(0, 30);
    if (!t) return;
    if (tags.length >= MAX_WORK_TAGS) {
      toast({ tone: 'error', title: `En fazla ${MAX_WORK_TAGS} etiket ekleyebilirsin.` });
      return;
    }
    if (!tags.some((x) => x.toLocaleLowerCase('tr-TR') === t.toLocaleLowerCase('tr-TR'))) setTags([...tags, t]);
    setTagInput('');
  }

  function save(status: WorkStatus) {
    const next: typeof errors = {};
    if (status === 'completed') {
      if (!title.trim()) next.title = 'Tamamlamak için bir başlık yaz.';
      if (words === 0) next.content = 'Tamamlamak için içerik yazmalısın.';
    } else if (!title.trim() && words === 0) {
      next.title = 'Kaydetmek için bir başlık ya da içerik yaz.';
    }
    setErrors(next);
    if (next.title || next.content) {
      document.getElementById(next.title ? 'work-title' : 'work-content-label')?.focus();
      return;
    }

    const input = {
      title: title.trim(),
      type,
      tags,
      content: sanitizeRichText(content),
      status,
      relatedBookId: relatedBookId || undefined,
    };
    setSavedSnapshot(current);

    if (work) {
      updateWork(work.id, input);
      toast({ title: status === 'completed' ? 'Yazı tamamlandı' : 'Taslak kaydedildi' });
      if (status === 'completed') router.push(`/garden/works/${work.id}`);
    } else {
      const created = addWork(input);
      toast({ title: status === 'completed' ? 'Yazın tamamlandı' : 'Taslak kaydedildi', description: 'Yalnızca bu tarayıcıda saklanır.' });
      router.replace(status === 'completed' ? `/garden/works/${created.id}` : `/garden/works/${created.id}/edit`);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 rounded-3xl border border-line bg-white p-5 sm:p-7 md:grid-cols-2">
        <Field id="work-title" label="Başlık" error={errors.title} className="md:col-span-2">
          <input
            {...fieldA11y('work-title', { error: errors.title })}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={140}
            placeholder="Yazına bir başlık ver"
            className={cn(inputStyles, 'font-display text-lg')}
          />
        </Field>

        <Field id="work-type" label="Tür">
          <div className="relative">
            <select id="work-type" value={type} onChange={(e) => setType(e.target.value as WorkType)} className={selectStyles}>
              {(Object.keys(WORK_TYPE_LABELS) as WorkType[]).map((t) => (
                <option key={t} value={t}>
                  {WORK_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
            <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-light" />
          </div>
        </Field>

        <Field id="work-book" label="İlgili kitap" hint="İsteğe bağlı. Yazı, kitabın detay sayfasında görünür.">
          <div className="relative">
            <select
              {...fieldA11y('work-book', { hint: true })}
              value={relatedBookId}
              onChange={(e) => setRelatedBookId(e.target.value)}
              className={selectStyles}
            >
              <option value="">Kitapla ilişkilendirme</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} — {b.author}
                </option>
              ))}
            </select>
            <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-light" />
          </div>
        </Field>

        <div className="md:col-span-2">
          <label htmlFor="work-tags" className="mb-2 block text-sm font-medium">
            Etiketler <span className="font-normal text-ink-light">({tags.length}/{MAX_WORK_TAGS})</span>
          </label>
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line px-3 py-2 focus-within:border-forest focus-within:ring-2 focus-within:ring-mint">
            {tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 rounded-full bg-mint px-2.5 py-1 text-xs text-forest">
                #{t}
                <button
                  type="button"
                  onClick={() => setTags(tags.filter((x) => x !== t))}
                  aria-label={`${t} etiketini kaldır`}
                  className="rounded-full p-0.5 hover:bg-white"
                >
                  <X size={12} aria-hidden="true" />
                </button>
              </span>
            ))}
            <input
              id="work-tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  addTag();
                } else if (e.key === 'Backspace' && !tagInput && tags.length) {
                  setTags(tags.slice(0, -1));
                }
              }}
              onBlur={addTag}
              placeholder={tags.length ? '' : 'Etiket yaz, Enter’a bas'}
              className="min-w-32 flex-1 bg-transparent py-1 text-sm outline-none"
            />
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-white p-3 sm:p-5">
        <p id="work-content-label" tabIndex={-1} className="mb-2 px-1 text-sm font-medium outline-none">
          İçerik
        </p>
        <RichTextEditor content={content} onChange={(html) => setContent(html)} />
        {errors.content && (
          <p role="alert" className="mt-2 px-1 text-xs font-medium text-[#A23B2C]">
            {errors.content}
          </p>
        )}
      </div>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-col gap-3 border-t border-line bg-mist/95 px-4 py-3 backdrop-blur sm:mx-0 sm:flex-row sm:items-center sm:justify-between sm:rounded-2xl sm:border">
        <p className="text-xs text-ink-light" aria-live="polite">
          {words} kelime · {dirty ? 'Kaydedilmemiş değişiklik var' : work ? 'Tüm değişiklikler kaydedildi' : 'Henüz kaydedilmedi'}
        </p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <button type="button" onClick={() => router.back()} className={buttonStyles({ variant: 'ghost' })}>
            Vazgeç
          </button>
          <button type="button" onClick={() => save('draft')} className={buttonStyles({ variant: 'secondary' })}>
            <Save size={17} aria-hidden="true" />
            Taslak kaydet
          </button>
          <button type="button" onClick={() => save('completed')} className={buttonStyles()}>
            <CircleCheckBig size={17} aria-hidden="true" />
            Tamamla
          </button>
        </div>
      </div>
    </div>
  );
}
