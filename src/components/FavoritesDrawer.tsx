'use client';

import React, { useEffect, useState } from 'react';
import { MediaItem } from '../types/media';
import { getFavorites, toggleFavorite } from '../lib/vector/vectorCache';

interface FavoritesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onFavoritesUpdated: () => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  onClose,
  onFavoritesUpdated,
}) => {
  const [favorites, setFavorites] = useState<MediaItem[]>([]);

  const loadFavs = async () => {
    const list = await getFavorites();
    setFavorites(list);
  };

  useEffect(() => {
    if (isOpen) {
      loadFavs();
    }
  }, [isOpen]);

  const handleRemove = async (item: MediaItem) => {
    await toggleFavorite(item);
    await loadFavs();
    onFavoritesUpdated();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(favorites, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `media_favorites_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md h-full glass-panel border-l border-white/10 flex flex-col p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 text-xl">★</span>
            <h2 className="font-bold text-lg text-white">Mes Favoris (NoDB)</h2>
            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
              {favorites.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-gray-400 hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-1">
          {favorites.length === 0 ? (
            <div className="text-center py-12 text-gray-500 text-sm">
              <p>Aucun favori enregistré pour le moment.</p>
              <p className="text-xs mt-1 text-gray-600">
                Cliquez sur l étoile ★ de n importe quelle carte média dans le chat pour la sauvegarder localement.
              </p>
            </div>
          ) : (
            favorites.map((item) => (
              <div
                key={item.id}
                className="glass-card p-3 rounded-xl flex items-center justify-between gap-3 border border-white/5"
              >
                <img
                  src={item.coverUrl}
                  alt={item.title}
                  className="w-12 h-16 object-cover rounded-lg bg-slate-900"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs text-white truncate">{item.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-1">
                    <span className="text-amber-400 font-bold">★ {item.rating}</span>
                    <span>•</span>
                    <span>{item.source}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(item)}
                  className="text-gray-500 hover:text-red-400 p-2 text-xs cursor-pointer"
                  title="Supprimer"
                >
                  🗑
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {favorites.length > 0 && (
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={handleExportJSON}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
            >
              Export JSON de mes Favoris 📥
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
