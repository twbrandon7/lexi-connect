'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { VocabularyCard } from '@/lib/types';
import { cn } from '@/lib/utils';
import './flashcard.css';

type FlashcardProps = {
  card: VocabularyCard;
};

export function Flashcard({ card }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flashcard-container" onClick={() => setIsFlipped(!isFlipped)}>
      <div className={cn('flashcard', { flipped: isFlipped })}>
        {/* Front of the card */}
        <div className="flashcard-front">
          <Card className="h-72 w-full flex items-center justify-center">
            <CardContent className="p-6 text-center">
              <h2 className="text-4xl font-bold">{card.word}</h2>
            </CardContent>
          </Card>
        </div>
        {/* Back of the card */}
        <div className="flashcard-back">
          <Card className="h-72 w-full">
             <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center">
              <p className="text-xl font-semibold mb-4">{card.definition}</p>
              {card.exampleSentence && (
                <blockquote className="text-muted-foreground italic">
                  "{card.exampleSentence}"
                </blockquote>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
