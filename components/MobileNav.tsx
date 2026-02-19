'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Activity, Users, Terminal, Menu, X, TrendingUp } from 'lucide-react';

const navItems = [
  { name: 'Home', icon: LayoutDashboard, href: '/' },
  { name: 'Markets', icon: TrendingUp, href: '/#markets' },
  { name: 'Team', icon: Activity, href: '/#team' },
  { name: 'Chat', icon: Users, href: '/chat' },
  { name: 'Terminal', icon: Terminal, href: '/terminal' },
];

export function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 md:hidden z-50 safe-area-pb">
        <div className="flex items-center justify-around">
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className={`flex flex-col items-center justify-center py-2 px-3 min-w-[64px] ${
                pathname === item.href
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-zinc-500 dark:text-zinc-400'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-[10px] mt-1 font-medium">{item.name}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 md:hidden z-40 px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-zinc-600 dark:text-zinc-400">Live</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
