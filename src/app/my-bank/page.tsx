'use client';

import { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import type { PersonalVocabulary, VocabularyCard } from '@/lib/types';
import { PersonalVocabularyCard } from '@/components/bank/PersonalVocabularyCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MyBankPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const personalVocabQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    const personalVocabCollection = collection(firestore, `users/${user.uid}/personalVocabulary`);
    return query(personalVocabCollection, orderBy('savedAt', 'desc'));
  }, [firestore, user]);

  const { data: personalVocabEntries, isLoading: isLoadingEntries } = useCollection<PersonalVocabulary>(personalVocabQuery);

  const showLoading = isUserLoading || isLoadingEntries;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">My Vocabulary Bank</h1>
         {personalVocabEntries && personalVocabEntries.length > 0 && (
            <Button asChild>
              <Link href={`/practice/my-bank`}>Practice My Bank</Link>
            </Button>
          )}
      </div>
      
      {showLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-lg" />
          ))}
        </div>
      ) : personalVocabEntries && personalVocabEntries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {personalVocabEntries.map((entry) => (
            <PersonalVocabularyCard key={entry.id} personalVocab={entry} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">Your bank is empty.</h3>
          <p className="text-muted-foreground mt-2">Join a session and save cards to get started.</p>
          <Button asChild className="mt-4">
            <Link href="/">Find a Session</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
