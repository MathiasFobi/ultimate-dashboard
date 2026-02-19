import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  try {
    const { stdout } = await execAsync('openclaw status --json');
    return NextResponse.json(JSON.parse(stdout));
  } catch (error) {
    console.error('Error fetching gateway status:', error);
    return NextResponse.json({ error: 'Failed to fetch gateway status' }, { status: 500 });
  }
}
