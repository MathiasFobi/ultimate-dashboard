'use client';

import React, { useEffect, useState } from 'react';
import { Activity, Cpu, Server, ShieldCheck } from 'lucide-react';

interface GatewayStatus {
  gatewayService: {
    runtimeShort: string;
  };
  os: {
    label: string;
  };
  update: {
    registry?: {
      latestVersion: string;
    }
  };
}

export default function HealthWidget() {
  const [status, setStatus] = useState<GatewayStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/gateway/status');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setStatus(data);
      setError(false);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const isOnline = status?.gatewayService?.runtimeShort?.includes('running');

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 animate-pulse">
        <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="mt-4 flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-zinc-300"></div>
          <div className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm dark:border-red-900/50 dark:bg-red-900/20">
        <h3 className="text-sm font-medium uppercase tracking-wider text-red-600 dark:text-red-400">System Health</h3>
        <div className="mt-4 flex items-center gap-3 text-red-700 dark:text-red-300">
          <Activity className="h-5 w-5" />
          <span className="font-semibold">Error connecting to Gateway API</span>
        </div>
        <button 
          onClick={() => { setLoading(true); fetchStatus(); }}
          className="mt-4 text-xs font-medium underline uppercase tracking-tight"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">System Health</h3>
        <ShieldCheck className={`h-4 w-4 ${isOnline ? 'text-green-500' : 'text-zinc-300 dark:text-zinc-700'}`} />
      </div>
      
      <div className="mt-4 flex items-center gap-3">
        <div className={`h-3 w-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        <span className="text-2xl font-semibold tracking-tight">
          {isOnline ? 'Gateway Online' : 'Gateway Offline'}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 text-sm">
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <Server className="h-4 w-4" />
          <span className="font-medium">Platform:</span> {status?.os?.label || 'Unknown'}
        </div>
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <Activity className="h-4 w-4" />
          <span className="font-medium">Version:</span> {status?.update?.registry?.latestVersion || 'v2026.02.13'}
        </div>
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <Cpu className="h-4 w-4" />
          <span className="font-medium">Status:</span> {status?.gatewayService?.runtimeShort?.split(' (')[0] || 'Unknown'}
        </div>
      </div>
    </div>
  );
}
