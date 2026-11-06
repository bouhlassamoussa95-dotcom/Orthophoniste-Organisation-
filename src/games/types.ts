export type SpeechCareLocale = 'ar' | 'fr' | 'en';
export type SpeechCareGameId = 'syllable-train' | 'sound-detective';

export interface GamePerformanceMetrics {
  gameId: SpeechCareGameId;
  gameName: string;
  target: string;
  attempts: number;
  correct: number;
  errors: number;
  accuracyPercent: number;
  elapsedSeconds: number;
  completed: boolean;
  startedAt: string;
  finishedAt: string;
  locale: SpeechCareLocale;
  patientId?: string;
  sessionId?: string;
  therapistNote?: string;
}

export interface GameProps {
  locale: SpeechCareLocale;
  patientId?: string;
  sessionId?: string;
  onLog: (metrics: GamePerformanceMetrics) => void;
}

export interface SyllableTask {
  id: string;
  word: string;
  parts: string[];
  hint: Record<SpeechCareLocale, string>;
  level: 1 | 2 | 3;
}

export interface SoundTask {
  id: string;
  target: string;
  phoneme: string;
  emoji: string;
  choices: Array<{ id: string; label: string; emoji: string }>;
  level: 1 | 2 | 3;
}

declare global {
  interface Window {
    mountSpeechCareGames?: () => void;
    SpeechCareHaptics?: { light: () => void };
  }
}
