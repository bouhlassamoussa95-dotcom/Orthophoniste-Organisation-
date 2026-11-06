import React, { useMemo, useRef, useState } from 'react';
import { syllableTasks } from './data';
import { gameCopy } from './i18n';
import type { GamePerformanceMetrics, GameProps } from './types';
import { GameFeedback } from './GameFeedback';

export function SyllableTrain({ locale, patientId, sessionId, onLog }: GameProps) {
  const copy = gameCopy[locale];
  const [taskIndex, setTaskIndex] = useState(0);
  const [placed, setPlaced] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);
  const [feedback, setFeedback] = useState<'success' | 'error' | 'info'>('info');
  const [message, setMessage] = useState(copy.instruction);
  const [note, setNote] = useState('');
  const [logged, setLogged] = useState(false);
  const [startedAt] = useState(() => new Date().toISOString());
  const timerStart = useRef(Date.now());
  const task = syllableTasks[taskIndex % syllableTasks.length];
  const isComplete = placed.length === task.parts.length;
  const choices = useMemo(() => [...task.parts].reverse(), [task]);
  const targetLang = locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-FR' : 'en-GB';

  const speak = () => {
    if (!('speechSynthesis' in window)) return setMessage(copy.audioFallback);
    const utterance = new SpeechSynthesisUtterance(task.word);
    utterance.lang = targetLang;
    utterance.rate = 0.82;
    const voice = speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith(locale));
    if (voice) utterance.voice = voice;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  const choose = (part: string) => {
    if (isComplete || placed.includes(part)) return;
    setAttempts(n => n + 1);
    const expected = task.parts[placed.length];
    if (part === expected) {
      const nextPlaced = [...placed, part];
      setPlaced(nextPlaced);
      setCorrect(n => n + 1);
      setFeedback('success');
      setMessage(nextPlaced.length === task.parts.length ? copy.correct : copy.correct);
    } else {
      setErrors(n => n + 1);
      setFeedback('error');
      setMessage(copy.tryAgain);
    }
  };

  const nextTask = () => {
    setTaskIndex(i => (i + 1) % syllableTasks.length);
    setPlaced([]);
    setFeedback('info');
    setMessage(copy.instruction);
  };

  const log = () => {
    if (logged) return;
    const finishedAt = new Date().toISOString();
    const metrics: GamePerformanceMetrics = {
      gameId: 'syllable-train', gameName: copy.syllableTitle, target: task.word,
      attempts, correct, errors, accuracyPercent: attempts ? Math.round((correct / attempts) * 100) : 0,
      elapsedSeconds: Math.max(1, Math.round((Date.now() - timerStart.current) / 1000)),
      completed: isComplete, startedAt, finishedAt, locale, patientId, sessionId,
      therapistNote: note.trim() || undefined
    };
    onLog(metrics);
    setLogged(true);
  };

  return (
    <section dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale === 'ar' ? 'ar-DZ' : locale} className="sc-flex sc-flex-col sc-gap-4 sc-pb-3">
      <header className="sc-rounded-2xl sc-bg-[var(--sec)] sc-p-4 sc-text-white">
        <div className="sc-flex sc-items-center sc-justify-between sc-gap-2">
          <span className="sc-text-xs sc-font-semibold sc-opacity-85">{copy.level} {task.level}</span>
          <span className="sc-rounded-full sc-bg-white/20 sc-px-3 sc-py-1 sc-text-xs">{taskIndex + 1} / {syllableTasks.length}</span>
        </div>
        <h2 className="sc-mt-1 sc-text-xl sc-font-bold">🚂 {copy.syllableTitle}</h2>
        <p className="sc-mt-2 sc-text-sm sc-leading-6 sc-opacity-95">{task.hint[locale]}</p>
      </header>

      <div className="sc-rounded-2xl sc-border sc-border-[var(--line)] sc-bg-[var(--card)] sc-p-4">
        <div className="sc-flex sc-items-center sc-justify-between sc-gap-2">
          <div><div className="sc-text-xs sc-text-[var(--mut)]">{copy.target}</div><div className="sc-mt-1 sc-text-2xl sc-font-bold" lang="ar" dir="rtl">{task.word}</div></div>
          <button type="button" onClick={speak} className="sc-min-h-12 sc-rounded-xl sc-bg-[var(--chip)] sc-px-4 sc-font-semibold sc-text-[var(--ink)]">🔊 {copy.listen}</button>
        </div>
        <div className="sc-mt-4">
          <div className="sc-mb-2 sc-text-sm sc-font-semibold">{copy.built}</div>
          <div className="sc-flex sc-min-h-[64px] sc-flex-wrap sc-items-center sc-gap-2 sc-rounded-xl sc-border-2 sc-border-dashed sc-border-[var(--line)] sc-bg-[var(--bg)] sc-p-3" aria-live="polite">
            {placed.length ? placed.map((part, index) => <span key={`${part}-${index}`} className="sc-rounded-lg sc-bg-[var(--sec)] sc-px-4 sc-py-2 sc-text-xl sc-font-bold sc-text-white">{part}</span>) : <span className="sc-text-sm sc-text-[var(--mut)]">{locale === 'ar' ? 'اختار المقاطع من الأسفل…' : locale === 'fr' ? 'Choisis les syllabes ci-dessous…' : 'Choose syllables below…'}</span>}
          </div>
        </div>
        <div className="sc-mt-4 sc-grid sc-grid-cols-2 sc-gap-3">
          {choices.map((part, index) => {
            const used = placed.includes(part);
            return <button type="button" key={`${task.id}-${part}-${index}`} disabled={used || isComplete} onClick={() => choose(part)} className="sc-min-h-[64px] sc-rounded-xl sc-border sc-border-[var(--line)] sc-bg-[var(--card)] sc-p-3 sc-text-2xl sc-font-bold sc-text-[var(--ink)] disabled:sc-opacity-35">{used ? '✓' : part}</button>;
          })}
        </div>
        <GameFeedback tone={feedback}>{message}</GameFeedback>
        {isComplete && <button type="button" onClick={nextTask} className="sc-min-h-[52px] sc-w-full sc-rounded-xl sc-bg-[var(--tea)] sc-px-4 sc-font-bold sc-text-white">{copy.next}</button>}
      </div>

      <div className="sc-grid sc-grid-cols-3 sc-gap-2">
        <Metric label={copy.attempts} value={attempts} />
        <Metric label={copy.correctCount} value={correct} />
        <Metric label={copy.progress} value={`${Math.round((placed.length / task.parts.length) * 100)}%`} />
      </div>

      <label className="sc-flex sc-flex-col sc-gap-2 sc-text-sm sc-font-medium sc-text-[var(--mut)]">
        {copy.note}
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder={copy.notePlaceholder} className="sc-min-h-12 sc-w-full sc-rounded-xl sc-border sc-border-[var(--line)] sc-bg-[var(--card)] sc-p-3 sc-text-base sc-text-[var(--ink)]" />
      </label>
      <button type="button" disabled={logged} onClick={log} className="sc-min-h-[56px] sc-w-full sc-rounded-2xl sc-bg-[var(--sec)] sc-px-5 sc-font-bold sc-text-white disabled:sc-opacity-60">{logged ? copy.logged : `✓ ${copy.log}`}</button>
      <p className="sc-text-center sc-text-xs sc-leading-5 sc-text-[var(--mut)]">{copy.offline} {copy.gameNote}</p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="sc-rounded-xl sc-border sc-border-[var(--line)] sc-bg-[var(--card)] sc-p-3 sc-text-center"><div className="sc-text-lg sc-font-bold sc-text-[var(--ink)]">{value}</div><div className="sc-text-xs sc-text-[var(--mut)]">{label}</div></div>;
}
