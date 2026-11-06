import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { GameHub } from './GameHub';
import type { GamePerformanceMetrics, SpeechCareGameId, SpeechCareLocale } from './types';

let activeRoot: Root | null = null;
let activeElement: HTMLElement | null = null;

function toLocale(value: string | undefined): SpeechCareLocale {
  return value === 'ar' || value === 'fr' ? value : 'en';
}

function emitMetrics(metrics: GamePerformanceMetrics): void {
  window.dispatchEvent(new CustomEvent<GamePerformanceMetrics>('speechcare:game-complete', { detail: metrics }));
}

function mountSpeechCareGames(): void {
  const element = document.getElementById('speechcare-game-root');
  if (!element) {
    activeRoot?.unmount();
    activeRoot = null;
    activeElement = null;
    return;
  }
  if (activeElement !== element || !activeRoot) {
    activeRoot?.unmount();
    activeElement = element;
    activeRoot = createRoot(element);
  }
  const root = activeRoot;
  if (!root) return;
  const gameId = element.dataset.game === 'sound-detective' ? 'sound-detective' : 'syllable-train';
  const locale = toLocale(element.dataset.locale);
  root.render(
    <GameHub
      gameId={gameId as SpeechCareGameId}
      locale={locale}
      patientId={element.dataset.patientId || undefined}
      sessionId={element.dataset.sessionId || undefined}
      onLog={emitMetrics}
    />
  );
}

window.mountSpeechCareGames = mountSpeechCareGames;
