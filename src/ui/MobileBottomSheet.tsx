import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export interface MobileBottomSheetProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  labelledBy?: string;
}

/** Reusable modal sheet for search-heavy lists and multi-step choices. */
export function MobileBottomSheet({ open, title, onClose, children, labelledBy = 'speechcare-sheet-title' }: MobileBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => sheetRef.current?.focus());
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="sc-fixed sc-inset-0 sc-z-[100] sc-flex sc-items-end sc-justify-center" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="sc-absolute sc-inset-0 sc-bg-black/45 sc-backdrop-blur-sm" />
      <section ref={sheetRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={labelledBy} className="sc-relative sc-z-[1] sc-max-h-[92dvh] sc-w-full sc-max-w-[520px] sc-overflow-hidden sc-rounded-t-3xl sc-bg-[var(--card)] sc-px-4 sc-pb-[calc(16px+env(safe-area-inset-bottom))] sc-pt-3 sc-shadow-2xl" onTouchStart={e => { startY.current = e.touches[0]?.clientY ?? null; }} onTouchEnd={e => { const end = e.changedTouches[0]?.clientY; if (startY.current !== null && end !== undefined && end - startY.current > 90) onClose(); startY.current = null; }}>
        <div className="sc-mx-auto sc-mb-3 sc-h-1.5 sc-w-12 sc-rounded-full sc-bg-[var(--mut)] sc-opacity-40" aria-hidden="true" />
        <div className="sc-mb-3 sc-flex sc-items-center sc-justify-between sc-gap-3"><h2 id={labelledBy} className="sc-text-base sc-font-bold sc-text-[var(--ink)]">{title}</h2><button type="button" aria-label="Close" onClick={onClose} className="sc-min-h-12 sc-min-w-12 sc-rounded-xl sc-bg-[var(--bg)] sc-text-lg sc-text-[var(--ink)]">×</button></div>
        <div className="sc-max-h-[calc(92dvh-90px)] sc-overflow-y-auto sc-overscroll-contain">{children}</div>
      </section>
    </div>, document.body
  );
}
