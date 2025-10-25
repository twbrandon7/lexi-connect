'use server';

/**
 * @fileOverview AI-Powered Vocabulary Discovery Flow.
 *
 * This flow allows users to ask questions in their native language and receive relevant English vocabulary, including definitions,
 * example sentences, and usage context, powered by the Gemini API. It supports vocabulary card generation and information retrieval.
 *
 * @interface AIPoweredVocabularyDiscoveryInput - The input type for the aiPoweredVocabularyDiscovery function.
 * @interface AIPoweredVocabularyDiscoveryOutput - The output type for the aiPoweredVocabularyDiscovery function.
 * @function aiPoweredVocabularyDiscovery - A function that handles the vocabulary discovery process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIPoweredVocabularyDiscoveryInputSchema = z.object({
  query: z.string().describe('The user query in their native language.'),
  motherLanguage: z.string().optional().describe('The user\u2019s mother language. Defaults to English if not provided.'),
  sessionId: z.string().optional().describe('The current session ID'),
});
export type AIPoweredVocabularyDiscoveryInput = z.infer<typeof AIPoweredVocabularyDiscoveryInputSchema>;

const AIPoweredVocabularyDiscoveryOutputSchema = z.object({
  answer: z.string().describe('The answer to the user query, including definitions, example sentences, and usage context.'),
  suggestedVocabularyCards: z.array(z.string()).describe('Suggested vocabulary cards related to the query.'),
});
export type AIPoweredVocabularyDiscoveryOutput = z.infer<typeof AIPoweredVocabularyDiscoveryOutputSchema>;

export async function aiPoweredVocabularyDiscovery(input: AIPoweredVocabularyDiscoveryInput): Promise<AIPoweredVocabularyDiscoveryOutput> {
  return aiPoweredVocabularyDiscoveryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPoweredVocabularyDiscoveryPrompt',
  input: {schema: AIPoweredVocabularyDiscoveryInputSchema},
  output: {schema: AIPoweredVocabularyDiscoveryOutputSchema},
  prompt: `You are an AI-powered vocabulary assistant. You will answer user questions about English vocabulary, providing definitions, example sentences, and usage context.

  The user is asking in {{{motherLanguage}}} language. Their question is: {{{query}}}

  Answer the question and suggest vocabulary cards that the user might want to create.
`,
});

const aiPoweredVocabularyDiscoveryFlow = ai.defineFlow(
  {
    name: 'aiPoweredVocabularyDiscoveryFlow',
    inputSchema: AIPoweredVocabularyDiscoveryInputSchema,
    outputSchema: AIPoweredVocabularyDiscoveryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
