# Roleplay Realm

A customizable AI roleplay website with character creation, user personas, scenarios, and saved conversations.

## Features

- Character library with editable personality, appearance, backstory, and speech style
- User persona creator
- Scenario setup and roleplay chat
- Local browser persistence with `localStorage`
- Responsive dark UI
- Gemini API called securely from a Vercel serverless function

## Deploy the full website and AI backend

This project is designed to deploy on **Vercel**. Vercel serves the static website from the repository root and runs the `api/chat.js` serverless function at `/api/chat`.

1. Sign in to Vercel.
2. Choose **Add New → Project**.
3. Import the GitHub repository `Void-Create-61113/ai-roleplay`.
4. Keep the project root as `./`. No build command or output directory is needed for this plain HTML/CSS/JS project.
5. Before or after the first deployment, open the Vercel project **Settings → Environment Variables**.
6. Add an environment variable named `GEMINI_API_KEY` and paste in your Gemini API key as its value. Select the Production environment (and Preview too if you want preview deployments to use AI).
7. Save the variable, then go to **Deployments** and redeploy the latest deployment so the new variable is available.
8. Open the Vercel deployment URL, usually ending in `.vercel.app`.

**Keep the API key private.** Do not paste it into `app.js`, `index.html`, GitHub files, or a public message. It belongs only in Vercel's Environment Variables settings.

## Local development

Install dependencies with `npm install`, then run `npm run dev` using the Vercel CLI. Set `GEMINI_API_KEY` in your local environment before testing the API.

## GitHub Pages note

GitHub Pages can host the static frontend, but it cannot run this project's `/api/chat` function. For the integrated Gemini experience, open the Vercel deployment URL instead. Character, persona, and chat data are currently saved in the browser where the site is opened; there are no user accounts or cloud-synced profiles yet.
