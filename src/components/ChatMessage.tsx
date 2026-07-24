'use client';

import React from 'react';
import { ChatMessage as ChatMessageType } from '../types/media';
import { MediaCard } from './MediaCard';

interface ChatMessageProps {
  message: ChatMessageType;
  onFavoriteToggled?: () => void;
}

export const ChatMessageItem: React.FC<ChatMessageProps> = ({ message, onFavoriteToggled }) => {
  const isUser = message.role === 'user';

  const getToolDisplayName = (toolName: string) => {
    switch (toolName) {
      case 'search_media_scraping': return 'Recherche Live Multi-Sources';
      case 'fetch_media_details': return 'Extraction Détails Source';
      case 'filter_recommendations_by_mood': return 'Filtre d Ambiance Sémantique';
      default: return toolName;
    }
  };

  return (
    <div className={`flex flex-col gap-2.5 my-3 ${isUser ? 'items-end' : 'items-start'}`}>
      {/* Sender Indicator */}
      <div className="flex items-center gap-2 px-1">
        <div
          className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
            isUser
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-cyan-500/20'
          }`}
        >
          {isUser ? 'YOU' : 'AI'}
        </div>
        <span className="text-[11px] font-semibold text-gray-400">
          {isUser ? 'Vous' : 'Média-Agent IA'}
        </span>
      </div>

      {/* Message Text Bubble */}
      {message.content && (
        <div
          className={`max-w-[90%] sm:max-w-[80%] p-4 rounded-3xl text-sm leading-relaxed ${
            isUser
              ? 'bg-blue-600/30 border border-blue-500/35 text-white rounded-tr-none shadow-lg'
              : 'liquid-glass text-gray-100 rounded-tl-none border-white/10'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      )}

      {/* Active Tool Execution Badge */}
      {message.toolCalls && message.toolCalls.length > 0 && (
        <div className="flex flex-col gap-1.5 my-1">
          {message.toolCalls.map((tc, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-200 backdrop-blur-xl animate-pulse"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span className="font-semibold text-cyan-300">
                {getToolDisplayName(tc.tool)}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-300">{tc.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* Media Cards Grid */}
      {message.cards && message.cards.length > 0 && (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
          {message.cards.map((card) => (
            <MediaCard key={card.id} item={card} onFavoriteToggled={onFavoriteToggled} />
          ))}
        </div>
      )}
    </div>
  );
};
