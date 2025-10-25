'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreateSessionDialog } from '@/components/home/CreateSessionDialog';
import { JoinSessionDialog } from '@/components/home/JoinSessionDialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Sparkles } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { PublicSessions } from '@/components/home/PublicSessions';

export default function Home() {
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const heroImage = PlaceHolderImages.find((img) => img.id === 'hero');

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
            <Button size="lg" onClick={() => setCreateOpen(true)}>
              <Sparkles className="mr-2" />
              Create New Session
            </Button>
            <Button size="lg" variant="secondary" onClick={() => setJoinOpen(true)}>
              Join with ID
            </Button>
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

      <CreateSessionDialog open={createOpen} onOpenChange={setCreateOpen} />
      <JoinSessionDialog open={joinOpen} onOpenChange={setJoinOpen} />
    </div>
  );
}
