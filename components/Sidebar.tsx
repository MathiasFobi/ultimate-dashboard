'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Terminal, Settings, Activity, Zap, Check, Loader2 } from 'lucide-react';

const navItems = [
  { name: 'Overview', icon: LayoutDashboard, href: '/' },
  { name: 'Antfarm Monitor', icon: Activity, href: '/antfarm' },
  { name: 'Koolie Chat', icon: Users, href: '/chat' },
  { name: 'Terminal', icon: Terminal, href: '/terminal' },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [restarting, setRestarting] = useState(false);
  const [restartSuccess, setRestartSuccess] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleRestartGateway = async () => {
    setRestarting(true);
    setRestartSuccess(false);
    try {
      const res = await fetch('/api/gateway/restart', { method: 'POST' });
      if (res.ok) {
        setRestartSuccess(true);
        setTimeout(() => setRestartSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Restart failed:', err);
    } finally {
      setRestarting(false);
    }
  };

  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Menu</div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === item.href
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-zinc-200 dark:border-zinc-800">
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Quick Actions</div>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleRestartGateway}
            disabled={restarting}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-colors group ${
              restartSuccess
                ? 'border-green-200 bg-green-50 dark:border-green-900/50 dark:bg-green-900/20'
                : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            {restarting ? (
              <Loader2 className="h-4 w-4 text-yellow-500 mb-1 animate-spin" />
            ) : restartSuccess ? (
              <Check className="h-4 w-4 text-green-500 mb-1" />
            ) : (
              <Zap className="h-4 w-4 text-zinc-400 group-hover:text-yellow-500 mb-1" />
            )}
            <span className={`text-[10px] font-medium ${
              restartSuccess ? 'text-green-600 dark:text-green-400' : 'text-zinc-600 dark:text-zinc-400'
            }`}>
              {restarting ? 'Restarting...' : restartSuccess ? 'Restarted!' : 'Restart Gateway'}
            </span>
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="flex flex-col items-center justify-center p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors group"
          >
            <Settings className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 mb-1" />
            <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">Settings</span>
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 w-96 max-w-[90vw] shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Settings</h3>
            <p className="text-zinc-500 text-sm mb-6">Dashboard settings coming soon...</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
