'use client';

import React, { useState, useRef, KeyboardEvent, FormEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';

export interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  isLoading?: boolean;
}

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = 'Type your message...',
  isLoading = false,
}: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed && !disabled && !isLoading) {
      onSend(trimmed);
      setInput('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const handleInput = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Auto-resize textarea
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2"
      data-testid="chat-input-form"
    >
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={1}
          className="w-full px-4 py-3 pr-10 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 resize-none overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] max-h-[120px]"
          data-testid="chat-textarea"
        />
        {/* Character count hint - subtle */}
        {input.length > 0 && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 pointer-events-none hidden sm:block">
            {input.length > 0 && (
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-700 rounded text-zinc-500 dark:text-zinc-400 text-[10px]">
                ↵ Enter to send
              </kbd>
            )}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!input.trim() || disabled || isLoading}
        className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-h-[48px] min-w-[48px]"
        data-testid="send-button"
        aria-label="Send message"
      >
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
      </button>
    </form>
  );
}
