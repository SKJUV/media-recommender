'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage, MediaItem, ToolCallEvent } from '../types/media';
import { ChatMessageItem } from './ChatMessage';
import { saveVectorCache, searchSimilarLocalVector } from '../lib/vector/vectorCache';

const SUGGESTIONS = [
  "🍿 Trouve-moi un film de SF méconnu sorti après 2010",
  "📚 Quelle BD lire si j'ai adoré Blacksad et le genre Polar ?",
  "🤖 Je veux un anime cyberpunk sombre et intense",
  "🎬 Séries britanniques dramatiques acclamées par la critique",
];

interface ChatWindowProps {
  onFavoriteToggled: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onFavoriteToggled }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: "Bonjour ! Je suis votre assistant Média IA NoDB. Que souhaitez-vous découvrir aujourd'hui ? (Films, Séries, Animes, Mangas, Bandes Dessinées)",
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

    // Check IndexedDB local vector cache first for instant vector match
    const cachedItems = await searchSimilarLocalVector(query);
    if (cachedItems.length > 0) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId
            ? {
                ...msg,
                content: `⚡ (Réponse Instantanée du Cache Vectoriel IndexedDB local)\nVoici ce que j'ai trouvé dans mon cache vectoriel pour "${query}" :`,
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
        throw new Error('Erreur de connexion au serveur chat');
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
                    saveVectorCache(newCards); // Persist to IndexedDB vector cache
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
              console.warn('[ChatWindow] Error parsing SSE json block:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('[ChatWindow] Chat stream error:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMsgId
            ? {
                ...msg,
                content: "Désolé, une erreur s'est produite lors du traitement de la requête.",
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
    <div className="flex-1 flex flex-col max-w-5xl w-full mx-auto p-4 sm:p-6 overflow-hidden">
      {/* Scrollable Chat Message List */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {messages.map((msg) => (
          <ChatMessageItem key={msg.id} message={msg} onFavoriteToggled={onFavoriteToggled} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Pills */}
      {messages.length < 3 && (
        <div className="my-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(sug)}
              className="text-xs bg-white/5 hover:bg-purple-600/20 text-gray-300 hover:text-purple-200 px-3 py-1.5 rounded-full border border-white/10 hover:border-purple-500/30 transition-all cursor-pointer"
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="mt-2 relative flex items-center"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Décrivez ce que vous cherchez (ex: Un film de SF comme Inception, une BD polar...)"
          disabled={isLoading}
          className="w-full glass-input py-3.5 pl-4 pr-14 rounded-2xl text-sm placeholder-gray-500 focus:ring-2 focus:ring-purple-500/50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-2 p-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs disabled:opacity-40 transition-all cursor-pointer"
        >
          {isLoading ? (
            <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            'Envoyer ➔'
          )}
        </button>
      </form>
    </div>
  );
};
