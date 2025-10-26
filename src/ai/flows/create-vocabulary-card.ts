'use server';

/**
 * @fileOverview A flow for creating a complete vocabulary card from a word.
 *
 * - createVocabularyCard - A function that generates all fields for a vocabulary card.
 * - CreateVocabularyCardInput - The input type for the createVocabularyCard function.
 * - CreateVocabularyCardOutput - The return type for the createVocabularyCard function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CreateVocabularyCardInputSchema = z.object({
  wordOrPhrase: z.string().describe('The English word or phrase to create a card for.'),
  motherLanguage: z.string().describe('The user’s mother language for translation.'),
  exampleSentence: z.string().optional().describe('An optional example sentence to provide context.'),
});
export type CreateVocabularyCardInput = z.infer<typeof CreateVocabularyCardInputSchema>;

const CreateVocabularyCardOutputSchema = z.object({
  wordOrPhrase: z.string(),
  primaryMeaning: z.string(),
  partOfSpeech: z.string(),
  pronunciationIpa: z.string(),
  exampleSentence: z.string(),
  translation: z.string(),
  exampleSentenceTranslation: z.string().describe("The translation of the example sentence into the user's mother language."),
});
export type CreateVocabularyCardOutput = z.infer<typeof CreateVocabularyCardOutputSchema>;

export async function createVocabularyCard(input: CreateVocabularyCardInput): Promise<CreateVocabularyCardOutput> {
  return createVocabularyCardFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createVocabularyCardPrompt',
  model: "googleai/gemini-1.5-pro-latest",
  input: { schema: CreateVocabularyCardInputSchema },
  output: { schema: CreateVocabularyCardOutputSchema },
  prompt: `You are an expert linguist and English teacher. Your task is to create a complete and accurate vocabulary card for the given English word or phrase.

The user's mother language is {{{motherLanguage}}}.

Generate the following fields for the word/phrase "{{wordOrPhrase}}":
1.  **primaryMeaning**: A clear and concise definition in English. If an example sentence is provided, tailor the meaning to that context.
2.  **partOfSpeech**: The grammatical part of speech (e.g., noun, verb, adjective).
3.  **pronunciationIpa**: The pronunciation in International Phonetic Alphabet (IPA) notation.
4.  **exampleSentence**: Use the provided example sentence if available: "{{#if exampleSentence}}{{{exampleSentence}}}{{else}}A natural and illustrative example sentence.{{/if}}". If not, create a new one.
5.  **translation**: The translation of the word/phrase into the user's mother language, which is {{{motherLanguage}}}.
6.  **exampleSentenceTranslation**: The translation of the final example sentence into the user's mother language.

Ensure all fields are accurate and helpful for a language learner.`,
});

const createVocabularyCardFlow = ai.defineFlow(
  {
    name: 'createVocabularyCardFlow',
    inputSchema: CreateVocabularyCardInputSchema,
    outputSchema: CreateVocabularyCardOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
