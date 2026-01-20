export enum ActivityType {
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  WORD_ADDED = 'word_added',
  WORD_DELETED = 'word_deleted',
  WORDS_IMPORTED = 'words_imported',
  DECK_CREATED = 'deck_created',
  DECK_DELETED = 'deck_deleted',
  QUIZ_STARTED = 'quiz_started',
  QUIZ_COMPLETED = 'quiz_completed',
  WORD_CORRECT = 'word_correct',
  WORD_INCORRECT = 'word_incorrect',
}

export interface Activity {
  _id?: string;
  userId: string;
  type: ActivityType;
  metadata?: any;
  createdAt: Date;
}

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

