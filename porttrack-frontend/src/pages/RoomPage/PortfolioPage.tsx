import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AlertCircle, Briefcase, Coins, Gauge, Loader2, Wallet } from 'lucide-react';
import { roomService, type PortfolioData } from '../../services/roomService';

interface RoomContext {
  roomId: number;
  roomDataVersion: number;
}

const formatCurrency = (amount?: number | null) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount ?? 0);
};

const formatPercent = (amount?: number | null) => `${(amount ?? 0).toFixed(2)}%`;

export const PortfolioPage: React.FC = () => {
  const { roomId, roomDataVersion } = useOutletContext<RoomContext>();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadPortfolio = async () => {
      try {
        setIsLoading(true);
        setError('');
        const result = await roomService.getPortfolio(roomId);
        if (!cancelled) setPortfolio(result);
      } catch (err) {
        const apiError = err as { response?: { data?: { message?: string } } };
        if (!cancelled) setError(apiError.response?.data?.message ?? 'Unable to load portfolio.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadPortfolio();

    return () => {
      cancelled = true;
    };
  }, [roomDataVersion, roomId]);

  const topHolding = useMemo(() => {
    if (!portfolio?.holdings.length) return undefined;
    return portfolio.holdings.reduce((largest, current) => (
      current.marketValue > largest.marketValue ? current : largest
    ));
  }, [portfolio]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mr-3" size={22} />
        Loading portfolio...
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

  if (!portfolio) return null;

  const profitTone = portfolio.totalProfitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-4xl font-black text-white tracking-tight">My Portfolio</h1>
        <p className="text-slate-400 mt-2 font-medium">Track holdings, cash, market value and unrealized performance.</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
        {[
          { label: 'Cash Balance', value: formatCurrency(portfolio.cashBalance), icon: <Wallet size={24} />, tone: 'text-blue-300' },
          { label: 'Holdings Value', value: formatCurrency(portfolio.holdingsValue), icon: <Briefcase size={24} />, tone: 'text-cyan-300' },
          { label: 'Total NAV', value: formatCurrency(portfolio.totalPortfolioValue), icon: <Coins size={24} />, tone: 'text-white' },
          { label: 'Total Return', value: formatPercent(portfolio.returnPercentage), icon: <Gauge size={24} />, tone: profitTone },
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

      <section className="rounded-[2rem] border border-slate-700/60 bg-slate-800/40 p-6 lg:p-8 shadow-xl backdrop-blur-sm">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-black text-white">Holdings</h2>
            <p className="text-sm text-slate-400">
              {topHolding ? `Largest position: ${topHolding.symbol} at ${formatCurrency(topHolding.marketValue)}.` : 'No stock positions yet.'}
            </p>
          </div>
          <div className={`text-sm font-black ${profitTone}`}>
            P/L {formatCurrency(portfolio.totalProfitLoss)}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-slate-700/80 text-xs uppercase tracking-widest text-slate-500">
                <th className="py-4 pr-4">Stock</th>
                <th className="py-4 pr-4 text-right">Quantity</th>
                <th className="py-4 pr-4 text-right">Avg Cost</th>
                <th className="py-4 pr-4 text-right">Market Price</th>
                <th className="py-4 pr-4 text-right">Market Value</th>
                <th className="py-4 pr-4 text-right">Unrealized P/L</th>
                <th className="py-4 text-right">Return</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.holdings.map((holding) => {
                const holdingTone = holding.unrealizedProfitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400';
                return (
                  <tr key={holding.symbol} className="border-b border-slate-800/80 text-sm text-slate-200">
                    <td className="py-5 pr-4">
                      <div className="font-black text-white">{holding.symbol}</div>
                      {!holding.priceAvailable && <div className="text-xs text-amber-300">Using avg cost as fallback price</div>}
                    </td>
                    <td className="py-5 pr-4 text-right font-mono">{new Intl.NumberFormat('vi-VN').format(holding.quantity)}</td>
                    <td className="py-5 pr-4 text-right font-mono">{formatCurrency(holding.avgPrice)}</td>
                    <td className="py-5 pr-4 text-right font-mono">{formatCurrency(holding.marketPrice)}</td>
                    <td className="py-5 pr-4 text-right font-mono">{formatCurrency(holding.marketValue)}</td>
                    <td className={`py-5 pr-4 text-right font-mono font-black ${holdingTone}`}>{formatCurrency(holding.unrealizedProfitLoss)}</td>
                    <td className={`py-5 text-right font-mono font-black ${holdingTone}`}>{formatPercent(holding.returnPercentage)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {portfolio.holdings.length === 0 && (
          <div className="rounded-2xl border border-slate-700/60 bg-slate-950/40 p-8 text-center text-slate-400">
            No holdings yet. Place your first buy order in Trade Hub.
          </div>
        )}
      </section>
    </div>
  );
};
