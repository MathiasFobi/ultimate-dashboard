import React from 'react';
import { ArrowLeft, Terminal } from 'lucide-react';
import Link from 'next/link';
import AntfarmMonitorWidget from '../../components/AntfarmMonitorWidget';

export default function AntfarmPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Antfarm Monitor</h2>
          <p className="text-zinc-500">Workflow orchestration and monitoring</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <AntfarmMonitorWidget />

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center gap-3 mb-4">
            <Terminal className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium">Antfarm CLI</h3>
          </div>
          
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
            Use the Antfarm CLI to manage workflows from your terminal:
          </p>

          <div className="space-y-2">
            <div className="rounded-lg bg-zinc-900 p-3 font-mono text-xs text-zinc-300">
              <span className="text-blue-400">$</span> antfarm workflow list
            </div>
            <div className="rounded-lg bg-zinc-900 p-3 font-mono text-xs text-zinc-300">
              <span className="text-blue-400">$</span> antfarm workflow run "task"
            </div>
            <div className="rounded-lg bg-zinc-900 p-3 font-mono text-xs text-zinc-300">
              <span className="text-blue-400">$</span> antfarm workflow runs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
