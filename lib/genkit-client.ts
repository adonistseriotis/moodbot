import { streamFlow } from 'genkit/beta/client';
import type { Message, StreamResponse } from './types';

// Replace this with your actual Firebase function URL
const GENKIT_FLOW_URL =
  'https://europe-west1-wheretogo-e5f51.cloudfunctions.net/smartSearch';

export async function callGenkitFlow(
  query: string,
  history: Message[],
  onChunk: (chunk: Partial<StreamResponse>) => void
): Promise<void> {
  // Keep only the latest 10 rounds (20 messages) before sending
  const limitedHistory = history.slice(-20);

  const result = streamFlow({
    url: GENKIT_FLOW_URL,
    input: {
      prompt: query,
      history: limitedHistory,
    },
  });

  for await (const chunk of result.stream) {
    console.debug('[v0] Received chunk:', chunk);
    onChunk(chunk);
  }

  return onChunk(await result.output);
}
