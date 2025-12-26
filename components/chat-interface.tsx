'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { Response } from '@/components/ui/shadcn-io/ai/response';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Loader2 } from 'lucide-react';
import { Loader } from '@/components/ui/shadcn-io/ai/loader';
import { EventCard } from '@/components/event-card';
import { SuggestedQueries } from '@/components/suggested-queries';
import type { Message, StreamResponse, Event } from '@/lib/types';
import { callGenkitFlow } from '@/lib/genkit-client';

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentReply, setCurrentReply] = useState('');
  const [suggestedQueries, setSuggestedQueries] = useState<string[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // latest user prompt callback
  const latestPrompt = useMemo(() => {
    const lastUserMessage = [...messages]
      .reverse()
      .find((msg) => msg.role === 'user');
    return lastUserMessage ? lastUserMessage.content[0]?.text || '' : '';
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentReply]);

  const handleSubmit = async (query?: string) => {
    const userMessage = query || input.trim();
    if (!userMessage || isStreaming) return;

    // Add user message to UI
    const newUserMessage: Message = {
      role: 'user',
      content: [{ text: userMessage }],
    };
    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    setIsStreaming(true);
    setCurrentReply('');
    setSuggestedQueries([]);
    setEvents([]);

    try {
      // Call the Genkit flow with streaming
      await callGenkitFlow(
        userMessage,
        messages,
        (chunk: Partial<StreamResponse>) => {
          console.debug('[v0] Received chunk:', chunk);
          if (chunk.reply !== undefined) {
            setCurrentReply(chunk.reply);
          }
          if (chunk.suggestedQueries) {
            setSuggestedQueries(chunk.suggestedQueries);
          }
          if (chunk.events) {
            setEvents(chunk.events);
          }
          if (chunk.history) {
            // Keep only the latest 5 rounds (10 messages)
            const limitedHistory = chunk.history.slice(-10);
            setMessages(limitedHistory);
          }
        }
      );
    } catch (error) {
      console.error('[v0] Error calling Genkit flow:', error);
      const errorMessage: Message = {
        role: 'model',
        content: [
          {
            text: 'Sorry, there was an error processing your request. Please try again.',
          },
        ],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
      setCurrentReply('');
    }
  };

  return (
    <div className="flex h-screen w-full flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <h1 className="text-2xl font-semibold text-foreground">Event Search</h1>
        <p className="text-sm text-muted-foreground">
          Ask me anything about events
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h2 className="text-xl font-medium text-muted-foreground">
                Start a conversation
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Ask about events, venues, or get recommendations
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <Card
                className={`max-w-[80%] px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card text-card-foreground'
                }`}
              >
                {message.role === 'model' && (
                  <Response>{message.content[0]?.text || ''}</Response>
                )}
                {message.role === 'user' && (
                  <p className="whitespace-pre-wrap">
                    {message.content[0]?.text || ''}
                  </p>
                )}
              </Card>
            </div>
          ))}

          {/* Streaming reply */}
          {isStreaming && <Loader size={32} />}
          {isStreaming && currentReply && (
            <div className="flex justify-start">
              <Card className="max-w-[80%] bg-card px-4 py-3 text-card-foreground">
                <Response>{currentReply}</Response>
              </Card>
            </div>
          )}
        </div>

        {/* Events Section */}
        {events.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-4 text-lg font-semibold">Events</h3>
            <div className="flex flex-row overflow-x-auto gap-4">
              {events.map((event, idx) => (
                <EventCard
                  key={event.id}
                  event={event}
                  latestPrompt={latestPrompt}
                  position={idx}
                />
              ))}
            </div>
          </div>
        )}

        {/* Suggested Queries */}
        {suggestedQueries.length > 0 && !isStreaming && (
          <SuggestedQueries
            queries={suggestedQueries}
            onQueryClick={handleSubmit}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-card px-6 py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about events..."
            disabled={isStreaming}
            className="flex-1"
          />
          <Button type="submit" disabled={isStreaming || !input.trim()}>
            {isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
