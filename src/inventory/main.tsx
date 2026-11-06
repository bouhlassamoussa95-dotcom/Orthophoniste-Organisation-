import React from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { ToyInventory } from './ToyInventory';
import type { InventoryLocale } from './copy';

declare global {
  interface Window { mountSpeechCareInventory?: () => void; }
}

let root: Root | null = null;
let mountedElement: HTMLElement | null = null;

function currentLocale(): InventoryLocale {
  const value = document.documentElement.lang.toLowerCase();
  return value.startsWith('ar') ? 'ar' : value.startsWith('fr') ? 'fr' : 'en';
}

function mount(): void {
  const element = document.getElementById('speechcare-inventory-root');
  if (!element) {
    root?.unmount(); root = null; mountedElement = null;
    return;
  }
  if (!root || mountedElement !== element) {
    root?.unmount();
    root = createRoot(element);
    mountedElement = element;
  }
  root.render(<ToyInventory locale={currentLocale()} onPlanActivity={(toy, activity) => {
    window.dispatchEvent(new CustomEvent('speechcare:inventory-plan', { detail: { toy, activity } }));
  }} />);
}

window.mountSpeechCareInventory = mount;
