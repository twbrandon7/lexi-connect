'use server';

/**
 * @fileOverview A flow for refining specific fields of a vocabulary card based on user input.
 *
 * - refineVocabularyCardFields - A function that handles the refinement of vocabulary card fields.
 * - RefineVocabularyCardFieldsInput - The input type for the refineVocabularyCardFields function.
 * - RefineVocabularyCardFieldsOutput - The return type for the refineVocabularyCardFields function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineVocabularyCardFieldsInputSchema = z.object({
  cardContent: z.string().describe('The current content of the vocabulary card.'),
  fieldToRefine: z.string().describe('The specific field of the card to refine (e.g., definition, example sentence).'),
  userInstructions: z.string().describe('The user instructions for refining the field.'),
});
export type RefineVocabularyCardFieldsInput = z.infer<typeof RefineVocabularyCardFieldsInputSchema>;

const RefineVocabularyCardFieldsOutputSchema = z.object({
  refinedContent: z.string().describe('The refined content of the specified field in the vocabulary card.'),
});
export type RefineVocabularyCardFieldsOutput = z.infer<typeof RefineVocabularyCardFieldsOutputSchema>;

export async function refineVocabularyCardFields(input: RefineVocabularyCardFieldsInput): Promise<RefineVocabularyCardFieldsOutput> {
  return refineVocabularyCardFieldsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'refineVocabularyCardFieldsPrompt',
  input: {schema: RefineVocabularyCardFieldsInputSchema},
  output: {schema: RefineVocabularyCardFieldsOutputSchema},
  prompt: `You are a helpful AI assistant that refines specific fields of a vocabulary card based on user instructions.

  The current content of the vocabulary card is:
  {{cardContent}}

  The user wants to refine the following field:
  {{fieldToRefine}}

  Here are the user's instructions for refining the field:
  {{userInstructions}}

  Please provide the refined content for the specified field, incorporating the user's instructions. Make sure the response contains ONLY the refined content and nothing else.
  `,
});

const refineVocabularyCardFieldsFlow = ai.defineFlow(
  {
    name: 'refineVocabularyCardFieldsFlow',
    inputSchema: RefineVocabularyCardFieldsInputSchema,
    outputSchema: RefineVocabularyCardFieldsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
