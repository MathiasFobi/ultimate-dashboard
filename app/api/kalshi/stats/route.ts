import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import crypto from 'crypto';

const KALSHI_API_BASE = 'https://demo-api.kalshi.com';
const KEY_PATH = '/Users/myassistant/Documents/projects/kalshi-specialist/kalshi_key.pem';

// Generate signed request for Kalshi API
function generateSignature(method: string, path: string, timestamp: string, body: string = ''): string {
  try {
    const privateKey = readFileSync(KEY_PATH, 'utf8');
    const message = `${method}${path}${timestamp}${body}`;
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(message);
    sign.end();
    return sign.sign(privateKey, 'base64');
  } catch (error) {
    console.error('Error generating signature:', error);
    return '';
  }
}

async function kalshiRequest(endpoint: string, method: string = 'GET') {
  const timestamp = new Date().toISOString().replace('Z', '+00:00');
  const signature = generateSignature(method, endpoint, timestamp);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Kalshi-Auth-Timestamp': timestamp,
    'X-Kalshi-Auth-Signature': signature,
  };

  const response = await fetch(`${KALSHI_API_BASE}${endpoint}`, {
    method,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Kalshi API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function GET() {
  try {
    // Fetch all the data in parallel
    const [markets, balance] = await Promise.all([
      kalshiRequest('/trade-api/v2/markets?status=open&limit=10').catch(() => ({ markets: [] })),
      kalshiRequest('/trade-api/v2/portfolio/balance').catch(() => ({ available_balance: 0, total_balance: 0 })),
    ]);

    // Calculate stats
    const totalMarkets = markets.markets?.length || 0;
    const activeMarkets = markets.markets?.filter((m: any) => m.status === 'active').length || 0;

    return NextResponse.json({
      markets: {
        total: totalMarkets,
        active: activeMarkets,
        trending: markets.markets?.slice(0, 5) || [],
      },
      balance: {
        available: balance.available_balance || 0,
        total: balance.total_balance || 0,
        currency: 'USD',
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Kalshi API error:', error);
    return NextResponse.json({
      markets: { total: 0, active: 0, trending: [] },
      balance: { available: 0, total: 0, currency: 'USD' },
      lastUpdated: new Date().toISOString(),
      error: 'Failed to fetch Kalshi data',
    });
  }
}
