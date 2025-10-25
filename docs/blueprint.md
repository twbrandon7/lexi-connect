# **App Name**: LexiConnect

## Core Features:

- AI-Powered Vocabulary Discovery: Users can ask questions in their native language to discover relevant English vocabulary, powered by the Gemini API. Includes definitions, example sentences, and usage context. Includes a tool which determines if vocabulary cards should be generated, or if additional information about a pre-existing vocabulary card should be shown.
- Real-time Collaborative Sessions: Multiple participants can simultaneously contribute to a shared vocabulary collection in real-time. Uses Firebase Realtime Database for live updates.
- Vocabulary Card Management: Create, edit, and manage vocabulary cards with primary content (word/phrase, meaning, part of speech, pronunciation, example sentence, translation) and secondary content (other meanings, additional examples, related cards).
- Gemini TTS Audio Pronunciation: Generates audio pronunciations for vocabulary cards using Gemini TTS API, focusing on US English accent.
- Personal Vocabulary Bank: Users can add vocabulary cards to their personal bank for later review and practice, persisting across sessions.
- Flashcard Practice Mode: Practice vocabulary using a flashcard mode with front (word/phrase or translation) and back (definition, example, pronunciation). Users can mark cards as 'know' or 'need review'.
- Session Management: Users can create and manage sessions. Sessions can be public and private.

## Style Guidelines:

- Primary color: Soft violet (#A084CA), conveying intellect and collaboration.
- Background color: Light, desaturated violet (#F0F0F5). It maintains a soft tie to the primary color, without overpowering the layout.
- Accent color: Pale rose (#EBC7E8), highlighting key interactive elements, and differing notably from the primary color in brightness and saturation to draw the user's attention.
- Body and headline font: 'Inter', a grotesque sans-serif which looks modern, machined, objective and neutral, making it suitable for both headlines and body text.
- Use simple, clear icons to represent different vocabulary categories and actions.
- Clean and intuitive layout with clear visual hierarchy, emphasizing key information and actions.
- Subtle animations for card transitions and user interactions to enhance engagement.