'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { buttonStyles, cn } from './ui';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Mobilde soldan açılan çekmece görünümü */
  variant?: 'dialog' | 'drawer';
  /** true iken Esc ve arka plan tıklaması kapatmaz (ör. kayıt sürerken) */
  dismissible?: boolean;
};

/**
 * Native <dialog> üzerine kurulu modal: odak tuzağı, Esc ile kapanma, arka planın
 * etkisizleşmesi ve kapanınca odağın tetikleyiciye dönmesi tarayıcı tarafından sağlanır.
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  children,
  size = 'md',
  variant = 'dialog',
  dismissible = true,
}: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // showModal odağı ilk butona (kapat) verir; istenen alan varsa ona taşı
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Modal açıkken sayfanın arkada kaymasını engelle
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const isDrawer = variant === 'drawer';

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(event) => {
        if (dismissible && event.target === event.currentTarget) onClose();
      }}
      className={cn(
        'garden-app m-0 max-h-none max-w-none bg-transparent p-0 text-ink backdrop:bg-[#193128]/50 backdrop:backdrop-blur-sm',
        isDrawer ? 'h-dvh w-full' : 'h-dvh w-full p-3 sm:p-6',
      )}
    >
      {open && (
        <div
          className={cn(
            'flex h-full w-full',
            isDrawer ? 'justify-start' : 'items-end justify-center sm:items-center',
          )}
          onClick={(event) => {
            if (dismissible && event.target === event.currentTarget) onClose();
          }}
        >
          <div
            className={cn(
              'relative flex max-h-full w-full flex-col overflow-hidden border border-line bg-white shadow-2xl',
              isDrawer
                ? 'h-full max-w-[19rem] rounded-r-3xl'
                : cn(
                    'rounded-3xl',
                    size === 'sm' && 'sm:max-w-md',
                    size === 'md' && 'sm:max-w-lg',
                    size === 'lg' && 'sm:max-w-2xl',
                  ),
            )}
          >
            <div className="flex items-start gap-4 px-5 pb-2 pt-5 sm:px-7 sm:pt-7">
              {icon && (
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-mint text-forest">
                  {icon}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="font-display text-xl leading-tight text-ink sm:text-2xl">
                  {title}
                </h2>
                {description && (
                  <div id={descId} className="mt-1.5 text-sm leading-6 text-ink-light">
                    {description}
                  </div>
                )}
              </div>
              {dismissible && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Pencereyi kapat"
                  className={buttonStyles({ variant: 'ghost', size: 'sm', className: '-mr-2 -mt-1 size-10 px-0' })}
                >
                  <X size={20} aria-hidden="true" />
                </button>
              )}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-3 sm:px-7 sm:pb-7">{children}</div>
          </div>
        </div>
      )}
    </dialog>
  );
}

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Vazgeç',
  tone = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} description={description} size="sm">
      <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
        <button type="button" data-autofocus onClick={onCancel} className={buttonStyles({ variant: 'secondary' })}>
          {cancelLabel}
        </button>
        <button type="button" onClick={onConfirm} className={buttonStyles({ variant: tone })}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
