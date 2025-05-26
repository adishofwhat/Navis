import os
import json
import faiss
import numpy as np
from pathlib import Path
from tqdm import tqdm
from sentence_transformers import SentenceTransformer

# === CONFIG ===
DOCS_PATH = Path("crawl4ai_docs/shopify")
OUT_PATH = Path("data/shopify")
OUT_PATH.mkdir(parents=True, exist_ok=True)
MODEL_NAME = "all-MiniLM-L6-v2"
CHUNK_SIZE = 500  # ~characters
CHUNK_OVERLAP = 100  # ~characters

# === LOAD EMBEDDING MODEL ===
print("🔧 Loading embedding model...")
model = SentenceTransformer(MODEL_NAME)

# === HELPER: CHUNK TEXT ===
def chunk_text(text, size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    chunks = []
    start = 0
    while start < len(text):
        end = start + size
        chunk = text[start:end].strip()
        if len(chunk.split()) > 10:  # Skip short chunks
            chunks.append(chunk)
        start += size - overlap
    return chunks

# === STEP 1: LOAD & CHUNK ARTICLES ===
print("📖 Loading and chunking articles...")
all_chunks = []
for article_file in tqdm(sorted(DOCS_PATH.glob("article_*.json"))):
    with open(article_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    url = data["url"]
    title = data["title"]
    content = data["content"]

    chunks = chunk_text(content)
    for idx, chunk in enumerate(chunks):
        all_chunks.append({
            "chunk_id": f"{article_file.stem}_{idx}",
            "text": chunk,
            "title": title,
            "source_url": url
        })

print(f"✅ Total chunks: {len(all_chunks)}")

# === STEP 2: EMBED ALL CHUNKS ===
print("🔢 Embedding all chunks...")
texts = [c["text"] for c in all_chunks]
embeddings = model.encode(texts, show_progress_bar=True)
embeddings = np.array(embeddings).astype("float32")

# === STEP 3: BUILD FAISS INDEX ===
print("📦 Building FAISS index...")
dim = embeddings.shape[1]
index = faiss.IndexFlatL2(dim)
index.add(embeddings)

faiss.write_index(index, str(OUT_PATH / "index.faiss"))

# === STEP 4: SAVE CHUNK METADATA ===
print("🧾 Saving chunk metadata...")
with open(OUT_PATH / "chunks.json", "w", encoding="utf-8") as f:
    json.dump(all_chunks, f, ensure_ascii=False, indent=2)

print("✅ Done — index and chunks saved.")
