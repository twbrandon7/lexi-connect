import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Calendar } from 'lucide-react';
import type { Session } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

type SessionItemProps = {
  session: Session;
};

export function SessionItem({ session }: SessionItemProps) {
  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="truncate">{session.name}</CardTitle>
        <CardDescription>Hosted by {session.hostId.split('_')[0]}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
         <div className="flex items-center text-sm text-muted-foreground">
            <Users className="mr-2 h-4 w-4" />
            <span>{session.participantCount || 1} participant(s)</span>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            <span>Created {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}</span>
          </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/sessions/${session.id}`}>Join Session</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
