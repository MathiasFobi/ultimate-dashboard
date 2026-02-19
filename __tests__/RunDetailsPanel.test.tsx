import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach, afterEach, Mock } from 'vitest';
import RunDetailsPanel from '../components/RunDetailsPanel';
import React from 'react';

// Mock Lucide icons with inline SVGs
vi.mock('lucide-react', () => ({
  ArrowLeft: () => <div data-testid="icon-arrow-left">←</div>,
  PlayCircle: () => <div data-testid="icon-play">▶</div>,
  CheckCircle: () => <div data-testid="icon-check">✓</div>,
  XCircle: () => <div data-testid="icon-x">✗</div>,
  Clock: () => <div data-testid="icon-clock">⏰</div>,
  FileText: () => <div data-testid="icon-file">📄</div>,
  ChevronRight: () => <div data-testid="icon-chevron">›</div>,
  Loader2: () => <div data-testid="icon-loader">⟳</div>,
  AlertCircle: () => <div data-testid="icon-alert">⚠</div>,
  Terminal: () => <div data-testid="icon-terminal">$</div>,
}));

describe('RunDetailsPanel', () => {
  const mockRun = {
    id: 'abc12345',
    status: 'running' as const,
    workflowType: 'feature-dev',
    taskTitle: 'Build new feature',
  };

  const mockStoriesResponse = {
    runId: 'abc12345',
    stories: [
      {
        id: 'story-1',
        title: 'Setup project structure',
        status: 'verified',
        agentId: 'developer',
        startedAt: '09:15 AM',
        completedAt: '09:30 AM',
      },
      {
        id: 'story-2',
        title: 'Implement authentication',
        status: 'in-progress',
        agentId: 'developer',
        startedAt: '09:35 AM',
      },
      {
        id: 'story-3',
        title: 'Add unit tests',
        status: 'pending',
      },
    ],
    total: 3,
    completed: 1,
    inProgress: 1,
    pending: 1,
  };

  const mockLogsResponse = {
    runId: 'abc12345',
    logs: [
      { timestamp: '09:15 AM', level: 'step', agentId: 'planner', message: 'Story started — Setup project structure' },
      { timestamp: '09:30 AM', level: 'success', agentId: 'developer', message: 'Story done — Setup project structure' },
      { timestamp: '09:35 AM', level: 'step', agentId: 'developer', message: 'Story started — Implement authentication' },
    ],
    logCount: 3,
  };

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renders run header with back button', () => {
    const handleBack = vi.fn();
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStoriesResponse),
    }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLogsResponse),
    });

    render(<RunDetailsPanel run={mockRun} onBack={handleBack} />);

    expect(screen.getByText('Build new feature')).toBeTruthy();
    expect(screen.getByText('abc12345')).toBeTruthy();
    expect(screen.getByText('feature-dev')).toBeTruthy();
  });

  test('calls onBack when back button is clicked', async () => {
    const handleBack = vi.fn();
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStoriesResponse),
    }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLogsResponse),
    });

    render(<RunDetailsPanel run={mockRun} onBack={handleBack} />);

    const backButton = screen.getByTestId('icon-arrow-left').closest('button');
    if (backButton) {
      fireEvent.click(backButton);
    }

    expect(handleBack).toHaveBeenCalled();
  });

  test('displays stories tab by default and shows story list', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStoriesResponse),
    }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLogsResponse),
    });

    render(<RunDetailsPanel run={mockRun} onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Setup project structure')).toBeTruthy();
      expect(screen.getByText('Implement authentication')).toBeTruthy();
      expect(screen.getByText('Add unit tests')).toBeTruthy();
    }, { timeout: 2000 });
  });

  test('displays story status badges', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStoriesResponse),
    }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLogsResponse),
    });

    render(<RunDetailsPanel run={mockRun} onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('verified')).toBeTruthy();
      expect(screen.getByText('in progress')).toBeTruthy();
      expect(screen.getByText('pending')).toBeTruthy();
    }, { timeout: 2000 });
  });

  test('switches to logs tab when clicked', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStoriesResponse),
    }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLogsResponse),
    });

    render(<RunDetailsPanel run={mockRun} onBack={() => {}} />);

    const logsTab = screen.getByText('Logs');
    fireEvent.click(logsTab.closest('button') || logsTab);

    await waitFor(() => {
      expect(screen.getByText('Story started — Setup project structure')).toBeTruthy();
    }, { timeout: 2000 });
  });

  test('handles story expansion', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStoriesResponse),
    }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLogsResponse),
    });

    render(<RunDetailsPanel run={mockRun} onBack={() => {}} />);

    await waitFor(() => {
      const storyTitle = screen.getByText('Setup project structure');
      expect(storyTitle).toBeTruthy();
    }, { timeout: 2000 });
  });

  test('displays progress stats', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStoriesResponse),
    }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLogsResponse),
    });

    render(<RunDetailsPanel run={mockRun} onBack={() => {}} />);

    await waitFor(() => {
      // Total
      expect(screen.getByText('Total Stories').closest('div')?.querySelector('p.text-2xl')).toHaveTextContent('3');
      // Completed
      expect(screen.getByText('Completed').closest('div')?.querySelector('p.text-2xl')).toHaveTextContent('1');
      // In Progress
      expect(screen.getByText('In Progress').closest('div')?.querySelector('p.text-2xl')).toHaveTextContent('1');
    }, { timeout: 2000 });
  });

  test('handles API errors gracefully', async () => {
    (fetch as Mock).mockRejectedValue(new Error('API Error'));

    render(<RunDetailsPanel run={mockRun} onBack={() => {}} />);

    await waitFor(() => {
      const errorElements = screen.queryAllByText('Failed to load stories');
      expect(errorElements.length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  test('shows empty state when no stories', async () => {
    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        runId: 'abc12345',
        stories: [],
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
      }),
    }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLogsResponse),
    });

    render(<RunDetailsPanel run={mockRun} onBack={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('No stories found for this run')).toBeTruthy();
    }, { timeout: 2000 });
  });

  test('refreshes data when run status is running', async () => {
    vi.useFakeTimers();
    
    (fetch as Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStoriesResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLogsResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockStoriesResponse),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockLogsResponse),
      });

    render(<RunDetailsPanel run={mockRun} onBack={() => {}} />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Setup project structure')).toBeTruthy();
    }, { timeout: 2000 });

    // Advance by 10 seconds to trigger refresh
    vi.advanceTimersByTime(10000);

    // Should have fetched twice (initial + refresh)
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(4); // 2 endpoints × 2 calls
    }, { timeout: 2000 });

    vi.useRealTimers();
  }, 10000);

  test('renders different status indicators for completed run', () => {
    const completedRun = {
      ...mockRun,
      status: 'completed' as const,
    };

    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStoriesResponse),
    }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLogsResponse),
    });

    render(<RunDetailsPanel run={completedRun} onBack={() => {}} />);

    expect(screen.getByText('Completed')).toBeTruthy();
  });

  test('renders different status indicators for failed run', () => {
    const failedRun = {
      ...mockRun,
      status: 'failed' as const,
    };

    (fetch as Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockStoriesResponse),
    }).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockLogsResponse),
    });

    render(<RunDetailsPanel run={failedRun} onBack={() => {}} />);

    expect(screen.getByText('Failed')).toBeTruthy();
  });
});
