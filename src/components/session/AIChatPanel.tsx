'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CornerDownLeft, Loader2, Sparkles, Wand2 } from 'lucide-react';
import {
  aiPoweredVocabularyDiscovery,
  type AIPoweredVocabularyDiscoveryOutput,
} from '@/ai/flows/ai-powered-vocabulary-discovery';
import { useUser, useAuth, initiateGoogleSignIn } from '@/firebase';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ChatMessage, ChatMessageProps } from './ChatMessage';
import { Separator } from '../ui/separator';

const formSchema = z.object({
  query: z.string().min(1, 'Please enter a question.'),
});

type AIQueryProps = {
  sessionId: string;
  sessionLanguage: string;
};

function SignInToChat() {
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
            description: 'Could not sign in with Google. Please try again.',
        });
    }
  };

  return (
    <div className="text-center text-sm text-muted-foreground p-4">
      <p>Please sign in to use the AI assistant.</p>
      <Button variant="link" onClick={handleSignIn} className="p-0 h-auto mt-2">Sign in with Google</Button>
    </div>
  );
}


export function AIChatPanel({ sessionId, sessionLanguage }: AIQueryProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessageProps[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { query: '' },
  });

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || user.isAnonymous) {
      toast({ variant: 'destructive', title: 'You must be logged in to chat.' });
      return;
    }
    setIsLoading(true);

    const userMessage: ChatMessageProps = {
      role: 'user',
      content: values.query,
    };
    setChatHistory(prev => [...prev, userMessage]);
    form.reset();

    try {
      const response = await aiPoweredVocabularyDiscovery({
        query: values.query,
        motherLanguage: sessionLanguage,
        sessionId: sessionId,
      });

      const aiMessage: ChatMessageProps = {
        role: 'ai',
        content: response.answer,
        suggestions: response.suggestedVocabularyCards,
        sessionId: sessionId,
        sessionLanguage: sessionLanguage,
      };
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI query failed:', error);
      const errorMessage: ChatMessageProps = {
        role: 'ai',
        content: 'Sorry, I could not process your request. Please try again.',
        isError: true,
      };
      setChatHistory(prev => [...prev, errorMessage]);
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
    <>
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="text-primary" />
            AI Vocabulary Discovery
        </h2>
      </div>
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-6 chat-panel-scroll">
        {chatHistory.length === 0 ? (
          <div className='flex flex-col h-full justify-center text-center text-muted-foreground p-4'>
            <p>Ask a question in your native language to discover relevant English vocabulary.</p>
            <p className='text-sm mt-2'>For example: "How do I talk about booking a hotel in English?"</p>
          </div>
        ) : (
          chatHistory.map((msg, index) => <ChatMessage key={index} {...msg} />)
        )}
      </div>
      <Separator />
      <div className="p-4">
        {user && !user.isAnonymous ? (
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
                <Textarea
                placeholder="Ask a question..."
                className="pr-20 resize-none"
                disabled={isLoading}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    form.handleSubmit(onSubmit)();
                    }
                }}
                {...form.control.register('query')}
                />
                <Button
                type="submit"
                size="icon"
                className="absolute top-1/2 right-3 -translate-y-1/2"
                disabled={isLoading}
                >
                {isLoading ? (
                    <Loader2 className="animate-spin" />
                ) : (
                    <CornerDownLeft />
                )}
                <span className="sr-only">Send</span>
                </Button>
                <FormMessage className="pt-2">
                    {form.formState.errors.query?.message}
                </FormMessage>
            </form>
            </Form>
        ) : (
            <SignInToChat />
        )}
      </div>
    </>
  );
}
