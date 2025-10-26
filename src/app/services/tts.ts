'use server';

import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// This will be initialized once per server instance.
const ttsClient = new TextToSpeechClient();

/**
 * Synthesizes speech from text and returns it as a base64 encoded audio string.
 * @param text The text to synthesize.
 * @returns A data URI string (e.g., "data:audio/mp3;base64,...").
 */
export async function synthesizeSpeech(text: string): Promise<string> {
  // Use the environment variable for the voice name, or default to a WaveNet voice.
  const voiceName = process.env.TTS_MODEL || 'en-US-Wavenet-A';

  const request = {
    input: { text: text },
    // Note: The 'name' is the model/voice name.
    voice: { languageCode: 'en-US', name: voiceName },
    audioConfig: { audioEncoding: 'MP3' as const },
  };

  try {
    const [response] = await ttsClient.synthesizeSpeech(request);
    
    if (!response.audioContent) {
      throw new Error('Audio content is missing in the TTS response.');
    }

    // The audioContent is a Buffer in Node.js environments.
    const audioBase64 = (response.audioContent as Buffer).toString('base64');
    
    return `data:audio/mp3;base64,${audioBase64}`;

  } catch (error) {
    console.error('Text-to-Speech synthesis failed:', error);
    // Depending on your error handling strategy, you might want to re-throw,
    // return a specific error message, or return a silent audio file.
    throw new Error('Failed to generate audio pronunciation.');
  }
}
