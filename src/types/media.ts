export type MediaType = 'movie' | 'series' | 'anime' | 'manga' | 'comic' | 'book';

export interface MediaItem {
  id: string;
  title: string;
  originalTitle?: string;
  type: MediaType;
  source: 'IMDb' | 'SensCritique' | 'MyAnimeList' | 'AniList' | 'BDGest';
  rating: number; // 0.0 - 10.0
  year?: number;
  synopsis: string;
  coverUrl: string;
  genres: string[];
  url: string;
  trailerUrl?: string;
  authorOrDirector?: string;
  episodesOrVolumes?: string;
  similarityScore?: number;
}

export interface ScrapingFilter {
  query: string;
  mediaTypes?: MediaType[];
  genres?: string[];
  minYear?: number;
  maxYear?: number;
  minRating?: number;
}

export interface ToolCallEvent {
  tool: string;
  query?: string;
  status: string;
}

export interface StreamChunk {
  type: 'text' | 'tool_call' | 'media_cards' | 'error' | 'done';
  text?: string;
  toolCall?: ToolCallEvent;
  cards?: MediaItem[];
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  toolCalls?: ToolCallEvent[];
  cards?: MediaItem[];
  isStreaming?: boolean;
}

export interface VectorEntry {
  id: string;
  title: string;
  vector: number[];
  item: MediaItem;
  timestamp: number;
}
