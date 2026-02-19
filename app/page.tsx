import React from 'react';
import HealthWidget from '../components/HealthWidget';
import KalshiWidget from '../components/KalshiWidget';
import TradingTeamWidget from '../components/TradingTeamWidget';
import AntfarmMonitorWidget from '../components/AntfarmMonitorWidget';
import { MobileBalanceCard } from '../components/MobileBalanceCard';
import { TrendingUp, Bot, Zap, MessageCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-4 md:space-y-8">
      {/* Mobile Welcome - Shown only on mobile */}
      <div className="md:hidden">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Trading Dashboard</h2>
            <p className="text-sm text-zinc-500">Live market monitoring</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/30 rounded-full border border-green-200 dark:border-green-800">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-700 dark:text-green-400">Live</span>
          </div>
        </div>

        {/* Mobile Balance Summary */}
        <MobileBalanceCard />

        {/* Mobile Quick Stats */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { icon: TrendingUp, label: 'Markets', value: '17' },
            { icon: Bot, label: 'Agents', value: '3' },
            { icon: Zap, label: 'Positions', value: '5/5' },
            { icon: MessageCircle, label: 'Telegram', value: 'ON' },
          ].map((stat) => (
            <div key={stat.label} className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3 text-center">
              <stat.icon className="h-4 w-4 mx-auto mb-1 text-blue-500" />
              <p className="text-lg font-bold">{stat.value}</p>
              <p className="text-[10px] text-zinc-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Welcome */}
      <div className="hidden md:block">
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-zinc-500">Welcome to your dashboard. Monitoring all active systems.</p>
      </div>

      {/* Main Grid - Responsive */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Kalshi Trading Widget - PRODUCTION */}
        <div className="md:col-span-2 lg:col-span-1">
          <KalshiWidget production={true} />
        </div>

        {/* Trading Team Widget */}
        <div className="md:col-span-1">
          <TradingTeamWidget />
        </div>

        {/* System Health Widget - Desktop only, hidden on mobile */}
        <div className="hidden md:block">
          <HealthWidget />
        </div>

        {/* Antfarm Monitor Widget - Desktop only */}
        <div className="hidden md:block">
          <AntfarmMonitorWidget />
        </div>

        {/* Mobile-optimized Info Cards */}
        <div className="md:hidden grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Messages</h3>
            <div className="mt-2">
              <span className="text-lg font-semibold">Active</span>
              <p className="text-xs text-zinc-500">Telegram Bot</p>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="text-xs font-medium uppercase tracking-wider text-zinc-500">Performance</h3>
            <div className="mt-2">
              <span className="text-lg font-semibold text-blue-500">Fast</span>
              <p className="text-xs text-zinc-500">Low Latency</p>
            </div>
          </div>
        </div>

        {/* Desktop Cards */}
        <div className="hidden md:block rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Messages</h3>
          <div className="mt-4">
            <span className="text-2xl font-semibold tracking-tight">Active Integration</span>
            <p className="mt-1 text-sm text-zinc-500">Telegram Bot Connected</p>
          </div>
        </div>

        <div className="hidden md:block rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 font-sans">
          <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Performance</h3>
          <div className="mt-4">
            <span className="text-2xl font-semibold tracking-tight text-blue-500">Fast Mode</span>
            <p className="mt-1 text-sm text-zinc-500">Latency: Low</p>
          </div>
        </div>

        {/* Recent Activity - Full width */}
        <div className="md:col-span-2 lg:col-span-3 rounded-xl border border-zinc-200 bg-white p-4 md:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-4">Recent Inquiries</h3>
          <div className="space-y-4">
            <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 last:border-0 last:pb-0">
              <div>
                <p className="font-medium text-sm md:text-base">BossMadeCrypto</p>
                <p className="text-xs md:text-sm text-zinc-500">"Awesome 👏🏾 what is the status on the ultimate dashboard?"</p>
              </div>
              <span className="text-xs text-zinc-400">Just now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
