import React, { useEffect, useRef } from 'react';

export interface DropdownOption { value: string; label: string; description?: string }
export interface AnchoredDropdownProps {
  open: boolean;
  options: DropdownOption[];
  value?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  label?: string;
}

/** Compact option menu for short lists such as status, language and report type. */
export function AnchoredDropdown({ open, options, value, onSelect, onClose, label = 'Options' }: AnchoredDropdownProps) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) onClose(); };
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', key); };
  }, [open, onClose]);
  if (!open) return null;
  return <div ref={root} role="listbox" aria-label={label} className="sc-absolute sc-left-0 sc-right-0 sc-top-[calc(100%+6px)] sc-z-50 sc-max-h-72 sc-overflow-auto sc-rounded-2xl sc-border sc-border-[var(--line)] sc-bg-[var(--card)] sc-p-1.5 sc-shadow-xl sc-origin-top sc-animate-[sc-picker-in_160ms_ease-out]">
    {options.map(option => <button key={option.value} type="button" role="option" aria-selected={value === option.value} onClick={() => onSelect(option.value)} className={`sc-flex sc-min-h-12 sc-w-full sc-flex-col sc-items-start sc-justify-center sc-rounded-xl sc-px-3 sc-py-2 sc-text-start ${value === option.value ? 'sc-bg-[var(--chip)] sc-font-bold' : 'sc-bg-transparent'} sc-text-[var(--ink)]`}><span>{option.label}</span>{option.description && <small className="sc-text-xs sc-text-[var(--mut)]">{option.description}</small>}</button>)}
  </div>;
}
