/**
 * Görünürlük kuralları ve türetilmiş veriler.
 *
 * Keşfet'te ya da bildirimlerde gösterilen her içerik bu modüldeki `canView*` kontrollerinden
 * geçer. Bu kontroller şu an istemcide çalışır; backend'de aynı kurallar sunucuda
 * (sorgu seviyesinde) uygulanmalıdır — yalnızca arayüzde gizlemek yeterli değildir.
 */
import {
  COMMUNITY_ARTICLES,
  COMMUNITY_BOOKS,
  COMMUNITY_USERS,
  GARDEN_UPDATES,
  PUBLIC_GARDENS,
} from './demo-data';
import type {
  ArticleKind,
  CommunityArticle,
  CommunityNotification,
  GardenUpdate,
  NotificationType,
  PublicGarden,
} from './types';

/** Bu tarayıcıda simülasyonla yayımlanmış demo içeriklerin yayın tarihleri (içerik kimliği → ISO). */
export type PublishedMap = Record<string, string>;

export const ARTICLE_KIND_LABELS: Record<ArticleKind, string> = {
  post: 'Blog yazısı',
  review: 'Kitap incelemesi',
  thought: 'Okur düşüncesi',
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  'new-post': 'Yeni yazı yayımladı',
  'new-review': 'Kitap hakkında yeni bir inceleme/düşünce paylaştı',
  'garden-update': 'Public bahçesinde yeni bir güncelleme yayımladı',
};

const usersById = new Map(COMMUNITY_USERS.map((u) => [u.id, u]));
const booksById = new Map(COMMUNITY_BOOKS.map((b) => [b.id, b]));

export const getUser = (id: string) => usersById.get(id);
export const getBook = (id?: string) => (id ? booksById.get(id) : undefined);

export function isProfilePublic(userId: string) {
  return usersById.get(userId)?.profileVisibility === 'public';
}

function publishedAtOf(item: { id: string; publishedAt?: string }, published: PublishedMap) {
  return item.publishedAt ?? published[item.id];
}

/* ---------- yazılar ---------- */

export type VisibleArticle = CommunityArticle & { publishedAt: string; isSimulated: boolean };

export function canViewArticle(article: CommunityArticle, published: PublishedMap) {
  return article.visibility === 'public' && isProfilePublic(article.authorId) && !!publishedAtOf(article, published);
}

function toVisible(article: CommunityArticle, published: PublishedMap): VisibleArticle {
  return { ...article, publishedAt: publishedAtOf(article, published)!, isSimulated: !article.publishedAt };
}

export function getVisibleArticles(published: PublishedMap): VisibleArticle[] {
  return COMMUNITY_ARTICLES.filter((a) => canViewArticle(a, published))
    .map((a) => toVisible(a, published))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getVisibleArticle(id: string, published: PublishedMap): VisibleArticle | undefined {
  const article = COMMUNITY_ARTICLES.find((a) => a.id === id);
  return article && canViewArticle(article, published) ? toVisible(article, published) : undefined;
}

/* ---------- bahçeler ---------- */

export function canViewGarden(garden: PublicGarden) {
  return garden.visibility === 'public' && isProfilePublic(garden.ownerId);
}

export function getVisibleGardens(): PublicGarden[] {
  return PUBLIC_GARDENS.filter(canViewGarden);
}

export function canViewGardenUpdate(update: GardenUpdate, published: PublishedMap) {
  const garden = PUBLIC_GARDENS.find((g) => g.ownerId === update.gardenOwnerId);
  return update.visibility === 'public' && !!garden && canViewGarden(garden) && !!publishedAtOf(update, published);
}

export function getLatestGardenUpdate(ownerId: string, published: PublishedMap) {
  return GARDEN_UPDATES.filter((u) => u.gardenOwnerId === ownerId && canViewGardenUpdate(u, published))
    .map((u) => ({ ...u, publishedAt: publishedAtOf(u, published)! }))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))[0];
}

