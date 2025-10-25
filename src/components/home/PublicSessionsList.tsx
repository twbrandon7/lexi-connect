'use client';

import type { Session } from '@/lib/types';
import { SessionItem } from './SessionItem';

type PublicSessionsListProps = {
  sessions: Session[];
};

export function PublicSessionsList({ sessions }: PublicSessionsListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sessions.map((session) => (
        <SessionItem key={session.id} session={session} />
      ))}
    </div>
  );
}
