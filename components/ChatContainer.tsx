'use client';

import React, { useRef, useEffect } from 'react';
import ChatMessage, { ChatMessageProps } from './ChatMessage';
import ChatInput from './ChatInput';
import { MessageSquare } from 'lucide-react';

export interface Message extends Omit<ChatMessageProps, 'timestamp'> {
  id: string;
  timestamp: Date;
}

export interface ChatContainerProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  emptyStateText?: string;
  className?: string;
}

export default function ChatContainer({
  messages,
  onSendMessage,
  isLoading = false,
  disabled = false,
  placeholder = 'Type your message...',
  emptyStateText = 'Start a conversation...',
  className = '',
}: ChatContainerProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const hasMessages = messages.length > 0;

  return (
    <div
      className={`flex flex-col h-full ${className}`}
      data-testid="chat-container"
    >
      {/* Messages Area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto space-y-4 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-lg min-h-0"
        data-testid="messages-list"
      >
        {hasMessages ? (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
                isStreaming={message.isStreaming}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div
            className="flex flex-col items-center justify-center h-full text-center"
            data-testid="empty-state"
          >
            <MessageSquare className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mb-4" />
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              {emptyStateText}
            </p>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
        <ChatInput
          onSend={onSendMessage}
          disabled={disabled}
          placeholder={placeholder}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
