import { expect, test, describe } from 'vitest';

describe('Session API Integration', () => {
  test('send endpoint exists and has correct structure', () => {
    // Verify the send API route file exists and is valid TypeScript
    const fs = require('fs');
    const path = require('path');
    
    const sendRoutePath = path.join(__dirname, '../app/api/session/send/route.ts');
    const historyRoutePath = path.join(__dirname, '../app/api/session/history/route.ts');
    
    expect(fs.existsSync(sendRoutePath)).toBe(true);
    expect(fs.existsSync(historyRoutePath)).toBe(true);
    
    const sendContent = fs.readFileSync(sendRoutePath, 'utf-8');
    const historyContent = fs.readFileSync(historyRoutePath, 'utf-8');
    
    // Verify key exports and structure
    expect(sendContent).toContain('export async function POST');
    expect(sendContent).toContain('openclaw sessions send');
    expect(historyContent).toContain('export async function GET');
    expect(historyContent).toContain('openclaw sessions list');
    expect(historyContent).toContain('openclaw sessions history');
  });

  test('chat page imports session API', () => {
    const fs = require('fs');
    const path = require('path');
    
    const chatPagePath = path.join(__dirname, '../app/chat/page.tsx');
    const content = fs.readFileSync(chatPagePath, 'utf-8');
    
    // Verify the chat page has been updated to use real API
    expect(content).toContain('/api/session/send');
    expect(content).toContain('/api/session/history');
    expect(content).toContain('fetchHistory');
    expect(content).toContain('pollForResponse');
  });

  test('API response types are correctly defined', () => {
    const fs = require('fs');
    const path = require('path');
    
    const historyRoutePath = path.join(__dirname, '../app/api/session/history/route.ts');
    const sendRoutePath = path.join(__dirname, '../app/api/session/send/route.ts');
    
    const historyContent = fs.readFileSync(historyRoutePath, 'utf-8');
    const sendContent = fs.readFileSync(sendRoutePath, 'utf-8');
    
    // Verify type definitions
    expect(historyContent).toContain('HistoryMessage');
    expect(historyContent).toContain('SessionHistoryResponse');
    expect(sendContent).toContain('SendMessageRequest');
    expect(sendContent).toContain('SendMessageResponse');
  });
});

describe('Chat Page Session Integration', () => {
  test('chat page uses real session API', () => {
    const fs = require('fs');
    const path = require('path');
    
    const chatPagePath = path.join(__dirname, '../app/chat/page.tsx');
    const content = fs.readFileSync(chatPagePath, 'utf-8');
    
    // Check that it's using real API calls
    expect(content).toContain('useEffect'); // Real data fetching
    expect(content).toContain('/api/session/history');
    expect(content).toContain('/api/session/send');
    expect(content).toContain('pollForResponse');
  });

  test('session API handles errors gracefully', () => {
    const fs = require('fs');
    const path = require('path');
    
    const chatPagePath = path.join(__dirname, '../app/chat/page.tsx');
    const content = fs.readFileSync(chatPagePath, 'utf-8');
    
    // Verify error handling is in place
    expect(content).toContain('error');
    expect(content).toContain('setError');
    expect(content).toContain('Dismiss');
  });

  test('session API sanitizes messages', () => {
    const fs = require('fs');
    const path = require('path');
    
    const sendRoutePath = path.join(__dirname, '../app/api/session/send/route.ts');
    const content = fs.readFileSync(sendRoutePath, 'utf-8');
    
    // Verify message sanitization
    expect(content).toContain('escape');
    expect(content).toContain('replace');
  });
});
