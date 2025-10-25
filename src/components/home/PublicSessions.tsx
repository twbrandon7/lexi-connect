'use client';

import { useEffect, useState, useMemo } from 'react';
import { doc, getDoc, collection, query, where, DocumentData } from 'firebase/firestore';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import type { Session } from '@/lib/types';
import { SessionItem } from './SessionItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

function PublicSessionsList({ sessionIds }: { sessionIds: string[] }) {
  const firestore = useFirestore();

  const sessionsQuery = useMemoFirebase(() => {
    if (!firestore || sessionIds.length === 0) return null;
    const sessionsRef = collection(firestore, 'public_sessions');
    // Firestore 'in' query is limited to 30 items.
    return query(sessionsRef, where('id', 'in', sessionIds.slice(0, 30)));
  }, [firestore, sessionIds]);

  const { data: sessions, isLoading, error } = useCollection<Session>(sessionsQuery);

  if (isLoading) {
    return (
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
    );
  }

  if (error) {
    // This will be a contextual error now
    // The FirebaseErrorListener will catch and display it
    return null;
  }
  
  if (sessions && sessions.length > 0) {
    const sortedSessions = [...sessions].sort((a, b) => b.createdAt - a.createdAt);
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedSessions.map((session) => (
          <SessionItem key={session.id} session={session} />
        ))}
      </div>
    );
  }

  return (
    <div className="text-center py-10 border-2 border-dashed rounded-lg">
      <p className="text-muted-foreground">No public sessions available right now.</p>
      <p className="text-sm text-muted-foreground">Why not create one?</p>
    </div>
  );
}


export function PublicSessions() {
  const firestore = useFirestore();
  const [sessionIds, setSessionIds] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firestore) return;
    
    const fetchSessionIds = async () => {
      setIsLoading(true);
      try {
        const publicIndexRef = doc(firestore, 'public', 'sessions');
        const publicIndexSnap = await getDoc(publicIndexRef);

        if (publicIndexSnap.exists()) {
          setSessionIds(publicIndexSnap.data().sessionIds || []);
        } else {
          setSessionIds([]);
        }
      } catch (e: any) {
        console.error("Error fetching public session index:", e);
        setError("Could not load the list of public sessions.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionIds();
  }, [firestore]);

  return (
    <section className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold font-headline">
        Join a Public Session
      </h2>
      
      {isLoading ? (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      ) : error ? (
        <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : sessionIds !== null ? (
        <PublicSessionsList sessionIds={sessionIds} />
      ) : null}
    </section>
  );
}
