/**
 * Özet değerlendirme sınırı.
 *
 * Şu an yalnızca `mockSummaryEvaluator` var: metnin uzunluğu, cümle yapısı ve kelime
 * çeşitliliği gibi yüzeysel ölçülerle DEMO bir sonuç üretir. Kitabı anlayıp anlamadığını
 * ölçmez; arayüz bu sonuçları her zaman "demo değerlendirme" olarak etiketler.
 *
 * TODO(backend): Gerçek değerlendirme sunucu tarafında (Route Handler / Server Action)
 * çalışmalı, API anahtarı istemciye hiç gelmemeli. Aynı `SummaryEvaluator` arayüzünü
 * uygulayan bir istemci (fetch) yazılıp store'daki `evaluator` değiştirilmesi yeterli.
 * Puanlama, eşik ve doğrulama politikası ürün kararı olarak ayrıca tanımlanacak.
 */
import type { CriterionLevel, EvaluationCriterion, SummaryEvaluation } from './types';

export type EvaluationInput = {
  bookTitle: string;
  author: string;
  summary: string;
};

export interface SummaryEvaluator {
  evaluate(input: EvaluationInput): Promise<SummaryEvaluation>;
}

export class EvaluationUnavailableError extends Error {
  constructor(message = 'Değerlendirme servisine şu anda ulaşılamıyor.') {
    super(message);
    this.name = 'EvaluationUnavailableError';
  }
}

/** Demo politika: yalnızca mock sonuçlar için geçerlidir. */
const MOCK_POLICY = {
  words: { strong: 120, partial: 60 },
  sentences: { strong: 5, partial: 3 },
  diversity: { strong: 0.55, partial: 0.4 },
  avgSentenceWords: { min: 7, max: 32 },
  /** Doğrulama için en az bu kadar "güçlü" ölçüt ve hiç "zayıf" ölçüt olmamalı */
  minStrong: 3,
} as const;

const tokenize = (text: string) =>
  text
    .toLocaleLowerCase('tr-TR')
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 1);

const splitSentences = (text: string) =>
  text
    .split(/(?<=[.!?…])\s+/)
    .map((s) => s.trim())
    .filter((s) => tokenize(s).length >= 3);

function level(value: number, strong: number, partial: number): CriterionLevel {
  if (value >= strong) return 'strong';
  if (value >= partial) return 'partial';
  return 'weak';
}

