/**
 * Aşama adları ve ilerleme metinleri. 200'e kadar her 10 kitapta, köklerde her 25 kitapta
 * yeni bir aşama. Backend'de rozet/bildirim üretmek için de kullanılabilir.
 */
import { CROWN_BOOKS, MAX_BOOKS, clamp } from './model';

export interface StageDef {
  /** Bu aşamanın başladığı kitap sayısı */
  from: number;
  name: string;
  /** `{n}` yerine kitap sayısı yazılır */
  message: string;
}

export const STAGES: readonly StageDef[] = [
  { from: 0, name: 'Tohum', message: 'İlk doğrulanmış kitabınla filizleneceksin.' },
  { from: 1, name: 'Filiz', message: '{n} doğrulanmış kitapla filizleniyorsun.' },
  { from: 10, name: 'Fidan', message: '{n} doğrulanmış kitapla ilk dalını verdin.' },
  { from: 20, name: 'Güçlenen Fidan', message: '{n} kitap. Gövden kalınlaşmaya başladı.' },
  { from: 30, name: 'Körpe Ağaç', message: '{n} doğrulanmış kitapla serpiliyorsun.' },
  { from: 40, name: 'Genç Ağaç', message: '{n} doğrulanmış kitapla büyüyorsun.' },
  { from: 50, name: 'Serpilen Ağaç', message: '{n} kitap. Gövden artık sağlam.' },
  { from: 60, name: 'Dallanan Ağaç', message: '{n} doğrulanmış kitapla dallanıyorsun.' },
  { from: 70, name: 'Yapraklanan Ağaç', message: '{n} kitap. Tacın doluyor.' },
  { from: 80, name: 'Gölgeli Ağaç', message: '{n} kitap. Artık gölgen var.' },
  { from: 90, name: 'Gür Ağaç', message: '{n} doğrulanmış kitapla gürleşiyorsun.' },
  { from: 100, name: 'Taçlanan Ağaç', message: '{n} kitap. Yüz kitabı geçtin.' },
  { from: 110, name: 'Sağlam Ağaç', message: '{n} doğrulanmış kitapla güçleniyorsun.' },
  { from: 120, name: 'Olgun Ağaç', message: '{n} kitap. Ağacın olgunlaştı.' },
  { from: 130, name: 'Geniş Taçlı Ağaç', message: '{n} doğrulanmış kitapla genişliyorsun.' },
  { from: 140, name: 'Heybetli Ağaç', message: '{n} kitap. Heybetli bir ağaç oldun.' },
  { from: 150, name: 'Bilge Ağaç', message: '{n} doğrulanmış kitapla bilgeleşiyorsun.' },
  { from: 160, name: 'Ulu Ağaç', message: '{n} kitap. Ulu bir ağaçsın.' },
  { from: 170, name: 'Görkemli Ağaç', message: '{n} doğrulanmış kitapla göz dolduruyorsun.' },
  { from: 180, name: 'Asil Ağaç', message: '{n} kitap. Taç tamamlanmak üzere.' },
  { from: 190, name: 'Tamamlanan Taç', message: '{n} kitap. Son dal da yerinde.' },
  { from: 200, name: 'Tam Ağaç', message: '200 kitapla tacın tamamlandı. Şimdi kök salma zamanı.' },
  { from: 201, name: 'Kök Salan Ağaç', message: '{n} kitap. İlk köklerin toprağa iniyor.' },
  { from: 226, name: 'Derin Köklü Ağaç', message: '{n} kitapla köklerin derinleşiyor.' },
  { from: 251, name: 'Sarsılmaz Ağaç', message: '{n} kitap. Hiçbir rüzgâr seni deviremez.' },
  { from: 276, name: 'Asırlık Ağaç', message: '{n} kitap. Köklerin her yöne yayıldı.' },
  { from: 300, name: 'Kadim Ağaç', message: '300 doğrulanmış kitapla ağacın tamamlandı.' },
];

export interface GardenStage {
  index: number;
  name: string;
  message: string;
  next: { name: string; at: number; booksLeft: number } | null;
}

export function getStage(bookCount: number): GardenStage {
  const n = clamp(Math.floor(bookCount), 0, MAX_BOOKS);
  let index = 0;
  for (let i = 0; i < STAGES.length; i++) if (n >= STAGES[i].from) index = i;
  const s = STAGES[index], nx = STAGES[index + 1];
  return {
    index,
    name: s.name,
    message: s.message.replace('{n}', String(n)),
    next: nx ? { name: nx.name, at: nx.from, booksLeft: nx.from - n } : null,
  };
}

export interface GardenProgress {
  phase: 'crown' | 'roots';
  /** 0–1 */
  ratio: number;
  label: string;
}

export function getProgress(bookCount: number): GardenProgress {
  const n = clamp(Math.floor(bookCount), 0, MAX_BOOKS);
  if (n <= CROWN_BOOKS) return { phase: 'crown', ratio: n / CROWN_BOOKS, label: `${n} / ${CROWN_BOOKS} kitap` };
  const rootBooks = MAX_BOOKS - CROWN_BOOKS;
  return { phase: 'roots', ratio: (n - CROWN_BOOKS) / rootBooks, label: `Kökler: ${n - CROWN_BOOKS} / ${rootBooks} kitap` };
}
