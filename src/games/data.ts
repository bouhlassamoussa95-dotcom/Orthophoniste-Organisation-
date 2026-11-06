import type { SoundTask, SyllableTask } from './types';

// Original, locally bundled SpeechCare prompts. No remote assets or AI calls.
export const syllableTasks: SyllableTask[] = [
  {
    id: 'kitab', word: 'كِتاب', parts: ['كِ', 'تاب'], level: 1,
    hint: {
      ar: 'ركّب المقاطع باش نكوّنو كلمة «كتاب». اسمع مليح وابدأ بالمقطع الأول.',
      fr: 'Assemble les syllabes dans le bon ordre pour former « كتاب ».',
      en: 'Put the syllables in order to build the target word.'
    }
  },
  {
    id: 'qamar', word: 'قَمَر', parts: ['قَ', 'مَر'], level: 1,
    hint: {
      ar: 'ركّب المقاطع باش نكوّنو كلمة «قمر». شكون يجي الأول؟',
      fr: 'Remets les syllabes dans l’ordre pour former « قمر ».',
      en: 'Put the syllables in order to make “moon”.'
    }
  },
  {
    id: 'samak', word: 'سَمَك', parts: ['سَ', 'مَك'], level: 2,
    hint: {
      ar: 'اسمع مليح: ركّب مقطعين باش نلقاو كلمة «سمك».',
      fr: 'Écoute et assemble les deux syllabes pour former « سمك ».',
      en: 'Listen and assemble the two syllables to make the word.'
    }
  },
  {
    id: 'batal', word: 'بَطَل', parts: ['بَ', 'طَل'], level: 2,
    hint: {
      ar: 'يلا يا بطل! رتّب المقاطع باش نكوّنو كلمة «بطل».',
      fr: 'À toi de jouer : replace les syllabes pour former « بطل ».',
      en: 'Your turn: place the syllables in the right order.'
    }
  }
];

export const soundTasks: SoundTask[] = [
  {
    id: 'mouz', target: 'موز', phoneme: 'م', emoji: '🍌', level: 1,
    choices: [
      { id: 'tuffah', label: 'تفاح', emoji: '🍎' },
      { id: 'mouz', label: 'موز', emoji: '🍌' },
      { id: 'hlib', label: 'حليب', emoji: '🥛' },
      { id: 'samak', label: 'سمك', emoji: '🐟' }
    ]
  },
  {
    id: 'bab', target: 'باب', phoneme: 'ب', emoji: '🚪', level: 1,
    choices: [
      { id: 'dar', label: 'دار', emoji: '🏠' },
      { id: 'bab', label: 'باب', emoji: '🚪' },
      { id: 'warda', label: 'وردة', emoji: '🌹' },
      { id: 'ktab', label: 'كتاب', emoji: '📘' }
    ]
  },
  {
    id: 'shams', target: 'شمس', phoneme: 'ش', emoji: '☀️', level: 2,
    choices: [
      { id: 'qamar', label: 'قمر', emoji: '🌙' },
      { id: 'shams', label: 'شمس', emoji: '☀️' },
      { id: 'star', label: 'نجمة', emoji: '⭐' },
      { id: 'cloud', label: 'سحابة', emoji: '☁️' }
    ]
  },
  {
    id: 'warda', target: 'وردة', phoneme: 'و', emoji: '🌹', level: 2,
    choices: [
      { id: 'warda', label: 'وردة', emoji: '🌹' },
      { id: 'shajara', label: 'شجرة', emoji: '🌳' },
      { id: 'kitab', label: 'كتاب', emoji: '📚' },
      { id: 'samaka', label: 'سمكة', emoji: '🐠' }
    ]
  }
];
