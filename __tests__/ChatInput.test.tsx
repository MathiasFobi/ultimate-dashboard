import { render, screen, fireEvent } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';
import ChatInput from '../components/ChatInput';
import React from 'react';

describe('ChatInput', () => {
  test('renders input with placeholder', () => {
    render(<ChatInput onSend={vi.fn()} placeholder="Custom placeholder" />);

    const textarea = screen.getByTestId('chat-textarea');
    expect(textarea.getAttribute('placeholder')).toBe('Custom placeholder');
  });

  test('calls onSend when form is submitted with non-empty text', () => {
    const handleSend = vi.fn();
    render(<ChatInput onSend={handleSend} />);

    const textarea = screen.getByTestId('chat-textarea');
    fireEvent.change(textarea, { target: { value: '  Test message  ' } });

    const form = screen.getByTestId('chat-input-form');
    fireEvent.submit(form);

    expect(handleSend).toHaveBeenCalledWith('Test message');
  });

  test('clears input after sending', async () => {
    const handleSend = vi.fn();
    render(<ChatInput onSend={handleSend} />);

    const textarea = screen.getByTestId('chat-textarea');
    fireEvent.change(textarea, { target: { value: 'Message to send' } });
    expect((textarea as HTMLTextAreaElement).value).toBe('Message to send');

    const form = screen.getByTestId('chat-input-form');
    fireEvent.submit(form);

    // Wait for state to update
    await new Promise(resolve => setTimeout(resolve, 10));
    expect((textarea as HTMLTextAreaElement).value).toBe('');
  });

  test('sends message on Enter key press', () => {
    const handleSend = vi.fn();
    render(<ChatInput onSend={handleSend} />);

    const textarea = screen.getByTestId('chat-textarea');
    fireEvent.change(textarea, { target: { value: 'Enter message' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });

    expect(handleSend).toHaveBeenCalledWith('Enter message');
  });

  test('does not send on Shift+Enter (allows new line)', () => {
    const handleSend = vi.fn();
    render(<ChatInput onSend={handleSend} />);

    const textarea = screen.getByTestId('chat-textarea');
    fireEvent.change(textarea, { target: { value: 'Line 1\nLine 2' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });

    expect(handleSend).not.toHaveBeenCalled();
  });

  test('does not send when input is empty', () => {
    const handleSend = vi.fn();
    render(<ChatInput onSend={handleSend} />);

    const form = screen.getByTestId('chat-input-form');
    fireEvent.submit(form);

    expect(handleSend).not.toHaveBeenCalled();
  });

  test('does not send when disabled', () => {
    const handleSend = vi.fn();
    render(<ChatInput onSend={handleSend} disabled={true} />);

    const textarea = screen.getByTestId('chat-textarea');
    fireEvent.change(textarea, { target: { value: 'Disabled message' } });

    const form = screen.getByTestId('chat-input-form');
    fireEvent.submit(form);

    expect(handleSend).not.toHaveBeenCalled();
  });

  test('textarea is disabled when disabled is true', () => {
    render(<ChatInput onSend={vi.fn()} disabled={true} />);

    const textarea = screen.getByTestId('chat-textarea');
    expect(textarea.hasAttribute('disabled')).toBe(true);
  });

  test('send button exists', () => {
    render(<ChatInput onSend={vi.fn()} />);

    const button = screen.getByTestId('send-button');
    expect(button).toBeDefined();
  });

  test('textarea is disabled when isLoading is true', () => {
    render(<ChatInput onSend={vi.fn()} isLoading={true} />);

    const textarea = screen.getByTestId('chat-textarea');
    expect(textarea.hasAttribute('disabled')).toBe(true);
  });

  test('textarea has correct aria-label on button', () => {
    render(<ChatInput onSend={vi.fn()} />);

    const button = screen.getByTestId('send-button');
    expect(button.getAttribute('aria-label')).toBe('Send message');
  });
});
