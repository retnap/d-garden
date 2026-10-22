"use client";

import {
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  Eye,
  FileText,
  Plus,
  Save,
  Send,
  Trash2,
  X,
} from "lucide-react";
import RichTextEditor from "@/components/write/RichTextEditor";
import { sanitizeRichText } from "@/components/write/editorExtensions";

type WorkType = "review" | "essay" | "story" | "novel";

type Chapter = {
  id: string;
  title: string;
  content: string;
};

type Draft = {
  workType: WorkType;
  title: string;
  description: string;
  category: string;
  tags: string[];
  bookTitle: string;
  chapters: Chapter[];
  activeChapterId: string;
};

type StatusMessage = {
  tone: "info" | "success" | "error";
  text: string;
};

type SaveState = "saving" | "saved" | "error";

const STORAGE_KEY = "dgarden-write-draft-v1";
const BACKUP_KEY = `${STORAGE_KEY}-unreadable-backup`;
const AUTOSAVE_DELAY = 500;
const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;
const MAX_CHAPTER_TITLE_LENGTH = 100;

const STORAGE_ERROR_MESSAGE =
  "Taslak kaydedilemedi. Tarayıcı depolama alanı dolmuş veya erişime kapalı olabilir; büyük görselleri kaldırıp tekrar dene.";

const workTypes: { value: WorkType; label: string }[] = [
  { value: "review", label: "Kitap incelemesi" },
  { value: "essay", label: "Deneme" },
  { value: "story", label: "Hikâye" },
  { value: "novel", label: "Roman" },
];

const categories = [
  "Kitap İncelemesi",
  "Kişisel Yorum",
  "Kitap Analizi",
  "Alıntılar",
  "Deneme",
  "Öykü",
  "Roman",
];

// Tür değiştiğinde kategori yalnızca önceki türün varsayılanındaysa güncellenir;
// kullanıcının seçtiği özel kategori korunur.
const defaultCategories: Record<WorkType, string> = {
  review: "Kitap İncelemesi",
  essay: "Deneme",
  story: "Öykü",
  novel: "Roman",
};

