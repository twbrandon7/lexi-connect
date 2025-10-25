'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { suggestVocabularyCards } from '@/ai/flows/suggest-vocabulary-cards';
import { generateAudioPronunciation } from '@/ai/flows/generate-audio-pronunciation';
import { Loader2, PlusCircle } from 'lucide-react';
import { collection, doc } from 'firebase/firestore';
import { useUser, useFirestore, addDocumentNonBlocking, useFirebase } from '@/firebase';
import type { VocabularyCard, Session } from '@/lib/types';

type SuggestedCardProps = {
  word: string;
  sessionId: string;
  sessionLanguage: string;
};

export function SuggestedCard({ word, sessionId, sessionLanguage }: SuggestedCardProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [isAdding, setIsAdding] = useState(false);
  const { auth } = useFirebase();

  const handleAddCard = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to add cards.',
      });
      return;
    }
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Database not available. Please try again later.',
      });
      return;
    }

    setIsAdding(true);
    try {
      // 0. Determine if the session is public or private to find the correct collection
      const publicSessionRef = doc(firestore, 'public_sessions', sessionId);
      const publicSessionSnap = await publicSessionRef.get();
      const isPublic = publicSessionSnap.exists();
      const collectionName = isPublic ? 'public_sessions' : 'sessions';

      // 1. Get definition
      const suggestionResult = await suggestVocabularyCards({
        query: word,
        motherLanguage: sessionLanguage,
      });

      const cardData = suggestionResult.cardSuggestions.find(c => c.word.toLowerCase() === word.toLowerCase());
      if (!cardData) {
        throw new Error(`Could not find a definition for "${word}".`);
      }

      // 2. Get audio
      const audioResult = await generateAudioPronunciation(word);
      const audioUrl = audioResult.media;

      // 3. Create card object
      const vocabularyCardsCollection = collection(firestore, `${collectionName}/${sessionId}/vocabularyCards`);
      
      const newCard: Omit<VocabularyCard, 'id'> = {
        wordOrPhrase: cardData.word,
        primaryMeaning: cardData.definition,
        audioPronunciationUrl: audioUrl,
        creatorId: user.uid,
        createdAt: Date.now(),
        sessionId: sessionId,
        partOfSpeech: '',
        pronunciationIpa: '',
        exampleSentence: '',
        translation: '',
      };

      // 4. Save to Firebase
      await addDocumentNonBlocking(vocabularyCardsCollection, newCard);

      toast({
        title: 'Card Added!',
        description: `"${cardData.word}" has been added to the session.`,
      });
    } catch (error) {
      console.error('Failed to add card:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Add Card',
        description: (error as Error).message || 'An unexpected error occurred.',
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{word}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={handleAddCard} disabled={isAdding} className="w-full">
          {isAdding ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <PlusCircle className="mr-2 h-4 w-4" />
          )}
          Add to Session
        </Button>
      </CardContent>
    </Card>
  );
}
