import os
import asyncio
import json
import re
from pathlib import Path
from collections import deque
from crawl4ai import AsyncWebCrawler

# === CONFIG ===
BASE_URL = "https://www.notion.com/help"
OUTPUT_DIR = Path("crawl4ai_docs/notion")
MAX_TOTAL_ARTICLES = 150
MIN_WORDS = 150
CRAWL_DELAY = 1.0
MAX_DEPTH = 1

# Notion link pattern
LINK_PATTERN = re.compile(r'\[(?:[^\]]+)\]\((https://www\.notion\.com/help[^)]+)\)')

# Ensure output directory
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

async def crawl_url(url, crawler):
    results = await crawler.arun(url=url, max_pages=1, max_depth=MAX_DEPTH, crawl_delay=CRAWL_DELAY)
    if not results or not results._results:
        return [], None, None

    result = results._results[0]
    markdown = getattr(result, 'markdown', None)
    title = getattr(result, 'title', None) or f"Untitled Page"
    return LINK_PATTERN.findall(markdown or ""), title, markdown

async def main():
    print(f"🚀 Starting crawl from {BASE_URL}")
    seen_urls = set()
    article_count = 0
    urls = deque([BASE_URL])

    async with AsyncWebCrawler() as crawler:
        while urls and article_count < MAX_TOTAL_ARTICLES:
            current_url = urls.popleft()
            if current_url in seen_urls:
                continue
            seen_urls.add(current_url)

            print(f"\n🔍 Crawling: {current_url}")
            found_links, title, content = await crawl_url(current_url, crawler)

            if content:
                word_count = len(content.strip().split())
                if word_count >= MIN_WORDS:
                    article_path = OUTPUT_DIR / f"article_{article_count + 1}.json"
                    with open(article_path, "w", encoding="utf-8") as f:
                        json.dump({
                            "url": current_url,
                            "title": title,
                            "content": content,
                            "word_count": word_count
                        }, f, ensure_ascii=False, indent=2)
                    print(f"✅ Saved: {article_path.name} ({word_count} words)")
                    article_count += 1
                else:
                    print(f"⏭️ Skipped (too short): {word_count} words")

            for link in found_links:
                if link.startswith("https://www.notion.com/help") and link not in seen_urls:
                    urls.append(link)

    print(f"\n📊 Crawl complete — saved {article_count} articles")

if __name__ == "__main__":
    asyncio.run(main())
