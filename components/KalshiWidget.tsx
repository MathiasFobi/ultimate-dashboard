'use client';

import React, { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, Activity, RefreshCw, AlertTriangle, Shield, Target, Zap, ChevronDown, ChevronUp } from 'lucide-react';

interface KalshiStats {
  mode: string;
  warning?: string;
  risk: {
    config: {
      MAX_POSITION_USD: number;
      MAX_DAILY_LOSS_USD: number;
      MAX_OPEN_POSITIONS: number;
    };
    status: {
      positionsOk: boolean;
      dailyLossOk: boolean;
      balanceOk: boolean;
    };
    dailyPnL: number;
    tradeCount: number;
  };
  balance: {
    available: number;
    total: number;
    currency: string;
  };
  positions: {
    open: number;
    value: number;
    details: Array<{
      ticker: string;
      side: string;
      count: number;
      price: number;
    }>;
  };
  markets: {
    total: number;
    active: number;
    opportunities: Array<{
      ticker: string;
      title: string;
      yes_ask: number;
      no_ask: number;
      volume: number;
    }>;
  };
  lastUpdated: string;
  error?: string;
}

interface KalshiWidgetProps {
  production?: boolean;
}

export default function KalshiWidget({ production = false }: KalshiWidgetProps) {
  const [stats, setStats] = useState<KalshiStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOpportunities, setShowOpportunities] = useState(true);
  const [showPositions, setShowPositions] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fetchStats = async () => {
    const endpoint = production ? '/api/kalshi/prod' : '/api/kalshi/stats';
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStats(data);
      setError(null);
    } catch (err: any) {
      console.error('Kalshi fetch failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // 30s refresh for prod
    return () => clearInterval(interval);
  }, [production]);

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 animate-pulse">
        <div className="h-4 w-48 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="mt-4 grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-zinc-200 dark:bg-zinc-800 rounded"></div>)}
        </div>
      </div>
    );
  }

  if (error || stats?.error) {
    return (
      <div className={`rounded-xl border p-6 shadow-sm ${production ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20' : 'border-red-200 bg-red-50 dark:border-red-900/50'}`}>
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <h3 className="font-semibold text-red-700">Kalshi Connection Error</h3>
        </div>
        <p className="text-red-600 text-sm mb-4">{error || stats?.error}</p>
        <p className="text-xs text-zinc-500">Production API requires valid keys. Check configuration.</p>
        <button
          onClick={() => { setLoading(true); fetchStats(); }}
          className="mt-4 text-xs font-medium underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const isLive = stats?.mode === 'PRODUCTION';
  const riskOk = stats?.risk?.status?.positionsOk && stats?.risk?.status?.dailyLossOk && stats?.risk?.status?.balanceOk;

  return (
    <div className={`rounded-xl border p-6 shadow-sm ${production ? 'border-amber-300 dark:border-amber-700' : 'border-zinc-200 dark:border-zinc-800'} bg-white dark:bg-zinc-900`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isLive ? (
            <>
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-amber-600">LIVE TRADING</h3>
                <p className="text-[10px] text-amber-500 font-mono">PRODUCTION MODE</p>
              </div>
            </>
          ) : (
            <>
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <h3 className="text-sm font-medium uppercase tracking-wider text-zinc-500">Kalshi Trading</h3>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <div className={`px-2 py-1 rounded text-xs font-bold ${riskOk ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {riskOk ? 'RISK OK' : 'RISK ALERT'}
            </div>
          )}
          <button
            onClick={() => { setLoading(true); fetchStats(); }}
            className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Risk Warning for Production */}
      {isLive && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <p className="text-xs text-amber-800 dark:text-amber-200 font-medium">
            ⚠️ Trading with REAL MONEY. Daily Loss Limit: ${stats.risk.config.MAX_DAILY_LOSS_USD}
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
          <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 text-xs">
            <DollarSign className="h-3 w-3" />
            <span>Available</span>
          </div>
          <p className="text-xl font-bold">
            ${typeof stats?.balance?.available === 'number' ? stats.balance.available.toLocaleString() : parseFloat(stats?.balance?.available || '0').toLocaleString()}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
          <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 text-xs">
            <Target className="h-3 w-3" />
            <span>Open Positions</span>
          </div>
          <p className="text-xl font-bold">{stats?.positions?.open || 0}</p>
          <p className="text-[10px] text-zinc-400">Value: ${typeof stats?.positions?.value === 'number' ? stats.positions.value.toFixed(0) : parseFloat(stats?.positions?.value || '0').toFixed(0)}</p>
        </div>

        <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800">
          <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 text-xs">
            <Activity className="h-3 w-3" />
            <span>Active Markets</span>
          </div>
          <p className="text-xl font-bold">{stats?.markets?.active || 0}</p>
          <p className="text-[10px] text-zinc-400">of {stats?.markets?.total || 0} total</p>
        </div>
      </div>

      {/* PnL Section */}
      {isLive && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="p-2 rounded bg-zinc-100 dark:bg-zinc-800/50">
            <p className="text-xs text-zinc-500">Daily P&L</p>
            <p className={`text-lg font-bold ${(parseFloat(String(stats?.risk?.dailyPnL)) || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(parseFloat(String(stats?.risk?.dailyPnL)) || 0) >= 0 ? '+' : ''}${(parseFloat(String(stats?.risk?.dailyPnL)) || 0).toFixed(2)}
            </p>
          </div>
          <div className="p-2 rounded bg-zinc-100 dark:bg-zinc-800/50">
            <p className="text-xs text-zinc-500">Trades Today</p>
            <p className="text-lg font-bold">{stats?.risk?.tradeCount || 0}</p>
          </div>
        </div>
      )}

      {/* Open Positions - Collapsible */}
      {(stats?.positions?.open ?? 0) > 0 && (
        <div className="mb-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
          <button
            onClick={() => setShowPositions(!showPositions)}
            className="flex items-center justify-between w-full mb-2"
          >
            <h4 className="text-xs font-medium uppercase tracking-wider text-zinc-400">Open Positions</h4>
            {isMobile && (
              showPositions ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />
            )}
          </button>
          {(!isMobile || showPositions) && stats?.positions?.details && (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {stats.positions.details.map((pos) => (
                <div key={pos.ticker} className="flex items-center justify-between p-2 rounded bg-zinc-50 dark:bg-zinc-800/50 text-sm">
                  <span className="font-mono text-xs truncate max-w-[120px] md:max-w-none">{pos.ticker.substring(0, 25)}...</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${pos.side === 'yes' ? 'text-green-600' : 'text-red-600'}`}>
                      {pos.side.toUpperCase()}
                    </span>
                    <span className="text-xs text-zinc-500">{pos.count} @ {(pos.price * 100).toFixed(0)}¢</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Trading Opportunities - Collapsible on Mobile */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
        <button
          onClick={() => setShowOpportunities(!showOpportunities)}
          className="flex items-center justify-between w-full mb-2"
        >
          <h4 className="text-xs font-medium uppercase tracking-wider text-zinc-400">{isLive ? 'LIVE OPPORTUNITIES' : 'Trending Markets'}</h4>
          {isMobile && (
            showOpportunities ? <ChevronUp className="h-4 w-4 text-zinc-400" /> : <ChevronDown className="h-4 w-4 text-zinc-400" />
          )}
        </button>
        {(!isMobile || showOpportunities) && (
          <div className={`space-y-2 ${isMobile ? 'max-h-48 overflow-y-auto' : ''}`}>
            {stats?.markets?.opportunities?.slice(0, isMobile ? 3 : undefined).map((market) => (
              <div key={market.ticker} className="flex items-center justify-between p-2 rounded bg-zinc-50 dark:bg-zinc-800/50">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" title={market.title}>{market.title}</p>
                  <p className="text-[10px] text-zinc-400 font-mono">{market.ticker.substring(0, 30)}...</p>
                </div>
                <div className="flex gap-1 md:gap-2 text-[10px]">
                  <span className="px-1.5 md:px-2 py-1 rounded bg-green-100 text-green-700 dark:bg-green-900/30">
                    Y {(market.yes_ask * 100).toFixed(0)}¢
                  </span>
                  <span className="px-1.5 md:px-2 py-1 rounded bg-red-100 text-red-700 dark:bg-red-900/30 hidden md:inline">
                    N {(market.no_ask * 100).toFixed(0)}¢
                  </span>
                </div>
              </div>
            )) || (
              <p className="text-sm text-zinc-500">No markets available</p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
        <span className="text-[10px] text-zinc-400">
          Last: {stats?.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString() : 'NA'}
        </span>
        {isLive && (
          <div className="flex gap-1">
            <Shield className="h-3 w-3 text-amber-500" />
            <span className="text-[10px] text-amber-500 font-bold">PROTECTED</span>
          </div>
        )}
      </div>
    </div>
  );
}
