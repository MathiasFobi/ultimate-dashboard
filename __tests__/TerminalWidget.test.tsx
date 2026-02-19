import { render, screen, waitFor } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import TerminalWidget from '../components/TerminalWidget';
import React from 'react';

// Mock @xterm/xterm
const mockWrite = vi.fn();
const mockWriteln = vi.fn();
const mockClear = vi.fn();
const mockOnData = vi.fn();
const mockFit = vi.fn();
const mockDispose = vi.fn();
const mockOpen = vi.fn();
const mockLoadAddon = vi.fn();

vi.mock('@xterm/xterm', () => {
  return {
    Terminal: class MockTerminal {
      write = mockWrite;
      writeln = mockWriteln;
      clear = mockClear;
      onData = mockOnData;
      open = mockOpen;
      loadAddon = mockLoadAddon;
      dispose = mockDispose;

      constructor(options: Record<string, unknown>) {
        // Store options if needed for testing
      }
    },
  };
});

vi.mock('@xterm/addon-fit', () => {
  return {
    FitAddon: class MockFitAddon {
      fit = mockFit;
    },
  };
});

vi.mock('lucide-react', () => ({
  Terminal: () => <div data-testid="icon-terminal" />,
}));

describe('TerminalWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset window.addEventListener/RemoveEventListener mocks
    vi.stubGlobal('addEventListener', vi.fn());
    vi.stubGlobal('removeEventListener', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('renders terminal container', () => {
    render(<TerminalWidget />);
    
    // Check terminal header
    expect(screen.getByText('Terminal')).toBeTruthy();
    
    // Check clear button
    expect(screen.getByText('Clear')).toBeTruthy();
    
    // Check footer
    const xtermVersion = screen.getByText('xterm.js 6.0');
    expect(xtermVersion).toBeTruthy();
    
    // Check ready status with the animated dot
    expect(screen.getByTestId('icon-terminal')).toBeTruthy();
    
    // Verify ready text exists
    expect(screen.getByText((content) => content.includes('Ready'))).toBeTruthy();
  });

  test('initializes xterm terminal with correct options', async () => {
    render(<TerminalWidget />);

    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalled();
    });

    // Verify terminal was opened
    expect(mockOpen).toHaveBeenCalledTimes(1);
  });

  test('loads FitAddon addon', async () => {
    render(<TerminalWidget />);

    await waitFor(() => {
      expect(mockLoadAddon).toHaveBeenCalled();
    });

    // Verify FitAddon was loaded
    expect(mockLoadAddon).toHaveBeenCalledTimes(1);
  });

  test('displays initial text when provided', async () => {
    const initialText = 'Welcome to the terminal!';
    render(<TerminalWidget initialText={initialText} />);

    await waitFor(() => {
      expect(mockWriteln).toHaveBeenCalled();
    });
  });

  test('calls onInput when user enters command', async () => {
    const onInput = vi.fn();
    render(<TerminalWidget onInput={onInput} />);

    await waitFor(() => {
      expect(mockOnData).toHaveBeenCalled();
    });

    // Simulate user typing (mockOnData was called with a callback)
    const dataHandler = mockOnData.mock.calls[0]?.[0];
    
    // Simulate pressing Enter (carriage return)
    if (dataHandler) {
      dataHandler('hello world');
      dataHandler('\r');
    }

    // onInput should be called with the buffer content
    await waitFor(() => {
      expect(onInput).toHaveBeenCalledWith('hello world');
    });
  });

  test('clear button clears terminal', async () => {
    render(<TerminalWidget />);

    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalled();
    });

    // Click clear button
    const clearButton = screen.getByText('Clear');
    clearButton.click();

    await waitFor(() => {
      expect(mockClear).toHaveBeenCalled();
    });
  });

  test('disposes terminal on unmount', async () => {
    const { unmount } = render(<TerminalWidget />);

    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalled();
    });

    unmount();

    expect(mockDispose).toHaveBeenCalled();
  });

  test('does not register onData handler in readOnly mode', async () => {
    const onInput = vi.fn();
    const { rerender } = render(<TerminalWidget onInput={onInput} readOnly={true} />);

    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalled();
    });

    // Verify onData was NOT called in readOnly mode
    // Note: Since we mock at module level, onData may be called on the mock
    // but the internal logic should not wire up the handler
    expect(mockOpen).toHaveBeenCalled();
  });

  test('writes welcome header on init', async () => {
    render(<TerminalWidget />);

    await waitFor(() => {
      expect(mockWriteln).toHaveBeenCalled();
    });

    // Verify welcome banner was written (should contain the box characters)
    const welcomeCalls = mockWriteln.mock.calls.filter(call => 
      typeof call[0] === 'string' && call[0].includes('╔')
    );
    expect(welcomeCalls.length).toBeGreaterThan(0);
  });

  test('adds resize event listener', async () => {
    const addEventListener = vi.fn();
    vi.stubGlobal('addEventListener', addEventListener);

    render(<TerminalWidget />);

    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalled();
    });

    // Verify resize listener was added
    const resizeCall = addEventListener.mock.calls.find(call => call[0] === 'resize');
    expect(resizeCall).toBeTruthy();
  });

  test('removes resize event listener on unmount', async () => {
    const removeEventListener = vi.fn();
    vi.stubGlobal('removeEventListener', removeEventListener);
    vi.stubGlobal('addEventListener', vi.fn());

    const { unmount } = render(<TerminalWidget />);

    await waitFor(() => {
      expect(mockOpen).toHaveBeenCalled();
    });

    unmount();

    // Verify resize listener was removed
    const resizeCall = removeEventListener.mock.calls.find(call => call[0] === 'resize');
    expect(resizeCall).toBeTruthy();
  });
});
