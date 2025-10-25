'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
import { getDoc, doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  sessionId: z.string().trim().min(1, 'Session ID cannot be empty.'),
});

type JoinSessionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function JoinSessionDialog({ open, onOpenChange }: JoinSessionDialogProps) {
  const router = useRouter();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sessionId: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Database not available. Please try again later.',
      });
      return;
    }
    setIsSubmitting(true);

    try {
      const sessionId = values.sessionId;
      // Check in private sessions first
      let sessionRef = doc(firestore, 'sessions', sessionId);
      let sessionSnap = await getDoc(sessionRef);

      if (sessionSnap.exists()) {
        onOpenChange(false);
        router.push(`/sessions/${sessionId}`);
        return;
      }

      // If not in private, check public sessions
      sessionRef = doc(firestore, 'public_sessions', sessionId);
      sessionSnap = await getDoc(sessionRef);

      if (sessionSnap.exists()) {
        onOpenChange(false);
        router.push(`/sessions/${sessionId}`);
        return;
      }

      // If it doesn't exist in either
      form.setError('sessionId', {
        type: 'manual',
        message: 'Session not found. Please check the ID and try again.',
      });
    } catch (error) {
      console.error('Failed to join session:', error);
      toast({
        variant: 'destructive',
        title: 'Error Joining Session',
        description:
          (error as Error).message ||
          'Could not verify session ID. Please check your connection.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join a Session by ID</DialogTitle>
          <DialogDescription>
            Enter the unique ID of the session you want to join.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="sessionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter session ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Join Session
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
