'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown, Download, ImageUp, RotateCcw, Trash2 } from 'lucide-react';
import { AVATAR_COLORS, BOOK_SORT_LABELS } from '@/lib/garden/constants';
import { hasDemoData } from '@/lib/garden/selectors';
import {
  clearAllBooksAndWorks,
  exportGardenData,
  removeDemoData,
  resetToDemo,
  updatePreferences,
  updateProfile,
  useGarden,
} from '@/lib/garden/store';
import type { BookSort, Preferences, Profile } from '@/lib/garden/types';
import { Avatar } from './GardenShell';
import { ConfirmDialog } from './Modal';
import { useToast } from './Toast';
import { Field, Notice, PageContainer, PageHeader, Panel, buttonStyles, cn, fieldA11y, inputStyles, selectStyles } from './ui';

function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: ReactNode }) {
  return (
    <Panel aria-labelledby={`${id}-title`} id={id} className="scroll-mt-24">
      <h2 id={`${id}-title`} className="font-display text-xl">
        {title}
      </h2>
      {description && <p className="mt-1 text-sm leading-6 text-ink-light">{description}</p>}
      <div className="mt-5">{children}</div>
    </Panel>
  );
}

function Toggle({
  id,
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  description?: ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4 py-3', disabled && 'opacity-60')}>
      <div className="min-w-0">
        <p id={`${id}-label`} className="text-sm font-medium">
          {label}
        </p>
        {description && (
          <p id={`${id}-desc`} className="mt-0.5 text-xs leading-5 text-ink-light">
            {description}
          </p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-desc` : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed',
          checked ? 'bg-forest' : 'bg-[#C9D6CF]',
        )}
      >
        <span className="sr-only">{checked ? 'Açık' : 'Kapalı'}</span>
        <span
          aria-hidden="true"
          className={cn(
            'inline-block size-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
    </div>
  );
}

const USERNAME_RE = /^[a-z0-9_.-]{3,24}$/;

function ProfileForm({ profile }: { profile: Profile }) {
  const toast = useToast();
  const [form, setForm] = useState(profile);
  const [errors, setErrors] = useState<Partial<Record<keyof Profile, string>>>({});
  const dirty = JSON.stringify(form) !== JSON.stringify(profile);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!form.displayName.trim()) next.displayName = 'Görünen ad boş olamaz.';
    if (!USERNAME_RE.test(form.username))
      next.username = '3–24 karakter; yalnızca küçük harf, rakam, nokta, tire ve alt çizgi.';
    setErrors(next);
    if (Object.keys(next).length) return;
    const ok = updateProfile({ ...form, displayName: form.displayName.trim(), bio: form.bio.trim() });
    toast(
      ok
        ? { title: 'Profil kaydedildi', description: 'Yalnızca bu tarayıcıda saklanır.' }
        : { tone: 'error', title: 'Profil tarayıcıya kaydedilemedi', description: 'Değişiklik yalnızca bu sekme açıkken geçerli.' },
    );
  }

  return (
    <form noValidate onSubmit={submit} className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="scale-150 self-start p-3 sm:self-center">
          <Avatar profile={form} />
        </div>
        <div className="space-y-3">
          <fieldset>
            <legend className="mb-2 text-sm font-medium">Profil rengi</legend>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((c, i) => (
                <label key={c} className="cursor-pointer">
                  <input
                    type="radio"
                    name="avatarColor"
                    value={c}
                    checked={form.avatarColor === c}
                    onChange={() => setForm({ ...form, avatarColor: c })}
                    className="peer sr-only"
                  />
                  <span className="sr-only">Renk {i + 1}</span>
                  <span
                    aria-hidden="true"
                    className="block size-8 rounded-full ring-offset-2 peer-checked:ring-2 peer-checked:ring-forest peer-focus-visible:outline-2 peer-focus-visible:outline-forest"
                    style={{ backgroundColor: c }}
                  />
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <button type="button" disabled aria-describedby="photo-note" className={buttonStyles({ variant: 'secondary', size: 'sm' })}>
              <ImageUp size={15} aria-hidden="true" />
              Fotoğraf yükle
            </button>
            <p id="photo-note" className="mt-1.5 text-xs text-ink-light">
              Fotoğraf yükleme, hesap sistemi bağlandığında açılacak.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field id="profile-name" label="Görünen ad" error={errors.displayName}>
          <input
            {...fieldA11y('profile-name', { error: errors.displayName })}
            value={form.displayName}
            onChange={(e) => setForm({ ...form, displayName: e.target.value })}
            maxLength={60}
            autoComplete="name"
            className={inputStyles}
          />
        </Field>
        <Field id="profile-username" label="Kullanıcı adı" error={errors.username} hint="Bahçe adresinde kullanılacak.">
          <div className="relative">
            <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-ink-light">
              @
            </span>
            <input
              {...fieldA11y('profile-username', { error: errors.username, hint: true })}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value.toLocaleLowerCase('tr-TR') })}
              maxLength={24}
              autoComplete="username"
              spellCheck={false}
              className={cn(inputStyles, 'pl-8')}
            />
          </div>
        </Field>
      </div>

      <Field id="profile-bio" label="Hakkında" aside={<span className="text-xs tabular-nums text-ink-light">{form.bio.length}/280</span>}>
        <textarea
          id="profile-bio"
          value={form.bio}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
          rows={3}
          maxLength={280}
          placeholder="Ne okumayı seversin?"
          className={cn(inputStyles, 'resize-y')}
        />
      </Field>

      <div className="flex justify-end gap-3">
        {dirty && (
          <button type="button" onClick={() => setForm(profile)} className={buttonStyles({ variant: 'ghost' })}>
            Vazgeç
          </button>
        )}
        <button type="submit" disabled={!dirty} className={buttonStyles()}>
          Profili kaydet
        </button>
      </div>
    </form>
  );
}

type DataAction = 'remove-demo' | 'reset' | 'clear' | null;

export default function SettingsContent() {
  const data = useGarden();
  const toast = useToast();
  const [action, setAction] = useState<DataAction>(null);
  const { preferences } = data;

  const setPref = (patch: Partial<Preferences>) => {
    const ok = updatePreferences(patch);
    if (!ok) toast({ tone: 'error', title: 'Tercih tarayıcıya kaydedilemedi' });
  };

  function download() {
    const blob = new Blob([exportGardenData()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `d-garden-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Verilerin indirildi', description: 'JSON dosyası olarak kaydedildi.' });
  }

  const dialogs = {
    'remove-demo': {
      title: 'Örnek veriler kaldırılsın mı?',
      description: 'Örnek kitaplar ve yazılar silinir. Senin eklediklerin korunur.',
      confirm: 'Örnekleri kaldır',
      run: () => {
        removeDemoData();
        toast({ title: 'Örnek veriler kaldırıldı' });
      },
    },
    reset: {
      title: 'Örnek verilerle baştan başlansın mı?',
      description: 'Eklediğin bütün kitaplar, özetler ve yazılar silinir; yerine örnek veriler yüklenir. Profilin ve tercihlerin korunur.',
      confirm: 'Sıfırla',
      run: () => {
        resetToDemo();
        toast({ title: 'Bahçen örnek verilerle sıfırlandı' });
      },
    },
    clear: {
      title: 'Bütün kitap ve yazılar silinsin mi?',
      description: 'Kitaplığın, özetlerin ve yazıların tamamen silinir; ağacın tohuma döner. Bu işlem geri alınamaz. Önce verilerini indirmen önerilir.',
      confirm: 'Hepsini sil',
      run: () => {
        clearAllBooksAndWorks();
        toast({ title: 'Kitapların ve yazıların silindi' });
      },
    },
  } as const;
  const dialog = action ? dialogs[action] : null;

  return (
    <PageContainer className="max-w-4xl">
      <PageHeader
        back={{ href: '/garden', label: 'Bahçene dön' }}
        eyebrow="Tercihlerin"
        title="Ayarlar"
        description="Profilini ve bahçe deneyimini kişiselleştir. Ayarlar şu an yalnızca bu tarayıcıda saklanır."
      />

      <Section id="profile" title="Profil" description="Bahçende görünen bilgiler.">
        <ProfileForm key={JSON.stringify(data.profile)} profile={data.profile} />
      </Section>

      <Section id="appearance" title="Görünüm" description="Değişiklikler hemen uygulanır.">
        <div className="divide-y divide-line">
          <Toggle
            id="pref-animate"
            label="Ağaç açılış animasyonu"
            description="Bahçem sayfası açıldığında ağaç tohumdan büyüyerek gösterilir. Sisteminde “hareketi azalt” açıksa animasyon her zaman kapalıdır."
            checked={preferences.animateTree}
            onChange={(v) => setPref({ animateTree: v })}
          />
          <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
            <label htmlFor="pref-sort" className="text-sm font-medium">
              Kitap listelerinde varsayılan sıralama
            </label>
            <div className="relative sm:w-56">
              <select
                id="pref-sort"
                value={preferences.librarySort}
                onChange={(e) => setPref({ librarySort: e.target.value as BookSort })}
                className={selectStyles}
              >
                {(Object.keys(BOOK_SORT_LABELS) as BookSort[]).map((s) => (
                  <option key={s} value={s}>
                    {BOOK_SORT_LABELS[s]}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-light" />
            </div>
          </div>
        </div>
      </Section>

      <Section id="notifications" title="Bildirimler">
        <div className="divide-y divide-line">
          <Toggle
            id="pref-eval"
            label="Değerlendirme sonuçlarını bildir"
            description="Bir özetin değerlendirmesi bittiğinde uygulama içinde bildirim gösterilir."
            checked={preferences.notifyEvaluation}
            onChange={(v) => setPref({ notifyEvaluation: v })}
          />
          <Toggle
            id="pref-weekly"
            label="Haftalık okuma özeti e-postası"
            description="E-posta bildirimleri hesap sistemi bağlandığında kullanılabilir olacak."
            checked={false}
            onChange={() => undefined}
            disabled
          />
        </div>
      </Section>

      <Section id="account" title="Hesap">
        <Notice tone="info" title="Hesap sistemi henüz bağlı değil">
          Giriş, e-posta ve şifre yönetimi gerçek kimlik doğrulama sistemi eklendiğinde burada yer alacak. Şu an bahçen
          bu tarayıcıya bağlı; başka bir cihazda görünmez.
        </Notice>
      </Section>

      <Section id="demo" title="Demo seçenekleri" description="Arayüzü farklı durumlarda denemek için.">
        <Toggle
          id="pref-fail"
          label="Değerlendirme hatası simüle et"
          description="Açıkken gönderilen özetlerin değerlendirmesi başarısız olur; yeniden deneme akışını görebilirsin."
          checked={preferences.simulateEvaluationFailure}
          onChange={(v) => setPref({ simulateEvaluationFailure: v })}
        />
      </Section>

      <Section id="data" title="Veri ve gizlilik">
        <div className="space-y-3 text-sm leading-6 text-ink-light">
          <p>
            Kitapların, özetlerin, yazıların ve ayarların yalnızca bu tarayıcının yerel depolamasında (localStorage)
            tutulur; hiçbir sunucuya gönderilmez. Tarayıcı verilerini temizlersen bahçen de silinir.
          </p>
          <p>
            Özet değerlendirmeleri şu an tarayıcında çalışan bir demo ile yapılır. Gerçek AI değerlendirmesi eklendiğinde,
            özetlerin değerlendirme için sunucuya gönderileceği burada açıkça belirtilecek.
          </p>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button type="button" onClick={download} className={buttonStyles({ variant: 'secondary' })}>
            <Download size={17} aria-hidden="true" />
            Verilerimi indir (JSON)
          </button>
          {hasDemoData(data) && (
            <button type="button" onClick={() => setAction('remove-demo')} className={buttonStyles({ variant: 'secondary' })}>
              <Trash2 size={17} aria-hidden="true" />
              Örnek verileri kaldır
            </button>
          )}
          <button type="button" onClick={() => setAction('reset')} className={buttonStyles({ variant: 'secondary' })}>
            <RotateCcw size={17} aria-hidden="true" />
            Örnek verilerle sıfırla
          </button>
          <button type="button" onClick={() => setAction('clear')} className={buttonStyles({ variant: 'danger' })}>
            <Trash2 size={17} aria-hidden="true" />
            Tüm kitap ve yazıları sil
          </button>
        </div>
      </Section>

      <ConfirmDialog
        open={dialog !== null}
        tone={action === 'remove-demo' ? 'primary' : 'danger'}
        title={dialog?.title ?? ''}
        description={dialog?.description ?? ''}
        confirmLabel={dialog?.confirm ?? ''}
        onCancel={() => setAction(null)}
        onConfirm={() => {
          dialog?.run();
          setAction(null);
        }}
      />
    </PageContainer>
  );
}
