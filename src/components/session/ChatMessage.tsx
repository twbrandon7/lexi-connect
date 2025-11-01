'use client';

import { Bot, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { SuggestedCard } from './SuggestedCard';
import type { AIPoweredVocabularyDiscoveryOutput } from '@/lib/types';
import { Button } from '../ui/button';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { suggestMoreVocabulary } from '@/ai/flows/suggest-more-vocabulary';
import { useToast } from '@/hooks/use-toast';

export type ChatMessageProps = {
  role: 'user' | 'ai';
  content: string;
  isError?: boolean;
  suggestions?: AIPoweredVocabularyDiscoveryOutput['suggestedVocabularyCards'];
  sessionId?: string;
  sessionLanguage?: string;
};

export function ChatMessage({ role, content, isError, suggestions, sessionId, sessionLanguage }: ChatMessageProps) {
  const [moreSuggestions, setMoreSuggestions] = useState<AIPoweredVocabularyDiscoveryOutput['suggestedVocabularyCards']>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const { toast } = useToast();

  const handleLoadMore = async () => {
    if (!suggestions || !sessionId || !sessionLanguage) return;
    setIsLoadingMore(true);

    const existingWords = [
      ...suggestions,
      ...moreSuggestions
    ].map(s => s.wordOrPhrase);

    try {
      const response = await suggestMoreVocabulary({
        query: content, // The original query is the user's message content
        motherLanguage: sessionLanguage,
        existingWords: existingWords,
      });
      setMoreSuggestions(prev => [...prev, ...response.suggestedVocabularyCards]);
    } catch (error) {
      console.error('Failed to get more suggestions:', error);
      toast({
        variant: 'destructive',
        title: 'Failed to Load More',
        description: 'Could not generate more suggestions.',
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  const renderAnswer = (answer: string) => {
    const lines = answer.split('\n').filter(line => line.trim() !== '');
    return lines.map((line, index) => {
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return <li key={index} className="ml-4">{line.trim().substring(2)}</li>;
      }
      return <p key={index}>{line}</p>;
    });
  };

  return (
    <div className={cn('flex items-start gap-3 text-sm', role === 'user' && 'justify-end')}>
      {role === 'ai' && (
        <Avatar className="w-8 h-8 border">
          <AvatarFallback className={cn(isError && 'bg-destructive text-destructive-foreground')}>
            <Bot />
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn('rounded-lg px-4 py-3', role === 'ai' ? 'bg-secondary' : 'bg-primary text-primary-foreground')}>
        <div className="prose prose-sm max-w-full text-foreground whitespace-pre-wrap">
            {role === 'ai' ? <ul>{renderAnswer(content)}</ul> : <p>{content}</p>}
        </div>
        
        {suggestions && sessionId && sessionLanguage && (
          <div className="mt-4 space-y-4">
            <h4 className='font-semibold text-muted-foreground'>Suggested Cards</h4>
            <div className="grid grid-cols-1 gap-2">
              {suggestions.map((suggestion, index) => (
                <SuggestedCard key={index} suggestion={suggestion} sessionId={sessionId} sessionLanguage={sessionLanguage} />
              ))}
              {moreSuggestions.map((suggestion, index) => (
                <SuggestedCard key={`more-${index}`} suggestion={suggestion} sessionId={sessionId} sessionLanguage={sessionLanguage} />
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" onClick={handleLoadMore} disabled={isLoadingMore}>
                <Plus className="mr-2" /> More
              </Button>
            </div>
          </div>
        )}
      </div>
      {role === 'user' && (
        <Avatar className="w-8 h-8 border">
          <AvatarFallback>
            <User />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
