import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface Story {
  id: string;
  title: string;
  status: 'pending' | 'claimed' | 'in-progress' | 'done' | 'verified' | 'failed';
  agentId?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface StoriesResponse {
  runId: string;
  stories: Story[];
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: runId } = await params;
  
  try {
    // Get stories using antfarm step stories command
    const antfarmCliPath = '/Users/myassistant/.openclaw/workspace/antfarm/dist/cli/cli.js';
    const { stdout, stderr } = await execAsync(
      `node ${antfarmCliPath} step stories ${runId}`,
      { timeout: 10000 }
    );

    if (stderr && !stdout) {
      // Try parsing logs as fallback
      const stories = await parseStoriesFromLogs(runId);
      return NextResponse.json(stories);
    }

    const stories = parseStoriesOutput(stdout, runId);
    return NextResponse.json(stories);
  } catch (error) {
    // Fallback: parse stories from logs
    try {
      const stories = await parseStoriesFromLogs(runId);
      return NextResponse.json(stories);
    } catch {
      return NextResponse.json({
        runId,
        stories: [],
        total: 0,
        completed: 0,
        inProgress: 0,
        pending: 0,
      });
    }
  }
}

async function parseStoriesFromLogs(runId: string): Promise<StoriesResponse> {
  const antfarmCliPath = '/Users/myassistant/.openclaw/workspace/antfarm/dist/cli/cli.js';
  const { stdout } = await execAsync(
    `node ${antfarmCliPath} logs ${runId}`,
    { timeout: 15000 }
  );
  
  return parseStoriesFromLogOutput(stdout, runId);
}

function parseStoriesOutput(output: string, runId: string): StoriesResponse {
  const stories: Story[] = [];
  const lines = output.split('\n');
  
  // Parse stories from antfarm output
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Match story patterns
    const storyMatch = trimmed.match(/^\[(.+?)\]\s+(.+)$/);
    if (storyMatch) {
      const [, id, title] = storyMatch;
      stories.push({
        id: id.trim(),
        title: title.trim(),
        status: 'pending',
      });
    }
  }
  
  return calculateStats(runId, stories);
}

function parseStoriesFromLogOutput(output: string, runId: string): StoriesResponse {
  const storyMap = new Map<string, Story>();
  const lines = output.split('\n');
  
  for (const line of lines) {
    // Story started pattern: "09:15 AM  [04b0994e]  developer  Story started — Add mobile viewport"
    const startedMatch = line.match(/\[[a-f0-9-]+\]\s+(\w+)\s+Story started\s+[—-]\s+(.+)$/i);
    if (startedMatch) {
      const [, agentId, title] = startedMatch;
      const storyId = title.toLowerCase().replace(/\s+/g, '-').slice(0, 30);
      
      if (!storyMap.has(storyId)) {
        storyMap.set(storyId, {
          id: storyId,
          title: title.trim(),
          status: 'in-progress',
          agentId,
          startedAt: line.split('  ')[0]?.trim(),
        });
      }
      continue;
    }
    
    // Story done pattern
    const doneMatch = line.match(/\[[a-f0-9-]+\]\s+Story done\s+[—-]\s+(.+)$/i);
    if (doneMatch) {
      const [, title] = doneMatch;
      const storyId = title.toLowerCase().replace(/\s+/g, '-').slice(0, 30);
      
      const existing = storyMap.get(storyId);
      if (existing) {
        existing.status = 'done';
        existing.completedAt = line.split('  ')[0]?.trim();
      } else {
        storyMap.set(storyId, {
          id: storyId,
          title: title.trim(),
          status: 'done',
          completedAt: line.split('  ')[0]?.trim(),
        });
      }
      continue;
    }
    
    // Story verified pattern
    const verifiedMatch = line.match(/\[[a-f0-9-]+\]\s+(\w+)\s+Story verified/i);
    if (verifiedMatch) {
      // Find most recent story and mark as verified
      const mostRecent = Array.from(storyMap.values()).pop();
      if (mostRecent && mostRecent.status === 'done') {
        mostRecent.status = 'verified';
      }
    }
    
    // Step claimed pattern for agent assignment
    const claimedMatch = line.match(/\[[a-f0-9-]+\]\s+(\w+)\s+Claimed step/i);
    if (claimedMatch) {
      const [, agentId] = claimedMatch;
      // Track agent assignment for next story start
    }
  }
  
  return calculateStats(runId, Array.from(storyMap.values()));
}

function calculateStats(runId: string, stories: Story[]): StoriesResponse {
  const completed = stories.filter(s => s.status === 'done' || s.status === 'verified').length;
  const inProgress = stories.filter(s => s.status === 'in-progress' || s.status === 'claimed').length;
  const pending = stories.filter(s => s.status === 'pending').length;
  
  return {
    runId,
    stories,
    total: stories.length,
    completed,
    inProgress,
    pending,
  };
}
