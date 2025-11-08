
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreateSessionDialog } from '@/components/home/CreateSessionDialog';
import { JoinSessionDialog } from '@/components/home/JoinSessionDialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LogIn, Sparkles } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { PublicSessions } from '@/components/home/PublicSessions';
import { useUser, useAuth, initiateGoogleSignIn } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const handleSignIn = async () => {
    if (!auth) return;
    try {
      await initiateGoogleSignIn(auth);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign-In Error',
        description: error.message || 'An unknown error occurred during sign-in.',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter">
            Connect. Discover.
            <br />
            <span className="text-primary">Master Vocabulary.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            LexiConnect is a collaborative, AI-powered vocabulary learning app for English corners. Ask questions, create shared vocabulary lists in real-time, and practice together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
             {isUserLoading ? (
                <Skeleton className="h-11 w-full sm:w-64" />
              ) : user && !user.isAnonymous ? (
                <>
                  <Button size="lg" onClick={() => setCreateOpen(true)}>
                    <Sparkles className="mr-2" />
                    Create New Session
                  </Button>
                  <Button size="lg" variant="secondary" onClick={() => setJoinOpen(true)}>
                    Join with ID
                  </Button>
                </>
              ) : (
                <Button size="lg" onClick={handleSignIn}>
                  <LogIn className="mr-2" />
                  Sign in with Google to Get Started
                </Button>
              )}
          </div>
        </div>
        <div className="hidden md:block">
          <Card className="overflow-hidden shadow-2xl">
            <CardContent className="p-0">
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                  data-ai-hint={heroImage.imageHint}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-16" />

      <PublicSessions />

      {user && !user.isAnonymous && (
        <>
          <CreateSessionDialog open={createOpen} onOpenChange={setCreateOpen} />
          <JoinSessionDialog open={joinOpen} onOpenChange={setJoinOpen} />
        </>
      )}
    </div>
  );
}
