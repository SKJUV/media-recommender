'use client';

import React from 'react';

interface HeaderProps {
  onOpenFavorites: () => void;
  favoritesCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenFavorites, favoritesCount }) => {
  return (
    <header className="w-full liquid-glass sticky top-0 z-40 px-4 sm:px-8 py-3.5 flex items-center justify-between border-b border-white/10">
      <div className="flex items-center gap-3.5">
        <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-[1.5px] shadow-lg shadow-blue-500/20">
          <div className="w-full h-full bg-[#080c14] rounded-[14px] flex items-center justify-center font-black text-base text-white">
            M
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-base sm:text-lg tracking-tight apple-gradient-text">
              Media Recommender
            </h1>
            <span className="bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-blue-500/25 tracking-wide">
              V2.0 Pro
            </span>
          </div>
          <p className="text-[11px] text-gray-400 font-normal">
            NoDB Architecture • Multi-Sources Live API
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenFavorites}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-card text-xs font-medium text-gray-200 hover:text-white transition-all cursor-pointer active:scale-95"
        >
          <span className="text-amber-400 font-bold">★</span>
          <span className="hidden sm:inline">Favoris</span>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[11px] font-semibold">
            {favoritesCount}
          </span>
        </button>
      </div>
    </header>
  );
};
