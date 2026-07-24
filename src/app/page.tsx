'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { ChatWindow } from '@/components/ChatWindow';
import { FavoritesDrawer } from '@/components/FavoritesDrawer';
import { getFavorites } from '@/lib/vector/vectorCache';

export default function Home() {
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [favCount, setFavCount] = useState(0);

  const updateFavCount = async () => {
    const list = await getFavorites();
    setFavCount(list.length);
  };

  useEffect(() => {
    updateFavCount();
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col bg-[#0a0c10] text-gray-100 overflow-hidden">
      {/* Dynamic Background Glow Orbs */}
      <div className="glow-bg-purple top-[-100px] left-[-100px] animate-pulse-glow" />
      <div className="glow-bg-cyan bottom-[-100px] right-[-100px] animate-pulse-glow" />

      {/* Header Bar */}
      <Header
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        favoritesCount={favCount}
      />

      {/* Main Chat Interface */}
      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <ChatWindow onFavoriteToggled={updateFavCount} />
      </main>

      {/* Favorites Drawer Modal */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        onFavoritesUpdated={updateFavCount}
      />
    </div>
  );
}
