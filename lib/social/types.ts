/**
 * D-Garden topluluk (Keşfet, takip, bildirim) veri modelleri.
 *
 * Modeller backend'e taşınabilecek biçimde tasarlandı: ilişkiler kimliklerle kurulur,
 * bildirimler içerik başlığını kopyalamaz (görünürlük her gösterimde yeniden kontrol edilir).
 * Şu an bu tiplerin tüm örnekleri demo veridir; gerçek kullanıcı içeriği yoktur.
 */

export type Visibility = 'public' | 'private';

export type CommunityUser = {
  id: string;
  displayName: string;
  username: string;
  bio: string;
  avatarColor: string;
  image?: string;
  /** Private profiller ve onlara ait hiçbir içerik Keşfet'te görünmez. */
  profileVisibility: Visibility;
};

export type ArticleKind = 'post' | 'review' | 'thought';

export type CommunityBook = {
  id: string;
  title: string;
  author: string;
  category: string;
  cover: string;
  description: string;
};

export type CommunityArticle = {
  id: string;
  authorId: string;
  kind: ArticleKind;
  title: string;
  excerpt: string;
  content: string[];
  bookId?: string;
  readTime: number;
  visibility: Visibility;
  /** Yoksa içerik henüz yayımlanmamıştır (demo simülasyonu kuyruğunda bekler). */
  publishedAt?: string;
};

export type GardenUpdate = {
  id: string;
  gardenOwnerId: string;
  text: string;
  visibility: Visibility;
  publishedAt?: string;
};

export type PublicGarden = {
  ownerId: string;
  intro: string;
  visibility: Visibility;
  /** 0–100 arası bahçe büyümesi */
  growth: number;
  completedBooks: number;
  readingNow: number;
  /** Özeti doğrulanmış kitapların kimlikleri */
  verifiedBookIds: string[];
  interests: string[];
};

/* ---------- takip ve bildirim ---------- */

export type Follow = {
  followerId: string;
  followeeId: string;
  createdAt: string;
};

export type NotificationType = 'new-post' | 'new-review' | 'garden-update';

export type CommunityNotification = {
  id: string;
  recipientId: string;
  actorId: string;
  type: NotificationType;
  /** Makale ya da bahçe güncellemesi kimliği; aynı alıcı + içerik için tek bildirim olur */
  contentId: string;
  createdAt: string;
  readAt?: string;
  /** Bu tarayıcıda simüle edildi; gerçek kullanıcılar arasında dağıtılmadı */
  isDemo: true;
};
