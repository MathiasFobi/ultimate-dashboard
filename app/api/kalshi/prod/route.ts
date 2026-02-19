import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import crypto from 'crypto';

// PRODUCTION KALSHI API
const KALSHI_API_BASE = 'https://api.elections.kalshi.com/trade-api/v2';
const KALSHI_KEY_ID = 'ff721a25-d41f-47aa-a52a-3ff34667333b';
const PROD_KEY_PATH = '/Users/myassistant/Documents/projects/kalshi-specialist/kalshi_key.pem';

// RESEARCHED & RISKY TRADING CONFIG - $10 Capital (UPDATED)
const RISK_CONFIG = {
  TOTAL_CAPITAL: 10,             // $10 total
  MAX_POSITION_USD: 3,           // INCREASED: $3 max per position (30%)
  MAX_DAILY_LOSS_USD: 7,         // INCREASED: Stop after $7 loss (70%)
  MAX_OPEN_POSITIONS: 5,         // INCREASED: Max 5 positions
  MIN_PROBABILITY: 0.60,         // DECREASED: >60% confidence (more trades)
  MIN_EDGE_PERCENT: 5,           // DECREASED: 5% edge minimum
  POSITION_SIZING: {
    STRONG: 3,                   // HIGH conviction = 3 contracts
    MEDIUM: 2,                   // MEDIUM conviction = 2 contracts  
    WEAK: 1,                     // LOW conviction = 1 contract
  },
};

// Position tracking (in-memory, would use DB in production)
const positions = new Map();
let dailyPnL = 0;
let tradeCount = 0;

function generateSignature(method: string, path: string, timestampMs: string): string {
  try {
    const privateKey = readFileSync(PROD_KEY_PATH, 'utf8');
    // Kalshi NEW format: timestamp + method + path (no query params)
    const pathWithoutQuery = path.split('?')[0];
    const message = `${timestampMs}${method}${pathWithoutQuery}`;
    
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(message);
    sign.end();
    
    // RSA-PSS padding as per Kalshi docs
    return sign.sign({
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
    }, 'base64');
  } catch (error) {
    throw new Error('Failed to generate signature - check private key');
  }
}

