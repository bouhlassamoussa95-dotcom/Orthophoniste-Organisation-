import type { SpeechCareLocale } from './types';

export const gameCopy = {
  ar: {
    syllableTitle: 'قطار المقاطع', soundTitle: 'البحث عن الصوت',
    instruction: 'اسمع مليح، ومن بعد اختار الإجابة.',
    syllableInstruction: 'ركّب المقاطع بالترتيب باش تبني الكلمة.',
    target: 'الكلمة الهدف', listen: 'اسمع الكلمة',
    built: 'الكلمة اللي ركّبتها',
    correct: 'يعطيك الصحة يا بطل! 👏', tryAgain: 'قريب! جرّب مرة أخرى.',
    next: 'الكلمة التالية', nextRound: 'تحدّي آخر',
    speak: 'اسمع مليح',
    log: 'تمّ / سجّل الحصة',
    logged: 'تسجّلت نتائج النشاط في ملخّص الحصة.',
    loggedAlone: 'تسجّلت نتائج النشاط. اربطها بحصة من شاشة الحصص إذا لزم.',
    progress: 'التقدّم', attempts: 'المحاولات', correctCount: 'الصحيح',
    note: 'ملاحظة المعالج (اختياري)', notePlaceholder: 'اكتب ملاحظة قصيرة على الأداء…',
    offline: 'نشاط يعمل دون إنترنت أو ذكاء اصطناعي.',
    complete: 'برافو! كملت النشاط 🎉',
    choose: 'اختار الصورة اللي توافق الكلمة المسموعة.',
    audioFallback: 'إذا ما خدمش الصوت، اقرا الكلمة بصوتك للطفل.',
    level: 'المستوى',
    gameNote: 'النتيجة وصفية للممارسة فقط، وما تعتبرش تشخيص ولا تقييم معياري.'
  },
  fr: {
    syllableTitle: 'Le train des syllabes', soundTitle: 'Détective des sons',
    instruction: 'Écoute attentivement, puis choisis la bonne réponse.',
    syllableInstruction: 'Assemble les syllabes dans le bon ordre pour former le mot.',
    target: 'Mot cible', listen: 'Écouter le mot', built: 'Mot construit',
    correct: 'Bravo, très bien ! 👏', tryAgain: 'Presque ! Essaie encore.',
    next: 'Mot suivant', nextRound: 'Nouveau défi', speak: 'Écouter',
    log: 'Terminer / enregistrer la séance',
    logged: 'Les résultats ont été ajoutés au résumé de séance.',
    loggedAlone: 'Résultats enregistrés. Associez-les à une séance depuis l’écran Séances si nécessaire.',
    progress: 'Progression', attempts: 'Essais', correctCount: 'Réussites',
    note: 'Note du thérapeute (facultatif)', notePlaceholder: 'Note brève sur la performance…',
    offline: 'Activité disponible hors ligne, sans IA.',
    complete: 'Bravo ! Activité terminée 🎉',
    choose: 'Choisis l’image qui correspond au mot entendu.',
    audioFallback: 'Si le son ne fonctionne pas, prononcez le mot à voix haute.',
    level: 'Niveau',
    gameNote: 'Le résultat est descriptif et ne constitue ni un diagnostic ni un test normé.'
  },
  en: {
    syllableTitle: 'Syllable Train', soundTitle: 'Sound Detective',
    instruction: 'Listen carefully, then choose the correct answer.',
    syllableInstruction: 'Put the syllables in order to build the target word.',
    target: 'Target word', listen: 'Listen to the word',
    built: 'Your word', correct: 'Great work! 👏',
    tryAgain: 'Almost! Try again.', next: 'Next word', nextRound: 'New challenge',
    speak: 'Listen', log: 'Done / Log Session',
    logged: 'Activity results were added to the session summary.',
    loggedAlone: 'Results saved. Link them to a session from the Sessions screen if needed.',
    progress: 'Progress', attempts: 'Attempts', correctCount: 'Correct',
    note: 'Therapist note (optional)', notePlaceholder: 'Add a short performance note…',
    offline: 'Works offline without AI.', complete: 'Great work! Activity complete 🎉',
    choose: 'Choose the picture that matches the spoken word.',
    audioFallback: 'If audio is unavailable, say the word aloud for the child.',
    level: 'Level', gameNote: 'This is descriptive practice feedback, not a diagnosis or standardized assessment.'
  }
} satisfies Record<SpeechCareLocale, Record<string, string>>;

export function localeDir(locale: SpeechCareLocale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}
