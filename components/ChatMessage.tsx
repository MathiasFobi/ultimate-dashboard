'use client';

import React from 'react';
import { User, Bot } from 'lucide-react';

export type MessageRole = 'user' | 'assistant';

export interface ChatMessageProps {
  role: MessageRole;
  content: string;
  timestamp?: Date;
  isStreaming?: boolean;
}

export default function ChatMessage({
  role,
  content,
  timestamp,
  isStreaming = false,
}: ChatMessageProps) {
  const isUser = role === 'user';

  return (
    <div
      className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
      data-testid="chat-message"
      data-role={role}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0 ${
          isUser ? 'bg-zinc-600 dark:bg-zinc-500' : 'bg-blue-500'
        }`}
        data-testid="message-avatar"
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Message Bubble */}
      <div
        className={`max-w-[80%] rounded-lg px-4 py-3 shadow-sm ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-none'
            : 'bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-bl-none'
        }`}
        data-testid="message-bubble"
      >
        <p
          className={`text-sm whitespace-pre-wrap ${
            isUser ? 'text-white' : 'text-zinc-900 dark:text-zinc-100'
          }`}
          data-testid="message-content"
        >
          {content}
          {isStreaming && (
            <span className="inline-block ml-1 animate-pulse" data-testid="streaming-indicator">
              ▊
            </span>
          )}
        </p>

        {timestamp && (
          <p
            className={`text-xs mt-1 ${
              isUser ? 'text-blue-100' : 'text-zinc-400'
            }`}
            data-testid="message-timestamp"
          >
            {timestamp.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            })}
          </p>
        )}
      </div>
    </div>
  );
}
