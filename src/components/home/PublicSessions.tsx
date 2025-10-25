'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { Session } from '@/lib/types';
import { PublicSessionsList } from './PublicSessionsList';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '../ui/button';
import { initiateGoogleSignIn, useAuth } from '@/firebase';

function SignInPrompt() {
  const auth = useAuth();
  
  const handleSignIn = () => {
    initiateGoogleSignIn(auth);
  };
  
  return (
    <div className="text-center py-16 border-2 border-dashed rounded-lg">
      <h3 className="text-xl font-semibold">Sign In to View Public Sessions</h3>
      <p className="text-muted-foreground mt-2 mb-4">
        Please sign in with your Google account to browse and join public sessions.
      </p>
      <Button onClick={handleSignIn}>Sign in with Google</Button>
    </div>
  );
}


export function PublicSessions() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Don't fetch if the user's auth status is still loading
    if (isUserLoading) {
      setIsLoading(true);
      return;
    }
    
    // Don't fetch if there's no user or no firestore instance
    if (!user || !firestore) {
      setIsLoading(false);
      return;
    }

    const fetchPublicSessions = async () => {
      setIsLoading(true);
      try {
        const sessionsCollection = collection(firestore, 'sessions');
        const q = query(
          sessionsCollection, 
          where('visibility', '==', 'public'),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const publicSessions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Session));
        setSessions(publicSessions);
      } catch (error) {
        console.error("Error fetching public sessions:", error);
        // You might want to set an error state here and display it to the user
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicSessions();

  }, [firestore, user, isUserLoading]);
  
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-headline">
          Join a Public Session
        </h2>
        <p className="text-muted-foreground mt-2">
          Explore sessions created by other users and learn together.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-60 w-full rounded-lg" />
          ))}
        </div>
      ) : !user ? (
        <SignInPrompt />
      ) : sessions && sessions.length > 0 ? (
        <PublicSessionsList sessions={sessions} />
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">No Public Sessions Found</h3>
          <p className="text-muted-foreground mt-2">
            Why not be the first to create one?
          </p>
        </div>
      )}
    </div>
  );
}
