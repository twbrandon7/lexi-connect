'use server';

/**
 * @fileOverview Generates audio pronunciations for vocabulary cards using the Gemini TTS API.
 *
 * - generateAudioPronunciation - A function that generates audio pronunciations for given text.
 * - GenerateAudioPronunciationInput - The input type for the generateAudioPronunciation function.
 * - GenerateAudioPronunciationOutput - The return type for the generateAudioPronunciation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';
import { googleAI } from '@genkit-ai/google-genai';

const GenerateAudioPronunciationInputSchema = z.string().describe('The text to generate audio pronunciation for.');
export type GenerateAudioPronunciationInput = z.infer<typeof GenerateAudioPronunciationInputSchema>;

const GenerateAudioPronunciationOutputSchema = z.object({
  media: z.string().describe('The audio data in WAV format as a data URI.'),
});
export type GenerateAudioPronunciationOutput = z.infer<typeof GenerateAudioPronunciationOutputSchema>;

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

export async function generateAudioPronunciation(input: GenerateAudioPronunciationInput): Promise<GenerateAudioPronunciationOutput> {
  return generateAudioPronunciationFlow(input);
}

const generateAudioPronunciationFlow = ai.defineFlow(
  {
    name: 'generateAudioPronunciationFlow',
    inputSchema: GenerateAudioPronunciationInputSchema,
    outputSchema: GenerateAudioPronunciationOutputSchema,
  },
  async (query) => {
    const ttsModel = process.env.TTS_MODEL || 'text-to-speech-1';
    
    const { media } = await ai.generate({
      model: googleAI.model(ttsModel),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'en-US-Wavenet-A' }, 
          },
        },
      },
      prompt: query,
    });
    if (!media) {
      throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    return {
      media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
    };
  }
);
