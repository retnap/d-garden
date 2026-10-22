'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Bell, BellOff, CheckCheck, Send } from 'lucide-react';
import Modal from '@/components/garden/Modal';
import { Badge, DemoBadge, EmptyState, Notice, buttonStyles, cn, formatRelative } from '@/components/garden/ui';
import { getQueuedContent, getUser, toNotificationView } from '@/lib/social/selectors';
import {
  getInbox,
  markAllNotificationsRead,
  markNotificationRead,
  markNotificationUnread,
  resetSocialDemo,
  simulateNextPublication,
  useSocialSnapshot,
  type SimulationResult,
} from '@/lib/social/store';

function describeResult(result: SimulationResult, authorName: string) {
  switch (result.status) {
    case 'notified':
      return `${authorName} yeni içerik yayımladı: “${result.title}”. Bildirim kutuna eklendi.`;
    case 'published-private':
      return `${authorName} özel (private) bir içerik kaydetti. Gizli içerikler için bildirim oluşturulmaz.`;
    case 'published-not-following':
      return `“${result.title}” yayımlandı, ancak takip ilişkisi olmadığı için bildirim oluşturulmadı.`;
    case 'empty':
      return `${authorName} için simüle edilecek başka içerik kalmadı.`;
  }
}

/**
 * Bildirim kutusu (DEMO). Gerçek kullanıcılar arası bildirim dağıtımı backend gerektirir;
 * burada bildirimler yalnızca bu tarayıcıda, simülasyon düğmesiyle üretilir.
 */
