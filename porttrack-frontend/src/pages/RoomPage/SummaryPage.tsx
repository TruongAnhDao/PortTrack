import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AlertCircle, ArrowDownRight, ArrowUpRight, BarChart3, Loader2, PieChart, Target, TrendingUp } from 'lucide-react';
import { roomService, type PortfolioHoldingData, type SummaryData } from '../../services/roomService';

interface RoomContext {
  roomId: number;
  roomDataVersion: number;
}

const formatCurrency = (amount?: number | null) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount ?? 0);
};

const formatPercent = (amount?: number | null) => `${(amount ?? 0).toFixed(2)}%`;

const chartColors = ['#60a5fa', '#22c55e', '#a78bfa', '#f59e0b', '#f43f5e', '#14b8a6'];

function AllocationBars({ holdings, totalValue }: { holdings: PortfolioHoldingData[]; totalValue: number }) {
  if (!holdings.length || totalValue <= 0) {
    return <div className="rounded-2xl border border-slate-700/60 bg-slate-950/40 p-8 text-center text-slate-400">No allocation data yet.</div>;
  }

  return (
    <div className="space-y-4">
      {holdings.map((holding, index) => {
        const weight = (holding.marketValue / totalValue) * 100;
        return (
          <div key={holding.symbol}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-black text-white">{holding.symbol}</span>
              <span className="font-mono text-slate-300">{weight.toFixed(1)}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-950">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.min(weight, 100)}%`, backgroundColor: chartColors[index % chartColors.length] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ReturnChart({ holdings }: { holdings: PortfolioHoldingData[] }) {
  const sortedHoldings = holdings.slice().sort((a, b) => b.returnPercentage - a.returnPercentage);
  const maxMagnitude = Math.max(10, ...sortedHoldings.map((holding) => Math.abs(holding.returnPercentage)));

  if (!sortedHoldings.length) {
    return <div className="rounded-2xl border border-slate-700/60 bg-slate-950/40 p-8 text-center text-slate-400">No return data yet.</div>;
  }

  return (
    <div className="space-y-5">
      {sortedHoldings.map((holding) => {
        const width = Math.min(100, Math.abs(holding.returnPercentage) / maxMagnitude * 100);
        const isPositive = holding.returnPercentage >= 0;
        return (
          <div key={holding.symbol} className="grid grid-cols-[64px_1fr_82px] items-center gap-4">
            <span className="font-black text-white">{holding.symbol}</span>
            <div className="h-3 overflow-hidden rounded-full bg-slate-950">
              <div
                className={`h-full rounded-full ${isPositive ? 'bg-emerald-400' : 'bg-rose-400'}`}
                style={{ width: `${width}%` }}
              />
            </div>
            <span className={`text-right font-mono font-black ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatPercent(holding.returnPercentage)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export const SummaryPage: React.FC = () => {
  const { roomId, roomDataVersion } = useOutletContext<RoomContext>();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadSummary = async () => {
      try {
        setIsLoading(true);
        setError('');
        const result = await roomService.getSummary(roomId);
        if (!cancelled) setSummary(result);
      } catch (err) {
        const apiError = err as { response?: { data?: { message?: string } } };
        if (!cancelled) setError(apiError.response?.data?.message ?? 'Unable to load summary.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, [roomDataVersion, roomId]);

  const bestHolding = useMemo(() => {
    if (!summary?.portfolio.holdings.length) return undefined;
    return summary.portfolio.holdings.reduce((best, current) => (
      current.returnPercentage > best.returnPercentage ? current : best
    ));
  }, [summary]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mr-3" size={22} />
        Loading summary...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-100 flex gap-3">
        <AlertCircle className="shrink-0" size={20} />
        {error}
      </div>
    );
  }

  if (!summary) return null;

  const portfolio = summary.portfolio;
  const profitTone = portfolio.totalProfitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-4xl font-black text-white tracking-tight">Summary</h1>
        <p className="text-slate-400 mt-2 font-medium">A compact view of performance, allocation and trading activity.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        {[
          { label: 'Portfolio Return', value: formatPercent(portfolio.returnPercentage), icon: <TrendingUp size={24} />, tone: profitTone },
          { label: 'Total P/L', value: formatCurrency(portfolio.totalProfitLoss), icon: <Target size={24} />, tone: profitTone },
          { label: 'Trades', value: summary.totalTrades.toString(), icon: <BarChart3 size={24} />, tone: 'text-white' },
          { label: 'Best Holding', value: bestHolding ? bestHolding.symbol : '--', icon: <PieChart size={24} />, tone: 'text-blue-300' },
        ].map((metric) => (
          <section key={metric.label} className="rounded-[2rem] border border-slate-700/60 bg-slate-800/40 p-6 shadow-xl backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
                {metric.icon}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{metric.label}</p>
                <p className={`mt-1 text-xl font-black ${metric.tone}`}>{metric.value}</p>
              </div>
            </div>
          </section>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section className="rounded-[2rem] border border-slate-700/60 bg-slate-800/40 p-6 lg:p-8 shadow-xl backdrop-blur-sm">
          <div className="mb-6 flex items-center gap-3">
            <PieChart className="text-blue-400" size={24} />
            <h2 className="text-2xl font-black text-white">Allocation</h2>
          </div>
          <AllocationBars holdings={portfolio.holdings} totalValue={portfolio.holdingsValue} />
        </section>

        <section className="rounded-[2rem] border border-slate-700/60 bg-slate-800/40 p-6 lg:p-8 shadow-xl backdrop-blur-sm">
          <div className="mb-6 flex items-center gap-3">
            <TrendingUp className="text-emerald-400" size={24} />
            <h2 className="text-2xl font-black text-white">Return by Holding</h2>
          </div>
          <ReturnChart holdings={portfolio.holdings} />
        </section>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.8fr_1.2fr] gap-8">
        <section className="rounded-[2rem] border border-slate-700/60 bg-slate-800/40 p-6 lg:p-8 shadow-xl backdrop-blur-sm">
          <h2 className="mb-6 text-2xl font-black text-white">Trading Mix</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
              <div className="mb-3 flex items-center gap-2 text-emerald-300">
                <ArrowUpRight size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Buy</span>
              </div>
              <p className="text-3xl font-black text-white">{summary.buyOrders}</p>
              <p className="mt-2 text-xs text-slate-400">{formatCurrency(summary.totalBuyValue)}</p>
            </div>
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-5">
              <div className="mb-3 flex items-center gap-2 text-rose-300">
                <ArrowDownRight size={18} />
                <span className="text-xs font-black uppercase tracking-widest">Sell</span>
              </div>
              <p className="text-3xl font-black text-white">{summary.sellOrders}</p>
              <p className="mt-2 text-xs text-slate-400">{formatCurrency(summary.totalSellValue)}</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-700/60 bg-slate-800/40 p-6 lg:p-8 shadow-xl backdrop-blur-sm">
          <h2 className="mb-6 text-2xl font-black text-white">Recent Activity</h2>
          <div className="space-y-3">
            {summary.recentTransactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tx.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>
                    {tx.type === 'BUY' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                  </div>
                  <div>
                    <p className="font-black text-white">{tx.type} {tx.symbol}</p>
                    <p className="text-xs text-slate-500">{new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(tx.executedAt))}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-slate-200">{new Intl.NumberFormat('vi-VN').format(tx.quantity)} shares</p>
                  <p className="font-mono text-xs text-slate-500">{formatCurrency(tx.price)}</p>
                </div>
              </div>
            ))}
            {summary.recentTransactions.length === 0 && (
              <div className="rounded-2xl border border-slate-700/60 bg-slate-950/40 p-8 text-center text-slate-400">
                No trades yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};
