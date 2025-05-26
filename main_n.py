from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import json
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware

# === CONFIG ===
MODEL_NAME = "all-MiniLM-L6-v2"
INDEX_PATH = Path("data/notion/index.faiss")
CHUNKS_PATH = Path("data/notion/chunks.json")
TOP_K = 5

# === INIT ===
app = FastAPI(title="Notion Help Agent")
model = SentenceTransformer(MODEL_NAME)
index = faiss.read_index(str(INDEX_PATH))
with open(CHUNKS_PATH, "r", encoding="utf-8") as f:
    chunk_data = json.load(f)

# Enable CORS for Vapi
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    question: str

@app.post("/query", response_model=str)
async def query_docs(req: QueryRequest):
    query_vec = model.encode([req.question]).astype("float32")
    distances, indices = index.search(query_vec, TOP_K)

    results = []
    for i in indices[0]:
        if 0 <= i < len(chunk_data):
            results.append(chunk_data[i])

    if not results:
        return "I couldn’t find anything helpful in the Notion docs."

    response = f"Here’s what I found for: {req.question}.\n"
    for r in results[:3]:
        snippet = r["text"].replace("\n", " ").strip()
        snippet = snippet[:500]
        response += f"\n• {snippet}..."

    return response
