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
import { VocabularyCardDetailsDialog } from '../session/VocabularyCardDetailsDialog';

type PersonalVocabularyCardProps = {
  personalVocab: PersonalVocabulary;
};

export function PersonalVocabularyCard({ personalVocab }: PersonalVocabularyCardProps) {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const cardRef = useMemo(() => {
    if (!firestore || !personalVocab.vocabularyCardId || !personalVocab.sessionId) return null;
    return doc(firestore, `sessions/${personalVocab.sessionId}/vocabularyCards/${personalVocab.vocabularyCardId}`);
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

  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
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
          <CardDescription>
            <div className='flex flex-col'>
              <span>The original vocabulary card may have been deleted.</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardFooter>
            <Button variant="destructive" size="sm" onClick={handleDelete}><Trash2 className="mr-2"/> Remove</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <>
      <div onClick={() => setIsDetailsOpen(true)} className="cursor-pointer h-full">
        <Card className={cn("flex flex-col h-full", personalVocab.mastered && "bg-secondary")}>
          {card.audioPronunciationUrl && (
            <audio ref={audioRef} src={card.audioPronunciationUrl} className="hidden" />
          )}
          <CardHeader>
            <div className="flex justify-between items-start gap-4">
                <CardTitle className="flex items-baseline gap-3">
                  <span>{card.wordOrPhrase}</span>
                  {card.translation && <span className="text-xl text-primary font-medium">{card.translation}</span>}
                </CardTitle>
                <div className='flex items-center'>
                  {card.audioPronunciationUrl && (
                      <Button variant="ghost" size="icon" onClick={playAudio}>
                          <Volume2 />
                          <span className="sr-only">Play pronunciation</span>
                      </Button>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}><MoreVertical /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
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
             <CardDescription>
                <div className="flex items-center gap-2 text-muted-foreground pt-1">
                {card.pronunciationIpa && <span>/{card.pronunciationIpa}/</span>}
                {card.partOfSpeech && <Badge variant="secondary">{card.partOfSpeech}</Badge>}
                </div>
             </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {card.exampleSentence && (
                <blockquote className="mt-2 border-l-2 pl-4 italic text-muted-foreground">
                    <p>"{card.exampleSentence}"</p>
                    {card.exampleSentenceTranslation && <p className="mt-2 text-sm">"{card.exampleSentenceTranslation}"</p>}
                </blockquote>
            )}
          </CardContent>
          <CardFooter>
              {personalVocab.difficultyLevel && <Badge variant="outline">{personalVocab.difficultyLevel}</Badge>}
          </CardFooter>
        </Card>
      </div>
      <VocabularyCardDetailsDialog
        isOpen={isDetailsOpen}
        setIsOpen={setIsDetailsOpen}
        card={card}
      />
    </>
  );
}
