'use client';

import { use } from 'react';
import { doc } from 'firebase/firestore';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import type { Session } from '@/lib/types';
import { VocabularyList } from '@/components/session/VocabularyList';
import { AIQuery } from '@/components/session/AIQuery';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function SessionContent({ session, sessionId }: { session: Session; sessionId: string }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl md:text-4xl font-bold font-headline truncate">{session.name}</h1>
          <div className="flex items-center gap-4">
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

export default function SessionPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const firestore = useFirestore();

  // Attempt to fetch from the general 'sessions' collection first.
  // This covers private sessions owned by the user.
  const sessionRef = useMemoFirebase(() => {
    if (!firestore || !sessionId) return null;
    return doc(firestore, 'sessions', sessionId);
  }, [firestore, sessionId]);

  const { data: directSession, isLoading: isLoadingDirect, error: directError } = useDoc<Session>(sessionRef);
  
  // Simultaneously attempt to fetch from 'public_sessions'.
  const publicSessionRef = useMemoFirebase(() => {
    if (!firestore || !sessionId) return null;
    return doc(firestore, 'public_sessions', sessionId);
  }, [firestore, sessionId]);

  const { data: publicSession, isLoading: isLoadingPublic, error: publicError } = useDoc<Session>(publicSessionRef);

  const isLoading = isLoadingDirect || isLoadingPublic;
  const session = directSession || publicSession;
  const error = directError || publicError;


  if (isLoading) {
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
  
  if (!session && !isLoading) {
    return (
     <div className="container mx-auto px-4 py-8">
       <Alert variant="destructive">
         <Terminal className="h-4 w-4" />
         <AlertTitle>Error</AlertTitle>
         <AlertDescription>Session not found. It may be private or no longer exists.</AlertDescription>
       </Alert>
     </div>
   );
 }

  if (session) {
    return <SessionContent session={session} sessionId={sessionId} />;
  }

  // This will show the actual permission error if both lookups fail due to permissions
  if (error && !isLoading) {
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

  return null; // Should not be reached in normal flow
}
