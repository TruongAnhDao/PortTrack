import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AlertCircle, CalendarClock, CheckCircle2, Copy, Loader2, Lock, PlayCircle, Save, Trophy, Users, Wallet } from 'lucide-react';
import { roomService, type UpdateOwnerRoomData } from '../../services/roomService';
import type { OwnerRoomContext } from './OwnerRoomLayout';

const formatCurrency = (amount?: number | null) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount ?? 0);
};

const toDateTimeInput = (value?: string) => value ? value.slice(0, 16) : '';

export const OwnerDashboardPage: React.FC = () => {
  const { roomId, dashboard, reloadDashboard } = useOutletContext<OwnerRoomContext>();
  const [form, setForm] = useState({
    name: '',
    type: 'PUBLIC' as 'PUBLIC' | 'PRIVATE',
    password: '',
    initialBalance: '',
    status: 'WAITING' as 'WAITING' | 'RUNNING' | 'FINISHED',
    startTime: '',
    endTime: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!dashboard) return;
    const syncForm = window.setTimeout(() => {
      setForm({
        name: dashboard.room.name,
        type: dashboard.room.type,
        password: '',
        initialBalance: String(dashboard.room.initialBalance),
        status: dashboard.room.status,
        startTime: toDateTimeInput(dashboard.room.startTime),
        endTime: toDateTimeInput(dashboard.room.endTime),
      });
    }, 0);

    return () => window.clearTimeout(syncForm);
  }, [dashboard]);

  const room = dashboard?.room;
  const statusTone = room?.status === 'RUNNING'
    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
    : room?.status === 'FINISHED'
      ? 'border-slate-500/30 bg-slate-500/10 text-slate-300'
      : 'border-amber-500/30 bg-amber-500/10 text-amber-300';

  const metrics = useMemo(() => ([
    { label: 'Players', value: String(dashboard?.playerCount ?? 0), icon: <Users size={24} />, tone: 'text-blue-300' },
    { label: 'Total Trades', value: String(dashboard?.totalTrades ?? 0), icon: <PlayCircle size={24} />, tone: 'text-white' },
    { label: 'Top Portfolio', value: formatCurrency(dashboard?.topPortfolioValue), icon: <Trophy size={24} />, tone: 'text-amber-300' },
    { label: 'Average Value', value: formatCurrency(dashboard?.averagePortfolioValue), icon: <Wallet size={24} />, tone: 'text-emerald-300' },
  ]), [dashboard]);

  const handleCopy = () => {
    if (!room) return;
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      setIsSaving(true);
      setError('');
      setMessage('');
      const payload: UpdateOwnerRoomData = {
        name: form.name.trim(),
        type: form.type,
        initialBalance: Number(form.initialBalance),
        status: form.status,
        startTime: form.startTime || undefined,
        endTime: form.endTime || undefined,
      };
      if (form.type === 'PRIVATE' && form.password.trim()) {
        payload.password = form.password.trim();
      }
      await roomService.updateOwnerRoom(roomId, payload);
      await reloadDashboard();
      setMessage('Room updated.');
    } catch (err) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message ?? 'Unable to update room.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!dashboard || !room) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-black uppercase tracking-widest ${statusTone}`}>
              {room.status}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-black uppercase tracking-widest text-slate-300">
              {room.type === 'PRIVATE' && <Lock size={13} />}
              {room.type}
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white">{room.name}</h1>
          <p className="mt-2 text-slate-400 font-medium">Owner control center for room setup, status and performance.</p>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex w-fit items-center gap-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 font-mono text-sm font-black uppercase tracking-widest text-cyan-300 transition hover:bg-cyan-500/20"
        >
          {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
          {room.code}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {metrics.map((metric) => (
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

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-8">
        <section className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-6 lg:p-8 shadow-xl">
          <div className="mb-6 flex items-center gap-3">
            <CalendarClock className="text-blue-300" size={24} />
            <h2 className="text-2xl font-black text-white">Room Rules</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">Room Name</label>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3.5 text-white outline-none transition focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">Type</label>
                <select
                  value={form.type}
                  onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as 'PUBLIC' | 'PRIVATE' }))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3.5 text-white outline-none transition focus:border-blue-500"
                >
                  <option value="PUBLIC">PUBLIC</option>
                  <option value="PRIVATE">PRIVATE</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">Status</label>
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as 'WAITING' | 'RUNNING' | 'FINISHED' }))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3.5 text-white outline-none transition focus:border-blue-500"
                >
                  <option value="WAITING">WAITING</option>
                  <option value="RUNNING">RUNNING</option>
                  <option value="FINISHED">FINISHED</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">Initial Balance</label>
                <input
                  type="number"
                  min="0"
                  value={form.initialBalance}
                  onChange={(event) => setForm((current) => ({ ...current, initialBalance: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3.5 text-white outline-none transition focus:border-blue-500"
                />
              </div>
            </div>

            {form.type === 'PRIVATE' && (
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">New Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  placeholder="Leave blank to keep current password"
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3.5 text-white outline-none transition focus:border-blue-500"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">Start Time</label>
                <input
                  type="datetime-local"
                  value={form.startTime}
                  onChange={(event) => setForm((current) => ({ ...current, startTime: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3.5 text-white outline-none transition focus:border-blue-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-500">End Time</label>
                <input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(event) => setForm((current) => ({ ...current, endTime: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3.5 text-white outline-none transition focus:border-blue-500"
                />
              </div>
            </div>

            {(message || error) && (
              <div className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold ${
                error ? 'border-rose-500/30 bg-rose-500/10 text-rose-200' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              }`}>
                {error ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                {error || message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-sm font-black uppercase tracking-widest text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Changes
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-700/70 bg-slate-900/60 p-6 lg:p-8 shadow-xl">
          <h2 className="mb-6 text-2xl font-black text-white">Room Snapshot</h2>
          <div className="space-y-4">
            {[
              ['Room Code', room.code],
              ['Initial Balance', formatCurrency(room.initialBalance)],
              ['Total Portfolio Value', formatCurrency(dashboard.totalPortfolioValue)],
              ['Start Time', room.startTime ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(room.startTime)) : '--'],
              ['End Time', room.endTime ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(room.endTime)) : '--'],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 border-b border-slate-800 pb-4 last:border-b-0">
                <span className="text-sm font-bold text-slate-500">{label}</span>
                <span className="text-right font-mono text-sm font-black text-slate-200">{value}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
