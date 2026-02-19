'use client';

import React, { useState } from 'react';
import { MessageSquare, ArrowLeft, User, Bot } from 'lucide-react';
import Link from 'next/link';
import ChatContainer, { Message } from '@/components/ChatContainer';

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

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate API delay and response (TODO: Connect to OpenClaw session API)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm a mock response 🤖. In the future, I'll connect to the OpenClaw session API to provide real responses!",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);
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
          <p className="text-zinc-500">Your AI assistant interface</p>
        </div>
      </div>

      {/* Chat Container */}
      <div className="mt-8 flex-1 min-h-0 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
        <ChatContainer
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          placeholder="Ask Koolie anything..."
          emptyStateText="Start chatting with Koolie!"
          className="h-full"
        />
      </div>
    </div>
  );
}
