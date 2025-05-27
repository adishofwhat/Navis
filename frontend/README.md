# Unified Voice Agent Frontend

A Next.js application for interacting with voice-based AI agents (Shopify, WhatsApp, Notion) powered by Vapi.

## Features

- Voice conversations with specialized AI agents
- Real-time transcript display with timestamps
- Agent switching interface with contextual responses
- Audio visualization and call status indicators
- Debug panel for development
- Error handling with toast notifications

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- [Vapi.ai](https://vapi.ai) account with API key and configured assistants
- Backend service (FastAPI) running via ngrok or deployed online

### Environment Setup

Create a `.env.local` file in the root of the frontend directory with the following variables:

```
# Vapi API Key from your Vapi dashboard
NEXT_PUBLIC_VAPI_API_KEY=your_vapi_api_key_here

# Vapi Assistant IDs created in your Vapi dashboard
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

## Component Structure

- `VoiceAgent.tsx`: Main component handling Vapi integration and voice functionality
- `AudioVisualizer.tsx`: Visual representation of audio input/output
- `ui/`: Reusable UI components (buttons, cards, toast notifications)
- `providers/`: Context providers for global state

## Vapi Integration

This project uses the @vapi-ai/web SDK to enable voice conversations:

1. Initialize Vapi with your API key
2. Configure the appropriate assistant ID based on user selection
3. Add tool configurations to connect with the backend API
4. Handle events like call-start, call-end, transcript, speech-start, etc.
5. Manage audio input/output and user interface states

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add all the environment variables in the Vercel dashboard
4. Deploy

## Backend Integration

This frontend connects to a FastAPI backend for RAG (Retrieval Augmented Generation) capabilities. Ensure your backend is:

1. Running and accessible via a public URL (ngrok, Render, etc.)
2. Configured with the `/query/{agent_key}` endpoint
3. Properly set in the `NEXT_PUBLIC_BACKEND_URL` environment variable

## Technologies

- **Next.js 14** with App Router
- **TailwindCSS** for styling
- **Vapi Web SDK** for voice conversations
- **TypeScript** for type safety
- **React Context** for state management

## Browser Compatibility

For the best experience, use:
- Chrome (recommended)
- Edge
- Firefox (may have limited microphone support)
- Safari (latest version)

## License

MIT
