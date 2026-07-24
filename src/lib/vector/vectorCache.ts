import { MediaItem, VectorEntry } from '../../types/media';
import { cosineSimilarity, simpleTextToVector } from './similarity';

const DB_NAME = 'MediaRecommenderNoDB_V2';
const DB_VERSION = 2;
const STORE_VECTOR = 'vector_cache';
const STORE_FAVORITES = 'favorites';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in server environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_VECTOR)) {
        db.createObjectStore(STORE_VECTOR, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_FAVORITES)) {
        db.createObjectStore(STORE_FAVORITES, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveVectorCache(items: MediaItem[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_VECTOR, 'readwrite');
    const store = tx.objectStore(STORE_VECTOR);

    for (const item of items) {
      // Ignore items with junk titles or prompt leakage
      if (item.title.includes('🍿') || item.title.includes('Trouve-moi')) continue;

      const vector = simpleTextToVector(`${item.title} ${item.genres.join(' ')}`);
      const entry: VectorEntry = {
        id: item.id,
        title: item.title,
        vector,
        item,
        timestamp: Date.now(),
      };
      store.put(entry);
    }
  } catch (error) {
    console.warn('[VectorCache] Error saving vector cache:', error);
  }
}

export async function searchSimilarLocalVector(query: string, limit = 3): Promise<MediaItem[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_VECTOR, 'readonly');
    const store = tx.objectStore(STORE_VECTOR);

    const queryVec = simpleTextToVector(query);
    const entries: VectorEntry[] = await new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });

    const scored = entries
      .filter((e) => !e.item.title.includes('🍿') && !e.item.title.includes('Trouve-moi'))
      .map((entry) => ({
        item: entry.item,
        score: cosineSimilarity(queryVec, entry.vector),
      }));

    scored.sort((a, b) => b.score - a.score);

    // Strict similarity threshold (> 0.75) to prevent accidental false positive matches
    return scored
      .filter((s) => s.score >= 0.75)
      .slice(0, limit)
      .map((s) => ({ ...s.item, similarityScore: +s.score.toFixed(2) }));
  } catch (error) {
    console.warn('[VectorCache] Error searching IndexedDB vector cache:', error);
    return [];
  }
}

export async function getFavorites(): Promise<MediaItem[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_FAVORITES, 'readonly');
    const store = tx.objectStore(STORE_FAVORITES);

    return new Promise((resolve) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  } catch (error) {
    return [];
  }
}

export async function toggleFavorite(item: MediaItem): Promise<boolean> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_FAVORITES, 'readwrite');
    const store = tx.objectStore(STORE_FAVORITES);

    const existing: MediaItem | undefined = await new Promise((resolve) => {
      const req = store.get(item.id);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(undefined);
    });

    if (existing) {
      store.delete(item.id);
      return false;
    } else {
      store.put(item);
      return true;
    }
  } catch (error) {
    console.warn('[Favorites] Error toggling favorite:', error);
    return false;
  }
}
