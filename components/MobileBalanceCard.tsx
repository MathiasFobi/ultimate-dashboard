'use client';

import React, { useEffect, useState } from 'react';
import { RefreshCw, TrendingUp, Target, Activity } from 'lucide-react';

interface BalanceData {
  balance?: {
    available: number;
  };
  positions?: {
    open: number;
  };
  markets?: {
    liquid: number;
  };
}

export function MobileBalanceCard() {
  const [data, setData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/kalshi/prod');
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error('Fetch failed:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="mt-4 rounded-xl bg-gradient-to-br from-blue-600 to-purple-700 p-4 text-white animate-pulse">
        <div className="h-8 bg-white/20 rounded w-32 mb-2"></div>
        <div className="h-4 bg-white/20 rounded w-24"></div>
      </div>
    );
  }

  const balance = typeof data?.balance?.available === 'number' ? data.balance.available : parseFloat(data?.balance?.available || '0') || 0;
  const openPositions = data?.positions?.open || 0;
  const markets = data?.markets?.liquid || 0;

  return (
    <div className="mt-4 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-4 text-white shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-200" />
          <span className="text-sm font-medium text-blue-100">Kalshi Live</span>
        </div>
        <button
          onClick={fetchData}
          className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
        >
          <RefreshCw className="h-4 w-4 text-white" />
        </button>
      </div>

      <div className="mb-4">
        <span className="text-4xl font-bold">${balance.toFixed(2)}</span>
        <p className="text-sm text-blue-200">Available Balance</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/10 rounded-lg p-2">
          <div className="flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5 text-blue-200" />
            <span className="text-xs text-blue-200">Positions</span>
          </div>
          <span className="text-xl font-semibold">{openPositions}/5</span>
        </div>

        <div className="bg-white/10 rounded-lg p-2">
          <div className="flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-blue-200" />
            <span className="text-xs text-blue-200">Markets</span>
          </div>
          <span className="text-xl font-semibold">{markets}</span>
        </div>
      </div>
    </div>
  );
}
