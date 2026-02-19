'use client';

import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle, Clock, PlayCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface WorkflowRun {
  id: string;
  status: 'running' | 'completed' | 'failed';
  workflowType: string;
  taskTitle: string;
}

interface AntfarmStatus {
  runs: WorkflowRun[];
  activeCount: number;
  completedCount: number;
}

export default function AntfarmMonitorWidget() {
  const [status, setStatus] = useState<AntfarmStatus | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchRuns = async () => {
    try {
      const res = await fetch('/api/antfarm/runs');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setStatus(data);
      setLastUpdated(new Date());
      setError(false);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
    const interval = setInterval(fetchRuns, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <PlayCircle className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-zinc-400" />;
    }
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-zinc-400';
    }
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 animate-pulse">
        <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="mt-4 space-y-3">
          <div className="h-8 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
          <div className="h-8 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm dark:border-red-900/50 dark:bg-red-900/20">
        <h3 className="text-sm font-medium uppercase tracking-wider text-red-600 dark:text-red-400">Antfarm Monitor</h3>
        <div className="mt-4 flex items-center gap-3 text-red-700 dark:text-red-300">
          <Activity className="h-5 w-5" />
          <span className="font-semibold">Error connecting to Antfarm API</span>
        </div>
        <button
          onClick={() => { setLoading(true); fetchRuns(); }}
          className="mt-4 text-xs font-medium underline uppercase tracking-tight"
        >
          Retry
        </button>
      </div>
    );
  }

  const activeRuns = status?.runs.filter((r) => r.status === 'running') || [];
  const completedRuns = status?.runs.filter((r) => r.status === 'completed') || [];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            Antfarm Monitor
          </h3>
          {activeRuns.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
              {activeRuns.length} Active
            </span>
          )}
        </div>
        <Link
          href="/antfarm"
          className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          View All →
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3">
          <div className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Active</span>
          </div>
          <p className="mt-1 text-2xl font-semibold">{status?.activeCount || 0}</p>
        </div>
        <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Completed</span>
          </div>
          <p className="mt-1 text-2xl font-semibold">{status?.completedCount || 0}</p>
        </div>
      </div>

      {/* Active Runs List */}
      {activeRuns.length > 0 && (
        <div className="mt-4">
          <h4 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Active Runs</h4>
          <div className="space-y-2">
            {activeRuns.slice(0, 3).map((run) => (
              <div
                key={run.id}
                className="flex items-start gap-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/30 p-3"
              >
                <div className={`h-2 w-2 mt-1.5 rounded-full ${getStatusDot(run.status)} animate-pulse`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{run.taskTitle}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {run.workflowType} · {run.id}
                  </p>
                </div>
                {getStatusIcon(run.status)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Runs (show last 2) */}
      {completedRuns.length > 0 && activeRuns.length < 3 && (
        <div className="mt-4">
          <h4 className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2">Recently Completed</h4>
          <div className="space-y-2">
            {completedRuns.slice(0, 2).map((run) => (
              <div
                key={run.id}
                className="flex items-start gap-3 rounded-lg border border-zinc-100 dark:border-zinc-800 p-2"
              >
                <div className={`h-2 w-2 mt-1.5 rounded-full ${getStatusDot(run.status)}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-zinc-600 dark:text-zinc-400">{run.taskTitle}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{run.workflowType} · {run.id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeRuns.length === 0 && completedRuns.length === 0 && (
        <div className="mt-6 text-center py-6">
          <Activity className="h-8 w-8 mx-auto text-zinc-300 dark:text-zinc-600" />
          <p className="mt-2 text-sm text-zinc-500">No workflow runs found</p>
        </div>
      )}

      {/* Last Updated */}
      <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <p className="text-xs text-zinc-400">Last updated: {formatTime(lastUpdated)}</p>
          <button
            onClick={() => { setLoading(true); fetchRuns(); }}
            className="text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          >
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
}
