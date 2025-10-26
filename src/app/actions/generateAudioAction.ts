'use server';

import { synthesizeSpeech } from '@/app/services/tts';

/**
 * A Next.js Server Action to safely generate audio from text.
 * @param text The text to convert to speech.
 * @returns An object with the data URI of the audio or an error message.
 */
export async function generateAudioAction(text: string): Promise<{ media?: string; error?: string }> {
  try {
    const audioDataUri = await synthesizeSpeech(text);
    return { media: audioDataUri };
  } catch (error) {
    console.error('Audio generation action failed:', error);
    return { error: 'Failed to generate audio.' };
  }
}
