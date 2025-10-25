'use client';

import { useEffect, useState } from 'react';
import { ref, query, orderByChild, equalTo, onValue, limitToLast } from 'firebase/database';
import { db } from '@/lib/firebase';
import type { Session } from '@/lib/types';
import { SessionItem } from './SessionItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

export function PublicSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionsRef = ref(db, 'sessions');
    const q = query(
      sessionsRef,
      orderByChild('visibility'),
      equalTo('public'),
      limitToLast(20) // Get the 20 most recent public sessions
    );

    const unsubscribe = onValue(q, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const sessionsList: Session[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        })).reverse(); // show newest first
        setSessions(sessionsList);
      } else {
        setSessions([]);
      }
      setLoading(false);
    }, (error) => {
      console.error(error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <section className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold font-headline">
        Join a Public Session
      </h2>
      {loading ? (
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
      ) : sessions.length > 0 ? (
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
