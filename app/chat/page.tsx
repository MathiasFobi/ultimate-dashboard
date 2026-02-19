import React from 'react';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/" className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Koolie Chat</h2>
          <p className="text-zinc-500">Your AI assistant interface</p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 h-[60vh] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
              K
            </div>
            <div className="bg-white dark:bg-zinc-800 p-3 rounded-lg shadow-sm max-w-[80%]">
              <p className="text-sm">Hey King! 🐾 I'm here and ready to help. What would you like to work on?</p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <MessageSquare className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
