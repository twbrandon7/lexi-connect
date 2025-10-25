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
  createdAt: number;
  participantCount?: number;
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
  createdAt: number;
  sessionId: string;
}
