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
  word: string;
  definition: string;
  partOfSpeech?: string;
  pronunciation?: string; // IPA
  audioUrl?: string; // base64 data URI
  exampleSentence?: string;
  translation?: string;
  creator: User;
  createdAt: number;
  sessionId: string;
}
