# AI-assisted collaborator suggestions

`POST /api/recommendations` requires a signed-in user and a project id. Without `allowAI: true`, the server uses local keyword overlap only. If the user checks the optional AI consent box and `AI_API_KEY` is configured, the backend sends the project title, summary, research areas, keywords, and candidate departments, interests, and skills to the OpenAI Responses API. Candidate names, email addresses, and account ids are not sent. The request sets `store: false`.

AI recommendations are suggestions, not decisions. The model returns a strict JSON structure; the backend accepts only candidate keys from the current request and clamps scores. If the provider is not configured or a request fails, the app falls back to local matching.

Set `AI_API_KEY` and optionally `AI_MODEL` only on the backend. Never put an AI API key in a `VITE_` frontend variable or commit it. Users can leave the AI checkbox off and still receive local keyword matches.

The implementation uses OpenAI's Responses API and Structured Outputs. See the [official Structured Outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses).
