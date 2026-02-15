import React from 'react';

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
        <p className="text-zinc-500">Welcome to your dashboard. Monitoring all active systems.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Status Card */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">System Status</h3>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-2xl font-semibold tracking-tight">Running Live</span>
          </div>
        </div>

        {/* Messaging Card */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Messages</h3>
          <div className="mt-4">
            <span className="text-2xl font-semibold tracking-tight">Active Integration</span>
            <p className="mt-1 text-sm text-zinc-500">Telegram Bot Connected</p>
          </div>
        </div>

        {/* Performance Card */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 font-sans">
          <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Performance</h3>
          <div className="mt-4">
            <span className="text-2xl font-semibold tracking-tight text-blue-500">Fast Mode</span>
            <p className="mt-1 text-sm text-zinc-500">Latency: Low</p>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="md:col-span-2 lg:col-span-3 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-4 tracking-tight">Recent Inquiries</h3>
          <div className="space-y-4">
            <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 last:border-0 last:pb-0">
              <div>
                <p className="font-medium">BossMadeCrypto</p>
                <p className="text-sm text-zinc-500">"Awesome 👏🏾 what is the status on the ultimate dashboard?"</p>
              </div>
              <span className="text-xs text-zinc-400">Just now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
