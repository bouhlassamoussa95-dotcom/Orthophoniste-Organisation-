import { Haptics, ImpactStyle } from '@capacitor/haptics';

declare global {
  interface Window {
    SpeechCareHaptics?: { light: () => void };
  }
}

window.SpeechCareHaptics = {
  light: () => {
    void Haptics.impact({ style: ImpactStyle.Light }).catch(() => {
      // Browser fallback is best-effort; native Android uses Capacitor Haptics.
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate?.(8);
    });
  }
};
