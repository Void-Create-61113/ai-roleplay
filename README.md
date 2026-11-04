# Roleplay Realm

A customizable AI roleplay website with character creation, user personas, scenarios, and saved conversations.

## Features

- Character library with editable personality, appearance, backstory, and speech style
- User persona creator
- Scenario setup and roleplay chat
- Local browser persistence with `localStorage`
- Responsive dark UI
- Gemini API called securely from a Netlify Function

## Deploy the website and AI backend with Netlify

1. Sign in to [Netlify](https://www.netlify.com/).
2. Choose **Add new project → Import an existing project**.
3. Connect GitHub and select `Void-Create-61113/ai-roleplay`.
4. Set the base directory to the repository root. Set the publish directory to `.`. No build command is needed.
5. Deploy the site.
6. In the Netlify site dashboard, open **Site configuration → Environment variables** (the exact menu wording may vary).
7. Add an environment variable named `GEMINI_API_KEY` and set its value to your Gemini API key.
8. Trigger a new deploy so the function receives the environment variable.
9. Open the Netlify site URL and test a roleplay chat.

**Keep the API key private.** Do not paste it into `app.js`, `index.html`, GitHub files, or a public message. It belongs only in Netlify's environment variable settings.

## Local development

Run `npm install`, then `npm run dev`. Set `GEMINI_API_KEY` in your local environment before testing the chat function.

## Data and hosting notes

Netlify serves the static website and runs `netlify/functions/chat.mjs` at `/.netlify/functions/chat`. Character, persona, and chat data are currently saved in the browser where the site is opened; there are no user accounts or cloud-synced profiles yet.

GitHub Pages can host the static frontend, but it cannot run the Gemini function. Use the Netlify deployment URL for the integrated AI chat.
