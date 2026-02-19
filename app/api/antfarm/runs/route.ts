import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface WorkflowRun {
  id: string;
  status: 'running' | 'completed' | 'failed';
  workflowType: string;
  taskTitle: string;
  taskSummary?: string;
}

export interface AntfarmRunsResponse {
  runs: WorkflowRun[];
  activeCount: number;
  completedCount: number;
}

export async function GET() {
  try {
    const antfarmCliPath = '/Users/myassistant/.openclaw/workspace/antfarm/dist/cli/cli.js';
    const { stdout, stderr } = await execAsync(`node ${antfarmCliPath} workflow runs`);
    
    if (stderr && !stdout) {
      console.error('Antfarm CLI error:', stderr);
      return NextResponse.json({ error: 'Failed to fetch workflow runs' }, { status: 500 });
    }

    const runs = parseAntfarmOutput(stdout);
    
    const response: AntfarmRunsResponse = {
      runs,
      activeCount: runs.filter(r => r.status === 'running').length,
      completedCount: runs.filter(r => r.status === 'completed').length,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching antfarm runs:', error);
    return NextResponse.json({ error: 'Failed to fetch workflow runs' }, { status: 500 });
  }
}

function parseAntfarmOutput(output: string): WorkflowRun[] {
  const runs: WorkflowRun[] = [];
  const lines = output.split('\n');
  
  for (const line of lines) {
    // Match pattern: [status] id workflowType "task title...
    const match = line.match(/^\s*\[(\w+)\s*\]\s+([a-f0-9-]+)\s+(\S+)\s+"?(.+?)"?$/);
    if (match) {
      const [, statusRaw, id, workflowType, taskTitle] = match;
      runs.push({
        id: id.slice(0, 8), // Shorten ID for display
        status: normalizeStatus(statusRaw),
        workflowType,
        taskTitle: taskTitle.trim().slice(0, 60) + (taskTitle.length > 60 ? '...' : ''),
      });
    }
  }
  
  return runs;
}

function normalizeStatus(status: string): 'running' | 'completed' | 'failed' {
  const s = status.toLowerCase().trim();
  if (s.includes('run')) return 'running';
  if (s.includes('complete')) return 'completed';
  if (s.includes('fail')) return 'failed';
  return 'running'; // default
}
