export type ToyCategory = 'articulation' | 'fine-motor' | 'sensory' | 'language' | 'cognitive' | 'other';

/** A reusable clinic material. Photo bytes are stored in the app-private filesystem;
 * only the relative file path and associations are included in app/cloud state. */
export interface ToyInventoryItem {
  id: string;
  name: string;
  category: ToyCategory;
  linkedActivities: string[];
  photoPath?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SpeechCareInventoryBridge {
  getToys: () => ToyInventoryItem[];
  saveToys: (items: ToyInventoryItem[]) => void;
}

declare global {
  interface Window {
    SpeechCareInventoryBridge?: SpeechCareInventoryBridge;
    mountSpeechCareInventory?: () => void;
    SpeechCareHaptics?: { light: () => void };
  }
}
