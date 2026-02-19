'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ChatContainer, { Message } from '@/components/ChatContainer';

interface ApiMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface HistoryResponse {
  messages: ApiMessage[];
  sessionKey?: string;
  error?: string;
}

interface SendResponse {
  success: boolean;
  sent: boolean;
  error?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hey King! 🐾 I'm here and ready to help. What would you like to work on?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionKey, setSessionKey] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/session/history');
        if (!response.ok) {
          console.warn('Failed to fetch session history');
          return;
        }
        const data: HistoryResponse = await response.json();
        
        if (data.sessionKey) {
          setSessionKey(data.sessionKey);
        }

        if (data.messages && data.messages.length > 0) {
          // Merge with welcome message, avoiding duplicates
          const apiMessages: Message[] = data.messages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp),
          }));

          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const newMessages = apiMessages.filter((m) => !existingIds.has(m.id));
            return [...prev, ...newMessages];
          });
        }
      } catch (err) {
        console.error('Error fetching history:', err);
      }
    };

    fetchHistory();
  }, []);

  // Poll for new messages after sending
  const pollForResponse = useCallback(async () => {
    // Wait a bit for the assistant to respond
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
      const response = await fetch('/api/session/history');
      if (!response.ok) return;

      const data: HistoryResponse = await response.json();
      if (data.messages && data.messages.length > 0) {
        const apiMessages: Message[] = data.messages.map((msg) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
        }));

        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newMessages = apiMessages.filter((m) => !existingIds.has(m.id));
          return [...prev, ...newMessages];
        });
      }
    } catch (err) {
      console.error('Error polling for response:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSendMessage = async (content: string) => {
    // Add user message immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/session/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: content }),
      });

      const data: SendResponse = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to send message');
        setIsLoading(false);
        return;
      }

      // Poll for assistant response
      await pollForResponse();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Network error while sending message');
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <Link href="/" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Koolie Chat</h2>
          <p className="text-zinc-500">Your AI assistant interface • Connected to OpenClaw</p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Chat Container */}
      <div className="mt-8 flex-1 min-h-0 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <ChatContainer
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          placeholder="Ask Koolie anything..."
          emptyStateText="Start chatting with Koolie! Messages are sent to the OpenClaw session API."
          className="h-full"
        />
      </div>
    </div>
  );
}
