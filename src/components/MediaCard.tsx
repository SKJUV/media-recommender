'use client';

import React, { useState } from 'react';
import { MediaItem } from '../types/media';
import { toggleFavorite } from '../lib/vector/vectorCache';

interface MediaCardProps {
  item: MediaItem;
  onFavoriteToggled?: () => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ item, onFavoriteToggled }) => {
  const [isFav, setIsFav] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const added = await toggleFavorite(item);
    setIsFav(added);
    if (onFavoriteToggled) onFavoriteToggled();
  };

  const getSourceBadgeColor = (source: string) => {
    switch (source) {
      case 'IMDb': return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'AniList': case 'MyAnimeList': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      case 'BDGest': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default: return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col justify-between group border border-white/10 hover:border-purple-500/40 relative">
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        {/* Poster Image */}
        <img
          src={item.coverUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

        {/* Source Badge */}
        <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-md ${getSourceBadgeColor(item.source)}`}>
          {item.source}
        </span>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 w-8 h-8 rounded-full glass-panel flex items-center justify-center text-sm transition-transform active:scale-90 hover:bg-white/20 cursor-pointer"
          title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <span className={isFav ? 'text-amber-400 font-bold scale-110' : 'text-gray-400'}>
            ★
          </span>
        </button>

        {/* Rating & Year */}
        <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-lg border border-white/10 backdrop-blur-md">
            <span className="text-amber-400 font-bold">★</span>
            <span className="font-semibold text-white">{item.rating}</span>
            <span className="text-gray-400 text-[10px]">/10</span>
          </div>
          {item.year && (
            <span className="bg-black/60 px-2 py-0.5 rounded-lg border border-white/10 backdrop-blur-md text-gray-300 text-[11px]">
              {item.year}
            </span>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm text-gray-100 line-clamp-1 group-hover:text-purple-300 transition-colors">
            {item.title}
          </h3>
          {item.originalTitle && (
            <p className="text-[11px] text-gray-400 italic line-clamp-1 mb-1">
              {item.originalTitle}
            </p>
          )}
          <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
            {item.synopsis}
          </p>
        </div>

        {/* Genres */}
        <div className="mt-3 flex flex-wrap gap-1">
          {item.genres.slice(0, 3).map((genre, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-white/5 text-gray-300 px-2 py-0.5 rounded-md border border-white/5"
            >
              {genre}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 text-xs font-semibold border border-purple-500/30 transition-all"
          >
            Fiche Source ↗
          </a>
          {item.trailerUrl && (
            <a
              href={item.trailerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-300 text-xs font-semibold border border-red-500/30 transition-all flex items-center justify-center"
              title="Regarder la Bande-Annonce"
            >
              ▶
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
