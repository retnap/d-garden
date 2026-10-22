/**
 * Takip ve bildirim durumunun DEMO deposu.
 *
 * Veriler yalnızca bu tarayıcıda (localStorage) tutulur ve tek bir ziyaretçiye
 * (`DEMO_VIEWER_ID`) aittir. Bu nedenle burada yapılan takip başka hiçbir kullanıcıya
 * ulaşmaz; "yeni yayın" da yalnızca simülasyondur. Kurallar (kendini takip edememe,
 * mükerrer takip/bildirim olmaması, takipten önceki içeriklerin bildirilmemesi,
 * gizli içeriklerin bildirilmemesi) burada uygulanır ki backend'e aynı sözleşmeyle taşınsın.
 *
 * TODO(backend): `follow`/`unfollow`/`markNotificationRead` API çağrısı olacak; bildirim
 * üretimi (`deliverNotifications`) yayın anında sunucuda, yetki ve görünürlük kontrolüyle çalışacak.
 */
import { useSyncExternalStore } from 'react';
import { DEMO_VIEWER_ID } from './demo-data';
import {
  canViewContent,
  findContent,
  getQueuedContent,
  getUser,
  isProfilePublic,
  notificationTypeFor,
  type PublishedMap,
} from './selectors';
import type { CommunityNotification, Follow } from './types';

const STORAGE_KEY = 'dgarden-social-v1';

export type SocialData = {
  version: 1;
  follows: Follow[];
  notifications: CommunityNotification[];
  published: PublishedMap;
};

export type SocialSnapshot = {
  data: SocialData;
  /** unavailable: tarayıcı depolamasına yazılamıyor; değişiklikler yalnızca bu sekmede kalır */
  storage: 'ok' | 'unavailable';
};

