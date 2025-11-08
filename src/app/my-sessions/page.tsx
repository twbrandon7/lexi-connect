'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, getDoc, doc, orderBy, limit } from 'firebase/firestore';
import { useFirestore, useUser, useAuth, initiateGoogleSignIn } from '@/firebase';
import type { Session, PersonalVocabulary } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { PublicSessionsList } from '@/components/home/PublicSessionsList';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function SignInPrompt() {
  const auth = useAuth();
  
  const handleSignIn = () => {
    if (auth) {
      initiateGoogleSignIn(auth);
    }
  };
  
  return (
    <div className="text-center py-20 border-2 border-dashed rounded-lg">
      <h3 className="text-xl font-semibold">Sign In to View Your Sessions</h3>
      <p className="text-muted-foreground mt-2 mb-4">
        Please sign in with your Google account to access your sessions.
      </p>
      <Button onClick={handleSignIn}>Sign in with Google</Button>
    </div>
  );
}

export default function MySessionsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) {
      return;
    }
    if (!user || user.isAnonymous || !firestore) {
      setIsLoading(false);
      return;
    }

    const fetchMySessions = async () => {
      setIsLoading(true);
      try {
        const sessionMap = new Map<string, Session>();

        // 1. Fetch sessions hosted by the user
        const hostedQuery = query(collection(firestore, 'sessions'), where('hostId', '==', user.uid));
        const hostedSnapshot = await getDocs(hostedQuery);
        hostedSnapshot.forEach(doc => {
            if (!sessionMap.has(doc.id)) {
                sessionMap.set(doc.id, { id: doc.id, ...doc.data() } as Session);
            }
        });

        // 2. Fetch sessions the user participated in (by checking personal vocabulary)
        const personalVocabQuery = query(
          collection(firestore, `users/${user.uid}/personalVocabulary`),
          orderBy('savedAt', 'desc'),
          limit(50) // Limit to last 50 saved cards to infer recent sessions
        );
        const personalVocabSnapshot = await getDocs(personalVocabQuery);
        const sessionIdsFromVocab = new Set<string>();
        personalVocabSnapshot.forEach(doc => {
            const vocab = doc.data() as PersonalVocabulary;
            if (vocab.sessionId) {
                sessionIdsFromVocab.add(vocab.sessionId);
            }
        });

        // 3. Fetch session details for participated sessions
        for (const sessionId of Array.from(sessionIdsFromVocab)) {
          if (!sessionMap.has(sessionId)) {
            const sessionRef = doc(firestore, 'sessions', sessionId);
            const sessionSnap = await getDoc(sessionRef);
            if (sessionSnap.exists()) {
              sessionMap.set(sessionId, { id: sessionId, ...sessionSnap.data() } as Session);
            }
          }
        }
        
        // 4. Combine and sort
        const allSessions = Array.from(sessionMap.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setSessions(allSessions);

      } catch (error) {
        console.error("Error fetching my sessions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMySessions();
  }, [firestore, user, isUserLoading]);

  const showLoading = isUserLoading || isLoading;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8">My Sessions</h1>
      
      {showLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-60 w-full rounded-lg" />)}
        </div>
      ) : user && !user.isAnonymous ? (
        sessions.length > 0 ? (
          <PublicSessionsList sessions={sessions} />
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">No Sessions Found</h3>
            <p className="text-muted-foreground mt-2">You haven't hosted or joined any sessions yet.</p>
            <Button asChild className="mt-4">
              <Link href="/">Explore Public Sessions</Link>
            </Button>
          </div>
        )
      ) : (
        <SignInPrompt />
      )}
    </div>
  );
}