/** Saf ve deterministik: aynı metin her zaman aynı demo sonucu verir. */
export function evaluateSummaryMock(input: EvaluationInput, now = new Date()): SummaryEvaluation {
  const words = tokenize(input.summary);
  const sentences = splitSentences(input.summary);
  const diversity = words.length ? new Set(words).size / words.length : 0;
  const avgSentence = sentences.length ? words.length / sentences.length : 0;

  const anchors = tokenize(`${input.bookTitle} ${input.author}`).filter((w) => w.length > 3);
  const mentionsBook = anchors.some((a) => words.includes(a));

  const coverage = level(words.length, MOCK_POLICY.words.strong, MOCK_POLICY.words.partial);
  const integrity = level(sentences.length, MOCK_POLICY.sentences.strong, MOCK_POLICY.sentences.partial);
  const ownWords = level(diversity, MOCK_POLICY.diversity.strong, MOCK_POLICY.diversity.partial);
  const clarity: CriterionLevel =
    avgSentence >= MOCK_POLICY.avgSentenceWords.min && avgSentence <= MOCK_POLICY.avgSentenceWords.max
      ? 'strong'
      : 'partial';
  const relevance: CriterionLevel = mentionsBook ? 'strong' : 'partial';

  const criteria: EvaluationCriterion[] = [
    {
      key: 'main-idea',
      label: 'Temel fikri yansıtma',
      level: 'unrated',
      note: 'Kitabın ana fikrini doğru aktarıp aktarmadığın ancak gerçek AI değerlendirmesiyle ölçülebilir.',
    },
    {
      key: 'coverage',
      label: 'Kapsam',
      level: coverage,
      note:
        coverage === 'strong'
          ? `${words.length} kelimeyle önemli noktalara yer açmışsın.`
          : `${words.length} kelime; önemli olayları veya argümanları anlatmak için kısa kalıyor.`,
    },
    {
      key: 'integrity',
      label: 'Bütünlük',
      level: integrity,
      note:
        integrity === 'strong'
          ? 'Özetin birbirine bağlanan cümlelerden oluşuyor.'
          : `${sentences.length} tam cümle var; başlangıç, gelişme ve sonuç arasında bağ kurmayı dene.`,
    },
    {
      key: 'clarity',
      label: 'Anlatım açıklığı',
      level: clarity,
      note:
        clarity === 'strong'
          ? 'Cümle uzunlukların okunaklı.'
          : avgSentence > MOCK_POLICY.avgSentenceWords.max
            ? 'Cümlelerin çok uzun; bölerek daha anlaşılır hâle getirebilirsin.'
            : 'Cümlelerin çok kısa ya da kopuk; düşünceni biraz daha açabilirsin.',
    },
    {
      key: 'own-words',
      label: 'Kendi ifadeleriyle anlatım',
      level: ownWords,
      note:
        ownWords === 'strong'
          ? 'Kelime çeşitliliğin yüksek. (Demo ölçüm: yalnızca tekrar oranına bakar.)'
          : 'Aynı kelimeler sık tekrar ediyor. (Demo ölçüm: yalnızca tekrar oranına bakar.)',
    },
    {
      key: 'relevance',
      label: 'Konuyla ilgi',
      level: relevance,
      note: mentionsBook
        ? 'Özetin kitabın adına veya yazarına doğrudan bağlanıyor.'
        : 'Özette kitabın adı ya da yazarı geçmiyor; bağlamı netleştirebilirsin.',
    },
  ];

  const rated = criteria.filter((c) => c.level !== 'unrated');
  const strongCount = rated.filter((c) => c.level === 'strong').length;
  const hasWeak = rated.some((c) => c.level === 'weak');
  const outcome = !hasWeak && strongCount >= MOCK_POLICY.minStrong ? 'verified' : 'needs-improvement';

  const suggestions = rated
    .filter((c) => c.level !== 'strong')
    .map((c) => {
      switch (c.key) {
        case 'coverage':
          return 'Kitaptaki en önemli iki üç olayı ya da argümanı kendi cümlelerinle ekle.';
        case 'integrity':
          return 'Özete kitabın neyi anlattığıyla başla, sonra gelişmeyi ve sende bıraktığı düşünceyi bağla.';
        case 'clarity':
          return 'Her cümlede tek bir düşünceyi anlatmaya çalış.';
        case 'own-words':
          return 'Tekrar eden ifadeleri farklı kelimelerle anlat; alıntı yerine yorumunu yaz.';
        default:
          return 'Kitabın adını, yazarını veya ana karakterini özette an.';
      }
    });

  return {
    source: 'mock',
    evaluatedAt: now.toISOString(),
    outcome,
    feedback:
      outcome === 'verified'
        ? 'Özetin demo değerlendirme ölçütlerini karşıladı. Kitabı kendi cümlelerinle, bütünlüklü biçimde anlatmışsın.'
        : 'Özetin iyi bir başlangıç. Aşağıdaki önerilerle geliştirip yeniden gönderebilirsin.',
    criteria,
    suggestions,
  };
}

const MOCK_DELAY_MS = 1600;

export function createMockEvaluator(options: { shouldFail?: () => boolean } = {}): SummaryEvaluator {
  return {
    evaluate(input) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (options.shouldFail?.()) reject(new EvaluationUnavailableError());
          else resolve(evaluateSummaryMock(input));
        }, MOCK_DELAY_MS);
      });
    },
  };
}
