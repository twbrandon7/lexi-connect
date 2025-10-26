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
  motherLanguage: z.string().optional().describe('The user’s mother language. Defaults to English if not provided.'),
  sessionId: z.string().optional().describe('The current session ID'),
});
export type AIPoweredVocabularyDiscoveryInput = z.infer<typeof AIPoweredVocabularyDiscoveryInputSchema>;

const AIPoweredVocabularyDiscoveryOutputSchema = z.object({
  answer: z.string().describe('A concise answer to the user query, providing multiple natural-sounding alternative sentences in English. Use markdown for bullet points.'),
  suggestedVocabularyCards: z.array(
    z.object({
      wordOrPhrase: z.string().describe('The suggested English word or phrase.'),
      partOfSpeech: z.string().describe('The grammatical part of speech (e.g., noun, verb, adjective).'),
      translation: z.string().describe('The translation of the word/phrase into the user\'s mother language.'),
      exampleSentence: z.string().describe('The full example sentence from the AI\'s answer where this word/phrase appeared.'),
    })
  ).describe('A list of suggested vocabulary cards derived directly from the AI\'s answer sentences.'),
});
export type AIPoweredVocabularyDiscoveryOutput = z.infer<typeof AIPoweredVocabularyDiscoveryOutputSchema>;

export async function aiPoweredVocabularyDiscovery(input: AIPoweredVocabularyDiscoveryInput): Promise<AIPoweredVocabularyDiscoveryOutput> {
  return aiPoweredVocabularyDiscoveryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiPoweredVocabularyDiscoveryPrompt',
  input: {schema: AIPoweredVocabularyDiscoveryInputSchema},
  output: {schema: AIPoweredVocabularyDiscoveryOutputSchema},
  prompt: `You are an expert linguist and English teacher. A user is asking for help expressing something in English. Their mother language is {{{motherLanguage}}}.

The user's query is: "{{query}}"

Your task is to:
1.  First, provide a concise and friendly answer. Give multiple natural-sounding sentences in English that express the user's intent.
    *   Start with the most direct translation.
    *   Provide a few alternatives (e.g., more casual, more formal).
    *   **Format this list of sentences using markdown bullet points (e.g., using a '-' or '*' at the start of the line).**
2.  After providing the answer, identify key vocabulary words or phrases from the sentences you just generated. For each word/phrase, create a vocabulary suggestion.
3.  For each suggestion, you MUST provide:
    *   **wordOrPhrase**: The English word or phrase.
    *   **partOfSpeech**: The grammatical part of speech.
    *   **translation**: The translation of the word/phrase into the user's mother language ({{{motherLanguage}}}).
    *   **exampleSentence**: The exact sentence from your answer where the word/phrase was used (excluding the bullet point marker).

Example Interaction:
User Query: "How to express 我今天很晚吃早餐?"
Mother Language: "Traditional Chinese (Taiwan)"

Your output should be in the format:
{
  "answer": "Here are a few ways to say that:\n- I had breakfast late today.\n- I ate breakfast really late today.\n- I had a late breakfast today.\n- (More casual) Breakfast was super late for me today.",
  "suggestedVocabularyCards": [
    {
      "wordOrPhrase": "breakfast",
      "partOfSpeech": "noun",
      "translation": "早餐",
      "exampleSentence": "I had breakfast late today."
    },
    {
      "wordOrPhrase": "late",
      "partOfSpeech": "adverb",
      "translation": "晚",
      "exampleSentence": "I ate breakfast really late today."
    },
    {
      "wordOrPhrase": "casual",
      "partOfSpeech": "adjective",
      "translation": "休閒的",
      "exampleSentence": "(More casual) Breakfast was super late for me today."
    }
  ]
}
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
