'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Flashcard } from './Flashcard';
import type { VocabularyCard } from '@/lib/types';
import { Button } from '../ui/button';
import { Check, X } from 'lucide-react';

type FlashcardPracticeProps = {
  cards: VocabularyCard[];
};

export function FlashcardPractice({ cards }: FlashcardPracticeProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [knownCount, setKnownCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);

  const handleSelect = (action: 'know' | 'review') => {
    if (!api) return;

    if (action === 'know') {
      setKnownCount(c => c + 1);
    } else {
      setReviewCount(c => c + 1);
    }

    if (api.canScrollNext()) {
      api.scrollNext();
    } else {
      // End of practice session logic could go here
    }
  };

  return (
    <div className='w-full max-w-lg space-y-4'>
       <Carousel setApi={setApi} className="w-full">
        <CarouselContent>
          {cards.map((card, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Flashcard card={card} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      <div className='flex justify-center gap-4'>
            <Button variant="destructive" size="lg" className="rounded-full h-16 w-16" onClick={() => handleSelect('review')}>
                <X className='h-8 w-8'/>
                <span className="sr-only">Need Review</span>
            </Button>
            <Button variant="default" className="bg-green-600 hover:bg-green-700 rounded-full h-16 w-16" size="lg" onClick={() => handleSelect('know')}>
                <Check className='h-8 w-8' />
                <span className="sr-only">I know it</span>
            </Button>
      </div>

       <div className='text-center text-sm text-muted-foreground'>
        <p>Known: {knownCount} | Needs Review: {reviewCount}</p>
       </div>
    </div>
  );
}
