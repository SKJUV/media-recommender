'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage, ToolCallEvent } from '../types/media';
import { ChatMessageItem } from './ChatMessage';
import { saveVectorCache, searchSimilarLocalVector } from '../lib/vector/vectorCache';

const SUGGESTIONS = [
  { icon: '🍿', text: 'Film de SF méconnu sorti après 2010' },
  { icon: '📚', text: 'BD Polar comme Blacksad' },
  { icon: '🤖', text: 'Anime Cyberpunk sombre' },
  { icon: '🎬', text: 'Série britannique acclamée' },
];

interface ChatWindowProps {
  onFavoriteToggled: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onFavoriteToggled }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: "Bonjour ! Je suis votre assistant Média IA. Que souhaitez-vous découvrir aujourd'hui ? (Films, Séries, Animes, Mangas, BD)",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    setInput('');
    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: query,
      timestamp: Date.now(),
    };

    const botMsgId = `bot-${Date.now()}`;
    const botMsg: ChatMessage = {
      id: botMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      toolCalls: [],
      cards: [],
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setIsLoading(true);

    // High confidence IndexedDB Vector Cache Search (Only hits if similarity >= 0.75)
    const cachedItems = await searchSimilarLocalVector(query);
    if (cachedItems.length > 0) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId
            ? {
                ...msg,
                content: `⚡ (Réponse Instantanée du Cache Vectoriel Local IndexedDB)\nVoici les résultats correspondants dans votre cache :`,
                cards: cachedItems,
                isStreaming: false,
              }
            : msg
        )
      );
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Connexion API échouée');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          if (!block.trim()) continue;

          let eventType = 'message_chunk';
          let dataStr = '';

          for (const line of block.split('\n')) {
            if (line.startsWith('event: ')) {
              eventType = line.replace('event: ', '').trim();
            } else if (line.startsWith('data: ')) {
              dataStr = line.replace('data: ', '').trim();
            }
          }

          if (dataStr) {
            try {
              const data = JSON.parse(dataStr);

              setMessages((prev) =>
                prev.map((msg) => {
                  if (msg.id !== botMsgId) return msg;

                  if (eventType === 'tool_call') {
                    const existingCalls = msg.toolCalls || [];
                    return {
                      ...msg,
                      toolCalls: [...existingCalls, data as ToolCallEvent],
                    };
                  } else if (eventType === 'message_chunk') {
                    return {
                      ...msg,
                      content: msg.content + (data.text || ''),
                    };
                  } else if (eventType === 'media_cards') {
                    const newCards = data.cards || [];
                    saveVectorCache(newCards);
                    return {
                      ...msg,
                      cards: newCards,
                    };
                  } else if (eventType === 'done') {
                    return {
                      ...msg,
                      isStreaming: false,
                    };
                  }
                  return msg;
                })
              );
            } catch (e) {
              console.warn('[ChatWindow] SSE parse error:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('[ChatWindow] Error during chat stream:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId
            ? {
                ...msg,
                content: "Désolé, une erreur s'est produite lors de la connexion au serveur.",
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto px-4 sm:px-6 py-4 overflow-hidden relative">
      {/* Messages List Container */}
      <div className="flex-1 overflow-y-auto pr-1 pb-24 space-y-4">
        {messages.map((msg) => (
          <ChatMessageItem key={msg.id} message={msg} onFavoriteToggled={onFavoriteToggled} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Bottom PWA Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-[#030508] via-[#030508]/90 to-transparent backdrop-blur-md z-30">
        {/* Suggestion Pills */}
        {messages.length < 3 && (
          <div className="mb-3 flex flex-wrap gap-2 justify-center">
            {SUGGESTIONS.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(sug.text)}
                className="flex items-center gap-1.5 text-xs bg-white/5 hover:bg-blue-600/20 text-gray-300 hover:text-white px-3.5 py-1.5 rounded-full border border-white/10 hover:border-blue-500/40 transition-all cursor-pointer backdrop-blur-md active:scale-95"
              >
                <span>{sug.icon}</span>
                <span>{sug.text}</span>
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative max-w-4xl mx-auto flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Quelle est votre envie média ? (ex: Film de SF, Anime Cyberpunk...)"
            disabled={isLoading}
            className="w-full liquid-input py-3.5 pl-5 pr-14 rounded-full text-sm placeholder-gray-500 font-medium shadow-2xl"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs disabled:opacity-40 transition-all cursor-pointer active:scale-90 shadow-md shadow-blue-500/25"
          >
            {isLoading ? (
              <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              '➔'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