export function gardenAnchorId(ownerId: string) {
  return `bahce-${usersById.get(ownerId)?.username.replace(/\./g, '-') ?? ownerId}`;
}

export function gardenHref(ownerId: string) {
  return `/explore?tur=bahceler#${gardenAnchorId(ownerId)}`;
}

export function articleHref(id: string) {
  return `/articles/${id}`;
}

/* ---------- yayın kuyruğu ve bildirimler ---------- */

export type QueuedContent =
  | { kind: 'article'; ownerId: string; item: CommunityArticle }
  | { kind: 'garden-update'; ownerId: string; item: GardenUpdate };

/** Yazarın henüz yayımlanmamış demo içerikleri (simülasyon sırası). Gizli öğeler de dahildir. */
export function getQueuedContent(ownerId: string, published: PublishedMap): QueuedContent[] {
  const articles: QueuedContent[] = COMMUNITY_ARTICLES.filter(
    (a) => a.authorId === ownerId && !publishedAtOf(a, published),
  ).map((item) => ({ kind: 'article', ownerId, item }));
  const updates: QueuedContent[] = GARDEN_UPDATES.filter(
    (u) => u.gardenOwnerId === ownerId && !publishedAtOf(u, published),
  ).map((item) => ({ kind: 'garden-update', ownerId, item }));
  // Yazı ve bahçe güncellemelerini sırayla dönüşümlü yayımla
  const result: QueuedContent[] = [];
  for (let i = 0; i < Math.max(articles.length, updates.length); i++) {
    if (articles[i]) result.push(articles[i]);
    if (updates[i]) result.push(updates[i]);
  }
  return result;
}

export function findContent(contentId: string): QueuedContent | undefined {
  const article = COMMUNITY_ARTICLES.find((a) => a.id === contentId);
  if (article) return { kind: 'article', ownerId: article.authorId, item: article };
  const update = GARDEN_UPDATES.find((u) => u.id === contentId);
  if (update) return { kind: 'garden-update', ownerId: update.gardenOwnerId, item: update };
  return undefined;
}

export function canViewContent(content: QueuedContent, published: PublishedMap) {
  return content.kind === 'article'
    ? canViewArticle(content.item, published)
    : canViewGardenUpdate(content.item, published);
}

export function notificationTypeFor(content: QueuedContent): NotificationType {
  if (content.kind === 'garden-update') return 'garden-update';
  return content.item.kind === 'post' ? 'new-post' : 'new-review';
}

export type NotificationView = {
  notification: CommunityNotification;
  actorName: string;
  typeLabel: string;
  /** İçerik artık görünür değilse başlık ve bağlantı verilmez */
  target: { title: string; href: string } | null;
};

/**
 * Bildirim, içerik başlığını kopyalamaz; her gösterimde içerik yeniden çözülür. İçerik ya da
 * profil sonradan private yapılırsa bildirimde yalnızca genel bir metin kalır.
 */
export function toNotificationView(notification: CommunityNotification, published: PublishedMap): NotificationView {
  const actor = usersById.get(notification.actorId);
  const actorVisible = !!actor && actor.profileVisibility === 'public';
  const content = findContent(notification.contentId);
  const visible = actorVisible && !!content && canViewContent(content, published);
  let target: NotificationView['target'] = null;
  if (visible && content) {
    target =
      content.kind === 'article'
        ? { title: content.item.title, href: articleHref(content.item.id) }
        : { title: content.item.text, href: gardenHref(content.ownerId) };
  }
  return {
    notification,
    actorName: actorVisible ? actor.displayName : 'Bir kullanıcı',
    typeLabel: NOTIFICATION_TYPE_LABELS[notification.type],
    target,
  };
}

/* ---------- arama ---------- */

const normalize = (value: string) => value.toLocaleLowerCase('tr-TR').trim();

export function matchesSearch(query: string, ...fields: (string | undefined)[]) {
  const q = normalize(query);
  if (!q) return true;
  return fields.some((f) => f && normalize(f).includes(q));
}
