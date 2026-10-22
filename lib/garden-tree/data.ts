/**
 * Backend sınırı. Şu an sahte veri döner; backend'e geçince yalnızca bu dosyanın
 * içi değişir, bileşenler aynı kalır.
 */
import 'server-only';

export interface GardenSnapshot {
  userId: string;
  /** Yalnızca doğrulanmış kitaplar sayılır */
  verifiedBookCount: number;
}

export async function getGardenSnapshot(userId: string): Promise<GardenSnapshot> {
  // TODO(backend): veritabanından oku, örn.
  // const verifiedBookCount = await db.book.count({ where: { userId, status: 'VERIFIED' } });
  return { userId, verifiedBookCount: 9 };
}
