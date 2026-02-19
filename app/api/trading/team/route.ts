import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// RESEARCHED & RISKY Trading Configuration - $10 Account
const TRADING_TEAM = {
  SCOUT: {
    id: 'market-scout',
    role: 'Market Scanner',
    interval: 60000, // 1 min - finds opportunities
    silent: true,
    strategy: 'Volume-weighted selection, min 500 contract volume, price 5-30¢ range',
  },
  TRADER: {
    id: 'position-trader',
    role: 'Trade Executor',
    interval: 30000, // 30s - executes trades
    silent: false, // Announces trades
    limits: {
      max_positions: 3, // Tight control
      max_contracts_per_trade: 4, // INCREASED for 2-3 leg opportunities
      min_price: 3, // LOWERED to 3¢ (more opportunities)
      max_price: 35, // INCREASED to 35¢ (higher confidence range)
      min_volume: 150, // Balanced liquidity filter
    },
  },
  RISK: {
    id: 'risk-overseer',
    role: 'Risk Monitor',
    interval: 15000, // 15s - fastest for risk
    silent: true, // Silent unless breach
    limits: {
      max_daily_loss: 7, // INCREASED from $5 (more risk tolerance)
      min_balance: 2, // DECREASED from $5 (deploy more capital)
    },
  },
};

// EXPONENTIAL GROWTH CONFIGURATION - Scales with profits
const GROWTH_CONFIG = {
  starting_balance: 10, // Initial $10 account
  current_balance: 10,  // Will update dynamically
  total_profit: 0,    // Track cumulative gains
  
  // PROPORTIONAL SIZING: Position size scales with balance
  sizing: {
    base_contracts: 1,                          // Per $10 of balance
    contract_multiplier: 1,                     // Will scale with balance
    max_contracts_absolute: 10,                 // Hard cap
    position_limit_base: 5,                     // Base max positions
    position_limit_scaling: 0.5,               // +1 position per $20 profit
  },
  
  // COMPOUNDING: Reinvest profits
  reinvest_threshold: 5,                       // Reinvest every $5 profit
  profit_retention: 0.9,                      // Keep 90% in play
  
  // DYNAMIC RISK: Risk limits grow with balance
  risk: {
    daily_loss_pct: 0.7,                       // 70% of balance (was $7 fixed)
    min_balance_pct: 0.15,                     // 15% minimum (was $2 fixed)
  },
};

// Calculate dynamic position sizing based on current balance
function calculatePositionSize(price: number, isParlay: boolean, balance: number): { contracts: number; conviction: string } {
  // Base sizing from balance (proportional to account size)
  const balanceMultiplier = Math.max(1, Math.floor(balance / 10)); // 1x per $10
  
  // 2-3 leg parlays get boosted sizing (LOWERED from 4-5 legs)
  if (isParlay) {
    if (price >= 5) {
      // High confidence 2-3 leg: Up to 2x base per $10
      return { 
        contracts: Math.min(2 * balanceMultiplier, GROWTH_CONFIG.sizing.max_contracts_absolute),
        conviction: 'HIGH' 
      };
    } else {
      // Lower confidence 4-5 leg: 2x base
      return { 
        contracts: Math.min(2 * balanceMultiplier, GROWTH_CONFIG.sizing.max_contracts_absolute),
        conviction: 'MEDIUM' 
      };
    }
  }
  
  // Regular plays scaled by confidence and balance
  if (price >= 15 && price <= 25) {
    return { 
      contracts: Math.min(3 * balanceMultiplier, GROWTH_CONFIG.sizing.max_contracts_absolute),
      conviction: 'HIGH' 
    };
  } else if (price >= 10) {
    return { 
      contracts: Math.min(2 * balanceMultiplier, GROWTH_CONFIG.sizing.max_contracts_absolute),
      conviction: 'MEDIUM' 
    };
  } else if (price >= 5) {
    return { 
      contracts: Math.min(2 * balanceMultiplier, GROWTH_CONFIG.sizing.max_contracts_absolute),
      conviction: 'MEDIUM' 
    };
  } else if (price >= 2) {
    return { 
      contracts: Math.min(1 * balanceMultiplier, GROWTH_CONFIG.sizing.max_contracts_absolute),
      conviction: 'LOW' 
    };
  }
  
  return { contracts: 1, conviction: 'LOW' };
}

