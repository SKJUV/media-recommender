import { MediaItem, ScrapingFilter } from '../../types/media';
import { scrapeIMDb } from './imdbScraper';
import { scrapeMyAnimeList } from './malScraper';
import { scrapeBDGest } from './bdgestScraper';

export async function searchAllMediaSources(filter: ScrapingFilter): Promise<MediaItem[]> {
  const { query, mediaTypes } = filter;
  const tasks: Promise<MediaItem[]>[] = [];

  const shouldSearchAll = !mediaTypes || mediaTypes.length === 0;

  if (shouldSearchAll || mediaTypes.includes('movie') || mediaTypes.includes('series')) {
    tasks.push(scrapeIMDb(query));
  }
  if (shouldSearchAll || mediaTypes.includes('anime') || mediaTypes.includes('manga')) {
    tasks.push(scrapeMyAnimeList(query));
  }
  if (shouldSearchAll || mediaTypes.includes('comic') || mediaTypes.includes('book')) {
    tasks.push(scrapeBDGest(query));
  }

  try {
    const resultsArray = await Promise.allSettled(tasks);
    const allItems: MediaItem[] = [];

    for (const res of resultsArray) {
      if (res.status === 'fulfilled') {
        allItems.push(...res.value);
      }
    }

    // Deduplicate items by title
    const seen = new Set<string>();
    const uniqueItems = allItems.filter((item) => {
      const lower = item.title.toLowerCase();
      if (seen.has(lower)) return false;
      seen.add(lower);
      return true;
    });

    return uniqueItems.sort((a, b) => b.rating - a.rating);
  } catch (error) {
    console.error('[ScraperManager] Error orchestrating scrapers:', error);
    return [];
  }
}
