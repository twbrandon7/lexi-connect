'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/ai-powered-vocabulary-discovery.ts';
import '@/ai/flows/generate-audio-pronunciation.ts';
import '@/ai/flows/suggest-vocabulary-cards.ts';
import '@/ai/flows/vocabulary-card-suggestions.ts';
import '@/ai/flows/refine-vocabulary-card-fields.ts';
import '@/ai/flows/create-vocabulary-card.ts';
import '@/ai/flows/suggest-more-vocabulary.ts';
