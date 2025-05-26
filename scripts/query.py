import faiss
import json
import numpy as np
from pathlib import Path
from sentence_transformers import SentenceTransformer

# === CONFIG ===
INDEX_PATH = Path("data/shopify/index.faiss")
CHUNKS_PATH = Path("data/shopify/chunks.json")
MODEL_NAME = "all-MiniLM-L6-v2"
TOP_K = 5

# === LOAD MODEL, INDEX, METADATA ===
print("🔧 Loading embedding model and FAISS index...")
model = SentenceTransformer(MODEL_NAME)
index = faiss.read_index(str(INDEX_PATH))

with open(CHUNKS_PATH, "r", encoding="utf-8") as f:
    chunk_data = json.load(f)

print(f"✅ Ready: {len(chunk_data)} chunks indexed")

# === FUNCTION TO QUERY INDEX ===
def query_docs(question, top_k=TOP_K):
    query_vec = model.encode([question]).astype("float32")
    distances, indices = index.search(query_vec, top_k)

    results = []
    for i in indices[0]:
        if 0 <= i < len(chunk_data):
            results.append(chunk_data[i])

    return results

if __name__ == "__main__":
    q = input("🔍 Ask a Shopify question: ")
    results = query_docs(q)

    for idx, r in enumerate(results):
        print(f"\nResult {idx+1}:")
        print(f"Title: {r['title']}")
        print(f"URL: {r['source_url']}")
        print(f"Text:\n{r['text'][:400]}...")