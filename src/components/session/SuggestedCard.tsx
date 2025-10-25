'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { suggestVocabularyCards } from '@/ai/flows/suggest-vocabulary-cards';
import { generateAudioPronunciation } from '@/ai/flows/generate-audio-pronunciation';
import { Loader2, PlusCircle } from 'lucide-react';
import { ref, push, set } from 'firebase/database';
import { db } from '@/lib/firebase';
import { useUser } from '@/hooks/useUser';
import type { VocabularyCard } from '@/lib/types';

type SuggestedCardProps = {
  word: string;
  sessionId: string;
  sessionLanguage: string;
};

export function SuggestedCard({ word, sessionId, sessionLanguage }: SuggestedCardProps) {
  const { toast } = useToast();
  const { user } = useUser();
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

    setIsAdding(true);
    try {
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
      const vocabularyCardsRef = ref(db, `sessions/${sessionId}/vocabulary`);
      const newCardRef = push(vocabularyCardsRef);
      const cardId = newCardRef.key;

      if (!cardId) {
        throw new Error('Could not create card ID.');
      }
      
      const newCard: Omit<VocabularyCard, 'id'> = {
        word: cardData.word,
        definition: cardData.definition,
        audioUrl,
        creator: user,
        createdAt: Date.now(),
        sessionId: sessionId,
      };

      // 4. Save to Firebase
      await set(newCardRef, newCard);

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
