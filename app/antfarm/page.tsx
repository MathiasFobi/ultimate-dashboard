'use client';

import React, { useState } from 'react';
import { ArrowLeft, Terminal, ChevronRight, ChevronDown, FileText, Activity } from 'lucide-react';
import Link from 'next/link';
import AntfarmMonitorWidget from '../../components/AntfarmMonitorWidget';
import RunDetailsPanel from '../../components/RunDetailsPanel';

interface WorkflowRun {
  id: string;
  status: 'running' | 'completed' | 'failed';
  workflowType: string;
  taskTitle: string;
}

export default function AntfarmPage() {
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);

  const handleRunSelect = (run: WorkflowRun) => {
    setSelectedRun(run);
  };

  const handleBackToList = () => {
    setSelectedRun(null);
  };

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

      {selectedRun ? (
        <RunDetailsPanel 
          run={selectedRun} 
          onBack={handleBackToList}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <AntfarmMonitorWidget onRunSelect={handleRunSelect} />

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
                <span className="text-blue-400">$</span> antfarm workflow run &quot;task&quot;
              </div>
              <div className="rounded-lg bg-zinc-900 p-3 font-mono text-xs text-zinc-300">
                <span className="text-blue-400">$</span> antfarm workflow runs
              </div>
            </div>
          </div>

          <div className="md:col-span-2 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="h-5 w-5 text-emerald-500" />
              <div>
                <h3 className="font-medium">Quick Guide</h3>
                <p className="text-xs text-zinc-500">
                  Click on any active run in the monitor widget to view stories and logs
                </p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-zinc-600">Running workflows show live progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-zinc-600">Stories are auto-discovered from logs</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                  <span className="text-zinc-600">Logs stream every 10 seconds</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="text-zinc-600">Hover timestamps to see full time</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