async function kalshiRequest(endpoint: string, method: string = 'GET', body?: any) {
  // Kalshi NEW format: timestamp in milliseconds (no decimals)
  const timestampMs = Date.now().toString();
  const path = `/trade-api/v2${endpoint}`;
  const signature = generateSignature(method, path, timestampMs);
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'KALSHI-ACCESS-KEY': KALSHI_KEY_ID,
    'KALSHI-ACCESS-TIMESTAMP': timestampMs,
    'KALSHI-ACCESS-SIGNATURE': signature,
  };

  const bodyString = body ? JSON.stringify(body) : '';

  const response = await fetch(`${KALSHI_API_BASE}${endpoint}`, {
    method,
    headers,
    ...(bodyString && { body: bodyString }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Kalshi API error: ${response.status} ${error}`);
  }

  return response.json();
}

export async function GET() {
  const diagnostics: any = {
    keyPath: PROD_KEY_PATH,
    keyId: KALSHI_KEY_ID,
    keyExists: false,
    keyLoaded: false,
    apiTest: null,
  };

  try {
    // Check if key exists
    let privateKey: string;
    try {
      privateKey = readFileSync(PROD_KEY_PATH, 'utf8');
      diagnostics.keyExists = true;
      diagnostics.keyLength = privateKey.length;
      diagnostics.keyLoaded = true;
    } catch {
      throw new Error('Production key not found at ' + PROD_KEY_PATH);
    }

    // Fetch all PRODUCTION data (expanded to 100 markets to find liquidity)
    const [marketsResponse, balanceResponse, positionsResponse, ordersResponse] = await Promise.all([
      kalshiRequest('/markets?status=open&limit=100').catch((e) => { 
        console.error('Markets fetch failed:', e); 
        return { markets: [] }; 
      }),
      kalshiRequest('/portfolio/balance').catch((e) => { 
        console.error('Balance fetch failed:', e); 
        // Return null to indicate failure
        return null; 
      }),
      kalshiRequest('/portfolio/positions').catch((e) => {
        console.error('Positions fetch failed:', e);
        return { positions: [] };
      }),
      kalshiRequest('/portfolio/orders').catch((e) => {
        console.error('Orders fetch failed:', e);
        return { orders: [] };
      }),
    ]);

    const markets = marketsResponse.markets || [];
    const balance = balanceResponse;
    const openPositions = positionsResponse.positions || [];

    // Calculate stats - only count markets with actual liquidity
    const activeMarkets = markets.filter((m: any) => m.status === 'active').length;
    const liquidMarkets = markets.filter((m: any) => m.yes_ask > 0 && m.yes_ask < 100).length;
    const totalPositions = openPositions.length;
    const positionValue = openPositions.reduce((sum: number, pos: any) => 
      sum + (pos.count * (pos.avg_price || 0)), 0
    );

    // Risk check (balance in cents from Kalshi API)
    // balance contains: { balance: cents, portfolio_value: cents }
    const availableCents = balance?.balance || balance?.available_balance || 0;
    const totalCents = balance?.balance || balance?.total_balance || 0;
    
    // Count BOTH filled positions AND resting orders toward limit
    const restingOrders = ordersResponse?.orders?.filter((o: any) => 
      o.status === 'resting' || o.status === 'open'
    ).length || 0;
    const totalActivePositions = totalPositions + restingOrders;
    
    const riskStatus = {
      positionsOk: totalActivePositions < RISK_CONFIG.MAX_OPEN_POSITIONS,
      dailyLossOk: dailyPnL > -RISK_CONFIG.MAX_DAILY_LOSS_USD,
      balanceOk: availableCents >= 1000, // At least $10
    };

    return NextResponse.json({
      mode: 'PRODUCTION',
      warning: 'REAL MONEY TRADING',
      risk: {
        config: RISK_CONFIG,
        status: riskStatus,
        dailyPnL,
        tradeCount,
      },
      balance: {
        available: (availableCents / 100).toFixed(2),
        total: (totalCents / 100).toFixed(2),
        currency: 'USD',
        raw_cents: availableCents,
      },
      positions: {
        open: totalPositions,
        resting: restingOrders,
        total_active: totalActivePositions,
        value: positionValue,
        details: openPositions.slice(0, 5).map((p: any) => ({
          ticker: p.market_ticker,
          side: p.side,
          count: p.count,
          price: p.avg_price,
        })),
      },
      markets: {
        total: markets.length,
        active: activeMarkets,
        liquid: liquidMarkets,
        opportunities: markets
          .filter((m: any) => m.yes_ask > 0 && m.yes_ask < 100) // Only liquid markets
          .sort((a: any, b: any) => a.yes_ask - b.yes_ask) // Sort by cheapest
          .slice(0, 5)
          .map((m: any) => ({
            ticker: m.ticker,
            title: m.title,
            yes_ask: m.yes_ask,
            no_ask: m.no_ask,
            volume: m.volume,
          })),
      },
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Kalshi PROD API error:', error);
    diagnostics.error = error.message || 'Failed to fetch production data';
    diagnostics.suggestion = 'New API keys may take 5-10 minutes to activate. If this persists, verify the Key ID matches in Kalshi dashboard.';
    return NextResponse.json({
      mode: 'PRODUCTION',
      error: error.message || 'Failed to fetch production data',
      diagnostics,
      lastUpdated: new Date().toISOString(),
    }, { status: 500 });
  }
}

// Execute trade endpoint
export async function POST(req: Request) {
  try {
    const { ticker, side, count, maxPrice } = await req.json();

    // Get LIVE position count from Kalshi using kalshiRequest
    const [positionsData, ordersData] = await Promise.all([
      kalshiRequest('/portfolio/positions').catch(() => ({ positions: [] })),
      kalshiRequest('/portfolio/orders').catch(() => ({ orders: [] })),
    ]);
    
    const livePositions = positionsData.positions?.length || 0;
    const restingOrders = ordersData.orders?.filter((o: any) => 
      o.status === 'resting' || o.status === 'open'
    ).length || 0;
    
    const totalActive = livePositions + restingOrders;
    
    // Risk checks using LIVE data
    if (totalActive >= RISK_CONFIG.MAX_OPEN_POSITIONS) {
      return NextResponse.json({ 
        error: 'Max positions reached', 
        details: { livePositions, restingOrders, totalActive, limit: RISK_CONFIG.MAX_OPEN_POSITIONS }
      }, { status: 429 });
    }

    if (dailyPnL <= -RISK_CONFIG.MAX_DAILY_LOSS_USD) {
      return NextResponse.json({ error: 'Daily loss limit hit - trading halted' }, { status: 429 });
    }

    // Submit order to Kalshi PROD (correct API format)
    const priceField = side === 'yes' ? 'yes_price' : 'no_price';
    const order = await kalshiRequest('/portfolio/orders', 'POST', {
      Ticker: ticker,
      Action: 'buy',
      Side: side,
      Count: Math.min(count, 100),
      Type: 'limit',
      [priceField]: maxPrice,
    });

    // Track position
    positions.set(order.order?.order_id, {
      ticker,
      side,
      count,
      price: maxPrice,
      timestamp: new Date().toISOString(),
    });

    tradeCount++;

    return NextResponse.json({
      success: true,
      order: order.order,
      warning: 'TRADE EXECUTED ON LIVE ACCOUNT',
    });
  } catch (error: any) {
    console.error('Trade failed:', error);
    return NextResponse.json(
      { error: error.message || 'Trade failed' },
      { status: 500 }
    );
  }
}
