'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, updateDoc, arrayUnion, writeBatch } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import type { Session } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(3, 'Session name must be at least 3 characters.'),
  motherLanguage: z.string().nonempty('Please select a language.'),
  visibility: z.enum(['public', 'private']),
});

type CreateSessionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreateSessionDialog({ open, onOpenChange }: CreateSessionDialogProps) {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      motherLanguage: 'Traditional Chinese (Taiwan)',
      visibility: 'public',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to create a session.',
      });
      return;
    }
    setIsSubmitting(true);

    try {
      const newSessionRef = doc(collection(firestore, 'sessions'));
      
      const newSession: Session = {
        id: newSessionRef.id,
        name: values.name,
        motherLanguage: values.motherLanguage,
        visibility: values.visibility,
        hostId: user.uid,
        createdAt: Date.now(),
        participantCount: 1,
      };

      const batch = writeBatch(firestore);

      // 1. Set the session document
      batch.set(newSessionRef, newSession);

      // 2. If public, add its ID to the public index
      if (values.visibility === 'public') {
        const publicIndexRef = doc(firestore, 'public', 'sessions');
        batch.update(publicIndexRef, {
            sessionIds: arrayUnion(newSession.id)
        });
      }

      // 3. Commit the batch
      await batch.commit();


      toast({
        title: 'Session Created!',
        description: `Your new session "${values.name}" is ready.`,
      });

      onOpenChange(false);
      router.push(`/sessions/${newSession.id}`);

    } catch (error: any) {
      console.error('Failed to create session:', error);
      // Special handling for the case where the index doc doesn't exist
      if (error.code === 'not-found' && values.visibility === 'public') {
         try {
            const publicIndexRef = doc(firestore, 'public', 'sessions');
            await setDocumentNonBlocking(publicIndexRef, { sessionIds: [newSessionRef.id] }, {});
            toast({
                title: 'Session Created!',
                description: `Your new session "${values.name}" is ready.`,
            });
            onOpenChange(false);
            router.push(`/sessions/${newSessionRef.id}`);
         } catch (initError) {
             console.error('Failed to initialize public session index:', initError);
             toast({
                variant: 'destructive',
                title: 'Failed to Create Session',
                description: 'Could not initialize public session list.',
             });
         }
      } else {
        toast({
            variant: 'destructive',
            title: 'Failed to Create Session',
            description: (error as Error).message || 'An unexpected error occurred.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Session</DialogTitle>
          <DialogDescription>
            Fill in the details to start a new collaborative vocabulary session.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 'Weekly English Corner'" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="motherLanguage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mother Language</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Traditional Chinese (Taiwan)">Traditional Chinese (Taiwan)</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Japanese">Japanese</SelectItem>
                      <SelectItem value="Korean">Korean</SelectItem>
                      <SelectItem value="English">English</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Visibility</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="public" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Public - Anyone can find and join.
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="private" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Private - Only joinable with a specific ID.
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Session
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
