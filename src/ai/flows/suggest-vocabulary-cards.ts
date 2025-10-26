'use server';

/**
 * @fileOverview A flow for suggesting vocabulary cards based on a user's query.
 *
 * - suggestVocabularyCards - A function that handles the suggestion of vocabulary cards.
 * - SuggestVocabularyCardsInput - The input type for the suggestVocabularyCards function.
 * - SuggestVocabularyCardsOutput - The return type for the suggestVocabularyCards function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestVocabularyCardsInputSchema = z.object({
  query: z.string().describe('The user query to suggest vocabulary cards for.'),
  motherLanguage: z.string().describe('The user\u2019s mother language.'),
});
export type SuggestVocabularyCardsInput = z.infer<typeof SuggestVocabularyCardsInputSchema>;

const SuggestVocabularyCardsOutputSchema = z.object({
  cardSuggestions: z.array(
    z.object({
      word: z.string().describe('The suggested word or phrase.'),
      definition: z.string().describe('A definition of the word or phrase.'),
    })
  ).describe('A list of suggested vocabulary cards.'),
});
export type SuggestVocabularyCardsOutput = z.infer<typeof SuggestVocabularyCardsOutputSchema>;

export async function suggestVocabularyCards(input: SuggestVocabularyCardsInput): Promise<SuggestVocabularyCardsOutput> {
  return suggestVocabularyCardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestVocabularyCardsPrompt',
  model: "googleai/gemini-1.5-flash-preview",
  input: {schema: SuggestVocabularyCardsInputSchema},
  output: {schema: SuggestVocabularyCardsOutputSchema},
  prompt: `You are a helpful AI assistant that suggests vocabulary cards based on a user's query.
  The user will provide a query and their mother language.
  You should suggest vocabulary cards with English words and definitions that are relevant to the query.
  Make sure each definition is context-specific and based on the user's query.

  User Query: {{{query}}}
  Mother Language: {{{motherLanguage}}}

  Here are some example responses:

  {
    "cardSuggestions": [
      {
        "word": "accommodation",
        "definition": "A place to stay, such as a hotel or apartment."
      },
      {
        "word": "cuisine",
        "definition": "A style of cooking."
      }
    ]
  }
  `,
});

const suggestVocabularyCardsFlow = ai.defineFlow(
  {
    name: 'suggestVocabularyCardsFlow',
    inputSchema: SuggestVocabularyCardsInputSchema,
    outputSchema: SuggestVocabularyCardsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
