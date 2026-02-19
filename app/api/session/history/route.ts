import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface HistoryMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface SessionHistoryResponse {
  messages: HistoryMessage[];
  sessionKey?: string;
  error?: string;
}

export async function GET() {
  try {
    // List active sessions and get the main session
    const { stdout: listOutput } = await execAsync(
      'openclaw sessions list --json',
      { timeout: 10000 }
    );

    const sessions = JSON.parse(listOutput) || [];
    
    // Find the main session (direct chat session)
    const mainSession = sessions.find((s: { kind?: string; sessionKey: string }) => 
      s.kind === 'main' || s.kind === 'chat' || s.sessionKey?.includes('main')
    ) || sessions[0];

    if (!mainSession && sessions.length === 0) {
      return NextResponse.json({
        messages: [],
        error: 'No active sessions found',
      });
    }

    const sessionKey = mainSession?.sessionKey;

    // Get history from the session
    const { stdout: historyOutput } = await execAsync(
      `openclaw sessions history "${sessionKey}" --json --limit 50`,
      { timeout: 10000 }
    );

    const history = JSON.parse(historyOutput) || [];

    // Transform history messages to our format
    const messages: HistoryMessage[] = history.map((msg: { 
      id?: string;
      role?: string; 
      content?: string; 
      timestamp?: string;
      text?: string;
      author?: string;
    }, index: number) => ({
      id: msg.id || `msg-${index}`,
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content || msg.text || '',
      timestamp: msg.timestamp || new Date().toISOString(),
    })).filter((m: HistoryMessage) => m.content);

    return NextResponse.json({
      messages,
      sessionKey,
    });
  } catch (error) {
    console.error('Error fetching session history:', error);
    // Return empty messages on error to allow chat to function
    return NextResponse.json({
      messages: [],
      error: 'Failed to fetch session history',
    });
  }
}
