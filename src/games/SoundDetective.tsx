import React, { useMemo, useRef, useState } from 'react';
import { soundTasks } from './data';
import { gameCopy } from './i18n';
import type { GamePerformanceMetrics, GameProps } from './types';
import { GameFeedback } from './GameFeedback';

export function SoundDetective({ locale, patientId, sessionId, onLog }: GameProps) {
  const copy = gameCopy[locale];
  const [taskIndex, setTaskIndex] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'info' | 'success' | 'error'>('info');
  const [note, setNote] = useState('');
  const [logged, setLogged] = useState(false);
  const [startedAt] = useState(() => new Date().toISOString());
  const timerStart = useRef(Date.now());
  const task = soundTasks[taskIndex % soundTasks.length];
  const choices = useMemo(() => task.choices, [task]);
  const targetLang = locale === 'ar' ? 'ar-DZ' : locale === 'fr' ? 'fr-FR' : 'en-GB';

  const speak = () => {
    if (!('speechSynthesis' in window)) return;
    const utterance = new SpeechSynthesisUtterance(task.target);
    utterance.lang = targetLang;
    utterance.rate = 0.78;
    const voice = speechSynthesis.getVoices().find(v => v.lang.toLowerCase().startsWith(locale));
    if (voice) utterance.voice = voice;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  const choose = (id: string) => {
    if (selected) return;
    setSelected(id);
    setAttempts(n => n + 1);
    if (id === task.id) {
      setCorrect(n => n + 1);
      setFeedback('success');
    } else {
      setErrors(n => n + 1);
      setFeedback('error');
    }
  };

  const next = () => {
    setTaskIndex(i => (i + 1) % soundTasks.length);
    setSelected(null);
    setFeedback('info');
  };

  const log = () => {
    if (logged) return;
    const finishedAt = new Date().toISOString();
    onLog({
      gameId: 'sound-detective', gameName: copy.soundTitle, target: task.target,
      attempts, correct, errors, accuracyPercent: attempts ? Math.round((correct / attempts) * 100) : 0,
      elapsedSeconds: Math.max(1, Math.round((Date.now() - timerStart.current) / 1000)),
      completed: selected === task.id, startedAt, finishedAt, locale, patientId, sessionId,
      therapistNote: note.trim() || undefined
    });
    setLogged(true);
  };

  const message = selected === task.id ? copy.correct : selected ? copy.tryAgain : copy.choose;
  return (
    <section dir={locale === 'ar' ? 'rtl' : 'ltr'} lang={locale === 'ar' ? 'ar-DZ' : locale} className="sc-flex sc-flex-col sc-gap-4 sc-pb-3">
      <header className="sc-rounded-2xl sc-bg-[var(--sec)] sc-p-4 sc-text-white">
        <div className="sc-flex sc-items-center sc-justify-between sc-gap-2"><span className="sc-text-xs sc-font-semibold sc-opacity-85">{copy.level} {task.level}</span><span className="sc-rounded-full sc-bg-white/20 sc-px-3 sc-py-1 sc-text-xs">{taskIndex + 1} / {soundTasks.length}</span></div>
        <h2 className="sc-mt-1 sc-text-xl sc-font-bold">🕵️ {copy.soundTitle}</h2>
        <p className="sc-mt-2 sc-text-sm sc-leading-6 sc-opacity-95">{copy.instruction}</p>
      </header>

      <div className="sc-rounded-2xl sc-border sc-border-[var(--line)] sc-bg-[var(--card)] sc-p-4">
        <div className="sc-text-center">
          <div className="sc-text-xs sc-text-[var(--mut)]">{copy.target}</div>
          <div className="sc-my-2 sc-text-3xl sc-font-bold" dir="rtl" lang="ar">{task.target}</div>
          <div className="sc-text-sm sc-text-[var(--mut)]">{locale === 'ar' ? `ركّز على صوت «${task.phoneme}»` : locale === 'fr' ? `Repère le son « ${task.phoneme} »` : `Listen for the sound “${task.phoneme}”`}</div>
          <button type="button" onClick={speak} className="sc-mt-3 sc-min-h-12 sc-rounded-xl sc-bg-[var(--chip)] sc-px-5 sc-font-semibold sc-text-[var(--ink)]">🔊 {copy.speak}</button>
        </div>
        <p className="sc-my-3 sc-text-center sc-text-sm sc-text-[var(--mut)]">{copy.choose}</p>
        <div className="sc-grid sc-grid-cols-2 sc-gap-3">
          {choices.map(choice => {
            const isCorrect = choice.id === task.id;
            const isSelected = selected === choice.id;
            const stateClass = selected && isCorrect ? 'sc-border-2 sc-border-[var(--tea)] sc-bg-[color-mix(in_srgb,var(--tea)_12%,var(--card))]' : isSelected ? 'sc-border-2 sc-border-[var(--red)] sc-bg-[color-mix(in_srgb,var(--red)_10%,var(--card))]' : 'sc-border sc-border-[var(--line)] sc-bg-[var(--card)]';
            return <button key={choice.id} type="button" disabled={!!selected} onClick={() => choose(choice.id)} className={`sc-flex sc-min-h-[112px] sc-flex-col sc-items-center sc-justify-center sc-gap-2 sc-rounded-2xl sc-p-3 sc-text-[var(--ink)] disabled:sc-opacity-100 ${stateClass}`}><span className="sc-text-4xl" aria-hidden="true">{choice.emoji}</span><span className="sc-text-lg sc-font-bold" dir="rtl" lang="ar">{choice.label}</span></button>;
          })}
        </div>
        <div className="sc-mt-3"><GameFeedback tone={feedback}>{selected ? message : copy.audioFallback}</GameFeedback></div>
        {selected && <button type="button" onClick={next} className="sc-mt-3 sc-min-h-[52px] sc-w-full sc-rounded-xl sc-bg-[var(--tea)] sc-px-4 sc-font-bold sc-text-white">{copy.nextRound}</button>}
      </div>

      <div className="sc-grid sc-grid-cols-3 sc-gap-2">
        <Metric label={copy.attempts} value={attempts} /><Metric label={copy.correctCount} value={correct} /><Metric label={copy.progress} value={`${attempts ? Math.round(correct / attempts * 100) : 0}%`} />
      </div>
      <label className="sc-flex sc-flex-col sc-gap-2 sc-text-sm sc-font-medium sc-text-[var(--mut)]">{copy.note}<textarea value={note} onChange={e => setNote(e.target.value)} rows={2} placeholder={copy.notePlaceholder} className="sc-min-h-12 sc-w-full sc-rounded-xl sc-border sc-border-[var(--line)] sc-bg-[var(--card)] sc-p-3 sc-text-base sc-text-[var(--ink)]" /></label>
      <button type="button" disabled={logged} onClick={log} className="sc-min-h-[56px] sc-w-full sc-rounded-2xl sc-bg-[var(--sec)] sc-px-5 sc-font-bold sc-text-white disabled:sc-opacity-60">{logged ? copy.logged : `✓ ${copy.log}`}</button>
      <p className="sc-text-center sc-text-xs sc-leading-5 sc-text-[var(--mut)]">{copy.offline} {copy.gameNote}</p>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="sc-rounded-xl sc-border sc-border-[var(--line)] sc-bg-[var(--card)] sc-p-3 sc-text-center"><div className="sc-text-lg sc-font-bold sc-text-[var(--ink)]">{value}</div><div className="sc-text-xs sc-text-[var(--mut)]">{label}</div></div>;
}
