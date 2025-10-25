'use client';

import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type { User } from '@/lib/types';
import { useFirebase } from '@/firebase';

interface UserContextType {
  user: User | null;
}

export const UserContext = createContext<UserContextType>({ user: null });

export function UserProvider({ children }: { children: ReactNode }) {
  const { auth } = useFirebase();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        const newUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.isAnonymous
            ? `Guest-${firebaseUser.uid.substring(0, 4)}`
            : firebaseUser.displayName || 'User',
        };
        setUser(newUser);
        localStorage.setItem('lexiconnect_user', JSON.stringify(newUser));
      } else {
        // No user is signed in.
        // For this app, we'll auto-sign-in an anonymous user.
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
