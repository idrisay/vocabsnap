export interface Vocabulary {
  word: string;
  meaning: string;
  example: string;
  memoryTip: string;
  _id?: string; // Add ID while we are at it
}

export interface QuizState {
  vocabularies: Vocabulary[];
  currentIndex: number;
  knownWords: Set<number>;
  unknownWords: Set<number>;
  isFlipped: boolean;
}
