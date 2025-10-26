export interface User {
  id: string;
  name: string;
}

export interface Session {
  id: string;
  name:string;
  motherLanguage: string;
  visibility: 'public' | 'private';
  hostId: string;
  hostName: string;
  createdAt: number;
  participantCount?: number;
  state?: 'open' | 'closed' | 'reopened';
}

export interface VocabularyCard {
  id: string;
  wordOrPhrase: string;
  primaryMeaning: string;
  partOfSpeech: string;
  pronunciationIpa: string;
  audioPronunciationUrl?: string;
  exampleSentence: string;
  translation: string;
  creatorId: string;
  creatorName: string;
  creatorPhotoURL?: string;
  createdAt: number;
  sessionId: string;
  exampleSentenceTranslation?: string;
}

export interface PersonalVocabulary {
  id: string;
  userId: string;
  vocabularyCardId: string;
  sessionId: string;
  mastered: boolean;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  savedAt: number;
}

export type AIPoweredVocabularyDiscoveryOutput = {
  answer: string;
  suggestedVocabularyCards: {
    wordOrPhrase: string;
    partOfSpeech: string;
    translation: string;
    exampleSentence: string;
  }[];
};
