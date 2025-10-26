'use client';

import { use, useEffect, useState, useMemo } from 'react';
import { collection, query, getDocs, doc, where } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import type { VocabularyCard, PersonalVocabulary } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { FlashcardPractice } from '@/components/practice/FlashcardPractice';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useDoc } from '@/firebase/firestore/use-doc';

async function getVocabularyCardsForPersonalVocab(
  firestore: any,
  personalVocabEntries: PersonalVocabulary[]
): Promise<VocabularyCard[]> {
  const cardPromises = personalVocabEntries.map(entry =>
    getDocs(
      query(
        collection(firestore, `sessions/${entry.sessionId}/vocabularyCards`),
        where('id', '==', entry.vocabularyCardId)
      )
    )
  );

  const cardSnapshots = await Promise.all(cardPromises);
  const vocabularyCards = cardSnapshots
    .flatMap(snapshot => snapshot.docs)
    .map(doc => ({ id: doc.id, ...doc.data() } as VocabularyCard));

  return vocabularyCards;
}

export default function PracticePage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const firestore = useFirestore();
  const { user } = useUser();
  const [bankCards, setBankCards] = useState<VocabularyCard[]>([]);
  const [isLoadingBankCards, setIsLoadingBankCards] = useState(false);

  const isPracticeMyBank = sessionId === 'my-bank';

  // Fetch cards from a specific session
  const sessionCardsQuery = useMemoFirebase(() => {
    if (!firestore || isPracticeMyBank) return null;
    return query(collection(firestore, `sessions/${sessionId}/vocabularyCards`));
  }, [firestore, sessionId, isPracticeMyBank]);

  const { data: sessionCards, isLoading: isLoadingSessionCards } =
    useCollection<VocabularyCard>(sessionCardsQuery);
    
  const sessionInfoRef = useMemoFirebase(() => {
    if (!firestore || isPracticeMyBank) return null;
    return doc(firestore, `sessions/${sessionId}`);
  },[firestore, sessionId, isPracticeMyBank]);
  const { data: sessionInfo } = useDoc(sessionInfoRef);

  // Fetch cards from the user's personal bank
  const personalVocabQuery = useMemoFirebase(() => {
    if (!firestore || !user || !isPracticeMyBank) return null;
    return query(collection(firestore, `users/${user.uid}/personalVocabulary`));
  }, [firestore, user, isPracticeMyBank]);

  const { data: personalVocabEntries, isLoading: isLoadingPersonalVocab } =
    useCollection<PersonalVocabulary>(personalVocabQuery);

  useEffect(() => {
    if (isPracticeMyBank && personalVocabEntries && firestore) {
      setIsLoadingBankCards(true);
      const cardIds = personalVocabEntries.map(entry => entry.vocabularyCardId);
      if (cardIds.length === 0) {
        setBankCards([]);
        setIsLoadingBankCards(false);
        return;
      }
      
      const fetchCards = async () => {
         const cards = await getVocabularyCardsForPersonalVocab(firestore, personalVocabEntries);
         setBankCards(cards);
         setIsLoadingBankCards(false);
      }
      fetchCards();

    }
  }, [isPracticeMyBank, personalVocabEntries, firestore]);

  const cards = isPracticeMyBank ? bankCards : sessionCards;
  const isLoading = isPracticeMyBank
    ? isLoadingPersonalVocab || isLoadingBankCards
    : isLoadingSessionCards;

  const pageTitle = isPracticeMyBank
    ? 'Practice My Bank'
    : `Practice: ${sessionInfo?.name || 'Session'}`;
  const backLink = isPracticeMyBank ? '/my-bank' : `/sessions/${sessionId}`;

  return (
    <div className="container mx-auto flex h-[calc(100vh-theme(spacing.14))] flex-col px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="truncate text-3xl font-bold font-headline md:text-4xl">
          {pageTitle}
        </h1>
        <Button variant="outline" asChild>
          <Link href={backLink}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-grow items-center justify-center">
          <Skeleton className="h-72 w-full max-w-lg rounded-lg" />
        </div>
      ) : cards && cards.length > 0 ? (
        <div className="flex flex-grow items-center justify-center">
          <FlashcardPractice cards={cards} />
        </div>
      ) : (
        <div className="flex flex-grow flex-col items-center justify-center rounded-lg border-2 border-dashed py-10 text-center">
          <p className="text-xl font-semibold">No cards to practice.</p>
          <p className="mt-2 text-muted-foreground">
            {isPracticeMyBank
              ? 'Save some cards to your bank first.'
              : 'Add some vocabulary to the session first.'}
          </p>
        </div>
      )}
    </div>
  );
}
