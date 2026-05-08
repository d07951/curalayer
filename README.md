<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b94c61f9-31aa-461a-8b6e-3c7d3d4829d9

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Real Clinical Chat + VaaS Demo Hit

Current flow:

- User input first goes through local demo semantic matching.
- If matched, app directly returns rich VaaS UI payload (demo effect).
- If not matched, app calls LLM chat API for real text response.
- LLM system prompt is constrained to clinical topics only.

## Cloudflare Deployment (Pages + Worker)

### 1) Deploy Worker API

Worker source lives in `cf-worker/src/index.ts`.

```bash
cd cf-worker
npm install
npx wrangler login
npx wrangler secret put OPENAI_API_KEY
npm run deploy
```

After deploy, copy your Worker URL, e.g.:
`https://curalayer-chat-api.<subdomain>.workers.dev`

### 2) Configure Frontend

Set frontend env variable:

```bash
VITE_CHAT_API_URL=https://curalayer-chat-api.<subdomain>.workers.dev/api/chat
```

Then build/deploy frontend to Cloudflare Pages (or run locally with `npm run dev`).

### 3) Optional same-domain routing

If you prefer same-origin `/api/chat`, configure Cloudflare routing (Pages Functions or route rule) to proxy `/api/chat` to this Worker.
