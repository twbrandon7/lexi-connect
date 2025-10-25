'use client';

import { doc, query, where, documentId, collection } from 'firebase/firestore';
import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import type { Session } from '@/lib/types';
import { PublicSessionsList } from './PublicSessionsList';
import { Skeleton } from '@/components/ui/skeleton';

export function PublicSessions() {
  const firestore = useFirestore();

  // 1. Fetch the public session index document
  const publicIndexRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'public/sessions') : null),
    [firestore]
  );
  const { data: publicIndex, isLoading: isLoadingIndex } = useDoc<{ sessionIds: string[] }>(publicIndexRef);

  const publicSessionIds = publicIndex?.sessionIds;

  // 2. Fetch the actual session documents based on the IDs from the index
  const sessionsQuery = useMemoFirebase(() => {
    if (!firestore || !publicSessionIds || publicSessionIds.length === 0) {
      return null;
    }
    const sessionsCollection = collection(firestore, 'sessions');
    // Firestore 'in' queries are limited to 30 elements.
    // For this app, we'll assume we won't exceed that.
    // For a production app with more items, pagination or multiple queries would be needed.
    return query(sessionsCollection, where(documentId(), 'in', publicSessionIds.slice(0, 30)));
  }, [firestore, publicSessionIds]);

  const { data: sessions, isLoading: isLoadingSessions } = useCollection<Session>(sessionsQuery);

  const isLoading = isLoadingIndex || (publicSessionIds && publicSessionIds.length > 0 && isLoadingSessions);
  
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-headline">
          Join a Public Session
        </h2>
        <p className="text-muted-foreground mt-2">
          Explore sessions created by other users and learn together.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-60 w-full rounded-lg" />
          ))}
        </div>
      ) : sessions && sessions.length > 0 ? (
        <PublicSessionsList sessions={sessions} />
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">No Public Sessions Found</h3>
          <p className="text-muted-foreground mt-2">
            Why not be the first to create one?
          </p>
        </div>
      )}
    </div>
  );
}
