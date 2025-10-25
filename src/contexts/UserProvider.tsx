'use client';

import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import type { User } from '@/lib/types';

interface UserContextType {
  user: User | null;
}

export const UserContext = createContext<UserContextType>({ user: null });

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let storedUser = localStorage.getItem('lexiconnect_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      const guestNumber = Math.floor(1000 + Math.random() * 9000);
      const newId = `user_${Date.now()}_${guestNumber}`;
      const newUser: User = {
        id: newId,
        name: `Guest-${guestNumber}`,
      };
      localStorage.setItem('lexiconnect_user', JSON.stringify(newUser));
      setUser(newUser);
    }
  }, []);

  const value = useMemo(() => ({ user }), [user]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
