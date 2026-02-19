import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface SendMessageRequest {
  message: string;
}

export interface SendMessageResponse {
  success: boolean;
  sent: boolean;
  error?: string;
}

export async function POST(request: Request) {
  try {
    const body: SendMessageRequest = await request.json();
    
    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { success: false, sent: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Sanitize the message - escape special shell characters
    const sanitizedMessage = body.message
      .replace(/"/g, '\\"')
      .replace(/\$/g, '\\$')
      .replace(/`/g, '\\`');

    // Send message to active OpenClaw session
    // Using the main session (no sessionKey needed for the human's main chat)
    const { stdout, stderr } = await execAsync(
      `openclaw sessions send "${sanitizedMessage}"`,
      { timeout: 10000 }
    );

    if (stderr && !stdout.includes('sent')) {
      console.error('Session send error:', stderr);
      return NextResponse.json(
        { success: false, sent: false, error: stderr },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sent: true,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, sent: false, error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
