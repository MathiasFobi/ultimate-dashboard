import React from 'react';
import { Terminal, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TerminalPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Terminal</h2>
          <p className="text-zinc-500">Command line interface</p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-zinc-900 p-4 shadow-sm font-mono text-sm h-[60vh] overflow-y-auto">
        <div className="text-green-400 mb-2">➜  ~ openclaw status</div>
        <div className="text-zinc-300 space-y-1">
          <p>Gateway: running</p>
          <p>Version: 2026.2.12</p>
          <p>Model: ollama/kimi-k2.5:cloud</p>
          <p>Workspace: /Users/myassistant/.openclaw/workspace</p>
        </div>
        <div className="text-green-400 mt-4">➜  ~ <span className="animate-pulse">_</span></div>
      </div>
    </div>
  );
}
