export interface Vocabulary {
  word: string;
  meaning: string;
  germanExample: string;
  memoryTip: string;
}

export interface QuizState {
  vocabularies: Vocabulary[];
  currentIndex: number;
  knownWords: Set<number>;
  unknownWords: Set<number>;
  isFlipped: boolean;
}
