'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { useUser } from '@/hooks/useUser';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Header() {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center gap-4">
            <Link href="/my-bank">
              <Button variant="ghost">My Bank</Button>
            </Link>
            {user && (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${user.name}`} />
                  <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline-block">{user.name}</span>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
