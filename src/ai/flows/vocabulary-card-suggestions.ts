'use server';

/**
 * @fileOverview Flow for suggesting vocabulary cards based on a user's query, including identifying existing cards.
 *
 * - suggestVocabularyCardsWithExistingCheck - A function that suggests vocabulary cards and checks for existing ones.
 * - SuggestVocabularyCardsWithExistingCheckInput - The input type for the suggestVocabularyCardsWithExistingCheck function.
 * - SuggestVocabularyCardsWithExistingCheckOutput - The return type for the suggestVocabularyCardsWithExistingCheck function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestVocabularyCardsWithExistingCheckInputSchema = z.object({
  query: z.string().describe('The user query to suggest vocabulary cards for.'),
  motherLanguage: z.string().describe('The user\u2019s mother language.'),
});
export type SuggestVocabularyCardsWithExistingCheckInput = z.infer<typeof SuggestVocabularyCardsWithExistingCheckInputSchema>;

const SuggestVocabularyCardsWithExistingCheckOutputSchema = z.object({
  cardSuggestions: z.array(
    z.object({
      word: z.string().describe('The suggested word or phrase.'),
      definition: z.string().describe('A definition of the word or phrase.'),
    })
  ).describe('A list of suggested vocabulary cards.'),
  existingCardFound: z.boolean().describe('Whether an existing card with a similar meaning was found.'),
  existingCardDetails: z.optional(z.object({
    word: z.string().describe('The word from the existing card'),
    definition: z.string().describe('The definition from the existing card'),
  })).describe('Details of the existing card if found')
});

export type SuggestVocabularyCardsWithExistingCheckOutput = z.infer<typeof SuggestVocabularyCardsWithExistingCheckOutputSchema>;

export async function suggestVocabularyCardsWithExistingCheck(input: SuggestVocabularyCardsWithExistingCheckInput): Promise<SuggestVocabularyCardsWithExistingCheckOutput> {
  return suggestVocabularyCardsWithExistingCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestVocabularyCardsWithExistingCheckPrompt',
  model: "googleai/gemini-1.5-flash",
  input: {schema: SuggestVocabularyCardsWithExistingCheckInputSchema},
  output: {schema: SuggestVocabularyCardsWithExistingCheckOutputSchema},
  prompt: `You are a helpful AI assistant that suggests vocabulary cards based on a user\'s query, and identifies if similar cards already exist. 
  The user will provide a query and their mother language.
  You should suggest vocabulary cards with English words and definitions that are relevant to the query.
  Make sure each definition is context-specific and based on the user\'s query.

  After suggesting cards, check if an existing card already exists with a similar meaning to the suggested cards. If so, set existingCardFound to true, and return the word and definition of the existing card. If not, set existingCardFound to false, and leave existingCardDetails undefined.

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
    ],
    "existingCardFound": false
  }

  {
    "cardSuggestions": [
      {
        "word": "accommodation",
        "definition": "A place to stay, such as a hotel or apartment."
      }
    ],
    "existingCardFound": true,
    "existingCardDetails": {
      "word": "accommodation",
      "definition": "The process of adapting or adjusting to someone or something."
    }
  }
  `,
});

const suggestVocabularyCardsWithExistingCheckFlow = ai.defineFlow(
  {
    name: 'suggestVocabularyCardsWithExistingCheckFlow',
    inputSchema: SuggestVocabularyCardsWithExistingCheckInputSchema,
    outputSchema: SuggestVocabularyCardsWithExistingCheckOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
