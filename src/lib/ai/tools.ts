import { FunctionDeclaration, FunctionDeclarationsTool, SchemaType } from '@google/generative-ai';

export const searchMediaScrapingDeclaration: FunctionDeclaration = {
  name: 'search_media_scraping',
  description: 'Déclenche le pipeline de scraping multi-sources (IMDb, AniList/MyAnimeList, BDGest) pour récupérer des fiches médias.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      query: {
        type: SchemaType.STRING,
        description: 'Termes de recherche (ex: "cyberpunk", "black mirror", "science-fiction")',
      },
      media_types: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING },
        description: 'Types de média souhaités: ["movie", "series", "anime", "manga", "comic"]',
      },
      min_rating: {
        type: SchemaType.NUMBER,
        description: 'Note minimale sur 10 (ex: 7.5)',
      },
    },
    required: ['query'],
  },
};

export const fetchMediaDetailsDeclaration: FunctionDeclaration = {
  name: 'fetch_media_details',
  description: 'Extrait en direct les détails et avis d un film, anime ou BD spécifique.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      media_url: {
        type: SchemaType.STRING,
        description: 'URL du média à analyser',
      },
    },
    required: ['media_url'],
  },
};

export const filterRecommendationsByMoodDeclaration: FunctionDeclaration = {
  name: 'filter_recommendations_by_mood',
  description: 'Applique un filtre d ambiance ou d émotion sur les fiches médias (ex: "sombre", "feel-good", "mind-bending").',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      mood: {
        type: SchemaType.STRING,
        description: 'L ambiance recherchée (ex: "melancolique", "epique", "drole")',
      },
    },
    required: ['mood'],
  },
};

export const mediaToolsSchema: FunctionDeclarationsTool = {
  functionDeclarations: [
    searchMediaScrapingDeclaration,
    fetchMediaDetailsDeclaration,
    filterRecommendationsByMoodDeclaration,
  ],
};
