'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Sparkles, Wand2 } from 'lucide-react';
import { aiPoweredVocabularyDiscovery, type AIPoweredVocabularyDiscoveryOutput } from '@/ai/flows/ai-powered-vocabulary-discovery';
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
  const [aiResponse, setAiResponse] = useState<AIPoweredVocabularyDiscoveryOutput | null>(null);

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
      const response = await aiPoweredVocabularyDiscovery({
        query: values.query,
        motherLanguage: sessionLanguage,
        sessionId: sessionId,
      });
      setAiResponse(response);
      form.reset();
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
  
  const renderAnswer = (answer: string) => {
    const lines = answer.split('\n');
    const listItems: string[] = [];
    const otherContent: string[] = [];

    lines.forEach(line => {
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        listItems.push(line.trim().substring(2));
      } else {
        otherContent.push(line);
      }
    });

    return (
      <div>
        {otherContent.length > 0 && <p className="text-muted-foreground whitespace-pre-wrap">{otherContent.join('\n')}</p>}
        {listItems.length > 0 && (
          <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-2">
            {listItems.map((item, index) => <li key={index}>{item}</li>)}
          </ul>
        )}
      </div>
    );
  };


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
            {aiResponse.answer && (
                <div>
                    <h3 className="text-lg font-semibold mb-2">Answer</h3>
                    {renderAnswer(aiResponse.answer)}
                </div>
            )}
            
            {aiResponse.suggestedVocabularyCards.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Suggested Vocabulary Cards</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiResponse.suggestedVocabularyCards.map((cardSuggestion, index) => (
                    <SuggestedCard
                      key={index}
                      suggestion={cardSuggestion}
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
