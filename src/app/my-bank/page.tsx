'use client';

import { useEffect, useState } from 'react';
import { get, ref } from 'firebase/database';
import { db } from '@/lib/firebase';
import type { VocabularyCard as CardType } from '@/lib/types';
import { VocabularyCard } from '@/components/session/VocabularyCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type BankEntry = {
  sessionId: string;
  cardId: string;
};

export default function MyBankPage() {
  const [savedCards, setSavedCards] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavedCards = async () => {
      const bankEntries: BankEntry[] = JSON.parse(localStorage.getItem('lexiconnect_bank') || '[]');
      if (bankEntries.length === 0) {
        setLoading(false);
        return;
      }
      
      const cardPromises = bankEntries.map(entry => 
        get(ref(db, `sessions/${entry.sessionId}/vocabulary/${entry.cardId}`))
      );

      const cardSnapshots = await Promise.all(cardPromises);
      
      const cards: CardType[] = cardSnapshots
        .map((snapshot, index) => {
          if (snapshot.exists()) {
            return { id: snapshot.key, ...snapshot.val() };
          }
          return null;
        })
        .filter((card): card is CardType => card !== null);
      
      setSavedCards(cards);
      setLoading(false);
    };

    fetchSavedCards();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8">My Vocabulary Bank</h1>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-lg" />
          ))}
        </div>
      ) : savedCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedCards.map((card) => (
            <VocabularyCard key={card.id} card={card} />
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
