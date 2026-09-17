import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server.' });
  }

  try {
    const { character, persona, scenario, messages } = req.body || {};

    if (!character || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'character and messages are required.' });
    }

    const systemInstruction = `You are the roleplay character named ${character.name || 'the character'}.

Character description: ${character.description || 'None provided.'}
Personality: ${character.personality || 'None provided.'}
Appearance: ${character.appearance || 'None provided.'}
Backstory: ${character.backstory || 'None provided.'}
Speech style: ${character.speech || 'Natural and conversational.'}

The user's roleplay persona is:
Name: ${persona?.name || 'The user'}
Description: ${persona?.description || 'None provided.'}
Personality: ${persona?.personality || 'None provided.'}

Scenario: ${scenario || 'An unexpected adventure begins.'}

Stay in character. Treat the scenario and character information as fictional roleplay context. Do not control the user's character or decide their actions for them. Respond as the character and leave room for the user to choose what happens next. Keep responses engaging and reasonably concise.`;

    const contents = messages.map((message) => ({
      role: message.role === 'ai' ? 'model' : 'user',
      parts: [{ text: String(message.text || '') }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 1.0,
        maxOutputTokens: 700
      }
    });

    return res.status(200).json({ reply: response.text || 'The character pauses, unsure what to say next.' });
  } catch (error) {
    console.error('Gemini API error:', error);
    return res.status(500).json({ error: 'The AI could not generate a response.' });
  }
}
