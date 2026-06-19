import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AlertCircle, ArrowDownRight, ArrowUpRight, Loader2, ReceiptText, Search } from 'lucide-react';
import { roomService, type OwnerTransactionData } from '../../services/roomService';
import type { OwnerRoomContext } from './OwnerRoomLayout';

const formatCurrency = (amount?: number | null) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount ?? 0);
};

const formatDateTime = (value: string) => {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
};

export const OwnerTransactionsPage: React.FC = () => {
  const { roomId, ownerDataVersion } = useOutletContext<OwnerRoomContext>();
  const [transactions, setTransactions] = useState<OwnerTransactionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadTransactions = async () => {
      try {
        setIsLoading(true);
        setError('');
        const result = await roomService.getOwnerTransactions(roomId);
        if (!cancelled) setTransactions(result);
      } catch (err) {
        const apiError = err as { response?: { data?: { message?: string } } };
        if (!cancelled) setError(apiError.response?.data?.message ?? 'Unable to load room transactions.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    loadTransactions();

    return () => {
      cancelled = true;
    };
  }, [ownerDataVersion, roomId]);

  const filteredTransactions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return transactions.filter((tx) => {
      const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;
      const matchesQuery = !normalizedQuery
        || tx.symbol.toLowerCase().includes(normalizedQuery)
        || tx.username.toLowerCase().includes(normalizedQuery);
      return matchesType && matchesQuery;
    });
  }, [query, transactions, typeFilter]);

  const totals = useMemo(() => ({
    trades: transactions.length,
    buys: transactions.filter((tx) => tx.type === 'BUY').length,
    sells: transactions.filter((tx) => tx.type === 'SELL').length,
    totalFees: transactions.reduce((sum, tx) => sum + tx.fee + tx.tax, 0),
  }), [transactions]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-slate-400">
        <Loader2 className="animate-spin mr-3" size={22} />
        Loading transactions...
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
        <h1 className="text-4xl font-black text-white tracking-tight">Transactions Overview</h1>
        <p className="mt-2 text-slate-400 font-medium">Review order flow across every student in this room.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {[
          { label: 'Trades', value: totals.trades.toString(), icon: <ReceiptText size={24} />, tone: 'text-white' },
          { label: 'Buy Orders', value: totals.buys.toString(), icon: <ArrowUpRight size={24} />, tone: 'text-emerald-300' },
          { label: 'Sell Orders', value: totals.sells.toString(), icon: <ArrowDownRight size={24} />, tone: 'text-rose-300' },
          { label: 'Fees + Tax', value: formatCurrency(totals.totalFees), icon: <ReceiptText size={24} />, tone: 'text-blue-300' },
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
              placeholder="Search ticker or student"
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 py-4 pl-12 pr-5 text-white outline-none transition focus:border-blue-500"
            />
          </div>
          <div className="flex rounded-2xl border border-slate-700 bg-slate-950/70 p-1">
            {(['ALL', 'BUY', 'SELL'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setTypeFilter(type)}
                className={`min-w-24 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest transition ${
                  typeFilter === type ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left">
            <thead>
              <tr className="border-b border-slate-700/80 text-xs uppercase tracking-widest text-slate-500">
                <th className="py-4 pr-4">Date</th>
                <th className="py-4 pr-4">Student</th>
                <th className="py-4 pr-4">Stock</th>
                <th className="py-4 pr-4">Type</th>
                <th className="py-4 pr-4 text-right">Quantity</th>
                <th className="py-4 pr-4 text-right">Price</th>
                <th className="py-4 pr-4 text-right">Fee</th>
                <th className="py-4 pr-4 text-right">Tax</th>
                <th className="py-4 text-right">Cash Flow</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => {
                const isBuy = tx.type === 'BUY';
                return (
                  <tr key={tx.id} className="border-b border-slate-800/80 text-sm text-slate-200">
                    <td className="py-5 pr-4 text-slate-400">{formatDateTime(tx.executedAt)}</td>
                    <td className="py-5 pr-4">
                      <p className="font-black text-white">{tx.username}</p>
                      <p className="text-xs text-slate-500">#{tx.userId}</p>
                    </td>
                    <td className="py-5 pr-4 font-black text-white">{tx.symbol}</td>
                    <td className="py-5 pr-4">
                      <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black ${
                        isBuy ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
                      }`}>
                        {isBuy ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-5 pr-4 text-right font-mono">{new Intl.NumberFormat('vi-VN').format(tx.quantity)}</td>
                    <td className="py-5 pr-4 text-right font-mono">{formatCurrency(tx.price)}</td>
                    <td className="py-5 pr-4 text-right font-mono">{formatCurrency(tx.fee)}</td>
                    <td className="py-5 pr-4 text-right font-mono">{formatCurrency(tx.tax)}</td>
                    <td className={`py-5 text-right font-mono font-black ${tx.totalAmount >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {formatCurrency(tx.totalAmount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="rounded-2xl border border-slate-700/60 bg-slate-950/40 p-8 text-center text-slate-400">
            No matching transactions found.
          </div>
        )}
      </section>
    </div>
  );
};
