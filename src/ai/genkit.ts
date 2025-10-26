import {genkit, GenkitPlugin} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {googleCloud} from '@genkit-ai/google-cloud';

// Conditionally configure Genkit plugins based on environment
const plugins: GenkitPlugin[] = [];
if (process.env.GEMINI_API_KEY) {
  // Use google-genai plugin if an API key is provided
  plugins.push(googleAI());
  // The googleCloud plugin is added to support additional services like high-quality TTS
  plugins.push(googleCloud); 
} else {
  // Use google-cloud plugin for ADC support
  plugins.push(googleCloud);
}

export const ai = genkit({
  plugins: plugins,
});
