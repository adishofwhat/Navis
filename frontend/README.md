# Unified Voice Agent

A Next.js application for interacting with voice-based AI agents (Shopify, WhatsApp, Notion) powered by Vapi.

## Features

- Voice conversations with specialized AI agents
- Real-time transcript display
- Agent switching interface
- Debug tools for development

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- [Vapi.ai](https://vapi.ai) account with API key
- Backend service (FastAPI) running via ngrok or deployed online

### Environment Setup

Create a `.env.local` file in the root of the frontend directory with the following variables:

```
# Vapi API Key
NEXT_PUBLIC_VAPI_API_KEY=your_vapi_api_key_here

# Vapi Assistant IDs
NEXT_PUBLIC_VAPI_ASSISTANT_ID_SHOPIFY=your_shopify_assistant_id_here
NEXT_PUBLIC_VAPI_ASSISTANT_ID_WHATSAPP=your_whatsapp_assistant_id_here
NEXT_PUBLIC_VAPI_ASSISTANT_ID_NOTION=your_notion_assistant_id_here

# Backend URL (ngrok or deployed backend)
NEXT_PUBLIC_BACKEND_URL=your_backend_url
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add all the environment variables in the Vercel dashboard
4. Deploy

## Backend Integration

This frontend connects to a FastAPI backend for RAG (Retrieval Augmented Generation) capabilities. Ensure your backend is:

1. Running and accessible via a public URL (ngrok, Render, etc.)
2. Configured with the `/query/{agent}` endpoint
3. Properly set in the `NEXT_PUBLIC_BACKEND_URL` environment variable

## Technologies

- Next.js App Router
- TailwindCSS
- Vapi Web SDK
- TypeScript

## License

MIT
