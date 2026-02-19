import { render, screen, waitFor, fireEvent, within } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach, afterEach } from 'vitest';
import AntfarmMonitorWidget from '../components/AntfarmMonitorWidget';
import React from 'react';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Activity: () => <div data-testid="icon-activity" />,
  CheckCircle: () => <div data-testid="icon-check" />,
  Clock: () => <div data-testid="icon-clock" />,
  PlayCircle: () => <div data-testid="icon-play" />,
  XCircle: () => <div data-testid="icon-x" />,
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));

describe('AntfarmMonitorWidget', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('renders loading state initially', () => {
    // @ts-ignore
    fetch.mockReturnValue(new Promise(() => {})); // Never resolves

    render(<AntfarmMonitorWidget />);
    // Verify it has animate-pulse class which is used in our loading state
    const loadingContainer = document.querySelector('.animate-pulse');
    expect(loadingContainer).toBeTruthy();
  });

  test('renders active runs when API returns data', async () => {
    const mockData = {
      runs: [
        {
          id: 'abc123',
          status: 'running',
          workflowType: 'feature-dev',
          taskTitle: 'Build new feature',
        },
        {
          id: 'def456',
          status: 'completed',
          workflowType: 'bugfix',
          taskTitle: 'Fix critical bug',
        },
      ],
      activeCount: 1,
      completedCount: 1,
    };

    // @ts-ignore
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    render(<AntfarmMonitorWidget />);

    await waitFor(() => {
      expect(screen.getByText('Build new feature')).toBeTruthy();
    }, { timeout: 2000 });

    // Check for the "1 Active" badge (this is unique)
    expect(screen.getByText('1 Active')).toBeTruthy();
  });

  test('renders error state when fetch fails', async () => {
    // @ts-ignore
    fetch.mockRejectedValue(new Error('API Down'));

    render(<AntfarmMonitorWidget />);

    await waitFor(() => {
      expect(screen.getByText('Error connecting to Antfarm API')).toBeTruthy();
    }, { timeout: 2000 });
  });

  test('renders empty state when no runs exist', async () => {
    const mockData = {
      runs: [],
      activeCount: 0,
      completedCount: 0,
    };

    // @ts-ignore
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    render(<AntfarmMonitorWidget />);

    await waitFor(() => {
      expect(screen.getByText('No workflow runs found')).toBeTruthy();
    }, { timeout: 2000 });
  });

  test('allows manual refresh', async () => {
    const mockData = {
      runs: [],
      activeCount: 0,
      completedCount: 0,
    };

    // @ts-ignore
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockData),
    });

    render(<AntfarmMonitorWidget />);

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1), { timeout: 2000 });

    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2), { timeout: 2000 });
  });
});
