'use client';

import { useMemo } from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Session } from '@/lib/types';
import { SessionItem } from './SessionItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export function PublicSessions() {
  const firestore = useFirestore();

  const sessionsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Query the single sessions collection for documents where visibility is 'public'.
    return query(
        collection(firestore, 'sessions'), 
        where('visibility', '==', 'public'),
        orderBy('createdAt', 'desc')
    );
  }, [firestore]);

  // The useCollection hook has built-in contextual error handling.
  // If a permission error occurs here, it will be emitted globally
  // and caught by the FirebaseErrorListener, showing a detailed overlay.
  const { data: sessions, isLoading, error } = useCollection<Session>(sessionsQuery);
  
  if (isLoading) {
    return (
        <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold font-headline">
                Join a Public Session
            </h2>
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
      </section>
    );
  }

  // If a non-permission error occurs, we can display it directly.
  // Permission errors are thrown by the listener and handled by Next.js error boundaries.
  if (error) {
     return (
        <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold font-headline">
                Join a Public Session
            </h2>
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Loading Sessions</AlertTitle>
                <AlertDescription>Could not load public sessions. Please try again later.</AlertDescription>
            </Alert>
        </section>
     )
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold font-headline">
        Join a Public Session
      </h2>
      
      {sessions && sessions.length > 0 ? (
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
