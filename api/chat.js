import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'The Gemini API key has not been added to the Vercel project yet.' });
  }

  try {
    const { character, persona, scenario, messages } = req.body || {};

    if (!character || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'A character and at least one chat message are required.' });
    }

    const safeText = (value, max = 3000) => String(value ?? '').slice(0, max);
    const systemInstruction = `You are roleplaying as the fictional character named ${safeText(character.name, 100) || 'the character'}.

Character description: ${safeText(character.description)}
Personality: ${safeText(character.personality)}
Appearance: ${safeText(character.appearance)}
Backstory: ${safeText(character.backstory)}
Speech style: ${safeText(character.speech, 1000) || 'Natural and conversational.'}

The user's roleplay persona:
Name: ${safeText(persona?.name, 100) || 'The user'}
Description: ${safeText(persona?.description)}
Personality: ${safeText(persona?.personality)}

Scenario: ${safeText(scenario, 2000) || 'An unexpected adventure begins.'}

Stay in character and treat these details as fictional roleplay context. Do not control the user's character or decide their actions, thoughts, or dialogue. Respond as your character and leave room for the user to choose what happens next. Keep replies engaging and reasonably concise. Keep the roleplay appropriate for a general audience.`;

    const contents = messages.slice(-24).map((message) => ({
      role: message.role === 'ai' ? 'model' : 'user',
      parts: [{ text: safeText(message.text, 6000) }]
    })).filter((message) => message.parts[0].text.trim());

    if (!contents.length || contents[contents.length - 1].role !== 'user') {
      return res.status(400).json({ error: 'Send a message before requesting a character response.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents,
      config: {
        systemInstruction,
        temperature: 1,
        maxOutputTokens: 700
      }
    });

    const reply = response.text?.trim();
    if (!reply) {
      return res.status(502).json({ error: 'Gemini returned an empty response. Please try again.' });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('Gemini API error:', error);
    return res.status(500).json({ error: 'Gemini could not generate a response. Check the Vercel function logs for details.' });
  }
}
