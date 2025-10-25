'use client';

import { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { VocabularyCard } from '@/lib/types';
import { VocabularyCard as VocabularyCardComponent } from './VocabularyCard';
import { Skeleton } from '@/components/ui/skeleton';

type VocabularyListProps = {
  sessionId: string;
};

export function VocabularyList({ sessionId }: VocabularyListProps) {
  const firestore = useFirestore();

  const cardsQuery = useMemoFirebase(() => {
    if (!firestore || !sessionId) return null;
    const cardsCollection = collection(firestore, `sessions/${sessionId}/vocabulary`);
    return query(cardsCollection, orderBy('createdAt', 'desc'));
  }, [firestore, sessionId]);

  const { data: cards, isLoading } = useCollection<VocabularyCard>(cardsQuery);

  return (
    <section className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold font-headline">
        Session Vocabulary
      </h2>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      ) : cards && cards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <VocabularyCardComponent key={card.id} card={card} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">This session is empty.</p>
          <p className="text-sm text-muted-foreground">Use the AI assistant to add the first vocabulary card!</p>
        </div>
      )}
    </section>
  );
}
