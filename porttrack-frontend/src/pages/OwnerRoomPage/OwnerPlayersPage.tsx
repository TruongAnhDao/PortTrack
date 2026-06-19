import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AlertCircle, Briefcase, ExternalLink, Link2, Loader2, Search, TrendingDown, TrendingUp, Users, Wallet } from 'lucide-react';
import { roomService, type OwnerPlayerData } from '../../services/roomService';
import type { OwnerRoomContext } from './OwnerRoomLayout';

const formatCurrency = (amount?: number | null) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount ?? 0);
};

const formatPercent = (amount?: number | null) => `${(amount ?? 0).toFixed(2)}%`;

export const OwnerPlayersPage: React.FC = () => {
  const { roomId, ownerDataVersion } = useOutletContext<OwnerRoomContext>();
  const [players, setPlayers] = useState<OwnerPlayerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadPlayers = async () => {
      try {
        setIsLoading(true);
        setError('');
        const result = await roomService.getOwnerPlayers(roomId);
        if (!cancelled) setPlayers(result);
      } catch (err) {
        const apiError = err as { response?: { data?: { message?: string } } };
        if (!cancelled) setError(apiError.response?.data?.message ?? 'Unable to load students.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadPlayers();

    return () => {
      cancelled = true;
    };
  }, [ownerDataVersion, roomId]);

  const filteredPlayers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return players;
    return players.filter((player) => player.username.toLowerCase().includes(normalizedQuery));
  }, [players, query]);

  const totals = useMemo(() => {
    const totalPortfolioValue = players.reduce((sum, player) => sum + player.totalPortfolioValue, 0);
    const profitablePlayers = players.filter((player) => player.totalProfitLoss >= 0).length;
    return {
      totalPortfolioValue,
      profitablePlayers,
      totalTrades: players.reduce((sum, player) => sum + player.totalTrades, 0),
    };
  }, [players]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mr-3" size={22} />
        Loading students...
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
        <h1 className="text-4xl font-black text-white tracking-tight">Student Management</h1>
        <p className="mt-2 text-slate-400 font-medium">Track student capital, holdings and trading activity.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          { label: 'Students', value: players.length.toString(), icon: <Users size={24} />, tone: 'text-blue-300' },
          { label: 'Profitable', value: totals.profitablePlayers.toString(), icon: <TrendingUp size={24} />, tone: 'text-emerald-300' },
          { label: 'Total Value', value: formatCurrency(totals.totalPortfolioValue), icon: <Wallet size={24} />, tone: 'text-white' },
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

      <section className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-6 lg:p-8 shadow-xl">
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search student"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 py-4 pl-12 pr-5 text-white outline-none transition focus:border-blue-500"
            />
          </div>
          <div className="flex items-center rounded-2xl border border-slate-700 bg-slate-950/70 px-5 py-3 text-sm font-bold text-slate-400">
            {totals.totalTrades} trades
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left">
            <thead>
              <tr className="border-b border-slate-700/80 text-xs uppercase tracking-widest text-slate-500">
                <th className="py-4 pr-4">Student</th>
                <th className="py-4 pr-4 text-right">Cash</th>
                <th className="py-4 pr-4 text-right">Holdings</th>
                <th className="py-4 pr-4 text-right">Total Value</th>
                <th className="py-4 pr-4 text-right">P/L</th>
                <th className="py-4 pr-4 text-right">Return</th>
                <th className="py-4 pr-4 text-right">Symbols</th>
                <th className="py-4 text-center">Submission</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.map((player) => {
                const isPositive = player.totalProfitLoss >= 0;
                return (
                  <tr key={player.portfolioId} className="border-b border-slate-800/80 text-sm text-slate-200">
                    <td className="py-5 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 font-black text-blue-300">
                          {player.username[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-white">{player.username}</p>
                          <p className="text-xs text-slate-500">#{player.userId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 pr-4 text-right font-mono">{formatCurrency(player.cashBalance)}</td>
                    <td className="py-5 pr-4 text-right font-mono">{formatCurrency(player.holdingsValue)}</td>
                    <td className="py-5 pr-4 text-right font-mono font-black text-white">{formatCurrency(player.totalPortfolioValue)}</td>
                    <td className={`py-5 pr-4 text-right font-mono font-black ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(player.totalProfitLoss)}
                    </td>
                    <td className={`py-5 pr-4 text-right font-mono font-black ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      <span className="inline-flex items-center justify-end gap-1">
                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {formatPercent(player.returnPercentage)}
                      </span>
                    </td>
                    <td className="py-5 pr-4 text-right">
                      <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-black text-slate-300">
                        <Briefcase size={14} />
                        {player.holdingCount}
                      </span>
                    </td>
                    <td className="py-5 text-center">
                      {player.submissionUrl ? (
                        <a
                          href={player.submissionUrl}
                          target="_blank"
                          rel="noreferrer"
                          title={`Open ${player.username}'s submission`}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 transition hover:bg-cyan-500/20 hover:text-white"
                        >
                          <ExternalLink size={17} />
                        </a>
                      ) : (
                        <span
                          title="No submission link"
                          className="inline-flex h-9 w-9 items-center justify-center text-slate-600"
                        >
                          <Link2 size={17} />
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPlayers.length === 0 && (
          <div className="rounded-2xl border border-slate-700/60 bg-slate-950/40 p-8 text-center text-slate-400">
            No students found.
          </div>
        )}
      </section>
    </div>
  );
};
