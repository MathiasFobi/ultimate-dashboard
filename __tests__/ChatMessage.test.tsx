import { render, screen } from '@testing-library/react';
import { expect, test, describe } from 'vitest';
import ChatMessage from '../components/ChatMessage';
import React from 'react';

describe('ChatMessage', () => {
  test('renders assistant message', () => {
    render(
      <ChatMessage
        role="assistant"
        content="Hello! How can I help you?"
        timestamp={new Date('2024-01-15 10:30:00')}
      />
    );

    const message = screen.getByTestId('chat-message');
    expect(message.getAttribute('data-role')).toBe('assistant');

    const content = screen.getByTestId('message-content');
    expect(content.textContent).toBe('Hello! How can I help you?');

    const timestamp = screen.getByTestId('message-timestamp');
    expect(timestamp).toBeDefined();
  });

  test('renders user message', () => {
    render(
      <ChatMessage
        role="user"
        content="Test message from user"
        timestamp={new Date('2024-01-15 14:45:00')}
      />
    );

    const message = screen.getByTestId('chat-message');
    expect(message.getAttribute('data-role')).toBe('user');

    const content = screen.getByTestId('message-content');
    expect(content.textContent).toBe('Test message from user');

    const timestamp = screen.getByTestId('message-timestamp');
    expect(timestamp).toBeDefined();
  });

  test('renders without timestamp when not provided', () => {
    render(
      <ChatMessage
        role="assistant"
        content="Message without timestamp"
      />
    );

    const timestamp = screen.queryByTestId('message-timestamp');
    expect(timestamp).toBeNull();
  });

  test('displays streaming indicator when isStreaming is true', () => {
    render(
      <ChatMessage
        role="assistant"
        content="Streaming message"
        isStreaming={true}
      />
    );

    const streamingIndicator = screen.getByTestId('streaming-indicator');
    expect(streamingIndicator).toBeDefined();
  });

  test('does not display streaming indicator when isStreaming is false', () => {
    render(
      <ChatMessage
        role="assistant"
        content="Complete message"
        isStreaming={false}
      />
    );

    const streamingIndicator = screen.queryByTestId('streaming-indicator');
    expect(streamingIndicator).toBeNull();
  });

  test('preserves whitespace in message content', () => {
    const multilineContent = `Line 1
Line 2
Line 3`;

    render(
      <ChatMessage
        role="assistant"
        content={multilineContent}
      />
    );

    const content = screen.getByTestId('message-content');
    expect(content.textContent).toContain('Line 1');
    expect(content.textContent).toContain('Line 2');
    expect(content.textContent).toContain('Line 3');
  });
});
