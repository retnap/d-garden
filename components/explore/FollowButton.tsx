'use client';

import { Check, UserPlus } from 'lucide-react';
import { cn } from '@/components/garden/ui';
import { DEMO_VIEWER_ID } from '@/lib/social/demo-data';
import { getUser } from '@/lib/social/selectors';
import { canFollow, follow, isFollowing, unfollow, useSocialSnapshot } from '@/lib/social/store';

/**
 * İçerik sahibini takip etme kontrolü (DEMO). Durum tek bir depodan okunduğu için aynı
 * yazarın tüm kartlarında tutarlıdır. Takip yalnızca bu tarayıcıda saklanır.
 */
export default function FollowButton({ userId, className }: { userId: string; className?: string }) {
  const snapshot = useSocialSnapshot();
  const user = getUser(userId);

  if (!user || userId === DEMO_VIEWER_ID || !canFollow(userId)) return null;

  const following = snapshot ? isFollowing(snapshot.data, userId) : false;

  return (
    <button
      type="button"
      disabled={!snapshot}
      aria-pressed={following}
      aria-label={following ? `${user.displayName} takip ediliyor. Takibi bırak` : `${user.displayName} kişisini takip et`}
      title="Demo: takip yalnızca bu tarayıcıda saklanır"
      onClick={() => (following ? unfollow(userId) : follow(userId))}
      className={cn(
        'inline-flex min-h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest disabled:cursor-wait disabled:opacity-60',
        following
          ? 'border-forest bg-mint text-forest hover:bg-white'
          : 'border-line bg-white text-forest hover:border-sage hover:bg-mist',
        className,
      )}
    >
      {following ? <Check size={14} aria-hidden="true" /> : <UserPlus size={14} aria-hidden="true" />}
      {following ? 'Takip ediliyor' : 'Takip et'}
    </button>
  );
}
