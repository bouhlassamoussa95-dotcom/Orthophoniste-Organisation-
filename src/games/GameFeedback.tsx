import React from 'react';

export function GameFeedback({ children, tone = 'info' }: { children: React.ReactNode; tone?: 'info' | 'success' | 'error' }) {
  const classes = tone === 'success'
    ? 'sc-border-[color-mix(in_srgb,var(--tea)_45%,transparent)] sc-bg-[color-mix(in_srgb,var(--tea)_12%,var(--card))]'
    : tone === 'error'
      ? 'sc-border-[color-mix(in_srgb,var(--red)_42%,transparent)] sc-bg-[color-mix(in_srgb,var(--red)_10%,var(--card))]'
      : 'sc-border-[var(--line)] sc-bg-[var(--bg)]';
  return <div role="status" aria-live="polite" className={`sc-rounded-xl sc-border sc-p-3 sc-text-sm sc-leading-6 ${classes} ${tone === 'success' ? 'sc-game-success' : ''}`}>{children}</div>;
}