function createId(prefix: string) {
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${rand}`;
}

const emptyData = (): SocialData => ({ version: 1, follows: [], notifications: [], published: {} });

let snapshot: SocialSnapshot | null = null;
const listeners = new Set<() => void>();

/* ---------- okuma / yazma ---------- */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Bozuk ya da elle değiştirilmiş kayıtlarda bile kuralların bozulmaması için temizler. */
function sanitize(value: unknown): SocialData {
  if (!isRecord(value) || value.version !== 1) return emptyData();
  const seenFollows = new Set<string>();
  const follows = (Array.isArray(value.follows) ? value.follows : []).filter((f): f is Follow => {
    if (!isRecord(f) || typeof f.followeeId !== 'string' || typeof f.createdAt !== 'string') return false;
    if (f.followerId !== DEMO_VIEWER_ID || f.followeeId === DEMO_VIEWER_ID) return false;
    if (seenFollows.has(f.followeeId)) return false;
    seenFollows.add(f.followeeId);
    return true;
  });
  const seenNotifications = new Set<string>();
  const notifications = (Array.isArray(value.notifications) ? value.notifications : []).filter(
    (n): n is CommunityNotification => {
      if (!isRecord(n) || typeof n.id !== 'string' || typeof n.contentId !== 'string') return false;
      const key = `${n.recipientId}:${n.contentId}`;
      if (seenNotifications.has(key)) return false;
      seenNotifications.add(key);
      return true;
    },
  );
  const published: PublishedMap = {};
  if (isRecord(value.published)) {
    for (const [id, at] of Object.entries(value.published)) if (typeof at === 'string') published[id] = at;
  }
  return { version: 1, follows, notifications, published };
}

function readStored(): SocialSnapshot {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return { data: raw ? sanitize(JSON.parse(raw)) : emptyData(), storage: 'ok' };
  } catch {
    return { data: emptyData(), storage: 'unavailable' };
  }
}

function persist(data: SocialData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

function current(): SocialSnapshot {
  if (!snapshot) snapshot = readStored();
  return snapshot;
}

function commit(update: (data: SocialData) => SocialData) {
  const prev = current();
  const data = update(prev.data);
  if (data === prev.data) return;
  snapshot = { data, storage: persist(data) ? 'ok' : 'unavailable' };
  listeners.forEach((l) => l());
}

function onStorage(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;
  snapshot = readStored();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener('storage', onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('storage', onStorage);
  };
}

const getServerSnapshot = () => null;

/** Sunucuda ve hydration sırasında `null` döner; takip durumu bilinmediği için kontroller pasif gösterilir. */
export function useSocialSnapshot(): SocialSnapshot | null {
  return useSyncExternalStore(subscribe, current, getServerSnapshot);
}

/* ---------- takip ---------- */

export function isFollowing(data: SocialData, userId: string) {
  return data.follows.some((f) => f.followerId === DEMO_VIEWER_ID && f.followeeId === userId);
}

export function canFollow(userId: string) {
  return userId !== DEMO_VIEWER_ID && !!getUser(userId) && isProfilePublic(userId);
}

export function follow(userId: string) {
  if (!canFollow(userId)) return;
  commit((d) =>
    isFollowing(d, userId)
      ? d
      : {
          ...d,
          follows: [...d.follows, { followerId: DEMO_VIEWER_ID, followeeId: userId, createdAt: new Date().toISOString() }],
        },
  );
}

/** Takibi bırakmak geçmiş bildirimleri silmez; yalnızca yenilerinin üretilmesini durdurur. */
export function unfollow(userId: string) {
  commit((d) =>
    isFollowing(d, userId) ? { ...d, follows: d.follows.filter((f) => f.followeeId !== userId) } : d,
  );
}

/* ---------- bildirimler ---------- */

/**
 * Yeni yayımlanan bir içerik için takipçilere bildirim üretir. Backend'de yayın anında
 * sunucuda çalışması gereken mantığın birebir karşılığıdır.
 */
function deliverNotifications(data: SocialData, contentId: string, publishedAt: string): CommunityNotification[] {
  const content = findContent(contentId);
  if (!content || !canViewContent(content, data.published)) return [];
  return data.follows
    .filter(
      (f) =>
        f.followeeId === content.ownerId &&
        f.followerId !== content.ownerId &&
        // Takipten önce yayımlanan içerik geriye dönük bildirilmez
        f.createdAt <= publishedAt &&
        !data.notifications.some((n) => n.recipientId === f.followerId && n.contentId === contentId),
    )
    .map((f) => ({
      id: createId('notif'),
      recipientId: f.followerId,
      actorId: content.ownerId,
      type: notificationTypeFor(content),
      contentId,
      createdAt: publishedAt,
      isDemo: true,
    }));
}

export type SimulationResult =
  | { status: 'notified'; title: string }
  | { status: 'published-private' }
  | { status: 'published-not-following'; title: string }
  | { status: 'empty' };

/** DEMO: Yazarın kuyruğundaki sıradaki içeriği bu tarayıcıda "yayımlanmış" sayar. */
export function simulateNextPublication(authorId: string): SimulationResult {
  const next = getQueuedContent(authorId, current().data.published)[0];
  if (!next) return { status: 'empty' };

  const publishedAt = new Date().toISOString();
  let delivered: CommunityNotification[] = [];
  commit((d) => {
    const withPublished = { ...d, published: { ...d.published, [next.item.id]: publishedAt } };
    delivered = deliverNotifications(withPublished, next.item.id, publishedAt);
    return { ...withPublished, notifications: [...delivered, ...d.notifications] };
  });

  const title = next.kind === 'article' ? next.item.title : next.item.text;
  if (!canViewContent(next, current().data.published)) return { status: 'published-private' };
  return delivered.length > 0 ? { status: 'notified', title } : { status: 'published-not-following', title };
}

export function getInbox(data: SocialData) {
  return data.notifications
    .filter((n) => n.recipientId === DEMO_VIEWER_ID)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function markNotificationRead(id: string) {
  commit((d) =>
    d.notifications.some((n) => n.id === id && !n.readAt)
      ? { ...d, notifications: d.notifications.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)) }
      : d,
  );
}

export function markNotificationUnread(id: string) {
  commit((d) =>
    d.notifications.some((n) => n.id === id && n.readAt)
      ? { ...d, notifications: d.notifications.map((n) => (n.id === id ? { ...n, readAt: undefined } : n)) }
      : d,
  );
}

export function markAllNotificationsRead() {
  const now = new Date().toISOString();
  commit((d) =>
    d.notifications.some((n) => !n.readAt)
      ? { ...d, notifications: d.notifications.map((n) => (n.readAt ? n : { ...n, readAt: now })) }
      : d,
  );
}

/** Takipleri, bildirimleri ve simüle edilen yayınları temizler. */
export function resetSocialDemo() {
  commit(() => emptyData());
}
