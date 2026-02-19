import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error' | 'step';
  agentId?: string;
  message: string;
}

export interface LogsResponse {
  runId: string;
  logs: LogEntry[];
  logCount: number;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: runId } = await params;
  
  try {
    const antfarmCliPath = '/Users/myassistant/.openclaw/workspace/antfarm/dist/cli/cli.js';
    const { stdout, stderr } = await execAsync(
      `node ${antfarmCliPath} logs ${runId}`,
      { timeout: 15000 }
    );

    if (stderr && !stdout) {
      console.error('Antfarm CLI error:', stderr);
      return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }

    const logs = parseLogs(stdout, runId);
    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { runId, logs: [], logCount: 0, error: 'Failed to fetch logs' },
      { status: 500 }
    );
  }
}

function parseLogs(output: string, runId: string): LogsResponse {
  const logs: LogEntry[] = [];
  const lines = output.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Parse log format: "09:15 AM  [run-id]  agent  Message..."
    // or: "09:15 AM  [run-id]  Message..."
    const logMatch = trimmed.match(/^(\d{1,2}:\d{2}\s+(?:AM|PM))\s+\[([a-f0-9-]+)\]\s*(.+)$/i);
    
    if (logMatch) {
      const [, timestamp, runIdMatch, rest] = logMatch;
      
      // Determine level based on content
      let level: LogEntry['level'] = 'info';
      if (rest.match(/failed|error|abort/i)) level = 'error';
      else if (rest.match(/completed|done|success|verified/i)) level = 'success';
      else if (rest.match(/warning|timed out|retry/i)) level = 'warning';
      else if (rest.match(/claimed|started|step/i)) level = 'step';
      
      // Extract agent ID if present
      const agentMatch = rest.match(/^(\w+)\s+(.+)$/);
      const agentId = agentMatch ? agentMatch[1] : undefined;
      const message = agentMatch ? agentMatch[2] : rest;
      
      logs.push({
        timestamp,
        level,
        agentId,
        message: message.trim(),
      });
    } else if (trimmed.length > 0) {
      // Lines without timestamp (continuation or special output)
      logs.push({
        timestamp: '',
        level: 'info',
        message: trimmed,
      });
    }
  }
  
  return {
    runId,
    logs,
    logCount: logs.length,
  };
}
