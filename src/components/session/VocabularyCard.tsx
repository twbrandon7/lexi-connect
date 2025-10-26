'use client';

import { useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Volume2, Bookmark, Edit, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { PersonalVocabulary, VocabularyCard as CardType } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { EditVocabularyCardDialog } from './EditVocabularyCardDialog';
import { Badge } from '../ui/badge';
import { VocabularyCardDetailsDialog } from './VocabularyCardDetailsDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


type VocabularyCardProps = {
  card: CardType;
  sessionState?: 'open' | 'closed' | 'reopened';
};

export function VocabularyCard({ card, sessionState = 'open' }: VocabularyCardProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const isCreator = user?.uid === card.creatorId;


  const playAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
    }
  };
  
  const addToBank = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !firestore) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save cards.' });
      return;
    }

    try {
      const personalVocabRef = doc(firestore, `users/${user.uid}/personalVocabulary`, card.id);
      
      const newPersonalVocab: PersonalVocabulary = {
        id: card.id,
        userId: user.uid,
        vocabularyCardId: card.id,
        mastered: false,
        savedAt: Date.now()
      };

      setDocumentNonBlocking(personalVocabRef, newPersonalVocab, { merge: true });

      toast({ title: "Saved!", description: `"${card.wordOrPhrase}" was added to your personal bank.` });

    } catch (error) {
        console.error("Failed to update vocabulary bank:", error);
        toast({ variant: 'destructive', title: "Error", description: "Could not save card to your bank." });
    }
  };

  const openEditDialog = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditOpen(true);
  }

  const handleDeleteCard = () => {
    if (!firestore || !isCreator) return;
    const cardRef = doc(firestore, `sessions/${card.sessionId}/vocabularyCards`, card.id);
    deleteDocumentNonBlocking(cardRef);
    toast({ title: 'Card Deleted', description: 'The vocabulary card has been removed.' });
  }

  return (
    <>
      <div onClick={() => setIsDetailsOpen(true)} className="cursor-pointer">
        <Card className="flex flex-col h-full">
          <CardHeader>
            <div className="flex justify-between items-start gap-4">
                <CardTitle className="flex items-baseline gap-3">
                  <span>{card.wordOrPhrase}</span>
                  {card.translation && <span className="text-xl text-primary font-medium">{card.translation}</span>}
                </CardTitle>
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
            <div className="flex items-center gap-2 text-muted-foreground pt-1">
              {card.pronunciationIpa && <span>/{card.pronunciationIpa}/</span>}
              {card.partOfSpeech && <Badge variant="secondary">{card.partOfSpeech}</Badge>}
            </div>
          </CardHeader>
          
           <CardContent className="flex-grow">
            {card.exampleSentence && (
              <blockquote className="mt-2 border-l-2 pl-4 italic text-muted-foreground">
                <p>"{card.exampleSentence}"</p>
                  {card.exampleSentenceTranslation && <p className="mt-2 text-sm">"{card.exampleSentenceTranslation}"</p>}
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
            <div className="flex gap-2">
              {isCreator && sessionState === 'open' && (
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" onClick={(e) => e.stopPropagation()}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this card from the session. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteCard}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              {sessionState === 'open' && (
                <Button variant="outline" size="sm" onClick={openEditDialog}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={addToBank}>
                <Bookmark className="mr-2 h-4 w-4" />
                Save
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Dialogs */}
      <EditVocabularyCardDialog 
        isOpen={isEditOpen} 
        setIsOpen={setIsEditOpen}
        card={card}
      />
       <VocabularyCardDetailsDialog
        isOpen={isDetailsOpen}
        setIsOpen={setIsDetailsOpen}
        card={card}
      />
    </>
  );
}
