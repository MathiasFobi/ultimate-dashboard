'use client';

import React, { useState } from 'react';
import { Terminal as TerminalIcon, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import TerminalWidget from '@/components/TerminalWidget';

export default function TerminalPage() {
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [initialText] = useState(`# OpenClaw Terminal v2026.2.18
# Connected to: localhost:4444
# Use 'help' for available commands\r\n`);

  const handleInput = (input: string) => {
    setCommandHistory((prev) => [...prev, input]);
    // TODO: Implement shell command execution via OpenClaw exec API
    console.log('Terminal input:', input);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <Link href="/" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Web Terminal</h2>
          <p className="text-zinc-500">xterm.js powered terminal interface</p>
        </div>
      </div>

      {/* Terminal Widget */}
      <div className="mt-8 flex-1 min-h-0">
        <TerminalWidget
          initialText={initialText}
          onInput={handleInput}
          readOnly={false}
        />
      </div>
    </div>
  );
}
