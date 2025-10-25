'use client';

import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { useFirebase } from '@/firebase';

interface UserContextType {
  user: FirebaseUser | null;
}

export const UserContext = createContext<UserContextType>({ user: null });

export function UserProvider({ children }: { children: ReactNode }) {
  const { auth } = useFirebase();
  const [user, setUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        auth.signInAnonymously().catch((error) => {
          console.error('Anonymous sign-in failed:', error);
        });
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const value = useMemo(() => ({ user }), [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
