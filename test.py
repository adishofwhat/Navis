import asyncio
import re
from crawl4ai import AsyncWebCrawler

# Regex to find Shopify internal help links
LINK_PATTERN = re.compile(r'\[(?:[^\]]+)\]\((https://help\.shopify\.com/[^)]+)\)')

async def main():
    print("🔍 Crawling homepage...")
    async with AsyncWebCrawler() as crawler:
        results = await crawler.arun(
            url="https://help.shopify.com/en",
            max_pages=1,
            max_depth=1
        )

        if not results._results or not hasattr(results._results[0], 'markdown'):
            print("❌ No valid content returned.")
            return

        first_page = results._results[0]
        markdown = getattr(first_page, 'markdown', None)

        if not markdown:
            print("❌ No markdown found in result.")
            return

        links = LINK_PATTERN.findall(markdown)
        print(f"✅ Extracted {len(links)} links.")
        for link in links[:10]:
            print("🔗", link)

if __name__ == "__main__":
    asyncio.run(main())