import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';
import ChatContainer, { Message } from '../components/ChatContainer';
import React from 'react';

const mockMessages: Message[] = [
  {
    id: '1',
    role: 'user',
    content: 'Hello!',
    timestamp: new Date('2024-01-15 10:30:00'),
  },
  {
    id: '2',
    role: 'assistant',
    content: 'Hi there! How can I help?',
    timestamp: new Date('2024-01-15 10:30:30'),
  },
];

describe('ChatContainer', () => {
  test('renders empty state when no messages', () => {
    render(<ChatContainer messages={[]} onSendMessage={vi.fn()} />);

    const emptyState = screen.getByTestId('empty-state');
    expect(emptyState).toBeDefined();
    expect(emptyState.textContent).toContain('Start a conversation...');
  });

  test('renders custom empty state text', () => {
    render(
      <ChatContainer
        messages={[]}
        onSendMessage={vi.fn()}
        emptyStateText="No messages yet"
      />
    );

    expect(screen.getByTestId('empty-state').textContent).toContain('No messages yet');
  });

  test('renders list of messages', () => {
    render(<ChatContainer messages={mockMessages} onSendMessage={vi.fn()} />);

    const messagesList = screen.getByTestId('messages-list');
    expect(messagesList).toBeDefined();

    const allMessages = screen.getAllByTestId('chat-message');
    expect(allMessages.length).toBe(2);

    expect(screen.getByText('Hello!')).toBeDefined();
    expect(screen.getByText('Hi there! How can I help?')).toBeDefined();
  });

  test('calls onSendMessage when message is sent', () => {
    const handleSend = vi.fn();
    render(<ChatContainer messages={[]} onSendMessage={handleSend} />);

    const textarea = screen.getByTestId('chat-textarea');
    fireEvent.change(textarea, { target: { value: 'New message' } });

    const form = screen.getByTestId('chat-input-form');
    fireEvent.submit(form);

    expect(handleSend).toHaveBeenCalledWith('New message');
  });

  test('placeholder is passed to input', () => {
    render(
      <ChatContainer
        messages={[]}
        onSendMessage={vi.fn()}
        placeholder="Ask me anything..."
      />
    );

    const textarea = screen.getByTestId('chat-textarea');
    expect(textarea.getAttribute('placeholder')).toBe('Ask me anything...');
  });

  test('input is disabled when disabled prop is true', () => {
    render(
      <ChatContainer
        messages={[]}
        onSendMessage={vi.fn()}
        disabled={true}
      />
    );

    const textarea = screen.getByTestId('chat-textarea');
    expect(textarea.hasAttribute('disabled')).toBe(true);
  });

  test('input shows loading state when isLoading is true', () => {
    render(
      <ChatContainer
        messages={[]}
        onSendMessage={vi.fn()}
        isLoading={true}
      />
    );

    const button = screen.getByTestId('send-button');
    expect(button.querySelector('.animate-spin')).toBeDefined();
  });

  test('displays timestamps for messages', () => {
    render(<ChatContainer messages={mockMessages} onSendMessage={vi.fn()} />);

    const timestamps = screen.getAllByTestId('message-timestamp');
    expect(timestamps.length).toBe(2);
  });

  test('shows streaming indicator on streaming message', () => {
    const streamingMessages: Message[] = [
      {
        id: '1',
        role: 'assistant',
        content: 'Streaming',
        timestamp: new Date(),
        isStreaming: true,
      },
    ];

    render(<ChatContainer messages={streamingMessages} onSendMessage={vi.fn()} />);

    expect(screen.getByTestId('streaming-indicator')).toBeDefined();
  });

  test('applies custom className', () => {
    const { container } = render(
      <ChatContainer
        messages={[]}
        onSendMessage={vi.fn()}
        className="custom-class"
      />
    );

    const chatContainer = container.querySelector('[data-testid="chat-container"]');
    expect(chatContainer?.classList.contains('custom-class')).toBe(true);
  });

  test('displays correct message roles', () => {
    render(<ChatContainer messages={mockMessages} onSendMessage={vi.fn()} />);

    const messages = screen.getAllByTestId('chat-message');
    expect(messages[0].getAttribute('data-role')).toBe('user');
    expect(messages[1].getAttribute('data-role')).toBe('assistant');
  });
});
