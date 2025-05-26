from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import faiss
import json
import numpy as np
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Unified Voice Agent")

# Enable CORS (optional, good for local + Vercel frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Config
MODEL_NAME = "paraphrase-MiniLM-L3-v2"
TOP_K = 5
AGENTS = {
    "shopify": {
        "index": "data/shopify/index.faiss",
        "chunks": "data/shopify/chunks.json",
    },
    "whatsapp": {
        "index": "data/whatsapp/index.faiss",
        "chunks": "data/whatsapp/chunks.json",
    },
    "notion": {
        "index": "data/notion/index.faiss",
        "chunks": "data/notion/chunks.json",
    },
}

# Load model
model = SentenceTransformer(MODEL_NAME)

# Load all indexes and chunks into memory
vector_data = {}

for agent, paths in AGENTS.items():
    try:
        index = faiss.read_index(paths["index"])
        with open(paths["chunks"], "r", encoding="utf-8") as f:
            chunks = json.load(f)
        vector_data[agent] = {
            "index": index,
            "chunks": chunks
        }
        print(f"Loaded {agent} knowledge base successfully")
    except Exception as e:
        print(f"Error loading {agent} knowledge base: {e}")

# Request schema
class QueryRequest(BaseModel):
    question: str

# Shared query handler
def query_agent(agent_key: str, question: str) -> str:
    if agent_key not in vector_data:
        return "That assistant does not exist."

    index = vector_data[agent_key]["index"]
    chunks = vector_data[agent_key]["chunks"]

    query_vec = model.encode([question]).astype("float32")
    distances, indices = index.search(query_vec, TOP_K)

    results = []
    for i in indices[0]:
        if 0 <= i < len(chunks):
            results.append(chunks[i])

    if not results:
        return f"Sorry, I couldn't find anything helpful in the {agent_key.capitalize()} docs."

    response = f"Here's what I found for: {question}.\n"
    for r in results[:3]:
        snippet = r["text"].replace("\n", " ").strip()[:500]
        # Add source URL when available
        source = f" (Source: {r['url']})" if "url" in r else ""
        response += f"\n• {snippet}...{source}"
    return response

# Routes
@app.post("/query/{agent_key}")
async def query(agent_key: str, req: QueryRequest):
    return query_agent(agent_key, req.question)
