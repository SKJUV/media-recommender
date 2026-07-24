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

  return (
    <div className={`flex flex-col gap-3 my-4 ${isUser ? 'items-end' : 'items-start'}`}>
      {/* Sender Header */}
      <div className="flex items-center gap-2 px-1">
        <div
          className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
            isUser
              ? 'bg-purple-600 text-white'
              : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white'
          }`}
        >
          {isUser ? 'U' : 'AI'}
        </div>
        <span className="text-xs font-semibold text-gray-400">
          {isUser ? 'Vous' : 'Média-Agent IA'}
        </span>
      </div>

      {/* Message Text Bubble */}
      {message.content && (
        <div
          className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-purple-600/30 border border-purple-500/30 text-purple-50 rounded-tr-none'
              : 'glass-panel text-gray-100 rounded-tl-none border-white/10'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      )}

      {/* Tool Call Events Badge */}
      {message.toolCalls && message.toolCalls.length > 0 && (
        <div className="flex flex-col gap-1 my-1">
          {message.toolCalls.map((tc, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs text-purple-300 backdrop-blur-md animate-pulse"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span className="font-mono text-[11px] font-bold text-cyan-300">[{tc.tool}]</span>
              <span>{tc.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* Embedded Media Cards Grid */}
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
