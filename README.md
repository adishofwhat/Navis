# Unified Voice Agent

A voice-enabled AI assistant project that combines a Next.js frontend with a FastAPI backend for conversational voice interactions with domain-specific agents.

## Project Structure

- **frontend/**: Next.js application with Vapi integration for voice conversations
- **app.py**: FastAPI backend for RAG (Retrieval Augmented Generation)
- **data/**: Vector embeddings and indexed content for each agent domain

## Setup & Running

### Backend (FastAPI)

1. Install Python requirements:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the FastAPI server:
   ```bash
   uvicorn app:app --reload
   ```

3. Expose the backend with ngrok (for development):
   ```bash
   ngrok http 8000
   ```

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
   NEXT_PUBLIC_VAPI_API_KEY=your_api_key_here
   NEXT_PUBLIC_VAPI_ASSISTANT_ID_SHOPIFY=your_assistant_id_here
   NEXT_PUBLIC_VAPI_ASSISTANT_ID_WHATSAPP=your_assistant_id_here
   NEXT_PUBLIC_VAPI_ASSISTANT_ID_NOTION=your_assistant_id_here
   NEXT_PUBLIC_BACKEND_URL=your_ngrok_url
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment

For detailed deployment instructions, see:
- [Frontend Deployment Guide](./frontend/README.md#deployment)
- Backend can be deployed on Render, Railway, or similar services

## Features

- Voice-based conversations with specialized AI agents
- Domain-specific knowledge bases for Shopify, WhatsApp, and Notion
- Real-time transcript display
- Debug tools for development

## Technologies

- **Frontend**: Next.js, TailwindCSS, TypeScript, Vapi Web SDK
- **Backend**: FastAPI, sentence-transformers, FAISS
- **Data**: Vector embeddings, JSON chunks