# Navis

A voice-enabled AI assistant solution that combines a Next.js frontend with a FastAPI backend for domain-specific voice conversations. This project allows users to interact with specialized AI agents for Shopify, WhatsApp, and Notion through voice commands.

## Project Overview

This application enables users to:
- Have natural voice conversations with AI assistants
- Get domain-specific help for Shopify, WhatsApp, or Notion
- View real-time transcripts of conversations
- Connect to a FastAPI backend for enhanced knowledge retrieval

## Project Structure

- **frontend/**: Next.js application with Vapi integration for voice conversations
- **app.py**: FastAPI backend for RAG (Retrieval Augmented Generation)
- **data/**: Vector embeddings and indexed content for each agent domain
- **scripts/**: Utility scripts for data processing and setup

## Setup & Running

### Backend (FastAPI)

1. Install Python requirements:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the FastAPI server:
   ```bash
   uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```

3. Expose the backend with ngrok for development (required for Vapi to access your local server):
   ```bash
   ngrok http 8000
   ```
   
   Copy the generated ngrok URL (e.g., https://5fd1-2601-241-8581-3a00-a550-f3e2-6b8c-fa64.ngrok-free.app)

### Frontend (Next.js)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env.local` with required environment variables:
   ```
   # Vapi API Key from vapi.ai dashboard
   NEXT_PUBLIC_VAPI_API_KEY=your_api_key_here
   
   # Vapi Assistant IDs (created in vapi.ai dashboard)
   NEXT_PUBLIC_VAPI_ASSISTANT_ID_SHOPIFY=your_assistant_id_here
   NEXT_PUBLIC_VAPI_ASSISTANT_ID_WHATSAPP=your_assistant_id_here
   NEXT_PUBLIC_VAPI_ASSISTANT_ID_NOTION=your_assistant_id_here
   
   # Backend URL - your ngrok URL from the previous step
   NEXT_PUBLIC_BACKEND_URL=your_ngrok_url
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Frontend Deployment

The frontend can be deployed to Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in the Vercel dashboard
4. Deploy!

### Backend Deployment

The backend can be deployed to services like Render, Railway, or Heroku:

1. Create a new web service
2. Link to your GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app:app --host 0.0.0.0 --port $PORT`
5. Add environment variables as needed

## Technologies Used

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: For type safety and better developer experience
- **TailwindCSS**: For styling and responsive design
- **Vapi Web SDK**: For voice-based AI conversations
- **React Hooks**: For state management and component lifecycle

### Backend
- **FastAPI**: High-performance Python web framework
- **Sentence Transformers**: For generating text embeddings
- **FAISS**: Facebook AI Similarity Search for vector search
- **Pydantic**: For data validation
- **CORS Middleware**: For cross-origin resource sharing

### Development Tools
- **ngrok**: For exposing local servers to the internet
- **Vercel**: For frontend deployment
- **Git**: For version control

## Browser Compatibility

For the best experience, use:
- Chrome (recommended)
- Edge
- Firefox (may have limited microphone support)
- Safari (latest version)

Note: This application requires microphone access and modern browser APIs.