import { GoogleGenerativeAI } from '@google/generative-ai';
import { mediaToolsSchema } from './tools';
import { searchAllMediaSources } from '../scrapers/scraperManager';
import { ChatMessage, MediaItem, StreamChunk } from '../../types/media';
import { detectMediaTypesFromQuery } from '../scrapers/queryCleaner';

const apiKey = process.env.GEMINI_API_KEY || '';

export async function processChatStream(
  messages: ChatMessage[],
  onChunk: (chunk: StreamChunk) => void
): Promise<void> {
  const lastUserMessage = messages[messages.length - 1]?.content || 'Recommande-moi un média';
  const detectedTypes = detectMediaTypesFromQuery(lastUserMessage);

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        tools: [mediaToolsSchema],
      });

      const history = messages.slice(0, -1).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const chat = model.startChat({ history });
      const result = await chat.sendMessageStream(lastUserMessage);

      let aggregatedText = '';
      const foundCards: MediaItem[] = [];

      for await (const chunk of result.stream) {
        const functionCalls = chunk.functionCalls();
        if (functionCalls && functionCalls.length > 0) {
          for (const call of functionCalls) {
            onChunk({
              type: 'tool_call',
              toolCall: {
                tool: call.name,
                query: (call.args as any)?.query || lastUserMessage,
                status: `Exécution de ${call.name}...`,
              },
            });

            if (call.name === 'search_media_scraping') {
              const queryArg = (call.args as any)?.query || lastUserMessage;
              const typesArg = (call.args as any)?.media_types || detectedTypes;
              const items = await searchAllMediaSources({ query: queryArg, mediaTypes: typesArg });
              foundCards.push(...items);
            }
          }
        }

        const textPart = chunk.text();
        if (textPart) {
          aggregatedText += textPart;
          onChunk({ type: 'text', text: textPart });
        }
      }

      if (foundCards.length > 0) {
        onChunk({ type: 'media_cards', cards: foundCards });
      }

      onChunk({ type: 'done' });
      return;
    } catch (error) {
      console.warn('[ChatbotAgent] Gemini API stream error, using intelligent fallback agent:', error);
    }
  }

  // Resilient Standalone AI Agent (Works without API Key for instant demo/testing)
  const sourceName = detectedTypes.includes('anime')
    ? 'AniList / MyAnimeList'
    : detectedTypes.includes('comic')
    ? 'BDGest'
    : detectedTypes.includes('movie')
    ? 'IMDb / SensCritique'
    : 'IMDb, AniList, BDGest';

  onChunk({
    type: 'tool_call',
    toolCall: {
      tool: 'search_media_scraping',
      query: lastUserMessage,
      status: `Recherche live en cours sur ${sourceName}...`,
    },
  });

  const cards = await searchAllMediaSources({ query: lastUserMessage, mediaTypes: detectedTypes });

  onChunk({
    type: 'text',
    text: `Voici les meilleures recommandations trouvées sur mesure pour ta recherche "${lastUserMessage}" :`,
  });

  onChunk({ type: 'media_cards', cards });
  onChunk({ type: 'done' });
}
