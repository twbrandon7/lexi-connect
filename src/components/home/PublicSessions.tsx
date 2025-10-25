'use client';

import { query, orderBy, limit } from 'firebase/firestore';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Session } from '@/lib/types';
import { SessionItem } from './SessionItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function PublicSessions() {
  const firestore = useFirestore();

  const sessionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Query the public_sessions collection instead
    const sessionsCollection = collection(firestore, 'public_sessions');
    return query(
      sessionsCollection,
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }, [firestore]);
  
  const { data: sessions, isLoading } = useCollection<Session>(sessionsQuery);

  return (
    <section className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold font-headline">
        Join a Public Session
      </h2>
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sessions && sessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <SessionItem key={session.id} session={session} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">No public sessions available right now.</p>
          <p className="text-sm text-muted-foreground">Why not create one?</p>
        </div>
      )}
    </section>
  );
}
