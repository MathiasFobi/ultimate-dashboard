'use client';

import React, { useState } from 'react';
import { Play, Pause, RotateCcw, AlertCircle, TrendingUp, DollarSign, Target, X } from 'lucide-react';

interface QuickAction {
  id: string;
  icon: React.ElementType;
  label: string;
  color: string;
  bgColor: string;
  action: () => void;
}

export function MobileQuickActions() {
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState<'running' | 'paused' | 'error'>('running');

  const actions: QuickAction[] = [
    {
      id: 'scout',
      icon: Target,
      label: 'Force Scout',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
      action: async () => {
        try {
          await fetch('/api/trading/team?agent=scout');
          window.alert('Scout triggered!');
        } catch (e) {
          console.error('Scout trigger failed:', e);
        }
      },
    },
    {
      id: 'refresh',
      icon: RotateCcw,
      label: 'Refresh Data',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/30',
      action: () => window.location.reload(),
    },
  ];

  return (
    <div className="fixed right-4 bottom-20 md:hidden z-50">
      {/* Expandable Action Buttons */}
      {expanded && (
        <div className="absolute bottom-14 right-0 flex flex-col gap-2 mb-2">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                action.action();
                setExpanded(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-full shadow-lg ${action.bgColor} border border-zinc-200 dark:border-zinc-700 min-w-[160px]`}
            >
              <action.icon className={`h-5 w-5 ${action.color}`} />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setExpanded(!expanded)}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all ${
          expanded
            ? 'bg-zinc-800 text-white rotate-45'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {expanded ? (
          <X className="h-6 w-6" />
        ) : (
          <div className="flex flex-col items-center">
            <TrendingUp className="h-5 w-5" />
            <span className="text-[9px] font-medium">Trade</span>
          </div>
        )}
      </button>
    </div>
  );
}
