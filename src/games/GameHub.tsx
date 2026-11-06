import React from 'react';
import { SyllableTrain } from './SyllableTrain';
import { SoundDetective } from './SoundDetective';
import type { GameProps, SpeechCareGameId } from './types';

export function GameHub({ gameId, ...props }: GameProps & { gameId: SpeechCareGameId }) {
  return gameId === 'syllable-train' ? <SyllableTrain {...props} /> : <SoundDetective {...props} />;
}