export default function NotificationInbox() {
  const snapshot = useSocialSnapshot();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');

  const data = snapshot?.data;
  const inbox = data ? getInbox(data) : [];
  const unread = inbox.filter((n) => !n.readAt).length;
  const followed = data ? data.follows.map((f) => getUser(f.followeeId)).filter((u) => !!u) : [];

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={!snapshot}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={unread > 0 ? `Bildirimler, ${unread} okunmamış` : 'Bildirimler'}
        className="relative inline-flex min-h-11 items-center gap-2 rounded-full border border-[#DCE8E1] bg-white px-4 py-2 text-sm font-medium text-[#1F5D42] transition-colors hover:border-[#8FB9A3] hover:bg-[#F4FAF6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1F5D42] disabled:opacity-60"
      >
        <Bell size={18} aria-hidden="true" />
        Bildirimler
        {unread > 0 && (
          <span aria-hidden="true" className="min-w-5 rounded-full bg-[#1F5D42] px-1.5 text-center text-xs font-semibold tabular-nums text-white">
            {unread}
          </span>
        )}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Bildirim kutusu"
        size="lg"
        icon={<Bell size={20} aria-hidden="true" />}
        description="Takip ettiğin okurların yeni yazıları, kitap düşünceleri ve public bahçe güncellemeleri."
      >
        <Notice tone="demo" title="Demo bildirimler">
          Bu bildirimler yalnızca bu tarayıcıda simüle edilir; gerçek kullanıcılar arasında dağıtılmaz. Gerçek
          bildirimler hesap sistemi ve sunucu bağlandığında çalışacak.
        </Notice>

        {data && (
          <>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-ink">
                {inbox.length > 0 ? `${inbox.length} bildirim · ${unread} okunmamış` : 'Bildirimler'}
              </h3>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className={buttonStyles({ variant: 'ghost', size: 'sm' })}
                >
                  <CheckCheck size={16} aria-hidden="true" />
                  Tümünü okundu işaretle
                </button>
              )}
            </div>

            {inbox.length === 0 ? (
              <EmptyState
                icon={BellOff}
                title="Henüz bildirim yok"
                description={
                  followed.length > 0
                    ? 'Takip ettiğin okurlar yeni bir şey yayımladığında burada görünecek. Takipten önce yayımlanan içerikler bildirim olarak eklenmez.'
                    : 'Keşfet’te bir yazarın yanındaki “Takip et” düğmesiyle başla. Takipten önce yayımlanan içerikler bildirim olarak eklenmez.'
                }
                className="mt-3 py-8"
              />
            ) : (
              <ul className="mt-3 divide-y divide-line overflow-hidden rounded-2xl border border-line">
                {inbox.map((n) => {
                  const view = toNotificationView(n, data.published);
                  const isUnread = !n.readAt;
                  return (
                    <li key={n.id} className={cn('flex gap-3 px-4 py-3.5', isUnread ? 'bg-mist' : 'bg-white')}>
                      <span
                        aria-hidden="true"
                        className={cn('mt-2 size-2 shrink-0 rounded-full', isUnread ? 'bg-forest' : 'bg-transparent')}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {isUnread && <Badge tone="green">Yeni</Badge>}
                          <DemoBadge>Demo</DemoBadge>
                          <span className="text-xs text-ink-light">
                            <time dateTime={n.createdAt}>{formatRelative(n.createdAt)}</time>
                          </span>
                        </div>
                        <p className={cn('mt-1.5 text-sm leading-6 text-ink', isUnread && 'font-semibold')}>
                          {view.actorName} <span className="font-normal text-ink-light">· {view.typeLabel}</span>
                        </p>
                        {view.target ? (
                          <Link
                            href={view.target.href}
                            onClick={() => {
                              markNotificationRead(n.id);
                              setOpen(false);
                            }}
                            className="mt-0.5 block rounded-sm text-sm leading-6 text-forest underline-offset-2 hover:underline"
                          >
                            {view.target.title}
                          </Link>
                        ) : (
                          <p className="mt-0.5 text-sm leading-6 text-ink-light">Bu içerik artık görüntülenemiyor.</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => (isUnread ? markNotificationRead(n.id) : markNotificationUnread(n.id))}
                        className={buttonStyles({ variant: 'ghost', size: 'sm', className: 'self-start text-xs' })}
                      >
                        {isUnread ? 'Okundu işaretle' : 'Okunmadı işaretle'}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            {/* Simülasyon */}
            <section aria-labelledby="notif-sim-title" className="mt-7 rounded-2xl border border-dashed border-[#D9D2EA] bg-[#F5F2FB]/60 p-4">
              <h3 id="notif-sim-title" className="text-sm font-semibold text-ink">
                Yeni yayın simülasyonu
              </h3>
              <p className="mt-1 text-xs leading-5 text-ink-light">
                Takip ettiğin bir okurun sıradaki örnek içeriğini “şimdi yayımlanmış” say. Bildirim yalnızca takip
                ettiğin, public içerikler için ve her içerik için bir kez oluşturulur.
              </p>
              {followed.length === 0 ? (
                <p className="mt-3 text-xs leading-5 text-ink-light">Simülasyon için önce en az bir okuru takip et.</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-2">
                  {followed.map((user) => {
                    const remaining = getQueuedContent(user.id, data.published).length;
                    return (
                      <li key={user.id} className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm text-ink">
                          {user.displayName}
                          <span className="text-xs text-ink-light"> · {remaining} örnek içerik bekliyor</span>
                        </span>
                        <button
                          type="button"
                          disabled={remaining === 0}
                          onClick={() => setStatus(describeResult(simulateNextPublication(user.id), user.displayName))}
                          className={buttonStyles({ variant: 'secondary', size: 'sm', className: 'text-xs' })}
                        >
                          <Send size={14} aria-hidden="true" />
                          Yeni yayın simüle et
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              <p role="status" aria-live="polite" className="mt-3 min-h-5 text-xs leading-5 text-ink">
                {status}
              </p>
              <button
                type="button"
                onClick={() => {
                  resetSocialDemo();
                  setStatus('Takipler, bildirimler ve simüle edilen yayınlar temizlendi.');
                }}
                className={buttonStyles({ variant: 'ghost', size: 'sm', className: 'mt-1 text-xs' })}
              >
                Demo takip ve bildirimlerini sıfırla
              </button>
            </section>

            {snapshot?.storage === 'unavailable' && (
              <Notice tone="warning" className="mt-4">
                Tarayıcı depolamasına yazılamıyor; değişiklikler yalnızca bu sekme açıkken korunur.
              </Notice>
            )}
          </>
        )}
      </Modal>
    </>
  );
}
