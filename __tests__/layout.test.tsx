import { render, screen } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';
import { MainLayout } from '../components/MainLayout';
import React from 'react';

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  LayoutDashboard: () => <div data-testid="icon-dashboard" />,
  Users: () => <div data-testid="icon-users" />,
  Terminal: () => <div data-testid="icon-terminal" />,
  Settings: () => <div data-testid="icon-settings" />,
  Activity: () => <div data-testid="icon-activity" />,
  Zap: () => <div data-testid="icon-zap" />,
}));

describe('MainLayout', () => {
  test('renders header with title', () => {
    render(<MainLayout>Test Content</MainLayout>);
    expect(screen.getByText('Ultimate Dashboard')).toBeDefined();
  });

  test('renders sidebar with navigation items', () => {
    render(<MainLayout>Test Content</MainLayout>);
    expect(screen.getByText('Overview')).toBeDefined();
    expect(screen.getByText('Antfarm Monitor')).toBeDefined();
    expect(screen.getByText('Koolie Chat')).toBeDefined();
    expect(screen.getByText('Terminal')).toBeDefined();
  });

  test('renders quick actions', () => {
    render(<MainLayout>Test Content</MainLayout>);
    expect(screen.getByText('Quick Actions')).toBeDefined();
    expect(screen.getByText('Restart Gateway')).toBeDefined();
  });

  test('renders children in main area', () => {
    render(
      <MainLayout>
        <div data-testid="child">Child Content</div>
      </MainLayout>
    );
    expect(screen.getByTestId('child')).toBeDefined();
    expect(screen.getByText('Child Content')).toBeDefined();
  });
});
