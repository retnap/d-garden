import { BookOpen } from 'lucide-react';
import type { LibraryBook } from '@/lib/garden/types';
import { cn } from './ui';

type BookCoverProps = {
  book: Pick<LibraryBook, 'title' | 'author' | 'coverColor'>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

/** Gerçek kapak görselleri gelene kadar kullanılan temsili renkli kapak. */
export default function BookCover({ book, size = 'md', className }: BookCoverProps) {
  if (size === 'sm') {
    return (
      <div
        aria-hidden="true"
        className={cn('flex aspect-[3/4] w-12 shrink-0 items-center justify-center rounded-lg text-white', className)}
        style={{ backgroundColor: book.coverColor }}
      >
        <BookOpen size={18} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative flex aspect-[4/5] items-center justify-center overflow-hidden',
        size === 'lg' ? 'rounded-2xl p-7 shadow-lg shadow-[#193128]/10' : 'p-5',
        className,
      )}
      style={{ backgroundColor: book.coverColor }}
    >
      <div className="absolute inset-3 border border-white/30" />
      <div className="relative flex max-w-full flex-col items-center text-center text-white">
        <BookOpen size={size === 'lg' ? 30 : 25} strokeWidth={1.4} />
        <p
          className={cn(
            'mt-5 line-clamp-4 break-words font-display font-semibold leading-tight',
            size === 'lg' ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl',
          )}
        >
          {book.title}
        </p>
        <span className="mt-4 h-px w-10 bg-white/70" />
        <p className="mt-3 line-clamp-2 text-xs tracking-wide text-white/80">{book.author}</p>
      </div>
    </div>
  );
}
