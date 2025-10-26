'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createVocabularyCard } from '@/ai/flows/create-vocabulary-card';
import { generateAudioPronunciation } from '@/ai/flows/generate-audio-pronunciation';
import { Loader2, PlusCircle, Pencil } from 'lucide-react';
import { collection, doc } from 'firebase/firestore';
import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import type { VocabularyCard } from '@/lib/types';
import type { AIPoweredVocabularyDiscoveryOutput } from '@/ai/flows/ai-powered-vocabulary-discovery';
import { Badge } from '../ui/badge';
import { EditSuggestedCardDialog } from './EditSuggestedCardDialog';

type SuggestedCardProps = {
  suggestion: AIPoweredVocabularyDiscoveryOutput['suggestedVocabularyCards'][0];
  sessionId: string;
  sessionLanguage: string;
};

export function SuggestedCard({ suggestion, sessionId, sessionLanguage }: SuggestedCardProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [isAdding, setIsAdding] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { wordOrPhrase, partOfSpeech, translation, exampleSentence } = suggestion;

  const handleAddCard = async () => {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in and connected to add cards.',
      });
      return;
    }

    setIsAdding(true);
    try {
      const vocabularyCardsCollection = collection(firestore, `sessions/${sessionId}/vocabularyCards`);
      const newCardRef = doc(vocabularyCardsCollection);

      const [details, audio] = await Promise.all([
         createVocabularyCard({
            wordOrPhrase: wordOrPhrase,
            motherLanguage: sessionLanguage,
        }),
        generateAudioPronunciation(wordOrPhrase)
      ]);
      
      const newCard: VocabularyCard = {
        id: newCardRef.id,
        wordOrPhrase: wordOrPhrase,
        primaryMeaning: details.primaryMeaning,
        partOfSpeech: partOfSpeech,
        pronunciationIpa: details.pronunciationIpa,
        exampleSentence: exampleSentence,
        translation: translation,
        exampleSentenceTranslation: details.exampleSentenceTranslation,
        audioPronunciationUrl: audio.media,
        creatorId: user.uid,
        createdAt: Date.now(),
        sessionId: sessionId,
      };

      setDocumentNonBlocking(newCardRef, newCard, {});

      toast({
        title: 'Card Added!',
        description: `"${wordOrPhrase}" has been added to the session.`,
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
    <>
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">{wordOrPhrase}</CardTitle>
        <CardDescription>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{partOfSpeech}</Badge>
            <span>{translation}</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow justify-end flex flex-col">
        <div className="flex gap-2 mt-auto">
          <Button onClick={handleAddCard} disabled={isAdding} className="w-full">
            {isAdding && !isEditOpen ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle className="mr-2 h-4 w-4" />
            )}
            Add to Session
          </Button>
          <Button variant="outline" size="icon" onClick={() => setIsEditOpen(true)} disabled={isAdding}>
            <Pencil />
            <span className="sr-only">Edit card before adding</span>
          </Button>
        </div>
      </CardContent>
    </Card>
    <EditSuggestedCardDialog 
      isOpen={isEditOpen}
      setIsOpen={setIsEditOpen}
      suggestion={suggestion}
      sessionId={sessionId}
      sessionLanguage={sessionLanguage}
    />
    </>
  );
}
