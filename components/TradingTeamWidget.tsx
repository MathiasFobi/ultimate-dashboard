'use client';

import React, { useEffect, useState } from 'react';
import { Bot, Activity, AlertTriangle, CheckCircle, Crosshair, Shield, Zap } from 'lucide-react';

interface TeamStatus {
  team: {
    SCOUT: { id: string; role: string; interval: number; silent: boolean };
    TRADER: { id: string; role: string; interval: number; silent: boolean };
    RISK: { id: string; role: string; interval: number; silent: boolean };
  };
  state: {
    mode: string;
    positions: any[];
    dailyPnL: number;
    riskBreaches: string[];
    opportunities: any[];
  };
}

interface ScoutStatus {
  status: string;
  opportunities_found?: number;
}

interface TraderStatus {
  status: string;
  next_action?: {
    ticker: string;
    side: string;
    count: number;
  };
}

interface RiskStatus {
  status: string;
  breaches?: string[];
}

interface AgentStatus {
  scout: ScoutStatus | null;
  trader: TraderStatus | null;
  risk: RiskStatus | null;
}

export default function TradingTeamWidget() {
  const [teamConfig, setTeamConfig] = useState<TeamStatus['team'] | null>(null);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({
    scout: null,
    trader: null,
    risk: null,
  });
  const [loading, setLoading] = useState(true);

  const fetchTeamConfig = async () => {
    const res = await fetch('/api/trading/team');
    const data = await res.json();
    setTeamConfig(data.team);
  };

  const fetchAgentStatus = async () => {
    const [scout, trader, risk] = await Promise.all([
      fetch('/api/trading/team?agent=scout').then(r => r.json()),
      fetch('/api/trading/team?agent=trader').then(r => r.json()),
      fetch('/api/trading/team?agent=risk').then(r => r.json()),
    ]);
    
    setAgentStatus({ scout, trader, risk });
  };

  useEffect(() => {
    fetchTeamConfig();
    fetchAgentStatus();
    setLoading(false);

    const scoutInterval = setInterval(() => fetch('/api/trading/team?agent=scout').then(r => r.json()).then(data => 
      setAgentStatus(prev => ({ ...prev, scout: data }))
    ), 60000);

    const traderInterval = setInterval(() => fetch('/api/trading/team?agent=trader').then(r => r.json()).then(data => 
      setAgentStatus(prev => ({ ...prev, trader: data }))
    ), 30000);

    const riskInterval = setInterval(() => fetch('/api/trading/team?agent=risk').then(r => r.json()).then(data => 
      setAgentStatus(prev => ({ ...prev, risk: data }))
    ), 15000);

    return () => {
      clearInterval(scoutInterval);
      clearInterval(traderInterval);
      clearInterval(riskInterval);
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 animate-pulse">
        <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scanning':
      case 'all-clear':
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'BREACH':
      case 'halted':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'waiting':
      case 'idle':
        return <Activity className="h-4 w-4 text-amber-500" />;
      default:
        return <Bot className="h-4 w-4 text-zinc-400" />;
    }
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 md:p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <Zap className="h-5 w-5 text-purple-500" />
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Trading Team</h3>
          <p className="text-[10px] text-zinc-400">Optimized Dev Team v2.0</p>
        </div>
      </div>

      <div className="space-y-2 md:space-y-4">
        {/* Market Scout */}
        <div className="p-2 md:p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <Crosshair className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{teamConfig?.SCOUT.role}</p>
                <p className="text-[10px] text-zinc-400 hidden md:block font-mono truncate">ID: {teamConfig?.SCOUT.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              {getStatusIcon(agentStatus.scout?.status || '')}
              <div className="text-right">
                <p className="text-xs font-medium">{agentStatus.scout?.status || 'init'}</p>
                <p className="text-[10px] text-zinc-400 hidden md:block">Interval: {(teamConfig?.SCOUT.interval || 0) / 1000}s</p>
              </div>
            </div>
          </div>
          {agentStatus.scout?.opportunities_found !== undefined && (
            <p className="text-xs mt-1 md:mt-2 text-zinc-500">
              Found {agentStatus.scout.opportunities_found} opportunities
            </p>
          )}
        </div>

        {/* Position Trader */}
        <div className="p-2 md:p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <Activity className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{teamConfig?.TRADER.role}</p>
                <p className="text-[10px] text-zinc-400 hidden md:block font-mono truncate">ID: {teamConfig?.TRADER.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              {getStatusIcon(agentStatus.trader?.status || '')}
              <div className="text-right">
                <p className="text-xs font-medium">{agentStatus.trader?.status || 'init'}</p>
                <p className="text-[10px] text-zinc-400 hidden md:block">Interval: {(teamConfig?.TRADER.interval || 0) / 1000}s</p>
              </div>
            </div>
          </div>
          {agentStatus.trader?.next_action && (
            <div className="mt-1 md:mt-2 p-2 rounded bg-zinc-100 dark:bg-zinc-700 text-xs">
              <p className="font-semibold text-zinc-700 dark:text-zinc-300 truncate">Next: {agentStatus.trader.next_action.ticker.substring(0, 20)}..."</p>
              <p className="text-zinc-500">Side: {agentStatus.trader.next_action.side.toUpperCase()} | Count: {agentStatus.trader.next_action.count}</p>
            </div>
          )}
        </div>

        {/* Risk Overseer */}
        <div className={`p-2 md:p-3 rounded-lg transition-all ${agentStatus.risk?.status === 'BREACH' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' : 'bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                <Shield className="h-3.5 w-3.5 md:h-4 md:w-4 text-amber-600" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{teamConfig?.RISK.role}</p>
                <p className="text-[10px] text-zinc-400 hidden md:block font-mono truncate">ID: {teamConfig?.RISK.id}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 md:gap-2">
              {getStatusIcon(agentStatus.risk?.status || '')}
              <div className="text-right">
                <p className={`text-xs font-bold ${agentStatus.risk?.status === 'BREACH' ? 'text-red-600' : ''}`}>
                  {agentStatus.risk?.status || 'init'}
                </p>
                <p className="text-[10px] text-zinc-400 hidden md:block">Interval: {(teamConfig?.RISK.interval || 0) / 1000}s</p>
              </div>
            </div>
          </div>
          {agentStatus.risk?.breaches && agentStatus.risk.breaches.length > 0 && (
            <div className="mt-1 md:mt-2 p-2 rounded bg-red-100 dark:bg-red-900/30">
              <p className="text-xs font-bold text-red-700">⚠️ Risk Breaches:{agentStatus.risk.breaches.join(', ')}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 md:mt-4 pt-2 md:pt-3 border-t border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-between text-[10px] md:text-xs text-zinc-400">
          <span>Agents: 3 active</span>
          <span>Mode: Production</span>
        </div>
      </div>
    </div>
  );
}
