import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AlertTriangle, BookOpen, CheckCircle2, ChevronRight, ExternalLink, Link2, Loader2, Save, ScrollText, Timer } from 'lucide-react';
import { roomService, type RoomDashboardData } from '../../services/roomService';
import { getApiErrorMessage } from '../../utils/apiError';

interface RoomContext {
  dashboard: RoomDashboardData | null;
  currentCashBalance: number | null;
  roomId: number;
}

const translateLegacyGuideText = (item: string) => {
  const normalized = item.replace(/^\d+\.\s*/, '').trim().toLowerCase();

  if (normalized.includes('giao d') || normalized.includes('t+0')) return '1. T+2 settlement.';
  if (normalized.includes('ph') && normalized.includes('giao')) return '2. Trading fee: 0.15%.';
  if (normalized.includes('thu') && normalized.includes('b')) return '3. Sell tax: 0.1%.';
  if (normalized.includes('thanh')) return '4. Newly bought shares can be sold after T+2.';

  return item;
};

export const RoomHomePage: React.FC = () => {
  const { dashboard, currentCashBalance, roomId } = useOutletContext<RoomContext>();
  const [now, setNow] = useState(() => Date.now());
  const [submissionDraft, setSubmissionDraft] = useState<string | null>(null);
  const [savedSubmission, setSavedSubmission] = useState<{ url: string; updatedAt: string } | null>(null);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [submissionError, setSubmissionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionUrl = submissionDraft ?? savedSubmission?.url ?? dashboard?.submissionUrl ?? '';
  const savedSubmissionUrl = savedSubmission?.url ?? dashboard?.submissionUrl ?? '';
  const submissionUpdatedAt = savedSubmission?.updatedAt ?? dashboard?.submissionUpdatedAt ?? null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const getTimeRemaining = () => {
    if (!dashboard?.endTime) return null;

    const remainingMs = new Date(dashboard.endTime).getTime() - now;
    if (remainingMs <= 0) return { days: 0, hours: 0, minutes: 0 };

    const totalMinutes = Math.floor(remainingMs / 60000);
    return {
      days: Math.floor(totalMinutes / 1440),
      hours: Math.floor((totalMinutes % 1440) / 60),
      minutes: totalMinutes % 60,
    };
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  const handleSubmission = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmissionError('');
    setSubmissionMessage('');

    const normalizedUrl = submissionUrl.trim();
    try {
      const parsedUrl = new URL(normalizedUrl);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error('Invalid protocol');
      }
    } catch {
      setSubmissionError('Enter a valid link starting with http:// or https://.');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await roomService.updateSubmissionLink(roomId, normalizedUrl);
      setSubmissionDraft(null);
      setSavedSubmission({ url: result.submissionUrl, updatedAt: result.submissionUpdatedAt });
      setSubmissionMessage('Submission link saved.');
    } catch (error) {
      setSubmissionError(getApiErrorMessage(error, 'Unable to save the submission link.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const remaining = getTimeRemaining();
  const guideItems = dashboard?.guideText
    ?.split(/\n+/)
    .map((item) => item.trim())
    .map(translateLegacyGuideText)
    .filter(Boolean) ?? [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight">
            {dashboard?.name ?? 'Room Dashboard'}
          </h1>
          <p className="text-slate-400 mt-2">Welcome to your practical trading environment.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 px-6 py-4 rounded-3xl flex items-center gap-5 shadow-lg">
          <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 border border-blue-500/20">
            <Timer size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Time Remaining</p>
            <div className="flex items-baseline gap-1.5 text-2xl font-mono font-black text-white">
              {remaining ? (
                <>
                  <span>{remaining.days}</span><span className="text-sm text-slate-500">D</span>
                  <span>{remaining.hours.toString().padStart(2, '0')}</span><span className="text-sm text-slate-500">H</span>
                  <span>{remaining.minutes.toString().padStart(2, '0')}</span><span className="text-sm text-slate-500">M</span>
                </>
              ) : (
                <span>--</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-slate-800/40 border border-slate-700/60 p-8 rounded-[2rem] backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-8">
              <ScrollText className="text-cyan-400" size={24} />
              <h3 className="text-xl font-black text-white uppercase tracking-wider">Trading Regulations</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Initial Capital', value: formatCurrency(dashboard?.initialBalance ?? 0) },
                { label: 'Available Cash', value: currentCashBalance === null ? 'Owner view' : formatCurrency(currentCashBalance) },
                { label: 'Start Time', value: dashboard?.startTime ? new Date(dashboard.startTime).toLocaleString('vi-VN') : '--' },
                { label: 'End Time', value: dashboard?.endTime ? new Date(dashboard.endTime).toLocaleString('vi-VN') : '--' },
                { label: 'Trading Fee', value: '0.15% per trade' },
                { label: 'Selling Tax', value: '0.1% on selling' },
              ].map((rule) => (
                <div key={rule.label} className="flex justify-between items-center gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{rule.label}</span>
                  <span className="text-sm font-black text-slate-200 text-right">{rule.value}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-4 items-start">
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={20} />
              <div className="text-xs text-amber-200/80 leading-relaxed font-medium">
                <strong className="text-amber-400 block mb-1">RULES:</strong>
                {guideItems.length > 0 ? (
                  <ul className="space-y-1">
                    {guideItems.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                ) : (
                  <p>Room rules are not available yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[2rem] border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-cyan-400">
                  <Link2 size={20} />
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">Submission Link</h3>
                </div>
                <p className="text-xs leading-relaxed text-slate-400">
                  Submit a viewable Google Sheet, Drive file, or document link.
                </p>
              </div>
              {savedSubmissionUrl && (
                <a
                  href={savedSubmissionUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Open submitted link"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 transition hover:bg-cyan-500/20 hover:text-white"
                >
                  <ExternalLink size={18} />
                </a>
              )}
            </div>

            <form onSubmit={handleSubmission} className="space-y-3">
              <input
                type="url"
                required
                maxLength={2048}
                value={submissionUrl}
                onChange={(event) => {
                  setSubmissionDraft(event.target.value);
                  setSubmissionError('');
                  setSubmissionMessage('');
                }}
                placeholder="https://docs.google.com/..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-500"
              />

              {submissionError && <p className="text-xs font-medium text-rose-400">{submissionError}</p>}
              {submissionMessage && (
                <p className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                  <CheckCircle2 size={14} />
                  {submissionMessage}
                </p>
              )}

              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] text-slate-500">
                  {submissionUpdatedAt
                    ? `Updated ${new Date(submissionUpdatedAt).toLocaleString('vi-VN')}`
                    : 'No link submitted yet'}
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting || submissionUrl.trim() === savedSubmissionUrl}
                  className="inline-flex min-w-24 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  Save
                </button>
              </div>
            </form>
          </section>

          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-6 rounded-[2rem] shadow-premium relative overflow-hidden">
            <BookOpen className="text-white/10 absolute -right-4 -bottom-5" size={104} />

            <h3 className="text-xl font-black text-white mb-1 relative z-10">Academy</h3>
            <p className="text-blue-100 text-xs leading-relaxed mb-4 relative z-10 font-medium">
              Master the frameworks to pick your first winning stocks.
            </p>

            <div className="space-y-2 relative z-10">
              {[
                { title: 'Fundamental Analysis', desc: 'PE, PB, ROE basics' },
                { title: 'Technical Indicators', desc: 'MA, RSI, MACD setup' },
                { title: 'Risk Management', desc: 'Position sizing rules' },
              ].map((item) => (
                <div key={item.title} className="flex min-h-14 items-center justify-between gap-3 bg-slate-950/20 hover:bg-slate-950/40 px-4 py-3 rounded-xl transition-colors cursor-pointer backdrop-blur-sm border border-white/10">
                  <div className="min-w-0">
                    <span className="block truncate text-sm font-bold text-white">{item.title}</span>
                    <span className="block truncate text-[10px] text-blue-200 uppercase tracking-widest">{item.desc}</span>
                  </div>
                  <ChevronRight size={17} className="shrink-0 text-white" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
