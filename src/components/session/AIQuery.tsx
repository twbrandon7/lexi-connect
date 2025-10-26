'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { suggestVocabularyCardsWithExistingCheck } from '@/ai/flows/vocabulary-card-suggestions';
import { useUser } from '@/firebase';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SuggestedCard } from './SuggestedCard';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Info } from 'lucide-react';

const formSchema = z.object({
  query: z.string().min(10, 'Please enter a more detailed question.'),
});

type AIQueryProps = {
  sessionId: string;
  sessionLanguage: string;
};

export function AIQuery({ sessionId, sessionLanguage }: AIQueryProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<{
    cardSuggestions: { word: string; definition: string }[];
    existingCardFound: boolean;
    existingCardDetails?: { word: string; definition: string };
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { query: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ variant: 'destructive', title: 'You are not logged in.' });
      return;
    }
    setIsLoading(true);
    setAiResponse(null);
    try {
      const response = await suggestVocabularyCardsWithExistingCheck({
        query: values.query,
        motherLanguage: sessionLanguage,
      });
      setAiResponse(response);
    } catch (error) {
      console.error('AI query failed:', error);
      toast({
        variant: 'destructive',
        title: 'AI Query Failed',
        description: 'The AI could not process your request. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" />
            AI-Powered Vocabulary Discovery
          </CardTitle>
          <CardDescription>
            Ask a question in your native language to discover relevant English vocabulary. For example: "How do I talk about booking a hotel in English?"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="query"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Type your question here..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                Ask AI
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      {isLoading && (
        <div className="flex items-center justify-center rounded-lg border border-dashed p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {aiResponse && (
        <Card className="bg-secondary">
          <CardHeader>
            <CardTitle>AI Response</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
             {aiResponse.existingCardFound && aiResponse.existingCardDetails && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Existing Card Found</AlertTitle>
                  <AlertDescription>
                    A card with a similar meaning already exists in this session: <strong>{aiResponse.existingCardDetails.word}</strong> - "{aiResponse.existingCardDetails.definition}". Consider reviewing it instead of adding a duplicate.
                  </AlertDescription>
                </Alert>
            )}

            {aiResponse.cardSuggestions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Suggested Vocabulary Cards</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiResponse.cardSuggestions.map((card, index) => (
                    <SuggestedCard
                      key={index}
                      word={card.word}
                      sessionId={sessionId}
                      sessionLanguage={sessionLanguage}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
