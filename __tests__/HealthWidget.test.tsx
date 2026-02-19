import { render, screen, waitFor } from '@testing-library/react';
import { expect, test, describe, vi, beforeEach } from 'vitest';
import HealthWidget from '../components/HealthWidget';
import React from 'react';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Activity: () => <div data-testid="icon-activity" />,
  Cpu: () => <div data-testid="icon-cpu" />,
  Server: () => <div data-testid="icon-server" />,
  ShieldCheck: () => <div data-testid="icon-shield" />,
}));

describe('HealthWidget', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  test('renders loading state initially', () => {
    // @ts-ignore
    fetch.mockResolvedValue({
      ok: true,
      json: () => new Promise(() => {}), // Never resolves
    });

    render(<HealthWidget />);
    // Verify it has animate-pulse class which is used in our loading state
    const loadingContainer = document.querySelector('.animate-pulse');
    expect(loadingContainer).toBeTruthy();
  });

  test('renders online status when API returns running', async () => {
    // @ts-ignore
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        gatewayService: { runtimeShort: 'running (pid 1234, state active)' },
        os: { label: 'macos 26.3 (arm64)' },
        update: { registry: { latestVersion: '2026.2.13' } }
      }),
    });

    render(<HealthWidget />);

    await waitFor(() => {
      expect(screen.getByText('Gateway Online')).toBeTruthy();
    });

    expect(screen.getByText('macos 26.3 (arm64)')).toBeTruthy();
    expect(screen.getByText('2026.2.13')).toBeTruthy();
    expect(screen.getByText('running')).toBeTruthy();
  });

  test('renders offline status when API returns stopped', async () => {
    // @ts-ignore
    fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        gatewayService: { runtimeShort: 'stopped' },
        os: { label: 'linux (ubuntu)' },
        update: { registry: { latestVersion: '2026.2.11' } }
      }),
    });

    render(<HealthWidget />);

    await waitFor(() => {
      expect(screen.getByText('Gateway Offline')).toBeTruthy();
    });
  });

  test('renders error state when fetch fails', async () => {
    // @ts-ignore
    fetch.mockRejectedValue(new Error('API Down'));

    render(<HealthWidget />);

    await waitFor(() => {
      expect(screen.getByText('Error connecting to Gateway API')).toBeTruthy();
    });
  });
});
