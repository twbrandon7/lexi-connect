'use client';

import { useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, Bookmark } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { VocabularyCard } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

type VocabularyCardProps = {
  card: VocabularyCard;
};

export function VocabularyCard({ card }: VocabularyCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }
  };
  
  const addToBank = () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save cards.' });
      return;
    }

    try {
      // We'll use local storage for the bank for simplicity in this version.
      // A more robust solution would use Firestore.
      const bank = JSON.parse(localStorage.getItem('lexiconnect_bank') || '[]');
      const isAlreadySaved = bank.some((entry: { cardId: string }) => entry.cardId === card.id);

      if (!isAlreadySaved) {
        bank.push({sessionId: card.sessionId, cardId: card.id});
        localStorage.setItem('lexiconnect_bank', JSON.stringify(bank));
        toast({ title: "Saved!", description: `"${card.wordOrPhrase}" was added to your personal bank.` });
      } else {
        toast({ title: "Already saved", description: `"${card.wordOrPhrase}" is already in your bank.` });
      }

      // Example of how you would save to a user's personal collection in Firestore
      // const personalVocabRef = doc(firestore, `users/${user.uid}/personalVocabulary/${card.id}`);
      // setDocumentNonBlocking(personalVocabRef, {
      //   ...card,
      //   savedAt: Date.now(),
      // }, { merge: true });

    } catch (error) {
        console.error("Failed to update vocabulary bank:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not save card to your bank." });
    }
  };

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
            <CardTitle>{card.wordOrPhrase}</CardTitle>
            {card.audioPronunciationUrl && (
                <>
                    <Button variant="ghost" size="icon" onClick={playAudio}>
                        <Volume2 />
                        <span className="sr-only">Play pronunciation</span>
                    </Button>
                    <audio ref={audioRef} src={card.audioPronunciationUrl} className="hidden" />
                </>
            )}
        </div>
        <CardDescription>{card.primaryMeaning}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {card.exampleSentence && (
            <blockquote className="mt-2 border-l-2 pl-4 italic text-muted-foreground">
                "{card.exampleSentence}"
            </blockquote>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
                <AvatarImage src={`https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${card.creatorId}`} />
                <AvatarFallback>{card.creatorId.substring(0, 1)}</AvatarFallback>
            </Avatar>
            <div className='flex flex-col'>
              <span className='font-medium'>{card.creatorId.substring(0, 6)}</span>
              <span className='text-xs'>{formatDistanceToNow(new Date(card.createdAt), { addSuffix: true })}</span>
            </div>
        </div>
        <Button variant="outline" size="sm" onClick={addToBank}>
          <Bookmark className="mr-2 h-4 w-4" />
          Save
        </Button>
      </CardFooter>
    </Card>
  );
}
