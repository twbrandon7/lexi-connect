'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { doc } from 'firebase/firestore';
import { useFirestore, updateDocumentNonBlocking } from '@/firebase';
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
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Wand2 } from 'lucide-react';
import type { VocabularyCard } from '@/lib/types';
import { Textarea } from '../ui/textarea';
import { refineVocabularyCardFields } from '@/ai/flows/refine-vocabulary-card-fields';

const formSchema = z.object({
  wordOrPhrase: z.string().min(1, "Word/Phrase is required."),
  primaryMeaning: z.string().min(1, "Primary meaning is required."),
  partOfSpeech: z.string(),
  pronunciationIpa: z.string(),
  exampleSentence: z.string(),
  translation: z.string(),
  exampleSentenceTranslation: z.string(),
});

type EditVocabularyCardDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  card: VocabularyCard;
};

type RefineField = 'primaryMeaning' | 'exampleSentence' | 'exampleSentenceTranslation';

export function EditVocabularyCardDialog({ isOpen, setIsOpen, card }: EditVocabularyCardDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refiningField, setRefiningField] = useState<RefineField | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    values: {
      wordOrPhrase: card.wordOrPhrase,
      primaryMeaning: card.primaryMeaning,
      partOfSpeech: card.partOfSpeech || '',
      pronunciationIpa: card.pronunciationIpa || '',
      exampleSentence: card.exampleSentence || '',
      translation: card.translation || '',
      exampleSentenceTranslation: card.exampleSentenceTranslation || '',
    },
  });

  const handleRefineField = async (field: RefineField, instructions: string) => {
    setRefiningField(field);
    try {
      const cardContent = JSON.stringify(form.getValues());
      const result = await refineVocabularyCardFields({
        cardContent,
        fieldToRefine: field,
        userInstructions: instructions,
      });

      if (result.refinedContent) {
        form.setValue(field, result.refinedContent);
        toast({ title: 'Field Refined', description: `The ${field} has been updated by the AI.` });
      }
    } catch (error) {
      console.error('AI refinement failed:', error);
      toast({ variant: 'destructive', title: 'AI Refinement Failed' });
    } finally {
      setRefiningField(null);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;
    setIsSubmitting(true);

    try {
      const cardRef = doc(firestore, `sessions/${card.sessionId}/vocabularyCards`, card.id);
      updateDocumentNonBlocking(cardRef, values);
      toast({ title: 'Card Updated', description: `"${values.wordOrPhrase}" has been successfully updated.` });
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to update card:', error);
      toast({ variant: 'destructive', title: 'Update Failed' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Vocabulary Card</DialogTitle>
          <DialogDescription>Make changes to the card details below.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <FormField
              control={form.control}
              name="wordOrPhrase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Word or Phrase</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="primaryMeaning"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Meaning</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                       <Textarea {...field} />
                       <Button type="button" size="icon" variant="outline" onClick={() => handleRefineField('primaryMeaning', 'Make this meaning clearer and more concise.')} disabled={refiningField === 'primaryMeaning'}>
                         {refiningField === 'primaryMeaning' ? <Loader2 className="animate-spin" /> : <Wand2 />}
                       </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="exampleSentence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Example Sentence</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                       <Textarea {...field} />
                       <Button type="button" size="icon" variant="outline" onClick={() => handleRefineField('exampleSentence', 'Create a better, more illustrative example sentence.')} disabled={refiningField === 'exampleSentence'}>
                         {refiningField === 'exampleSentence' ? <Loader2 className="animate-spin" /> : <Wand2 />}
                       </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="exampleSentenceTranslation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Example Sentence Translation</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                       <Textarea {...field} />
                       <Button type="button" size="icon" variant="outline" onClick={() => handleRefineField('exampleSentenceTranslation', 'Improve this translation.')} disabled={refiningField === 'exampleSentenceTranslation'}>
                         {refiningField === 'exampleSentenceTranslation' ? <Loader2 className="animate-spin" /> : <Wand2 />}
                       </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="partOfSpeech"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Part of Speech</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="pronunciationIpa"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Pronunciation (IPA)</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="translation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Translation</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
