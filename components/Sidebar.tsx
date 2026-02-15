import React from 'react';
import { LayoutDashboard, Users, Terminal, Settings, Activity, Zap } from 'lucide-react';

const navItems = [
  { name: 'Overview', icon: LayoutDashboard, active: true },
  { name: 'Antfarm Monitor', icon: Activity },
  { name: 'Koolie Chat', icon: Users },
  { name: 'Terminal', icon: Terminal },
];

export function Sidebar() {
  return (
    <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Menu</div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.name}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                item.active 
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
          <button className="flex flex-col items-center justify-center p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors group">
            <Zap className="h-4 w-4 text-zinc-400 group-hover:text-yellow-500 mb-1" />
            <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">Restart Gateway</span>
          </button>
          <button className="flex flex-col items-center justify-center p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors group">
            <Settings className="h-4 w-4 text-zinc-400 group-hover:text-zinc-600 mb-1" />
            <span className="text-[10px] font-medium text-zinc-600 dark:text-zinc-400">Settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
