'use server';

/**
 * @fileOverview A flow for suggesting more vocabulary cards based on a query and existing words.
 *
 * - suggestMoreVocabulary - A function that handles the suggestion of additional vocabulary cards.
 * - SuggestMoreVocabularyInput - The input type for the suggestMoreVocabulary function.
 * - SuggestMoreVocabularyOutput - The return type for the suggestMoreVocabulary function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const SuggestMoreVocabularyInputSchema = z.object({
  query: z.string().describe('The original user query to suggest vocabulary cards for.'),
  motherLanguage: z.string().describe("The user's mother language."),
  existingWords: z.array(z.string()).describe('A list of words that have already been suggested.'),
});
export type SuggestMoreVocabularyInput = z.infer<typeof SuggestMoreVocabularyInputSchema>;

const SuggestMoreVocabularyOutputSchema = z.object({
  suggestedVocabularyCards: z.array(
    z.object({
      wordOrPhrase: z.string().describe('The suggested English word or phrase.'),
      partOfSpeech: z.string().describe('The grammatical part of speech (e.g., noun, verb, adjective).'),
      translation: z.string().describe("The translation of the word/phrase into the user's mother language."),
      exampleSentence: z.string().describe("An example sentence for the word/phrase."),
    })
  ).describe('A list of new suggested vocabulary cards.'),
});
export type SuggestMoreVocabularyOutput = z.infer<typeof SuggestMoreVocabularyOutputSchema>;

export async function suggestMoreVocabulary(input: SuggestMoreVocabularyInput): Promise<SuggestMoreVocabularyOutput> {
  return suggestMoreVocabularyFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMoreVocabularyPrompt',
  model: googleAI.model('gemini-1.5-pro-latest'),
  input: { schema: SuggestMoreVocabularyInputSchema },
  output: { schema: SuggestMoreVocabularyOutputSchema },
  prompt: `You are a helpful AI assistant that suggests additional vocabulary cards based on a user's query, avoiding words that have already been provided.

The user's original query was: "{{query}}"
Their mother language is: {{{motherLanguage}}}

The following words have already been suggested:
{{#each existingWords}}- {{this}}
{{/each}}

Your task is to generate a new list of 3-5 relevant vocabulary words or phrases based on the original query.
These new suggestions must be different from the words in the "existingWords" list.
For each new suggestion, provide the word/phrase, its part of speech, a translation into the user's mother language ({{{motherLanguage}}}), and a new, simple example sentence.
`,
});

const suggestMoreVocabularyFlow = ai.defineFlow(
  {
    name: 'suggestMoreVocabularyFlow',
    inputSchema: SuggestMoreVocabularyInputSchema,
    outputSchema: SuggestMoreVocabularyOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
