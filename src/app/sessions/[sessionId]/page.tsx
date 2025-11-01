'use client';

import { use, useEffect } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useDoc, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import type { Session } from '@/lib/types';
import { VocabularyList } from '@/components/session/VocabularyList';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { SessionManagement } from '@/components/session/SessionManagement';
import { AIChatPanel } from '@/components/session/AIChatPanel';

function SessionContent({ session, sessionId }: { session: Session; sessionId: string }) {
  const { user } = useUser();
  const firestore = useFirestore();
  const isHost = user?.uid === session.hostId;

  useEffect(() => {
    if (user && firestore && session.id && session.state !== 'closed') {
      const sessionRef = doc(firestore, 'sessions', session.id);
      // Add the current user to the participants array if they are not already in it.
      // arrayUnion is idempotent and will not add duplicates.
      updateDoc(sessionRef, {
        participants: arrayUnion(user.uid),
      });
    }
  }, [user, firestore, session.id, session.state]);

  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))]">
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="container mx-auto">
          <div className="mb-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-3xl md:text-4xl font-bold font-headline truncate">{session.name}</h1>
              <div className="flex items-center gap-4">
                {session.state && <Badge variant={session.state === 'closed' ? 'destructive' : 'default'}>{session.state}</Badge>}
                <Badge variant={session.visibility === 'public' ? 'default' : 'secondary'}>
                  {session.visibility}
                </Badge>
                {isHost && <SessionManagement session={session} />}
              </div>
            </div>
          </div>
          <VocabularyList sessionId={sessionId} sessionState={session.state} />
        </div>
      </div>
      {session.state !== 'closed' && (
        <aside className="w-full md:w-[400px] lg:w-[450px] xl:w-[500px] border-l bg-card flex flex-col">
          <AIChatPanel sessionId={sessionId} sessionLanguage={session.motherLanguage} />
        </aside>
      )}
    </div>
  );
}


function SessionSkeleton() {
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

export default function SessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const firestore = useFirestore();

  const sessionRef = useMemoFirebase(() => {
    if (!firestore || !sessionId) return null;
    return doc(firestore, 'sessions', sessionId);
  }, [firestore, sessionId]);

  const { data: session, isLoading, error } = useDoc<Session>(sessionRef);

  if (isLoading) {
    return <SessionSkeleton />;
  }

  if (session) {
    return <SessionContent session={session} sessionId={sessionId} />;
  }

  // If we finished loading, found no session, and there was no critical error, the session doesn't exist or is not accessible.
  if (!session && !error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Session Not Found</AlertTitle>
          <AlertDescription>The session ID is invalid, the session has been deleted, or you do not have permission to view it.</AlertDescription>
        </Alert>
      </div>
    );
  }

  // If there was a critical error during fetching.
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return null; // Should not be reached
}
