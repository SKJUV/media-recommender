/**
 * Clean natural language user queries for scrapers and APIs
 * Removes emojis, stop words, and conversational intent prefixes
 */

export function cleanUserQuery(query: string): string {
  if (!query) return '';

  // 1. Remove Emojis
  let cleaned = query.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
    ''
  );

  // 2. Remove common conversational phrases in French/English
  const intentPhrases = [
    /trouve-moi un film de/gi,
    /trouve-moi une série/gi,
    /trouve-moi un anime/gi,
    /trouve-moi une bd/gi,
    /trouve-moi/gi,
    /je veux un anime/gi,
    /je veux une série/gi,
    /je veux un film/gi,
    /je cherche/gi,
    /recommande-moi/gi,
    /quelle bd lire/gi,
    /quels sont les meilleurs/gi,
    /des exemples de/gi,
    /si j'ai adoré/gi,
    /sorti après/gi,
    /acclamées par la critique/gi,
  ];

  for (const phrase of intentPhrases) {
    cleaned = cleaned.replace(phrase, ' ');
  }

  // 3. Trim extra spaces
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned || query;
}

export interface CuratedFallback {
  category: 'movie' | 'anime' | 'comic' | 'series';
  keywords: string[];
  items: Array<{
    title: string;
    originalTitle?: string;
    type: 'movie' | 'series' | 'anime' | 'manga' | 'comic';
    source: 'IMDb' | 'SensCritique' | 'MyAnimeList' | 'AniList' | 'BDGest';
    rating: number;
    year: number;
    synopsis: string;
    coverUrl: string;
    genres: string[];
    url: string;
    trailerUrl?: string;
  }>;
}

export const CURATED_MEDIA_DATABASE: CuratedFallback[] = [
  {
    category: 'movie',
    keywords: ['sf', 'science-fiction', 'espace', 'méconnu', 'futur', 'interstellar', 'coherence', 'predestination', 'ex machina'],
    items: [
      {
        title: 'Coherence',
        type: 'movie',
        source: 'IMDb',
        rating: 7.7,
        year: 2013,
        synopsis: 'Lors du passage d une comète, huit amis réunis lors d un dîner basculent dans une réalité alternative perturbante où la physique quantique devient incontrôlable.',
        coverUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600',
        genres: ['Sci-Fi', 'Thriller', 'Mystère'],
        url: 'https://www.imdb.com/title/tt2866360/',
        trailerUrl: 'https://www.youtube.com/watch?v=sEceDz1Rodc',
      },
      {
        title: 'Predestination',
        type: 'movie',
        source: 'IMDb',
        rating: 7.4,
        year: 2014,
        synopsis: 'Un agent temporel voyage dans le temps pour empêcher un poseur de bombes de commettre ses méfaits, découvrant une boucle temporelle vertigineuse.',
        coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600',
        genres: ['Sci-Fi', 'Voyage Temporel', 'Drame'],
        url: 'https://www.imdb.com/title/tt2397535/',
        trailerUrl: 'https://www.youtube.com/watch?v=UVOf6G767lM',
      },
      {
        title: 'Upgrade',
        type: 'movie',
        source: 'IMDb',
        rating: 7.5,
        year: 2018,
        synopsis: 'Paralysé à la suite d une agression, un homme se voit implanter une puce d intelligence artificielle expérimentale qui lui redonne le contrôle de son corps.',
        coverUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600',
        genres: ['Cyberpunk', 'Action', 'Sci-Fi'],
        url: 'https://www.imdb.com/title/tt6499752/',
        trailerUrl: 'https://www.youtube.com/watch?v=1hTLGmqV5L8',
      },
    ],
  },
  {
    category: 'anime',
    keywords: ['cyberpunk', 'sombre', 'anime', 'edgerunners', 'ghost in the shell', 'psycho-pass', 'akira'],
    items: [
      {
        title: 'Psycho-Pass',
        originalTitle: 'サイコパス',
        type: 'anime',
        source: 'AniList',
        rating: 8.4,
        year: 2012,
        synopsis: 'Dans un futur dystopique où le système Sybil calcule l état mental et le potentiel criminel de chaque citoyen, des inspecteurs traquent les déviants.',
        coverUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600',
        genres: ['Cyberpunk', 'Policier', 'Psychologique'],
        url: 'https://myanimelist.net/anime/13601/Psycho-Pass',
        trailerUrl: 'https://www.youtube.com/watch?v=Y64m7yS47aE',
      },
      {
        title: 'Cyberpunk: Edgerunners',
        originalTitle: 'サイバーパンク エッジランナーズ',
        type: 'anime',
        source: 'AniList',
        rating: 8.6,
        year: 2022,
        synopsis: 'Dans une métropole obsessionnelle obsédée par la cybernétique, un adolescent de la rue devient un outlaw edgerunner prêt à tout risquer.',
        coverUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600',
        genres: ['Cyberpunk', 'Action', 'Sci-Fi'],
        url: 'https://myanimelist.net/anime/42310/Cyberpunk__Edgerunners',
        trailerUrl: 'https://www.youtube.com/watch?v=JtqIas3bYhg',
      },
    ],
  },
  {
    category: 'comic',
    keywords: ['blacksad', 'bd', 'polar', 'comics', 'bande dessinee', 'roman graphique'],
    items: [
      {
        title: 'Blacksad: Quelque part entre les ombres',
        type: 'comic',
        source: 'BDGest',
        rating: 9.3,
        year: 2000,
        synopsis: 'Le détective privé John Blacksad enquête sur le meurtre de son ancienne compagne dans un New York nocturne sublimement aquarellé par Guarnido & Canales.',
        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
        genres: ['Polar', 'Anthropomorphe', 'Aquarelle'],
        url: 'https://www.bedetheque.com/serie-722-BD-Blacksad.html',
        trailerUrl: 'https://www.youtube.com/watch?v=W3a4jL1c_gQ',
      },
      {
        title: 'Tyler Cross: Black Rock',
        type: 'comic',
        source: 'BDGest',
        rating: 8.8,
        year: 2013,
        synopsis: 'Un braqueur de banque sans scrupules se retrouve coincé dans une bourgade texane poisseuse tenue par un clan mafieux en 1950.',
        coverUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600',
        genres: ['Polar Noir', 'Action', 'BD Franco-Belge'],
        url: 'https://www.bedetheque.com/serie-39042-BD-Tyler-Cross.html',
      },
    ],
  },
];