function createChapterId() {
  return `chapter-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function createInitialChapter(): Chapter {
  return {
    id: "chapter-1",
    title: "Bölüm 1",
    content: "",
  };
}

function createEmptyDraft(): Draft {
  const chapter = createInitialChapter();

  return {
    workType: "review",
    title: "",
    description: "",
    category: defaultCategories.review,
    tags: [],
    bookTitle: "",
    chapters: [chapter],
    activeChapterId: chapter.id,
  };
}

function isWorkType(value: unknown): value is WorkType {
  return (
    value === "review" ||
    value === "essay" ||
    value === "story" ||
    value === "novel"
  );
}

function normalizeTag(value: string) {
  return value
    .trim()
    .replace(/^#+/, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TAG_LENGTH);
}

function isSameTag(a: string, b: string) {
  return a.toLocaleLowerCase("tr-TR") === b.toLocaleLowerCase("tr-TR");
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const tags: string[] = [];

  for (const item of value) {
    if (typeof item !== "string") continue;

    const tag = normalizeTag(item);
    if (!tag || tags.some((existing) => isSameTag(existing, tag))) continue;

    tags.push(tag);
    if (tags.length === MAX_TAGS) break;
  }

  return tags;
}

// Eksik alanlı bölümler atılmaz; içerik kurtarılır, eksikler varsayılanla doldurulur.
function normalizeChapters(value: unknown): Chapter[] {
  if (!Array.isArray(value)) return [];

  const chapters: Chapter[] = [];
  const seenIds = new Set<string>();

  for (const item of value) {
    if (!item || typeof item !== "object") continue;

    const saved = item as Record<string, unknown>;
    let id = typeof saved.id === "string" ? saved.id : "";

    if (!id || seenIds.has(id)) id = createChapterId();
    seenIds.add(id);

    chapters.push({
      id,
      title:
        typeof saved.title === "string" && saved.title.trim()
          ? saved.title
          : `Bölüm ${chapters.length + 1}`,
      content: typeof saved.content === "string" ? saved.content : "",
    });
  }

  return chapters;
}

type StoredDraft =
  | { kind: "empty" }
  | { kind: "restored"; draft: Draft; repaired: boolean }
  | { kind: "unreadable"; raw: string }
  | { kind: "unavailable" };

function readDraft(): StoredDraft {
  let raw: string | null;

  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error("Taslak okunamadı:", error);
    return { kind: "unavailable" };
  }

  if (!raw) return { kind: "empty" };

  let value: unknown;

  try {
    value = JSON.parse(raw);
  } catch {
    return { kind: "unreadable", raw };
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { kind: "unreadable", raw };
  }

  const saved = value as Record<string, unknown>;
  const workType = isWorkType(saved.workType) ? saved.workType : "review";
  const chapters = normalizeChapters(saved.chapters);

  if (!chapters.length) chapters.push(createInitialChapter());

  const draft: Draft = {
    workType,
    title: typeof saved.title === "string" ? saved.title : "",
    description:
      typeof saved.description === "string" ? saved.description : "",
    category:
      typeof saved.category === "string" &&
      categories.includes(saved.category)
        ? saved.category
        : defaultCategories[workType],
    tags: normalizeTags(saved.tags),
    bookTitle: typeof saved.bookTitle === "string" ? saved.bookTitle : "",
    chapters,
    activeChapterId: chapters.some(
      (chapter) => chapter.id === saved.activeChapterId
    )
      ? (saved.activeChapterId as string)
      : chapters[0].id,
  };

  // Kayıtlar JSON.stringify(draft) ile aynı alan sırasında yazılır;
  // fark varsa en az bir alan düzeltilmiştir.
  return { kind: "restored", draft, repaired: JSON.stringify(draft) !== raw };
}

function writeStorage(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.error("Taslak kaydedilemedi:", error);
    return false;
  }
}

type InitialState = {
  draft: Draft;
  serialized: string;
  restored: boolean;
  notice: StatusMessage | null;
};

function loadInitialState(): InitialState {
  const stored = readDraft();
  const draft = stored.kind === "restored" ? stored.draft : createEmptyDraft();
  let notice: StatusMessage | null = null;

  if (stored.kind === "restored" && stored.repaired) {
    notice = {
      tone: "info",
      text: "Taslağın geri yüklendi. Okunamayan bazı alanlar varsayılan değerlerle dolduruldu.",
    };
  } else if (stored.kind === "unreadable") {
    // Okunamayan veri, yeni taslak üzerine yazılmadan önce yedeklenir.
    notice = writeStorage(BACKUP_KEY, stored.raw)
      ? {
          tone: "error",
          text: `Kayıtlı taslak okunamadı; boş bir taslakla başlandı. Eski veri bu tarayıcıda "${BACKUP_KEY}" anahtarıyla yedeklendi.`,
        }
      : {
          tone: "error",
          text: "Kayıtlı taslak okunamadı ve yedeklenemedi. Yazmaya başladığında eski verinin üzerine yazılacak.",
        };
  } else if (stored.kind === "unavailable") {
    notice = {
      tone: "error",
      text: "Tarayıcı depolama alanına erişilemiyor. Taslağın bu oturumda kaydedilemeyecek.",
    };
  }

  return {
    draft,
    // Başlangıç değeri "kaydedilmiş" kabul edilir: açılışta boş taslak yazılmaz,
    // düzeltilmiş taslak da kullanıcı değişiklik yapana kadar ham veriyi ezmez.
    serialized: JSON.stringify(draft),
    restored: stored.kind === "restored",
    notice,
  };
}

// Paragraf ve blok sınırları metin içinde boşluğa çevrilir; aksi hâlde
// "<p>bir</p><p>iki</p>" tek kelime sayılır.
const BLOCK_TAG_PATTERN =
  /<(\/?(?:p|h[1-6]|li|ul|ol|blockquote|br|hr|img|div)\b)/gi;
const WORD_PATTERN = /[\p{L}\p{N}]/u;

// DOMParser ile oluşturulan belge etkisizdir: betikler ve olay nitelikleri
// (ör. <img onerror>) çalışmaz. Bu nedenle innerHTML yerine kullanılır.
function parseHtml(html: string) {
  return new DOMParser().parseFromString(html, "text/html").body;
}

function countWords(html: string) {
  if (!html) return 0;

  const text = parseHtml(html.replace(BLOCK_TAG_PATTERN, " <$1")).textContent;

  return (text ?? "")
    .split(/\s+/)
    .filter((word) => WORD_PATTERN.test(word)).length;
}

function hasMeaningfulContent(html: string) {
  if (!html) return false;

  const body = parseHtml(html);
  return Boolean(body.textContent?.trim()) || body.querySelector("img") !== null;
}

const subscribeToNothing = () => () => {};

export default function WritePage() {
  // localStorage yalnızca tarayıcıda okunabilir. Sunucu ve hydration render'ı
  // yükleme görünümünü üretir; ardından taslak, effect içinde setState
  // çağırmadan, WriteWorkspace'in başlangıç state'i olarak okunur.
  const isClient = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false
  );

  if (!isClient) {
    return (
      <main className="min-h-screen bg-white px-4 pb-12 pt-24 text-[#193128] sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1600px]">
          <p role="status" className="text-sm text-[#65766D]">
            Taslak yükleniyor…
          </p>
          <div className="mt-6 min-h-[420px] animate-pulse rounded-2xl border border-[#DCE8E1] bg-[#F4FAF6]" />
        </div>
      </main>
    );
  }

  return <WriteWorkspace />;
}

function WriteWorkspace() {
  const [initial] = useState(loadInitialState);
  const [draft, setDraft] = useState<Draft>(initial.draft);
  const [tagInput, setTagInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [status, setStatus] = useState<StatusMessage | null>(initial.notice);

  // Son başarılı kaydın ve son başarısız denemenin içerikleri.
  // Kayıt durumu bunlardan türetilir; ayrıca state tutulmaz.
  const [savedSnapshot, setSavedSnapshot] = useState(initial.serialized);
  const [failedSnapshot, setFailedSnapshot] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  const previewTriggerRef = useRef<HTMLButtonElement>(null);
  const previewCloseRef = useRef<HTMLButtonElement>(null);

  const serialized = useMemo(() => JSON.stringify(draft), [draft]);

  const saveState: SaveState =
    serialized === failedSnapshot
      ? "error"
      : serialized !== savedSnapshot
        ? "saving"
        : "saved";

  const hasChapters =
    draft.workType === "story" || draft.workType === "novel";

  const activeChapter = useMemo(
    () =>
      draft.chapters.find(
        (chapter) => chapter.id === draft.activeChapterId
      ) ?? draft.chapters[0],
    [draft.chapters, draft.activeChapterId]
  );

  // Tek parça türlerde yalnızca aktif bölüm görünür ve yayınlanır.
  // Diğer bölümler silinmez; hikâye/romana dönüldüğünde geri gelir.
  const visibleChapters = useMemo(
    () => (hasChapters ? draft.chapters : [activeChapter]),
    [hasChapters, draft.chapters, activeChapter]
  );

  const wordCount = useMemo(
    () =>
      visibleChapters.reduce(
        (total, chapter) => total + countWords(chapter.content),
        0
      ),
    [visibleChapters]
  );

  const previewChapters = useMemo(
    () =>
      showPreview
        ? visibleChapters.map((chapter) => ({
            id: chapter.id,
            title: chapter.title,
            html: hasMeaningfulContent(chapter.content)
              ? sanitizeRichText(chapter.content)
              : "",
          }))
        : [],
    [showPreview, visibleChapters]
  );

  function persist(value: string): boolean {
    if (writeStorage(STORAGE_KEY, value)) {
      setSavedSnapshot(value);
      setFailedSnapshot(null);
      setLastSavedAt(new Date());
      return true;
    }

    setFailedSnapshot(value);
    return false;
  }

  const autosave = useEffectEvent((value: string) => {
    if (!persist(value)) {
      setStatus({ tone: "error", text: STORAGE_ERROR_MESSAGE });
    }
  });

  const flushPendingSave = useEffectEvent(() => {
    if (serialized !== savedSnapshot && serialized !== failedSnapshot) {
      persist(serialized);
    }
  });

  // Değişiklikleri tarayıcıya otomatik kaydet. Yeni bir değişiklik bekleyen
  // zamanlayıcıyı iptal eder; böylece eski içerik daha yenisinin üzerine yazılamaz.
  // Başarısız içerik, değişene kadar ya da manuel kayda kadar yeniden denenmez.
  useEffect(() => {
    if (serialized === savedSnapshot || serialized === failedSnapshot) return;

    const timeoutId = window.setTimeout(
      () => autosave(serialized),
      AUTOSAVE_DELAY
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [serialized, savedSnapshot, failedSnapshot]);

  // Sekme kapanırken veya arka plana alınırken bekleyen kaydı hemen yaz.
  // Tarayıcılar bu olayların her durumda tetikleneceğini garanti etmez.
  useEffect(() => {
    const handlePageHide = () => flushPendingSave();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") flushPendingSave();
    };

    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Önizleme açıkken odağı modala taşı, Escape ile kapat.
  useEffect(() => {
    if (!showPreview) return;

    previewCloseRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setShowPreview(false);
      previewTriggerRef.current?.focus();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showPreview]);

  function closePreview() {
    setShowPreview(false);
    previewTriggerRef.current?.focus();
  }

  function updateDraft<K extends keyof Draft>(
    key: K,
    value: Draft[K]
  ) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateChapter(id: string, changes: Partial<Chapter>) {
    setDraft((current) => ({
      ...current,
      chapters: current.chapters.map((chapter) =>
        chapter.id === id ? { ...chapter, ...changes } : chapter
      ),
    }));
  }

  function addChapter() {
    const chapter: Chapter = {
      id: createChapterId(),
      title: `Bölüm ${draft.chapters.length + 1}`,
      content: "",
    };

    setDraft((current) => ({
      ...current,
      chapters: [...current.chapters, chapter],
      activeChapterId: chapter.id,
    }));

    setStatus({ tone: "success", text: "Yeni bölüm eklendi." });
  }

  function deleteChapter(id: string) {
    if (draft.chapters.length <= 1) {
      setStatus({ tone: "error", text: "En az bir bölüm bulunmalı." });
      return;
    }

    const index = draft.chapters.findIndex((chapter) => chapter.id === id);
    if (index === -1) return;

    const chapter = draft.chapters[index];

    if (
      hasMeaningfulContent(chapter.content) &&
      !window.confirm(
        `"${chapter.title || "Başlıksız bölüm"}" bölümü ve içeriği silinsin mi? Bu işlem geri alınamaz.`
      )
    ) {
      return;
    }

    const remaining = draft.chapters.filter((item) => item.id !== id);

    // Aktif bölüm silinirse bir önceki (ilk bölümse bir sonraki) bölüme geç.
    const activeChapterId =
      draft.activeChapterId === id
        ? remaining[Math.max(0, index - 1)].id
        : draft.activeChapterId;

    setDraft((current) => ({
      ...current,
      chapters: remaining,
      activeChapterId,
    }));

    setStatus({ tone: "success", text: "Bölüm silindi." });
  }

  function renameChapter(id: string) {
    const chapter = draft.chapters.find((item) => item.id === id);
    if (!chapter) return;

    const nextTitle = window.prompt("Bölüm başlığı:", chapter.title);

    if (nextTitle === null) return;

    if (!nextTitle.trim()) {
      setStatus({ tone: "error", text: "Bölüm başlığı boş bırakılamaz." });
      return;
    }

    updateChapter(id, {
      title: nextTitle.trim().slice(0, MAX_CHAPTER_TITLE_LENGTH),
    });
  }

  function addTag(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const tag = normalizeTag(tagInput);

    if (!tag) {
      setTagInput("");
      return;
    }

    if (draft.tags.some((existing) => isSameTag(existing, tag))) {
      setStatus({ tone: "error", text: "Bu etiket zaten eklenmiş." });
      return;
    }

    if (draft.tags.length >= MAX_TAGS) {
      setStatus({
        tone: "error",
        text: `En fazla ${MAX_TAGS} etiket ekleyebilirsin.`,
      });
      return;
    }

    updateDraft("tags", [...draft.tags, tag]);
    setTagInput("");
  }

  function saveDraft() {
    if (persist(serialized)) {
      setStatus({
        tone: "success",
        text: "Taslağın bu tarayıcıya kaydedildi.",
      });
    } else {
      setStatus({ tone: "error", text: STORAGE_ERROR_MESSAGE });
    }
  }

  function publish() {
    if (!draft.title.trim()) {
      setStatus({
        tone: "error",
        text: "Devam etmeden önce eser başlığını gir.",
      });
      return;
    }

    if (hasChapters) {
      const untitled = draft.chapters.findIndex(
        (chapter) => !chapter.title.trim()
      );

      if (untitled !== -1) {
        setStatus({
          tone: "error",
          text: `${untitled + 1}. bölümün başlığı boş. Yayınlamadan önce bölüm başlığını gir.`,
        });
        return;
      }
    }

    const emptyChapter = visibleChapters.find(
      (chapter) => !hasMeaningfulContent(chapter.content)
    );

    if (emptyChapter) {
      setStatus({
        tone: "error",
        text: hasChapters
          ? `"${emptyChapter.title}" bölümü boş. Yayınlamadan önce içerik ekle veya bölümü sil.`
          : "Yayınlamadan önce içerik eklemelisin.",
      });
      return;
    }

    setStatus({
      tone: "info",
      text: "Kontroller tamamlandı. Gerçek yayınlama henüz etkin değil; backend bağlantısı gerekiyor.",
    });
  }

  function changeWorkType(nextType: WorkType) {
    setDraft((current) => ({
      ...current,
      workType: nextType,
      category:
        current.category === defaultCategories[current.workType]
          ? defaultCategories[nextType]
          : current.category,
    }));
  }

  return (
    <main className="min-h-screen bg-white px-4 pb-12 pt-24 text-[#193128] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#DCE8E1] pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/explore"
              aria-label="Keşfet sayfasına dön"
              className="flex size-10 items-center justify-center rounded-xl border border-[#DCE8E1] text-[#1F5D42] transition hover:bg-[#F4FAF6]"
            >
              <ArrowLeft size={19} />
            </Link>

            <div>
              <h1 className="font-display text-2xl sm:text-3xl">
                Eser editörü
              </h1>
              <p className="mt-1 text-sm text-[#65766D]">
                Oku. Düşün. Üret.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs text-[#65766D]">
              {wordCount} kelime
            </span>

            <button
              type="button"
              onClick={saveDraft}
              className="inline-flex items-center gap-2 rounded-xl border border-[#DCE8E1] px-3 py-2.5 text-sm transition hover:bg-[#F4FAF6]"
            >
              <Save size={16} />
              Kaydet
            </button>

            <button
              ref={previewTriggerRef}
              type="button"
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#DCE8E1] px-3 py-2.5 text-sm transition hover:bg-[#F4FAF6]"
            >
              <Eye size={16} />
              Önizle
            </button>

            <button
              type="button"
              onClick={publish}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1F5D42] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#153D2D]"
            >
              <Send size={16} />
              Yayınla
            </button>
          </div>
        </header>

        {status && (
          <div
            role={status.tone === "error" ? "alert" : "status"}
            className={`mb-5 flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm ${
              status.tone === "error"
                ? "bg-red-50 text-red-700"
                : "bg-[#F4FAF6] text-[#1F5D42]"
            }`}
          >
            <span>{status.text}</span>
            <button
              type="button"
              onClick={() => setStatus(null)}
              aria-label="Mesajı kapat"
              className="shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <p
          role="status"
          className={`mb-4 text-right text-xs ${
            saveState === "error"
              ? "text-red-600"
              : saveState === "saved"
                ? "text-[#1F5D42]"
                : "text-[#65766D]"
          }`}
        >
          {saveState === "saving" && "Kaydediliyor…"}

          {saveState === "saved" &&
            (lastSavedAt
              ? `✓ Kaydedildi · ${lastSavedAt.toLocaleTimeString("tr-TR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
              : initial.restored
                ? "✓ Taslak geri yüklendi"
                : "Değişiklikler bu tarayıcıya otomatik kaydedilir")}

          {saveState === "error" && "Kaydedilemedi · Kaydet ile tekrar dene"}
        </p>

        {/* Mobil: yatay kaydırılabilir bölüm şeridi */}
        {hasChapters && (
          <nav
            aria-label="Bölümler"
            className="mb-5 flex items-center gap-2 overflow-x-auto border-b border-[#DCE8E1] pb-3 lg:hidden"
          >
            {draft.chapters.map((chapter, index) => (
              <div key={chapter.id} className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateDraft("activeChapterId", chapter.id)}
                  aria-current={
                    draft.activeChapterId === chapter.id ? "true" : undefined
                  }
                  className={`max-w-48 truncate rounded-xl px-3 py-2 text-sm ${
                    draft.activeChapterId === chapter.id
                      ? "bg-[#1F5D42] text-white"
                      : "bg-[#F4FAF6] text-[#65766D]"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}{" "}
                  {chapter.title || "Başlıksız bölüm"}
                </button>
                <button
                  type="button"
                  onClick={() => renameChapter(chapter.id)}
                  aria-label={`${chapter.title || "Başlıksız bölüm"} başlığını düzenle`}
                  className="flex size-8 items-center justify-center rounded-lg text-[#65766D] hover:bg-[#F4FAF6]"
                >
                  <FileText size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => deleteChapter(chapter.id)}
                  aria-label={`${chapter.title || "Başlıksız bölüm"} bölümünü sil`}
                  className="flex size-8 items-center justify-center rounded-lg text-[#65766D] hover:bg-[#F4FAF6] hover:text-red-700"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addChapter}
              aria-label="Yeni bölüm ekle"
              className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-dashed border-[#B8CFC0] text-[#1F5D42]"
            >
              <Plus size={17} />
            </button>
          </nav>
        )}

        <div
          className={`grid grid-cols-1 items-start gap-6 ${
            hasChapters
              ? "lg:grid-cols-[220px_minmax(0,1fr)_280px]"
              : "lg:grid-cols-[minmax(0,1fr)_280px]"
          } xl:gap-8`}
        >
          {/* Sol panel: yalnızca hikâye ve romanda */}
          {hasChapters && (
            <aside className="hidden lg:sticky lg:top-24 lg:block">
              <div className="rounded-2xl border border-[#DCE8E1] bg-[#F4FAF6] p-3">
                <div className="mb-3 flex items-center justify-between px-1">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-[#65766D]">
                    Bölümler
                  </h2>
                  <span className="text-xs text-[#65766D]">
                    {draft.chapters.length}
                  </span>
                </div>

                <div className="max-h-[60vh] space-y-1 overflow-y-auto">
                  {draft.chapters.map((chapter, index) => (
                    <div
                      key={chapter.id}
                      className={`group flex items-center gap-1 rounded-xl ${
                        draft.activeChapterId === chapter.id
                          ? "bg-[#DDEFE5]"
                          : "hover:bg-white"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          updateDraft("activeChapterId", chapter.id)
                        }
                        aria-current={
                          draft.activeChapterId === chapter.id
                            ? "true"
                            : undefined
                        }
                        className={`min-w-0 flex-1 px-2 py-2.5 text-left text-sm ${
                          draft.activeChapterId === chapter.id
                            ? "font-semibold text-[#1F5D42]"
                            : "text-[#65766D]"
                        }`}
                      >
                        <span className="mr-1.5 text-xs opacity-60">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="break-words">
                          {chapter.title || "Başlıksız bölüm"}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => renameChapter(chapter.id)}
                        aria-label={`${chapter.title || "Başlıksız bölüm"} başlığını düzenle`}
                        className="px-1 text-xs text-[#65766D] hover:text-[#1F5D42]"
                      >
                        Düzenle
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteChapter(chapter.id)}
                        aria-label={`${chapter.title || "Başlıksız bölüm"} bölümünü sil`}
                        className="mr-1 text-[#65766D] hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addChapter}
                  className="mt-3 flex w-full items-center gap-2 rounded-xl border border-dashed border-[#B8CFC0] px-3 py-3 text-sm font-medium text-[#1F5D42] transition hover:bg-white"
                >
                  <Plus size={17} />
                  Bölüm ekle
                </button>
              </div>
            </aside>
          )}

          {/* Orta panel: yazı editörü */}
          <section className="min-w-0">
            <div className="mb-5">
              <label
                htmlFor="work-type"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#65766D]"
              >
                Eser türü
              </label>

              <div className="relative max-w-sm">
                <select
                  id="work-type"
                  value={draft.workType}
                  onChange={(event) => {
                    if (isWorkType(event.target.value)) {
                      changeWorkType(event.target.value);
                    }
                  }}
                  className="w-full appearance-none rounded-xl border border-[#DCE8E1] bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:border-[#1F5D42] focus:ring-2 focus:ring-[#DDEFE5]"
                >
                  {workTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#65766D]"
                />
              </div>
            </div>

            <input
              value={draft.title}
              onChange={(event) => updateDraft("title", event.target.value)}
              maxLength={120}
              placeholder="Eserinin başlığı..."
              aria-label="Eser başlığı"
              className="mb-4 w-full border-0 bg-transparent p-0 font-display text-3xl leading-tight outline-none placeholder:text-[#B1BEB6] focus:ring-0 sm:text-4xl"
            />

            <textarea
              value={draft.description}
              onChange={(event) =>
                updateDraft("description", event.target.value)
              }
              maxLength={240}
              rows={2}
              placeholder="Kısa bir açıklama ekle..."
              aria-label="Eser açıklaması"
              className="mb-5 w-full resize-y border-0 bg-transparent p-0 text-base leading-7 text-[#65766D] outline-none placeholder:text-[#B1BEB6] focus:ring-0"
            />

            {hasChapters && activeChapter && (
              <div className="mb-4 border-y border-[#DCE8E1] py-3">
                <label
                  htmlFor="active-chapter-title"
                  className="mb-2 block text-xs text-[#65766D]"
                >
                  Aktif bölüm
                </label>
                <input
                  id="active-chapter-title"
                  value={activeChapter.title}
                  onChange={(event) =>
                    updateChapter(activeChapter.id, {
                      title: event.target.value,
                    })
                  }
                  maxLength={MAX_CHAPTER_TITLE_LENGTH}
                  placeholder="Bölüm başlığı"
                  className="w-full border-0 bg-transparent p-0 font-display text-xl font-medium outline-none placeholder:text-[#B1BEB6] focus:ring-0"
                />
              </div>
            )}

            <RichTextEditor
              key={activeChapter.id}
              content={activeChapter.content}
              onChange={(html) =>
                updateChapter(activeChapter.id, { content: html })
              }
            />

            <div className="mt-4 flex justify-between gap-3 border-t border-[#DCE8E1] pt-3 text-xs text-[#65766D]">
              <span className="min-w-0 truncate">
                {hasChapters
                  ? activeChapter.title || "Başlıksız bölüm"
                  : "Yazı içeriği"}
              </span>
              <span className="shrink-0">{wordCount} kelime toplam</span>
            </div>
          </section>

          {/* Sağ panel: eser ayarları */}
          <aside className="space-y-5 lg:sticky lg:top-24">
            <section className="rounded-2xl border border-[#DCE8E1] bg-[#F4FAF6] p-5">
              <h2 className="font-display text-xl">Eser ayarları</h2>
              <p className="mt-1 text-sm text-[#65766D]">
                Eserini sınıflandır.
              </p>

              <div className="mt-5">
                <label
                  htmlFor="book-title"
                  className="mb-2 block text-sm font-medium"
                >
                  İlişkili kitap
                </label>
                <div className="relative">
                  <BookOpen
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#65766D]"
                  />
                  <input
                    id="book-title"
                    value={draft.bookTitle}
                    onChange={(event) =>
                      updateDraft("bookTitle", event.target.value)
                    }
                    maxLength={160}
                    placeholder="Kitap adı (isteğe bağlı)"
                    className="w-full rounded-xl border border-[#DCE8E1] bg-white py-3 pl-9 pr-3 text-sm outline-none focus:border-[#1F5D42]"
                  />
                </div>
                <p className="mt-2 text-xs leading-5 text-[#65766D]">
                  Şimdilik kitap adı elle giriliyor.
                </p>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-medium"
                >
                  Kategori
                </label>
                <select
                  id="category"
                  value={draft.category}
                  onChange={(event) => {
                    if (categories.includes(event.target.value)) {
                      updateDraft("category", event.target.value);
                    }
                  }}
                  className="w-full rounded-xl border border-[#DCE8E1] bg-white px-3 py-3 text-sm outline-none focus:border-[#1F5D42]"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="tag-input"
                  className="mb-2 block text-sm font-medium"
                >
                  Etiketler
                </label>

                {draft.tags.length > 0 && (
                  <ul aria-label="Eklenen etiketler" className="mb-3 flex flex-wrap gap-2">
                    {draft.tags.map((tag) => (
                      <li
                        key={tag}
                        className="inline-flex max-w-full items-center gap-1 rounded-full bg-[#DDEFE5] px-3 py-1.5 text-xs text-[#1F5D42]"
                      >
                        <span className="break-all">#{tag}</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateDraft(
                              "tags",
                              draft.tags.filter((item) => item !== tag)
                            )
                          }
                          aria-label={`${tag} etiketini kaldır`}
                          className="shrink-0"
                        >
                          <X size={12} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <form onSubmit={addTag} className="flex gap-2">
                  <input
                    id="tag-input"
                    value={tagInput}
                    onChange={(event) => setTagInput(event.target.value)}
                    placeholder="Etiket ekle"
                    maxLength={MAX_TAG_LENGTH + 1}
                    aria-describedby="tag-help"
                    className="min-w-0 flex-1 rounded-xl border border-[#DCE8E1] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#1F5D42]"
                  />
                  <button
                    type="submit"
                    aria-label="Etiket ekle"
                    className="rounded-xl border border-[#DCE8E1] bg-white px-3 text-sm text-[#1F5D42] transition hover:bg-[#DDEFE5]"
                  >
                    <Plus size={16} />
                  </button>
                </form>
                <p id="tag-help" className="mt-2 text-xs text-[#65766D]">
                  {draft.tags.length}/{MAX_TAGS} etiket
                </p>
              </div>
            </section>

            <section className="rounded-2xl border border-[#DCE8E1] p-5">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[#1F5D42]" />
                <h2 className="font-medium">Yayın bilgisi</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-[#65766D]">
                {hasChapters
                  ? `${draft.chapters.length} bölüm. Her bölümün içeriği ayrı tutulur.`
                  : "Tek parça bir yazı hazırlıyorsun. Bölüm paneli bu tür için gizlidir."}
              </p>
              {!hasChapters && draft.chapters.length > 1 && (
                <p className="mt-3 text-xs leading-5 text-[#65766D]">
                  Diğer {draft.chapters.length - 1} bölüm korunuyor; hikâye
                  veya roman türüne dönersen yeniden görünür.
                </p>
              )}
              <p className="mt-3 text-xs leading-5 text-[#65766D]">
                Taslaklar bu tarayıcıda saklanır; hesabına yüklenmez.
              </p>
            </section>
          </aside>
        </div>
      </div>

      {/* Önizleme */}
      {showPreview && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#193128]/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePreview();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-title"
            className="max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-10"
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="rounded-full bg-[#DDEFE5] px-3 py-1.5 text-xs text-[#1F5D42]">
                Önizleme
              </span>
              <button
                ref={previewCloseRef}
                type="button"
                onClick={closePreview}
                aria-label="Önizlemeyi kapat"
                className="flex size-9 items-center justify-center rounded-lg hover:bg-[#F4FAF6]"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-[#1F5D42]">
              {workTypes.find((type) => type.value === draft.workType)?.label}
              {" · "}
              {draft.category}
            </p>

            <h2
              id="preview-title"
              className="mt-3 break-words font-display text-3xl sm:text-4xl"
            >
              {draft.title || "Başlıksız eser"}
            </h2>

            {draft.description && (
              <p className="mt-4 whitespace-pre-line break-words text-lg leading-7 text-[#65766D]">
                {draft.description}
              </p>
            )}

            {draft.bookTitle && (
              <p className="mt-3 break-words text-sm text-[#65766D]">
                İlişkili kitap: {draft.bookTitle}
              </p>
            )}

            <div className="mt-8 space-y-8">
              {previewChapters.map((chapter) => (
                <article key={chapter.id}>
                  {hasChapters && (
                    <h3 className="mb-3 break-words font-display text-xl">
                      {chapter.title || "Başlıksız bölüm"}
                    </h3>
                  )}

                  {chapter.html ? (
                    <div
                      className="rich-text-preview max-w-none break-words text-base text-[#193128]"
                      // HTML, editörün şemasından geçirilerek temizlenmiştir
                      // (sanitizeRichText). Yayınlamadan önce sunucuda da
                      // ayrıca temizlenmelidir.
                      dangerouslySetInnerHTML={{ __html: chapter.html }}
                    />
                  ) : (
                    <p className="text-sm text-[#65766D]">Henüz içerik yok.</p>
                  )}
                </article>
              ))}
            </div>

            {draft.tags.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {draft.tags.map((tag) => (
                  <span
                    key={tag}
                    className="max-w-full break-all rounded-full bg-[#F4FAF6] px-3 py-1.5 text-sm text-[#1F5D42]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
