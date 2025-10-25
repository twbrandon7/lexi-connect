'use client';

import { use } from 'react';
import { collection, query } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { VocabularyCard } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { FlashcardPractice } from '@/components/practice/FlashcardPractice';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PracticePage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const firestore = useFirestore();

  const cardsQuery = useMemoFirebase(() => {
    if (!firestore || !sessionId) return null;
    return query(collection(firestore, `sessions/${sessionId}/vocabularyCards`));
  }, [firestore, sessionId]);

  const { data: cards, isLoading } = useCollection<VocabularyCard>(cardsQuery);

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col h-[calc(100vh-theme(spacing.14))]">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">Flashcard Practice</h1>
        <Button variant="outline" asChild>
            <Link href={`/sessions/${sessionId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Session
            </Link>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex-grow flex items-center justify-center">
            <Skeleton className="w-full max-w-lg h-72 rounded-lg" />
        </div>
      ) : cards && cards.length > 0 ? (
        <div className="flex-grow flex items-center justify-center">
          <FlashcardPractice cards={cards} />
        </div>
      ) : (
        <div className="flex-grow flex flex-col items-center justify-center text-center py-10 border-2 border-dashed rounded-lg">
          <p className="text-xl font-semibold">No cards to practice.</p>
          <p className="text-muted-foreground mt-2">Add some vocabulary to the session first.</p>
        </div>
      )}
    </div>
  );
}
