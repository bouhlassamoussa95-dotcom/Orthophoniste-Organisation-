import React, { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { MobileBottomSheet } from '../ui/MobileBottomSheet';
import { deleteToyPhoto, pickAndStoreToyFile, pickAndStoreToyPhoto, resolveToyPhoto } from './photoSecurity';
import { inventoryCopy, toyCategories, type InventoryLocale } from './copy';
import type { ToyCategory, ToyInventoryItem } from './types';

interface ToyInventoryProps {
  locale: InventoryLocale;
  onPlanActivity?: (toy: ToyInventoryItem, activity: string) => void;
}

const EMOJI: Record<ToyCategory, string> = {
  articulation: '🗣️', 'fine-motor': '🧩', sensory: '🟠', language: '🖼️', cognitive: '🧠', other: '🧸'
};
const makeId = () => `toy_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

function loadItems(): ToyInventoryItem[] {
  const bridge = window.SpeechCareInventoryBridge;
  if (bridge) return bridge.getToys() || [];
  try { return JSON.parse(localStorage.getItem('speechcare_toy_inventory') || '[]') as ToyInventoryItem[]; }
  catch { return []; }
}

export function ToyInventory({ locale, onPlanActivity }: ToyInventoryProps) {
  const copy = inventoryCopy(locale);
  const rtl = locale === 'ar';
  const [items, setItems] = useState<ToyInventoryItem[]>(loadItems);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftCategory, setDraftCategory] = useState<ToyCategory>('articulation');
  const [draftNotes, setDraftNotes] = useState('');
  const [draftId, setDraftId] = useState(makeId);
  const [draftPhotoPath, setDraftPhotoPath] = useState<string | undefined>();
  const [draftPhotoUrl, setDraftPhotoUrl] = useState('');
  const [busyPhoto, setBusyPhoto] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [activityDrafts, setActivityDrafts] = useState<Record<string, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const persist = useCallback((next: ToyInventoryItem[]) => {
    setItems(next);
    if (window.SpeechCareInventoryBridge) window.SpeechCareInventoryBridge.saveToys(next);
    else { try { localStorage.setItem('speechcare_toy_inventory', JSON.stringify(next)); } catch { /* storage quota is surfaced by app shell when bridged */ } }
    window.dispatchEvent(new CustomEvent('speechcare:inventory-updated', { detail: next }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all(items.filter(x => x.photoPath).map(async item => {
      const url = await resolveToyPhoto(item.photoPath);
      return [item.id, url] as const;
    })).then(entries => {
      if (!cancelled) setPhotoUrls(current => ({ ...current, ...Object.fromEntries(entries.filter((x): x is readonly [string, string] => !!x[1])) }));
    });
    return () => { cancelled = true; };
  }, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase();
    if (!q) return items;
    return items.filter(item => item.name.toLocaleLowerCase().includes(q) || item.linkedActivities.some(activity => activity.toLocaleLowerCase().includes(q)));
  }, [items, search]);

  const resetDraft = () => {
    setDraftId(makeId()); setDraftName(''); setDraftCategory('articulation'); setDraftNotes(''); setDraftPhotoPath(undefined); setDraftPhotoUrl(''); setError('');
  };

  const closeDraft = useCallback(() => {
    if (draftPhotoPath) void deleteToyPhoto(draftPhotoPath);
    setSheetOpen(false);
    resetDraft();
  }, [draftPhotoPath]);

  const acceptPickedPhoto = async (photo: Awaited<ReturnType<typeof pickAndStoreToyPhoto>>) => {
    if (!photo) return;
    if (draftPhotoPath && draftPhotoPath !== photo.relativePath) await deleteToyPhoto(draftPhotoPath);
    setDraftPhotoPath(photo.relativePath);
    setDraftPhotoUrl(photo.displayUrl);
  };

  const choosePhoto = async (toyId: string) => {
    setBusyPhoto(true); setError('');
    try { await acceptPickedPhoto(await pickAndStoreToyPhoto(toyId, locale)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : copy.photoError); }
    finally { setBusyPhoto(false); }
  };

  const chooseFile = async (toyId: string) => {
    setBusyPhoto(true); setError('');
    try { await acceptPickedPhoto(await pickAndStoreToyFile(toyId, locale)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : copy.photoError); }
    finally { setBusyPhoto(false); }
  };

  const createToy = (event: FormEvent) => {
    event.preventDefault();
    const name = draftName.trim();
    if (!name) { setError(copy.photoRequired); return; }
    const now = new Date().toISOString();
    const item: ToyInventoryItem = {
      id: draftId, name, category: draftCategory, linkedActivities: [], photoPath: draftPhotoPath,
      notes: draftNotes.trim() || undefined, createdAt: now, updatedAt: now
    };
    persist([item, ...items]);
    if (draftPhotoUrl) setPhotoUrls(current => ({ ...current, [item.id]: draftPhotoUrl }));
    resetDraft(); setSheetOpen(false); setStatus(copy.saved); window.SpeechCareHaptics?.light();
  };

  const addActivity = (item: ToyInventoryItem) => {
    const activity = (activityDrafts[item.id] || '').trim();
    if (!activity) return;
    if (item.linkedActivities.some(x => x.toLocaleLowerCase() === activity.toLocaleLowerCase())) {
      setActivityDrafts(current => ({ ...current, [item.id]: '' })); return;
    }
    persist(items.map(x => x.id === item.id ? { ...x, linkedActivities: [...x.linkedActivities, activity], updatedAt: new Date().toISOString() } : x));
    setActivityDrafts(current => ({ ...current, [item.id]: '' })); setStatus(copy.activityAdded); window.SpeechCareHaptics?.light();
  };

  const removeActivity = (item: ToyInventoryItem, activity: string) => {
    persist(items.map(x => x.id === item.id ? { ...x, linkedActivities: x.linkedActivities.filter(a => a !== activity), updatedAt: new Date().toISOString() } : x));
  };

  const removeToy = async (item: ToyInventoryItem) => {
    if (deleteTarget !== item.id) { setDeleteTarget(item.id); return; }
    await deleteToyPhoto(item.photoPath);
    setPhotoUrls(current => { const next = { ...current }; delete next[item.id]; return next; });
    persist(items.filter(x => x.id !== item.id)); setDeleteTarget(null);
  };

  return (
    <section id="speechcare-inventory-root-inner" dir={rtl ? 'rtl' : 'ltr'} lang={rtl ? 'ar-DZ' : locale} className="sc-inventory sc-flex sc-flex-col sc-gap-4 sc-pb-5">
      <header className="sc-flex sc-flex-wrap sc-items-start sc-justify-between sc-gap-3">
        <div className="sc-min-w-0"><h2 className="sc-m-0 sc-text-xl sc-font-bold sc-text-[var(--ink)]">🧸 {copy.title}</h2><p className="sc-mt-1 sc-text-sm sc-text-[var(--mut)]">{copy.subtitle}</p></div>
        <button type="button" onClick={() => { resetDraft(); setSheetOpen(true); }} className="sc-min-h-[56px] sc-rounded-2xl sc-bg-[var(--sec)] sc-px-4 sc-font-bold sc-text-white">＋ {copy.addToy}</button>
      </header>

      {status && <p role="status" aria-live="polite" className="sc-m-0 sc-rounded-xl sc-bg-[var(--chip)] sc-px-3 sc-py-2 sc-text-sm sc-font-semibold sc-text-[var(--ink)]">{status}</p>}

      <div className="sc-flex sc-items-center sc-gap-2">
        <input aria-label={copy.search} value={search} onChange={e => setSearch(e.target.value)} placeholder={copy.search} className="sc-min-h-12 sc-w-full sc-rounded-xl sc-border sc-border-[var(--line)] sc-bg-[var(--card)] sc-px-4 sc-text-base sc-text-[var(--ink)]" />
        <span className="sc-whitespace-nowrap sc-rounded-full sc-bg-[var(--chip)] sc-px-3 sc-py-2 sc-text-xs sc-font-semibold sc-text-[var(--ink)]">{items.length} {copy.count}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="sc-rounded-2xl sc-border sc-border-dashed sc-border-[var(--line)] sc-bg-[var(--card)] sc-p-6 sc-text-center">
          <div className="sc-text-5xl">🧸</div><h3 className="sc-mt-3 sc-text-lg sc-font-bold sc-text-[var(--ink)]">{items.length ? copy.noResults : copy.emptyTitle}</h3><p className="sc-mt-1 sc-text-sm sc-text-[var(--mut)]">{items.length ? copy.search : copy.emptyText}</p>
          {!items.length && <button type="button" onClick={() => setSheetOpen(true)} className="sc-mt-4 sc-min-h-[52px] sc-rounded-xl sc-bg-[var(--sec)] sc-px-5 sc-font-bold sc-text-white">＋ {copy.addToy}</button>}
        </div>
      ) : (
        <div className="sc-grid sc-grid-cols-1 sc-gap-3 sm:sc-grid-cols-2">
          {filtered.map(item => (
            <article key={item.id} className="sc-overflow-hidden sc-rounded-2xl sc-border sc-border-[var(--line)] sc-bg-[var(--card)] sc-shadow-sm">
              <div className="sc-flex sc-gap-3 sc-p-3">
                <div className="sc-flex sc-h-24 sc-w-24 sc-flex-none sc-items-center sc-justify-center sc-overflow-hidden sc-rounded-xl sc-bg-[var(--bg)] sc-text-4xl">
                  {photoUrls[item.id] ? <img src={photoUrls[item.id]} alt={item.name} className="sc-h-full sc-w-full sc-object-cover" /> : <span aria-label={copy.noPhoto}>{EMOJI[item.category]}</span>}
                </div>
                <div className="sc-min-w-0 sc-flex-1">
                  <h3 className="sc-break-words sc-text-base sc-font-bold sc-text-[var(--ink)]">{item.name}</h3>
                  <span className="sc-mt-1 sc-inline-flex sc-rounded-full sc-bg-[var(--chip)] sc-px-3 sc-py-1 sc-text-xs sc-font-semibold sc-text-[var(--ink)]">{copy.categories[item.category]}</span>
                  {item.notes && <p className="sc-mt-2 sc-line-clamp-2 sc-text-xs sc-text-[var(--mut)]">{item.notes}</p>}
                </div>
              </div>
              <div className="sc-border-t sc-border-[var(--line)] sc-p-3">
                <div className="sc-mb-2 sc-text-sm sc-font-bold sc-text-[var(--ink)]">{item.linkedActivities.length ? item.linkedActivities.length + ' · ' : ''}{copy.materialsInPlan}</div>
                {item.linkedActivities.length ? <ul className="sc-mb-3 sc-flex sc-flex-wrap sc-gap-2">{item.linkedActivities.map(activity => (
                  <li key={activity} className="sc-inline-flex sc-max-w-full sc-items-center sc-gap-1 sc-rounded-full sc-bg-[var(--bg)] sc-px-3 sc-py-1.5 sc-text-xs sc-text-[var(--ink)]"><span className="sc-break-words">{activity}</span>
                    <button type="button" aria-label={`${copy.remove}: ${activity}`} onClick={() => removeActivity(item, activity)} className="sc-ml-1 sc-flex sc-h-12 sc-w-12 sc-items-center sc-justify-center sc-rounded-full sc-text-base sc-text-[var(--mut)]">×</button>
                  </li>
                ))}</ul> : <p className="sc-mb-3 sc-text-xs sc-text-[var(--mut)]">{copy.noActivities}</p>}
                {onPlanActivity && item.linkedActivities.length > 0 && <div className="sc-mb-3 sc-flex sc-flex-wrap sc-gap-2">{item.linkedActivities.map(activity => <button type="button" key={`plan-${activity}`} onClick={() => onPlanActivity(item, activity)} className="sc-min-h-12 sc-rounded-lg sc-border sc-border-[var(--line)] sc-bg-[var(--bg)] sc-px-3 sc-text-xs sc-font-semibold sc-text-[var(--ink)]">＋ {copy.use}: {activity}</button>)}</div>}
                <div className="sc-flex sc-gap-2">
                  <input maxLength={120} value={activityDrafts[item.id] || ''} onChange={e => setActivityDrafts(current => ({ ...current, [item.id]: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addActivity(item); } }} placeholder={copy.activityPlaceholder} className="sc-min-h-12 sc-min-w-0 sc-flex-1 sc-rounded-xl sc-border sc-border-[var(--line)] sc-bg-[var(--bg)] sc-px-3 sc-text-sm sc-text-[var(--ink)]" />
                  <button type="button" onClick={() => addActivity(item)} className="sc-min-h-12 sc-min-w-12 sc-rounded-xl sc-bg-[var(--sec)] sc-px-3 sc-font-bold sc-text-white" aria-label={copy.addActivity}>＋</button>
                </div>
                <button type="button" onClick={() => removeToy(item)} className={`sc-mt-3 sc-min-h-12 sc-rounded-lg sc-px-3 sc-text-xs sc-font-semibold ${deleteTarget === item.id ? 'sc-bg-[var(--red)] sc-text-white' : 'sc-text-[var(--mut)]'}`}>{deleteTarget === item.id ? copy.deleteConfirm : copy.delete}</button>
              </div>
            </article>
          ))}
        </div>
      )}

      <MobileBottomSheet open={sheetOpen} title={copy.addToy} onClose={closeDraft}>
        <form onSubmit={createToy} className="sc-flex sc-flex-col sc-gap-3">
          <label className="sc-flex sc-flex-col sc-gap-1 sc-text-sm sc-font-semibold sc-text-[var(--ink)]">{copy.name}
            <input autoFocus maxLength={100} value={draftName} onChange={e => setDraftName(e.target.value)} placeholder={copy.namePlaceholder} className="sc-min-h-12 sc-rounded-xl sc-border sc-border-[var(--line)] sc-bg-[var(--bg)] sc-px-3 sc-text-base" />
          </label>
          <label className="sc-flex sc-flex-col sc-gap-1 sc-text-sm sc-font-semibold sc-text-[var(--ink)]">{copy.category}
            <div className="sc-grid sc-grid-cols-2 sc-gap-2">{toyCategories.map(category => <button type="button" key={category} onClick={() => setDraftCategory(category)} className={`sc-min-h-12 sc-rounded-xl sc-border sc-px-3 sc-text-sm sc-font-semibold ${draftCategory === category ? 'sc-border-[var(--sec)] sc-bg-[var(--chip)] sc-text-[var(--sec)]' : 'sc-border-[var(--line)] sc-bg-[var(--card)] sc-text-[var(--ink)]'}`}>{EMOJI[category]} {copy.categories[category]}</button>)}</div>
          </label>
          <label className="sc-flex sc-flex-col sc-gap-1 sc-text-sm sc-font-semibold sc-text-[var(--ink)]">{copy.notes}
            <textarea rows={2} maxLength={400} value={draftNotes} onChange={e => setDraftNotes(e.target.value)} placeholder={copy.notesPlaceholder} className="sc-min-h-20 sc-rounded-xl sc-border sc-border-[var(--line)] sc-bg-[var(--bg)] sc-p-3 sc-text-base" />
          </label>
          <div className="sc-flex sc-items-center sc-gap-3">
            <div className="sc-flex sc-h-20 sc-w-20 sc-items-center sc-justify-center sc-overflow-hidden sc-rounded-xl sc-bg-[var(--bg)] sc-text-3xl">{draftPhotoUrl ? <img src={draftPhotoUrl} alt="Toy preview" className="sc-h-full sc-w-full sc-object-cover" /> : EMOJI[draftCategory]}</div>
            <div className="sc-flex sc-flex-1 sc-flex-col sc-gap-1">
              <button type="button" disabled={busyPhoto} onClick={() => choosePhoto(draftId)} className="sc-min-h-[52px] sc-rounded-xl sc-border sc-border-[var(--line)] sc-bg-[var(--bg)] sc-px-3 sc-font-semibold sc-text-[var(--ink)]">{busyPhoto ? '…' : `📷 ${draftPhotoUrl ? copy.changePhoto : copy.photo}`}</button>
              <button type="button" disabled={busyPhoto} onClick={() => chooseFile(draftId)} className="sc-min-h-12 sc-rounded-xl sc-border sc-border-[var(--line)] sc-bg-[var(--card)] sc-px-3 sc-text-sm sc-font-semibold sc-text-[var(--ink)]">📁 {copy.file}</button>
              <p className="sc-text-xs sc-text-[var(--mut)]">{copy.photoSecurity}</p>
            </div>
          </div>
          {error && <p role="alert" className="sc-rounded-lg sc-bg-[var(--red)]/10 sc-p-3 sc-text-sm sc-text-[var(--red)]">{error}</p>}
          {draftPhotoPath && <p className="sc-text-xs sc-font-semibold sc-text-[var(--tea)]">✓ {copy.photoReady}</p>}
          <div className="sc-flex sc-gap-2"><button type="submit" className="sc-min-h-[56px] sc-flex-1 sc-rounded-xl sc-bg-[var(--sec)] sc-px-4 sc-font-bold sc-text-white">{copy.save}</button><button type="button" onClick={closeDraft} className="sc-min-h-[56px] sc-rounded-xl sc-border sc-border-[var(--line)] sc-bg-[var(--bg)] sc-px-4 sc-font-semibold sc-text-[var(--ink)]">{copy.cancel}</button></div>
        </form>
      </MobileBottomSheet>
    </section>
  );
}
