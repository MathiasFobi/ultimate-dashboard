import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { MobileQuickActions } from './MobileQuickActions';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Mobile Navigation */}
      <MobileNav />
      <MobileQuickActions />
      
      <div className="flex-1 flex flex-col">
        {/* Desktop Header - Hidden on mobile */}
        <div className="hidden md:block">
          <Header />
        </div>
        
        {/* Mobile spacer for fixed header */}
        <div className="h-14 md:hidden" />
        
        {/* Main content with padding for mobile bottom nav */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
