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

  const getSourceBadgeStyle = (source: string) => {
    switch (source) {
      case 'IMDb':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'AniList':
      case 'MyAnimeList':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'BDGest':
        return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <div className="liquid-glass-card liquid-sheen rounded-3xl overflow-hidden flex flex-col justify-between group relative border border-white/10">
      {/* Top Cover Image Section */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-950">
        <img
          src={item.coverUrl}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-[#080c14]/30 to-transparent" />

        {/* Source Badge */}
        <span className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border backdrop-blur-xl ${getSourceBadgeStyle(item.source)}`}>
          {item.source}
        </span>

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 flex items-center justify-center text-sm backdrop-blur-xl transition-all active:scale-90 cursor-pointer"
          title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <span className={isFav ? 'text-amber-400 font-bold scale-110' : 'text-gray-400'}>
            ★
          </span>
        </button>

        {/* Rating & Release Year */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-xl border border-white/15 backdrop-blur-xl text-xs">
            <span className="text-amber-400 font-bold">★</span>
            <span className="font-semibold text-white">{item.rating}</span>
            <span className="text-gray-400 text-[10px]">/10</span>
          </div>
          {item.year && (
            <span className="bg-black/60 px-2.5 py-1 rounded-xl border border-white/15 backdrop-blur-xl text-gray-300 text-[11px] font-medium">
              {item.year}
            </span>
          )}
        </div>
      </div>

      {/* Media Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm text-gray-100 line-clamp-1 group-hover:text-blue-400 transition-colors">
            {item.title}
          </h3>
          {item.originalTitle && (
            <p className="text-[11px] text-gray-400 italic line-clamp-1 mt-0.5">
              {item.originalTitle}
            </p>
          )}
          <p className="text-xs text-gray-300/90 line-clamp-2 mt-2 leading-relaxed">
            {item.synopsis}
          </p>
        </div>

        {/* Genres */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.genres.slice(0, 3).map((genre, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-white/5 text-gray-300 px-2.5 py-0.5 rounded-full border border-white/10 font-medium"
            >
              {genre}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-xs font-semibold border border-blue-500/30 transition-all cursor-pointer"
          >
            Fiche Source ↗
          </a>
          {item.trailerUrl && (
            <a
              href={item.trailerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-300 text-xs font-semibold border border-red-500/30 transition-all flex items-center justify-center cursor-pointer"
              title="Bande-Annonce"
            >
              ▶
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
