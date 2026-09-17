# Roleplay Realm

A customizable AI roleplay website with character creation, user personas, scenarios, and saved conversations.

## Included

- Character library with editable personality, appearance, backstory, and speech style
- User persona creator
- Scenario setup screen
- Roleplay chat interface
- Local browser persistence with `localStorage`
- Responsive dark UI
- Safe API architecture: the browser calls `/api/chat` instead of containing an AI secret

## AI connection

The frontend is ready to call `POST /api/chat`. Add a server-side endpoint that accepts `character`, `scenario`, and `messages`, calls your chosen AI provider using a server-side environment variable, and returns JSON in this shape:

```json
{"reply":"The character's response..."}
```

Until that endpoint exists, the site uses a small demo response so the interface can be tested without an API key.

## Run

Because this starter is plain HTML/CSS/JavaScript, `index.html` can be served by any static host. For real AI, deploy it with a server/runtime that supports the `/api/chat` endpoint.
