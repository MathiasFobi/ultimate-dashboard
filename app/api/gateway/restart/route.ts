import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    // Trigger gateway restart
    exec('openclaw gateway restart', (error, stdout, stderr) => {
      if (error) {
        console.error('Gateway restart error:', error);
      } else {
        console.log('Gateway restart initiated:', stdout);
      }
    });
    
    // Return immediately since restart is async
    return NextResponse.json({ 
      success: true, 
      message: 'Gateway restart initiated' 
    });
  } catch (error) {
    console.error('Error restarting gateway:', error);
    return NextResponse.json(
      { error: 'Failed to restart gateway' }, 
      { status: 500 }
    );
  }
}
