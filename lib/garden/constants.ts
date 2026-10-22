import type { BookSort, ReadingStatus, SummaryStatus, WorkStatus, WorkType } from './types';

export const BOOK_CATEGORIES = [
  'Roman',
  'Klasik',
  'Bilim Kurgu',
  'Fantastik',
  'Polisiye',
  'Kişisel Gelişim',
  'Psikoloji',
  'Felsefe',
  'Tarih',
  'Biyografi',
  'Bilim',
  'Diğer',
] as const;

export const READING_STATUS_LABELS: Record<ReadingStatus, string> = {
  'reading-list': 'Okuma listesinde',
  reading: 'Okuyorum',
  completed: 'Tamamlandı',
};

export const READING_STATUS_ORDER: ReadingStatus[] = ['reading-list', 'reading', 'completed'];

/** `none`: tamamlanmış ama henüz özet yazılmamış kitap */
export type SummaryState = SummaryStatus | 'none';

export const SUMMARY_STATUS_LABELS: Record<SummaryState, string> = {
  none: 'Özet yok',
  draft: 'Özet taslağı',
  pending: 'Değerlendirme bekliyor',
  evaluating: 'Değerlendiriliyor',
  verified: 'Doğrulandı',
  'needs-improvement': 'Geliştirilmeli',
  failed: 'Değerlendirme başarısız',
};

export const SUMMARY_STATUS_DESCRIPTIONS: Record<SummaryState, string> = {
  none: 'Kitabı bitirdin. Özetini yazdığında bahçene katkı sağlayabilir.',
  draft: 'Özetin kaydedildi ama henüz değerlendirmeye gönderilmedi.',
  pending: 'Özetin değerlendirme sırasında bekliyor.',
  evaluating: 'Özetin şu anda değerlendiriliyor.',
  verified: 'Özetin doğrulandı ve ağacının büyümesine katkı sağladı.',
  'needs-improvement': 'Özetin için geliştirme önerileri var. Düzenleyip yeniden gönderebilirsin.',
  failed: 'Değerlendirme tamamlanamadı. Özetin korunuyor; yeniden deneyebilirsin.',
};

/**
 * Formdaki ilk doğrulama sınırı. Bu yalnızca arayüz kontrolüdür;
 * AI değerlendirme eşiği DEĞİLDİR.
 */
export const SUMMARY_MIN_LENGTH = 100;
export const SUMMARY_MAX_LENGTH = 10000;

export const BOOK_SORT_LABELS: Record<BookSort, string> = {
  recent: 'Son eklenen',
  title: 'Kitap adı (A–Z)',
  author: 'Yazar (A–Z)',
  progress: 'Okuma ilerlemesi',
};

export const WORK_TYPE_LABELS: Record<WorkType, string> = {
  essay: 'Deneme',
  review: 'Kitap incelemesi',
  story: 'Öykü',
  poem: 'Şiir',
  note: 'Not',
};

export const WORK_STATUS_LABELS: Record<WorkStatus, string> = {
  draft: 'Taslak',
  completed: 'Tamamlandı',
};

export const COVER_COLORS = [
  '#6B4038',
  '#B58B55',
  '#4D725D',
  '#597C92',
  '#7A5C8E',
  '#2F5D62',
  '#8C5A3C',
  '#3F4E6B',
] as const;

export const AVATAR_COLORS = ['#1F5D42', '#597C92', '#B58B55', '#7A5C8E', '#6B4038', '#2F5D62'] as const;

export const MAX_WORK_TAGS = 8;
