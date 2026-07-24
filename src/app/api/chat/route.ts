import { NextRequest } from 'next/server';
import { processChatStream } from '@/lib/ai/chatbotAgent';
import { ChatMessage, StreamChunk } from '@/types/media';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const messages: ChatMessage[] = body.messages || [];

    const encoder = new TextEncoder();
    const customReadable = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: string, data: any) => {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        };

        await processChatStream(messages, (chunk: StreamChunk) => {
          if (chunk.type === 'tool_call') {
            sendEvent('tool_call', chunk.toolCall);
          } else if (chunk.type === 'text') {
            sendEvent('message_chunk', { text: chunk.text });
          } else if (chunk.type === 'media_cards') {
            sendEvent('media_cards', { cards: chunk.cards });
          } else if (chunk.type === 'done') {
            sendEvent('done', { status: 'complete' });
          }
        });

        controller.close();
      },
    });

    return new Response(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('[API /api/chat] Error handling chat stream:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
