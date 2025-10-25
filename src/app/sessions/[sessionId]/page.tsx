'use client';

import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/lib/firebase';
import type { Session } from '@/lib/types';
import { VocabularyList } from '@/components/session/VocabularyList';
import { AIQuery } from '@/components/session/AIQuery';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SessionPage({ params }: { params: { sessionId: string } }) {
  const { sessionId } = params;
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    const sessionRef = ref(db, `sessions/${sessionId}`);

    const unsubscribe = onValue(sessionRef, (snapshot) => {
      if (snapshot.exists()) {
        setSession({ id: snapshot.key, ...snapshot.val() });
        setError(null);
      } else {
        setError('Session not found.');
        setSession(null);
      }
      setLoading(false);
    }, (err) => {
      console.error(err);
      setError('Failed to load session data.');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-40 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <div className='flex flex-wrap items-center justify-between gap-4'>
            <h1 className="text-3xl md:text-4xl font-bold font-headline truncate">{session.name}</h1>
            <div className='flex items-center gap-4'>
                <Badge variant={session.visibility === 'public' ? 'default' : 'secondary'}>
                {session.visibility}
                </Badge>
                <Button asChild>
                    <Link href={`/practice/${sessionId}`}>Start Practice</Link>
                </Button>
            </div>
        </div>
        <AIQuery sessionId={sessionId} sessionLanguage={session.motherLanguage} />
      </div>

      <VocabularyList sessionId={sessionId} />
    </div>
  );
}
