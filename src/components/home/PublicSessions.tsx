'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { Session } from '@/lib/types';
import { SessionItem } from './SessionItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function PublicSessions() {
  const firestore = useFirestore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPublicSessions = async () => {
      if (!firestore) return;
      setIsLoading(true);

      try {
        const publicIndexRef = doc(firestore, 'public', 'sessions');
        const publicIndexSnap = await getDoc(publicIndexRef);

        if (publicIndexSnap.exists()) {
          const publicSessionIds = publicIndexSnap.data().sessionIds || [];
          
          if (publicSessionIds.length > 0) {
            // Fetch the session documents based on the IDs
            const sessionsRef = collection(firestore, 'public_sessions');
            // Firestore 'in' query is limited to 30 items. 
            // If you expect more, you'll need to batch the requests.
            const q = query(sessionsRef, where('id', 'in', publicSessionIds.slice(0, 30)));
            const sessionSnaps = await getDocs(q);

            const sessionData = sessionSnaps.docs
              .map(doc => doc.data() as Session)
              .sort((a, b) => b.createdAt - a.createdAt); // Sort by creation date descending

            setSessions(sessionData);
          } else {
            setSessions([]);
          }
        } else {
          setSessions([]); // No public index document found
        }
      } catch (error) {
        console.error("Error fetching public sessions:", error);
        setSessions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicSessions();
  }, [firestore]);


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
