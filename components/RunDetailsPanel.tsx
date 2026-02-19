'use client';

import React, { useEffect, useState, useRef } from 'react';
import { 
  ArrowLeft, 
  PlayCircle, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  ChevronRight,
  Loader2,
  AlertCircle,
  Terminal
} from 'lucide-react';

interface Story {
  id: string;
  title: string;
  status: 'pending' | 'claimed' | 'in-progress' | 'done' | 'verified' | 'failed';
  agentId?: string;
  startedAt?: string;
  completedAt?: string;
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error' | 'step';
  agentId?: string;
  message: string;
}

interface WorkflowRun {
  id: string;
  status: 'running' | 'completed' | 'failed';
  workflowType: string;
  taskTitle: string;
}

interface RunDetailsPanelProps {
  run: WorkflowRun;
  onBack: () => void;
}

export default function RunDetailsPanel({ run, onBack }: RunDetailsPanelProps) {
  const [stories, setStories] = useState<Story[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [storiesError, setStoriesError] = useState(false);
  const [logsError, setLogsError] = useState(false);
  const [activeTab, setActiveTab] = useState<'stories' | 'logs'>('stories');
  const [expandedStories, setExpandedStories] = useState<Set<string>>(new Set());
  const logsEndRef = useRef<HTMLDivElement>(null);

  const fetchStories = async () => {
    try {
      const res = await fetch(`/api/antfarm/runs/${run.id}/stories`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setStories(data.stories || []);
      setStoriesError(false);
    } catch (err) {
      console.error('Error fetching stories:', err);
      setStoriesError(true);
    } finally {
      setStoriesLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/antfarm/runs/${run.id}/logs`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setLogs(data.logs || []);
      setLogsError(false);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setLogsError(true);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchStories();
    fetchLogs();

    // Poll for updates
    const interval = setInterval(() => {
      if (run.status === 'running') {
        fetchStories();
        fetchLogs();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [run.id, run.status]);

  useEffect(() => {
    // Auto-scroll to bottom for logs
    if (activeTab === 'logs' && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, activeTab]);

  const toggleStoryExpand = (storyId: string) => {
    const newExpanded = new Set(expandedStories);
    if (newExpanded.has(storyId)) {
      newExpanded.delete(storyId);
    } else {
      newExpanded.add(storyId);
    }
    setExpandedStories(newExpanded);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in-progress':
      case 'claimed':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'done':
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-zinc-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'in-progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'claimed': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'done': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'verified': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      'failed': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      'pending': 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
    };
    
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.replace('-', ' ')}
      </span>
    );
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'text-emerald-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-amber-400';
      case 'step':
        return 'text-blue-400';
      default:
        return 'text-zinc-300';
    }
  };

  const completedStories = stories.filter(s => s.status === 'done' || s.status === 'verified').length;
  const inProgressCount = stories.filter(s => s.status === 'in-progress' || s.status === 'claimed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-bold tracking-tight truncate">{run.taskTitle}</h2>
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <span className="font-mono">{run.id}</span>
            <span>·</span>
            <span>{run.workflowType}</span>
            <span>·</span>
            {run.status === 'running' ? (
              <span className="text-blue-600 dark:text-blue-400">Running</span>
            ) : run.status === 'completed' ? (
              <span className="text-emerald-600 dark:text-emerald-400">Completed</span>
            ) : (
              <span className="text-red-600 dark:text-red-400">Failed</span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      {stories.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Total Stories</p>
            <p className="text-2xl font-semibold mt-1">{stories.length}</p>
          </div>
          <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-4">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Completed</p>
            <p className="text-2xl font-semibold text-emerald-700 dark:text-emerald-400 mt-1">{completedStories}</p>
          </div>
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4">
            <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider">In Progress</p>
            <p className="text-2xl font-semibold text-blue-700 dark:text-blue-400 mt-1">{inProgressCount}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('stories')}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === 'stories'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Stories
              {stories.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 rounded">
                  {stories.length}
                </span>
              )}
            </div>
            {activeTab === 'stories' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-3 px-1 text-sm font-medium transition-colors relative ${
              activeTab === 'logs'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              Logs
              {logs.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 rounded">
                  {logs.length}
                </span>
              )}
            </div>
            {activeTab === 'logs' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400" />
            )}
          </button>
        </div>
      </div>

      {/* Stories Panel */}
      {activeTab === 'stories' && (
        <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
          {storiesLoading ? (
            <div className="p-8 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : storiesError ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-8 w-8 mx-auto text-red-400 mb-2" />
              <p className="text-zinc-600 dark:text-zinc-400">Failed to load stories</p>
            </div>
          ) : stories.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="h-8 w-8 mx-auto text-zinc-300 dark:text-zinc-600 mb-2" />
              <p className="text-zinc-500">No stories found for this run</p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {stories.map((story) => (
                <div key={story.id} className="p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors">
                  <div 
                    className="flex items-start gap-3 cursor-pointer"
                    onClick={() => toggleStoryExpand(story.id)}
                  >
                    <button className="mt-0.5">
                      {expandedStories.has(story.id) ? (
                        <ChevronRight className="h-4 w-4 rotate-90 transition-transform" />
                      ) : (
                        <ChevronRight className="h-4 w-4 transition-transform" />
                      )}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(story.status)}
                        <p className="font-medium flex-1">{story.title}</p>
                        {getStatusBadge(story.status)}
                      </div>                      
                      {expandedStories.has(story.id) && (
                        <div className="mt-2 text-sm text-zinc-500 space-y-1">
                          {story.agentId && (
                            <p>Agent: <span className="font-mono">{story.agentId}</span></p>
                          )}
                          {story.startedAt && (
                            <p>Started: {story.startedAt}</p>
                          )}
                          {story.completedAt && (
                            <p>Completed: {story.completedAt}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Logs Panel */}
      {activeTab === 'logs' && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-900 dark:border-zinc-800 overflow-hidden">
          {logsLoading ? (
            <div className="p-8 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
            </div>
          ) : logsError ? (
            <div className="p-8 text-center">
              <AlertCircle className="h-8 w-8 mx-auto text-red-400 mb-2" />
              <p className="text-zinc-400">Failed to load logs</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center">
              <Terminal className="h-8 w-8 mx-auto text-zinc-600 mb-2" />
              <p className="text-zinc-500">No logs found for this run</p>
            </div>
          ) : (
            <div className="p-4 font-mono text-xs max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="py-1 border-b border-zinc-800 last:border-0">
                  <div className="flex gap-2">
                    {log.timestamp && (
                      <span className="text-zinc-500 shrink-0 w-16">{log.timestamp}</span>
                    )}
                    {log.agentId && (
                      <span className="text-blue-400 shrink-0 w-20">{log.agentId}</span>
                    )}
                    <span className={getLogLevelColor(log.level)}>
                      {log.message}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