// Calculate dynamic position limit based on balance
function calculatePositionLimit(balance: number): number {
  const baseLimit = GROWTH_CONFIG.sizing.position_limit_base;
  const bonusPositions = Math.floor((balance - GROWTH_CONFIG.starting_balance) / 20); // +1 per $20 above start
  return Math.min(15, baseLimit + Math.max(0, bonusPositions)); // Cap at 15 positions
}

// Current positions and trading state
type TradingState = {
  mode: 'demo' | 'prod';
  positions: any[];
  dailyPnL: number;
  riskBreaches: string[];
  opportunities: any[];
  totalProfit: number;
  peakBalance: number;
  tradesExecuted: number;
  winRate: number;
};

const state: TradingState = {
  mode: 'prod',
  positions: [],
  dailyPnL: 0,
  riskBreaches: [],
  opportunities: [],
  totalProfit: 0,
  peakBalance: 10,
  tradesExecuted: 0,
  winRate: 0,
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const agent = searchParams.get('agent');

  try {
    switch (agent) {
      case 'scout':
        // Market Scout: Discover opportunities
        return await runScout();
      
      case 'trader':
        // Position Trader: Execute on signals
        return await runTrader();
      
      case 'risk':
        // Risk Overseer: Monitor limits
        return await runRiskOverseer();
      
      default:
        return NextResponse.json({
          team: TRADING_TEAM,
          state,
          endpoints: {
            scout: '/api/trading/team?agent=scout',
            trader: '/api/trading/team?agent=trader',
            risk: '/api/trading/team?agent=risk',
          },
        });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Market Scout Agent - RESEARCHED & RISKY Strategy
async function runScout() {
  try {
    // Fetch market data from Kalshi
    const res = await fetch('http://127.0.0.1:4444/api/kalshi/prod');
    const data = await res.json();
    
    // RESEARCHED: Prioritize 4-5 leg parlays (most accurate)
    let opportunities = (data.markets?.opportunities || [])
      .filter((m: any) => {
        // Must have liquidity
        if (!m.yes_ask || m.yes_ask <= 0 || m.yes_ask >= 95) return false;
        
        // PARLAY LEG DETECTION: Check title for leg count
        const title = m.title?.toLowerCase() || '';
        const isParlay = title.includes('parlay') || title.includes('multi') || title.includes('combo');
        
        // Count "+" symbols or numbers to estimate legs
        const legMatches = title.match(/(\d)\s*leg/i) || title.match(/(\d)\s*parlay/i);
        const explicitLegs = legMatches ? parseInt(legMatches[1]) : 0;
        const plusCount = (title.match(/\/\+/g) || []).length;
        const estimatedLegs = explicitLegs || (plusCount > 0 ? plusCount + 1 : 0);
        
        // TARGET: 4-5 leg parlays (most accurate based on your data)
        const is45LegParlay = isParlay && estimatedLegs >= 4 && estimatedLegs <= 5;
        
        // ALSO ACCEPT: High conviction singles and other quality plays
        const qualityZone = m.yes_ask >= 5 && m.yes_ask <= 30;
        const valuePlay = m.yes_ask >= 2 && m.yes_ask < 5 && m.volume > 50;
        
        // PRIORITY: 4-5 leg parlays get priority
        return is45LegParlay || qualityZone || valuePlay;
      })
      .map((m: any) => {
        const yesPrice = m.yes_ask;
        const noPrice = m.no_ask;
        const title = m.title?.toLowerCase() || '';
        
        // Detect 4-5 leg parlays for scoring boost
        const isParlay = title.includes('parlay') || title.includes('multi') || title.includes('combo');
        const legMatches = title.match(/(\d)\s*leg/i) || title.match(/(\d)\s*parlay/i);
        const explicitLegs = legMatches ? parseInt(legMatches[1]) : 0;
        const plusCount = (title.match(/\/\+/g) || []).length;
        const estimatedLegs = explicitLegs || (plusCount > 0 ? plusCount + 1 : 0);
        const is45LegParlay = isParlay && estimatedLegs >= 4 && estimatedLegs <= 5;
        
        // Get current balance for dynamic sizing
        const currentBalance = data.balance?.available ? parseFloat(data.balance.available) : 10;
        
        // EXPONENTIAL SCALING: Position size grows with balance
        const { contracts, conviction } = calculatePositionSize(yesPrice, is45LegParlay, currentBalance);
        
        // QUALITY SCORE: Boosted for 4-5 leg + account growth potential
        let quality_score = Math.round(m.volume + (50 - Math.abs(yesPrice - 15)) * 2);
        if (is45LegParlay) {
          quality_score += 200; // Parlay bonus
        }
        // Growth potential boost (low price + high potential return)
        if (yesPrice <= 5 && is45LegParlay) {
          quality_score += 100; // Cheap parlays with big upside
        }
        
        return {
          ticker: m.ticker,
          title: m.title?.substring(0, 60),
          signal: 'YES',
          conviction,
          suggested_contracts: contracts,
          yes_price: yesPrice,
          no_price: noPrice,
          volume: m.volume,
          leg_count: estimatedLegs,
          is_45_leg_parlay: is45LegParlay,
          quality_score: quality_score,
          potential_profit: ((100 - yesPrice) * contracts / 100).toFixed(2), // $ profit if win
          account_growth_potential: (((100 - yesPrice) * contracts / 100) / currentBalance * 100).toFixed(1) + '%',
        };
      })
      // Sort by: Quality score (volume + optimal price), then volume
      .sort((a: any, b: any) => b.quality_score - a.quality_score || b.volume - a.volume)
      .slice(0, 5);

    state.opportunities = opportunities;

    return NextResponse.json({
      agent: 'market-scout',
      status: 'scanning',
      opportunities_found: opportunities.length,
      opportunities,
      mode: state.mode,
      balance: data.balance,
      last_updated: data.lastUpdated,
    });
  } catch (error) {
    return NextResponse.json({
      agent: 'market-scout',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Position Trader Agent - Actually executes trades
async function runTrader() {
  try {
    // Get current state from Scout (for analyzed opportunities) + Risk check
    const [scoutRes, riskRes] = await Promise.all([
      fetch('http://127.0.0.1:4444/api/trading/team?agent=scout'),
      fetch('http://127.0.0.1:4444/api/trading/team?agent=risk'),
    ]);
    
    const scoutData = await scoutRes.json();
    const riskData = await riskRes.json();
    
    // Get balance/positions from kalshi for position count
    const kalshiRes = await fetch('http://127.0.0.1:4444/api/kalshi/prod');
    const kalshiData = await kalshiRes.json();
    
    // Check risk status
    if (riskData.status === 'BREACH') {
      return NextResponse.json({
        agent: 'position-trader',
        status: 'halted',
        reason: 'Risk breach: ' + riskData.breaches.join(', '),
      });
    }
    
    // Get the balance from Kalshi data - use actual balance from account
    const balance = kalshiData.balance?.available ? parseFloat(kalshiData.balance.available) : 10;
    
    // EXPONENTIAL GROWTH: Dynamic position limit based on balance
    // Base: 5 positions, +1 per $20 above starting $10
    const positionLimit = Math.min(15, 5 + Math.max(0, Math.floor((balance - 10) / 20)));
    
    // RISKY: Increased max positions to dynamic limit based on balance
    const totalActive = kalshiData.positions?.total_active || 
                       (kalshiData.positions?.open || 0) + (kalshiData.positions?.resting || 0);
    
    if (totalActive >= positionLimit) {
      return NextResponse.json({
        agent: 'position-trader',
        status: 'idle',
        reason: `Max positions reached (${positionLimit}) based on $${balance.toFixed(2)} balance - ${(kalshiData.positions?.resting || 0)} orders resting`,
        current_positions: totalActive,
        balance,
        scaling: {
          base_limit: 5,
          bonus_positions: Math.max(0, positionLimit - 5),
          total_limit: positionLimit,
        },
      });
    }

    // No opportunities, no trade
    if (!kalshiData.markets?.opportunities || kalshiData.markets.opportunities.length === 0) {
      return NextResponse.json({
        agent: 'position-trader',
        status: 'waiting',
        reason: 'No high-quality opportunities (focusing on 4-5 leg parlays)',
        markets_found: kalshiData.markets?.total || 0,
        balance,
        position_limit: positionLimit,
      });
    }

    // RESEARCHED: Pick best opportunity - PRIORITIZE 4-5 LEG PARLAYS with balance-aware sizing
    const candidates = scoutData.opportunities?.filter((m: any) => 
      (m.is_45_leg_parlay && m.yes_price >= 2) ||  // 4-5 leg parlays prioritized
      (m.conviction && (m.yes_price >= 5))        // Or quality singles
    ) || [];
    
    if (candidates.length === 0) {
      return NextResponse.json({
        agent: 'position-trader',
        status: 'waiting',
        reason: 'No 4-5 leg parlays or high-quality opportunities available',
        scout_status: scoutData.status,
        balance,
      });
    }
    
    // Sort by: 4-5 leg parlays first, then quality score
    const prioritized = candidates.sort((a: any, b: any) => {
      if (a.is_45_leg_parlay && !b.is_45_leg_parlay) return -1;
      if (!a.is_45_leg_parlay && b.is_45_leg_parlay) return 1;
      return b.quality_score - a.quality_score;
    });
    
    const best = prioritized[0];
    
    // EXPONENTIAL SCALING: Calculate contract count based on balance
    // Base: 1 contract per $10 of balance, doubled for 4-5 leg parlays
    const balanceMultiplier = Math.max(1, Math.floor(balance / 10));
    let contractCount = best.suggested_contracts || 1;
    
    if (best.is_45_leg_parlay && best.yes_price >= 5) {
      // 4-5 leg parlays: 3x base + balance scaling, capped at 10
      contractCount = Math.min(10, 3 * balanceMultiplier);
    } else if (best.is_45_leg_parlay && best.yes_price >= 2) {
      // Lower price 4-5 leg: 2x base + balance scaling
      contractCount = Math.min(8, 2 * balanceMultiplier);
    } else if (best.yes_price >= 15) {
      // Premium plays: 2x base
      contractCount = Math.min(6, 2 * balanceMultiplier);
    } else {
      // Standard: 1x base
      contractCount = Math.min(5, balanceMultiplier);
    }
    
    // EXECUTE the trade via Kalshi API
    const tradeResult = await executeTrade(best.ticker, 'yes', contractCount, best.yes_price);
    
    if (tradeResult.success) {
      // Update state
      state.positions.push({
        ticker: best.ticker,
        side: 'yes',
        count: contractCount,
        price: best.yes_price,
        conviction: best.conviction,
        order_id: tradeResult.order?.order_id,
        timestamp: new Date().toISOString(),
      });

      const totalCost = (best.yes_price * contractCount / 100).toFixed(2);

      return NextResponse.json({
        agent: 'position-trader',
        status: 'executed',
        trade: {
          ticker: best.ticker,
          side: 'yes',
          count: contractCount,
          price: best.yes_price,
          conviction: best.conviction,
          cost: `\$${totalCost}`,
          strategy: 'RESEARCHED & RISKY',
        },
        order: tradeResult.order,
        positions_now: state.positions.length,
        balance_remaining: kalshiData.balance?.available,
      });
    } else {
      return NextResponse.json({
        agent: 'position-trader',
        status: 'failed',
        reason: tradeResult.error,
        attempted: {
          ticker: best.ticker,
          count: contractCount,
          price: best.yes_price,
        },
      });
    }
  } catch (error) {
    return NextResponse.json({
      agent: 'position-trader',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Execute trade via Kalshi API
async function executeTrade(ticker: string, side: string, count: number, price: number) {
  try {
    const response = await fetch('http://127.0.0.1:4444/api/kalshi/prod', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticker,
        side,
        count,
        maxPrice: price,
      }),
    });

    const data = await response.json();
    
    if (response.ok && data.success) {
      return { success: true, order: data.order };
    } else {
      return { success: false, error: data.error || 'Unknown error' };
    }
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// Risk Overseer Agent - Checks against Kalshi account with DYNAMIC PERCENTAGE LIMITS
async function runRiskOverseer() {
  try {
    const kalshiRes = await fetch('http://127.0.0.1:4444/api/kalshi/prod');
    const kalshiData = await kalshiRes.json();
    
    const balance = parseFloat(kalshiData.balance?.available || '10');
    const positions = kalshiData.positions?.open || 0;
    
    // DYNAMIC RISK LIMITS: Scale with account balance
    // Daily loss limit: 70% of balance (was fixed $7)
    // Min balance: 15% of starting balance or $2, whichever is higher
    const startingBalance = 10;
    const dailyLossLimit = balance * 0.7; // 70% of current balance
    const minBalance = Math.max(2, startingBalance * 0.15); // $2 or 15% of start
    
    // Dynamic position limit: 5 base + 1 per $20 above $10
    const positionLimit = Math.min(15, 5 + Math.max(0, Math.floor((balance - 10) / 20)));
    
    const totalActive = kalshiData.positions?.total_active || positions + (kalshiData.positions?.resting || 0);
    
    const checks = {
      positionLimit: totalActive < positionLimit,
      balanceMinimum: balance >= minBalance,
      dailyLoss: state.dailyPnL > -dailyLossLimit,
    };

    const allClear = Object.values(checks).every(Boolean);
    const breaches = Object.entries(checks)
      .filter(([_, pass]) => !pass)
      .map(([name]) => name);

    state.riskBreaches = breaches;

    if (!allClear) {
      // Track stats for risk breach
      if (state.dailyPnL <= -dailyLossLimit) {
        state.totalProfit = Math.max(0, state.totalProfit + state.dailyPnL); // Reduce total profit
      }
      
      return NextResponse.json({
        agent: 'risk-overseer',
        status: 'BREACH',
        level: 'CRITICAL',
        breaches,
        metrics: {
          positions: totalActive,
          position_limit: positionLimit,
          balance,
          min_balance: minBalance,
          daily_pnl: state.dailyPnL,
          daily_loss_limit: -dailyLossLimit,
          daily_loss_pct: (Math.abs(state.dailyPnL) / balance * 100).toFixed(1) + '%',
        },
        action: 'TRADING_HALTED',
        timestamp: new Date().toISOString(),
      });
    }

    // Update peak balance tracking
    if (balance > state.peakBalance) {
      state.peakBalance = balance;
    }

    return NextResponse.json({
      agent: 'risk-overseer',
      status: 'all-clear',
      checks,
      metrics: {
        positions: totalActive,
        position_limit: positionLimit,
        balance,
        peak_balance: state.peakBalance,
        min_balance: minBalance,
        daily_pnl: state.dailyPnL,
        daily_loss_limit: -dailyLossLimit,
        total_profit: state.totalProfit,
        trades_executed: state.tradesExecuted,
        win_rate: state.winRate,
      },
      scaling: {
        balance_multiplier: Math.max(1, Math.floor(balance / 10)),
        position_limit: positionLimit,
        next_position_bonus: Math.max(0, 20 - (balance % 20)),
      },
      mode: state.mode,
    });
  } catch (error) {
    return NextResponse.json({
      agent: 'risk-overseer',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// POST endpoint for traders to report trades
export async function POST(req: Request) {
  try {
    const { agent, trade, pnl } = await req.json();

    if (agent === 'trader' && trade) {
      state.positions.push(trade);
    }

    if (pnl) {
      state.dailyPnL += pnl;
    }

    return NextResponse.json({
      acknowledged: true,
      state: {
        positions: state.positions.length,
        dailyPnL: state.dailyPnL,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
