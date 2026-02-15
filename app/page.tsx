import React from 'react';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black p-8 text-black dark:text-white">
      <header className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-4">
          Ultimate Dashboard
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400">
          Antfarm Management & Monitoring
        </p>
      </header>

      <main className="grid w-full max-w-5xl gap-8 md:grid-cols-2 lg:grid-cols-3">
        {/* Status Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">System Status</h2>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-2xl font-semibold">Running Live</span>
          </div>
        </div>

        {/* Messaging Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Messages</h2>
          <div className="mt-4">
            <span className="text-2xl font-semibold">Active Integration</span>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Telegram Bot Connected</p>
          </div>
        </div>

        {/* Speed Card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 lg:col-span-1">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Performance</h2>
          <div className="mt-4">
            <span className="text-2xl font-semibold text-blue-500">Fast Mode</span>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">Latency: Low</p>
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="md:col-span-2 lg:col-span-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-4">Recent Inquiries</h2>
          <div className="space-y-4">
            <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 last:border-0 last:pb-0">
              <div>
                <p className="font-medium">BossMadeCrypto</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">"Awesome 👏🏾 what is the status on the ultimate dashboard?"</p>
              </div>
              <span className="text-xs text-zinc-400">Just now</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-16 text-zinc-400 text-sm">
        Antfarm v1.0.0 • Powered by Cline
      </footer>
    </div>
  );
}