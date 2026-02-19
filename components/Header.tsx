import React from 'react';

export function Header() {
  return (
    <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Ultimate Dashboard
        </h1>
      </div>
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-zinc-600 dark:text-zinc-400">Gateway: Online</span>
        </div>
        <div className="flex items-center gap-2 font-mono bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded">
          <span className="text-xs">v1.0.0</span>
        </div>
      </div>
    </header>
  );
}
