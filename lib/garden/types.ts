/**
 * D-Garden kişisel bahçe veri modelleri.
 *
 * Okuma durumu (`status`) ile özet/doğrulama durumu (`summary.status`) bilerek ayrı tutulur:
 * bir kitabın "tamamlandı" olması, özetinin doğrulandığı anlamına gelmez.
 */

export type ReadingStatus = 'reading-list' | 'reading' | 'completed';

/**
 * Özetin yaşam döngüsü.
 * draft → pending → evaluating → verified | needs-improvement | failed
 */
export type SummaryStatus =
  | 'draft'
  | 'pending'
  | 'evaluating'
  | 'verified'
  | 'needs-improvement'
  | 'failed';

export type CriterionLevel = 'strong' | 'partial' | 'weak' | 'unrated';

export type EvaluationCriterion = {
  key: string;
  label: string;
  level: CriterionLevel;
  note: string;
};

export type SummaryEvaluation = {
  /** `mock` sonuçlar arayüzde her zaman "demo" olarak işaretlenir. */
  source: 'mock' | 'ai';
  evaluatedAt: string;
  outcome: 'verified' | 'needs-improvement';
  feedback: string;
  criteria: EvaluationCriterion[];
  suggestions: string[];
};

export type BookSummary = {
  text: string;
  status: SummaryStatus;
  updatedAt: string;
  submittedAt?: string;
  /** Son başarılı değerlendirme sonucu */
  evaluation?: SummaryEvaluation;
  /** Değerlendirme başarısız olduğunda gösterilen hata */
  error?: string;
  attempts: number;
};

export type LibraryBook = {
  id: string;
  title: string;
  author: string;
  category: string;
  status: ReadingStatus;
  coverColor: string;
  pageCount?: number;
  currentPage?: number;
  addedAt: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
  summary?: BookSummary;
  /** Örnek veri; kullanıcı eklemedi */
  isDemo?: boolean;
};

export type WorkType = 'essay' | 'review' | 'story' | 'poem' | 'note';

export type WorkStatus = 'draft' | 'completed';

export type Work = {
  id: string;
  title: string;
  type: WorkType;
  tags: string[];
  /** Temizlenmiş (sanitize edilmiş) HTML */
  content: string;
  status: WorkStatus;
  relatedBookId?: string;
  createdAt: string;
  updatedAt: string;
  isDemo?: boolean;
};

export type Profile = {
  displayName: string;
  username: string;
  bio: string;
  avatarColor: string;
};

export type Preferences = {
  animateTree: boolean;
  librarySort: BookSort;
  notifyEvaluation: boolean;
  notifyWeeklySummary: boolean;
  /** Demo: değerlendirmenin başarısız olma durumunu denemek için */
  simulateEvaluationFailure: boolean;
};

export type GardenData = {
  version: 1;
  books: LibraryBook[];
  works: Work[];
  profile: Profile;
  preferences: Preferences;
};

export type BookSort = 'recent' | 'title' | 'author' | 'progress';
