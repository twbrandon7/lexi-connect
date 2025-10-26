'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createVocabularyCard } from '@/ai/flows/create-vocabulary-card';
import { generateAudioPronunciation } from '@/ai/flows/generate-audio-pronunciation';
import { Loader2, PlusCircle } from 'lucide-react';
import { collection } from 'firebase/firestore';
import { useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import type { VocabularyCard } from '@/lib/types';

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
      // 1. Get all card details from AI
      const [cardDetailsResult, audioResult] = await Promise.all([
        createVocabularyCard({
          wordOrPhrase: word,
          motherLanguage: sessionLanguage,
        }),
        generateAudioPronunciation(word)
      ]);

      if (!cardDetailsResult) {
        throw new Error(`Could not generate card details for "${word}".`);
      }

      // 2. Create card object
      const vocabularyCardsCollection = collection(firestore, `sessions/${sessionId}/vocabularyCards`);
      
      const newCard: Omit<VocabularyCard, 'id'> = {
        ...cardDetailsResult,
        audioPronunciationUrl: audioResult.media,
        creatorId: user.uid,
        createdAt: Date.now(),
        sessionId: sessionId,
      };

      // 3. Save to Firebase
      await addDocumentNonBlocking(vocabularyCardsCollection, newCard);

      toast({
        title: 'Card Added!',
        description: `"${newCard.wordOrPhrase}" has been added to the session.`,
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
