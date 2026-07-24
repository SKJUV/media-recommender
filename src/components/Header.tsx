'use client';

import React from 'react';

interface HeaderProps {
  onOpenFavorites: () => void;
  favoritesCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFavorites, favoritesCount }) => {
  return (
    <header className="w-full glass-panel sticky top-0 z-40 px-4 py-3 flex items-center justify-between border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-cyan-500 to-pink-500 p-[2px] shadow-lg shadow-purple-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-bold text-lg text-white">
            🎬
          </div>
        </div>
        <div>
          <h1 className="font-extrabold text-lg tracking-tight gradient-text">
            Média-Recommender V2
          </h1>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>NoDB Architecture</span>
            <span className="text-gray-600">•</span>
            <span className="bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded text-[10px] font-medium border border-purple-500/20">
              Stealth Scraping
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenFavorites}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
        >
          <span className="text-amber-400">★</span>
          <span>Favoris</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] border border-purple-500/30">
            {favoritesCount}
          </span>
        </button>
      </div>
    </header>
  );
};
