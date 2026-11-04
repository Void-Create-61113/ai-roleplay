import { GoogleGenAI } from '@google/genai';

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8' }
});

export default async (request) => {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  if (!process.env.GEMINI_API_KEY) {
    return json({ error: 'The Gemini API key has not been added to the Netlify site yet.' }, 500);
  }

  try {
    const { character, persona, scenario, messages } = await request.json();

    if (!character || !Array.isArray(messages) || messages.length === 0) {
      return json({ error: 'A character and at least one chat message are required.' }, 400);
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
      return json({ error: 'Send a message before requesting a character response.' }, 400);
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
      return json({ error: 'Gemini returned an empty response. Please try again.' }, 502);
    }

    return json({ reply });
  } catch (error) {
    console.error('Gemini API error:', error);
    return json({ error: 'Gemini could not generate a response. Check the Netlify function logs for details.' }, 500);
  }
};
