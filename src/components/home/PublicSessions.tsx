'use client';

import { useMemo, useState, useEffect } from 'react';
import { doc, getDoc, getDocs, collection, query, where, documentId, orderBy } from 'firebase/firestore';
import { useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import type { Session } from '@/lib/types';
import { SessionItem } from './SessionItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export function PublicSessions() {
  const firestore = useFirestore();
  
  // 1. Hook to get the public session index document
  const publicIndexRef = useMemoFirebase(() => {
      if (!firestore) return null;
      return doc(firestore, 'public', 'sessions');
  }, [firestore]);
  const { data: publicIndex, isLoading: isIndexLoading, error: indexError } = useDoc<{ sessionIds: string[] }>(publicIndexRef);

  // 2. State for the final session data
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 3. Effect to fetch sessions based on the index
  useEffect(() => {
    if (isIndexLoading || !firestore) {
      setIsLoading(true);
      return;
    }

    if (indexError) {
      setError(indexError);
      setIsLoading(false);
      return;
    }
    
    const sessionIds = publicIndex?.sessionIds;

    if (!sessionIds || sessionIds.length === 0) {
      setSessions([]);
      setIsLoading(false);
      return;
    }

    const fetchSessions = async () => {
      try {
        const sessionsRef = collection(firestore, 'sessions');
        // Firestore 'in' query is limited to 30 items. If more are needed, batching is required.
        const q = query(sessionsRef, where(documentId(), 'in', sessionIds.slice(0, 30)));
        const querySnapshot = await getDocs(q);
        const fetchedSessions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session));
        
        // Sort sessions by creation date, descending
        fetchedSessions.sort((a, b) => b.createdAt - a.createdAt);

        setSessions(fetchedSessions);
      } catch (e: any) {
        console.error("Error fetching public sessions:", e);
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSessions();

  }, [publicIndex, isIndexLoading, indexError, firestore]);
  
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

  if (error) {
     return (
        <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold font-headline">
                Join a Public Session
            </h2>
            <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Loading Sessions</AlertTitle>
                <AlertDescription>{error.message || 'Could not load public sessions. Please try again later.'}</AlertDescription>
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
