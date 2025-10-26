'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import type { VocabularyCard } from '@/lib/types';

type VocabularyCardDetailsDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  card: VocabularyCard;
};

export function VocabularyCardDetailsDialog({ isOpen, setIsOpen, card }: VocabularyCardDetailsDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">{card.wordOrPhrase}</DialogTitle>
          <DialogDescription className="flex items-center gap-4 pt-1">
             {card.pronunciationIpa && <span className='text-base'>/{card.pronunciationIpa}/</span>}
             {card.partOfSpeech && <Badge variant="secondary">{card.partOfSpeech}</Badge>}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <h4 className="font-semibold text-primary">Translation</h4>
            <p className="text-lg">{card.translation}</p>
          </div>
           <div>
            <h4 className="font-semibold text-primary">Primary Meaning</h4>
            <p>{card.primaryMeaning}</p>
          </div>
          {card.exampleSentence && (
            <div>
                <h4 className="font-semibold text-primary">Example</h4>
                <blockquote className="mt-1 border-l-2 pl-4 italic">
                    <p>"{card.exampleSentence}"</p>
                    {card.exampleSentenceTranslation && <p className="mt-2 text-sm text-muted-foreground">"{card.exampleSentenceTranslation}"</p>}
                </blockquote>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
