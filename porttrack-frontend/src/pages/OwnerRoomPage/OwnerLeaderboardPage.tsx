import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AlertCircle, Award, Loader2, Medal, TrendingDown, TrendingUp, Trophy } from 'lucide-react';
import { roomService, type OwnerLeaderboardEntryData } from '../../services/roomService';
import type { OwnerRoomContext } from './OwnerRoomLayout';

const formatCurrency = (amount?: number | null) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount ?? 0);
};

const formatPercent = (amount?: number | null) => `${(amount ?? 0).toFixed(2)}%`;

export const OwnerLeaderboardPage: React.FC = () => {
  const { roomId, ownerDataVersion } = useOutletContext<OwnerRoomContext>();
  const [entries, setEntries] = useState<OwnerLeaderboardEntryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadLeaderboard = async () => {
      try {
        setIsLoading(true);
        setError('');
        const result = await roomService.getOwnerLeaderboard(roomId);
        if (!cancelled) setEntries(result);
      } catch (err) {
        const apiError = err as { response?: { data?: { message?: string } } };
        if (!cancelled) setError(apiError.response?.data?.message ?? 'Unable to load leaderboard.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadLeaderboard();

    return () => {
      cancelled = true;
    };
  }, [ownerDataVersion, roomId]);

  const topEntries = entries.slice(0, 3);
  const tableEntries = entries.slice(3);
  const bestReturn = useMemo(() => {
    if (!entries.length) return undefined;
    return entries.reduce((best, current) => current.returnPercentage > best.returnPercentage ? current : best);
  }, [entries]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mr-3" size={22} />
        Loading leaderboard...
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

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header>
        <h1 className="text-4xl font-black text-white tracking-tight">Leaderboard</h1>
        <p className="mt-2 text-slate-400 font-medium">Rank students by current total portfolio value.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: 'Competitors', value: entries.length.toString(), icon: <Trophy size={24} />, tone: 'text-blue-300' },
          { label: 'Top Value', value: formatCurrency(entries[0]?.totalPortfolioValue), icon: <Medal size={24} />, tone: 'text-amber-300' },
          { label: 'Best Return', value: bestReturn ? formatPercent(bestReturn.returnPercentage) : '0.00%', icon: <Award size={24} />, tone: 'text-emerald-300' },
        ].map((metric) => (
          <section key={metric.label} className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-300">
                {metric.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{metric.label}</p>
                <p className={`mt-1 truncate text-2xl font-black ${metric.tone}`}>{metric.value}</p>
              </div>
            </div>
          </section>
        ))}
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-12 text-center text-slate-400">
          No students have joined this room yet.
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {topEntries.map((entry) => {
              const isWinner = entry.rank === 1;
              const isPositive = entry.totalProfitLoss >= 0;
              return (
                <article
                  key={entry.portfolioId}
                  className={`rounded-2xl border p-6 shadow-xl ${
                    isWinner
                      ? 'border-amber-400/40 bg-amber-500/10'
                      : 'border-slate-700/70 bg-slate-900/60'
                  }`}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isWinner ? 'bg-amber-400 text-slate-950' : 'bg-blue-500/10 text-blue-300'}`}>
                      <Trophy size={24} />
                    </div>
                    <span className={`text-4xl font-black ${isWinner ? 'text-amber-300' : 'text-slate-500'}`}>#{entry.rank}</span>
                  </div>
                  <h2 className="truncate text-2xl font-black text-white">{entry.username}</h2>
                  <p className="mt-1 text-xs font-bold text-slate-500">Student #{entry.userId}</p>
                  <div className="mt-6 space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-bold text-slate-500">Total Value</span>
                      <span className="font-mono font-black text-white">{formatCurrency(entry.totalPortfolioValue)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-bold text-slate-500">Return</span>
                      <span className={`inline-flex items-center gap-1 font-mono font-black ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPositive ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                        {formatPercent(entry.returnPercentage)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-bold text-slate-500">Trades</span>
                      <span className="font-mono font-black text-slate-200">{entry.totalTrades}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-6 lg:p-8 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left">
                <thead>
                  <tr className="border-b border-slate-700/80 text-xs uppercase tracking-widest text-slate-500">
                    <th className="py-4 pr-4">Rank</th>
                    <th className="py-4 pr-4">Student</th>
                    <th className="py-4 pr-4 text-right">Cash</th>
                    <th className="py-4 pr-4 text-right">Holdings</th>
                    <th className="py-4 pr-4 text-right">Total Value</th>
                    <th className="py-4 pr-4 text-right">P/L</th>
                    <th className="py-4 pr-4 text-right">Return</th>
                    <th className="py-4 text-right">Trades</th>
                  </tr>
                </thead>
                <tbody>
                  {tableEntries.map((entry) => {
                    const isPositive = entry.totalProfitLoss >= 0;
                    return (
                      <tr key={entry.portfolioId} className="border-b border-slate-800/80 text-sm text-slate-200">
                        <td className="py-5 pr-4 font-black text-slate-400">#{entry.rank}</td>
                        <td className="py-5 pr-4">
                          <p className="font-black text-white">{entry.username}</p>
                          <p className="text-xs text-slate-500">#{entry.userId}</p>
                        </td>
                        <td className="py-5 pr-4 text-right font-mono">{formatCurrency(entry.cashBalance)}</td>
                        <td className="py-5 pr-4 text-right font-mono">{formatCurrency(entry.holdingsValue)}</td>
                        <td className="py-5 pr-4 text-right font-mono font-black text-white">{formatCurrency(entry.totalPortfolioValue)}</td>
                        <td className={`py-5 pr-4 text-right font-mono font-black ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {formatCurrency(entry.totalProfitLoss)}
                        </td>
                        <td className={`py-5 pr-4 text-right font-mono font-black ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {formatPercent(entry.returnPercentage)}
                        </td>
                        <td className="py-5 text-right font-mono">{entry.totalTrades}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {tableEntries.length === 0 && entries.length <= 3 && (
              <div className="rounded-2xl border border-slate-700/60 bg-slate-950/40 p-8 text-center text-slate-400">
                Top students are shown above.
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};
