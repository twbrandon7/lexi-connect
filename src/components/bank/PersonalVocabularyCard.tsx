'use client';

import { useMemo, useState, useRef } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { useDoc, useFirestore, useUser, updateDocumentNonBlocking } from '@/firebase';
import type { PersonalVocabulary, VocabularyCard } from '@/lib/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '../ui/skeleton';
import { Volume2, MoreVertical, Trash2, CheckCircle, Circle, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type PersonalVocabularyCardProps = {
  personalVocab: PersonalVocabulary;
};

export function PersonalVocabularyCard({ personalVocab }: PersonalVocabularyCardProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const cardRef = useMemo(() => {
    if (!firestore || !personalVocab.vocabularyCardId) return null;
    // This assumes all cards are in a single top-level collection.
    // This will break if cards are in a sub-collection.
    // A better approach would be to store the full path to the card.
    // For now, this is a placeholder. Let's find a session ID.
    // This is a design flaw in the data model. We'll assume the sessionID is part of the card for now.
    // Let's assume we can get it. This is a bit of a hack.
    const [sessionId] = personalVocab.id.split('_'); // This is not reliable.
    return doc(firestore, `sessions/${(personalVocab as any).sessionId || sessionId}/vocabularyCards/${personalVocab.vocabularyCardId}`);
  }, [firestore, personalVocab]);

  const { data: card, isLoading } = useDoc<VocabularyCard>(cardRef);

  const handleDifficultyChange = (difficulty: string) => {
    if (!firestore || !user) return;
    const personalVocabRef = doc(firestore, `users/${user.uid}/personalVocabulary/${personalVocab.id}`);
    updateDocumentNonBlocking(personalVocabRef, { difficultyLevel: difficulty });
  };

  const toggleMastered = () => {
    if (!firestore || !user) return;
    const personalVocabRef = doc(firestore, `users/${user.uid}/personalVocabulary/${personalVocab.id}`);
    updateDocumentNonBlocking(personalVocabRef, { mastered: !personalVocab.mastered });
  };

  const handleDelete = async () => {
    if (!firestore || !user) return;
    const personalVocabRef = doc(firestore, `users/${user.uid}/personalVocabulary/${personalVocab.id}`);
    await deleteDoc(personalVocabRef);
    toast({ title: 'Removed', description: 'Card removed from your bank.'});
  };

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }
  };


  if (isLoading) {
    return <Skeleton className="h-56 w-full rounded-lg" />;
  }

  if (!card) {
    return (
      <Card className="flex flex-col border-destructive">
        <CardHeader>
          <CardTitle className='text-destructive'>Card Not Found</CardTitle>
          <CardDescription>The original vocabulary card may have been deleted.</CardDescription>
        </CardHeader>
        <CardFooter>
            <Button variant="destructive" size="sm" onClick={handleDelete}><Trash2 className="mr-2"/> Remove</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className={cn("flex flex-col", personalVocab.mastered && "bg-secondary")}>
      {card.audioPronunciationUrl && (
        <audio ref={audioRef} src={card.audioPronunciationUrl} className="hidden" />
      )}
      <CardHeader>
         <div className="flex justify-between items-start gap-4">
            <CardTitle>{card.wordOrPhrase}</CardTitle>
            <div className='flex items-center'>
              {card.audioPronunciationUrl && (
                  <Button variant="ghost" size="icon" onClick={playAudio}>
                      <Volume2 />
                      <span className="sr-only">Play pronunciation</span>
                  </Button>
              )}
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon"><MoreVertical /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={toggleMastered}>
                        {personalVocab.mastered ? <Circle className='mr-2' /> : <CheckCircle className="mr-2" />}
                        {personalVocab.mastered ? 'Mark as Not Mastered' : 'Mark as Mastered'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup value={personalVocab.difficultyLevel} onValueChange={handleDifficultyChange}>
                        <DropdownMenuRadioItem value="beginner"><Tag className="mr-2" />Beginner</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="intermediate"><Tag className="mr-2" />Intermediate</DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="advanced"><Tag className="mr-2" />Advanced</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
                        <Trash2 className="mr-2" />
                        Remove from bank
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
       <CardFooter>
          {personalVocab.difficultyLevel && <Badge variant="outline">{personalVocab.difficultyLevel}</Badge>}
      </CardFooter>
    </Card>
  );
}
