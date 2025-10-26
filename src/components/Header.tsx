'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';
import { useUser, useAuth, initiateGoogleSignIn } from '@/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const handleSignIn = async () => {
    if (!auth) return;
    try {
      await initiateGoogleSignIn(auth);
    } catch (error: any) {
      if (error.code === 'auth/popup-blocked-by-browser') {
        toast({
          variant: 'destructive',
          title: 'Popup Blocked',
          description: 'Please allow popups for this site to sign in with Google.',
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Sign-In Error',
          description: error.message || 'An unknown error occurred during sign-in.',
        });
      }
    }
  };

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
            {isUserLoading ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            ) : user ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage
                    src={user.photoURL || `https://api.dicebear.com/8.x/bottts-neutral/svg?seed=${user.uid}`}
                  />
                  <AvatarFallback>
                    {user.displayName?.substring(0, 2) || 'G'}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline-block">
                  {user.isAnonymous
                    ? `Guest-${user.uid.substring(0, 4)}`
                    : user.displayName}
                </span>
              </div>
            ) : (
              <Button variant="outline" onClick={handleSignIn}>
                <LogIn className="mr-2" />
                Sign in with Google
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
