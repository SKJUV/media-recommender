import { MediaItem, ScrapingFilter, MediaType } from '../../types/media';
import { scrapeIMDb } from './imdbScraper';
import { scrapeMyAnimeList } from './malScraper';
import { scrapeBDGest } from './bdgestScraper';
import { detectMediaTypesFromQuery } from './queryCleaner';

export async function searchAllMediaSources(filter: ScrapingFilter): Promise<MediaItem[]> {
  const { query } = filter;
  let targetTypes: MediaType[] = filter.mediaTypes || [];

  // If no explicit media types passed, detect from user query (e.g. "anime", "film", "bd")
  if (targetTypes.length === 0) {
    targetTypes = detectMediaTypesFromQuery(query);
  }

  const tasks: Promise<MediaItem[]>[] = [];

  const searchAll = targetTypes.length === 0;

  if (searchAll || targetTypes.includes('movie') || targetTypes.includes('series')) {
    tasks.push(scrapeIMDb(query));
  }
  if (searchAll || targetTypes.includes('anime') || targetTypes.includes('manga')) {
    tasks.push(scrapeMyAnimeList(query));
  }
  if (searchAll || targetTypes.includes('comic') || targetTypes.includes('book')) {
    tasks.push(scrapeBDGest(query));
  }

  try {
    const resultsArray = await Promise.allSettled(tasks);
    let allItems: MediaItem[] = [];

    for (const res of resultsArray) {
      if (res.status === 'fulfilled') {
        allItems.push(...res.value);
      }
    }

    // Strict post-filtering by media type if specific types were requested/detected
    if (targetTypes.length > 0) {
      allItems = allItems.filter((item) => {
        if (targetTypes.includes('anime') || targetTypes.includes('manga')) {
          return item.type === 'anime' || item.type === 'manga' || item.source === 'AniList' || item.source === 'MyAnimeList';
        }
        if (targetTypes.includes('movie') || targetTypes.includes('series')) {
          return item.type === 'movie' || item.type === 'series' || item.source === 'IMDb' || item.source === 'SensCritique';
        }
        if (targetTypes.includes('comic') || targetTypes.includes('book')) {
          return item.type === 'comic' || item.source === 'BDGest';
        }
        return true;
      });
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
