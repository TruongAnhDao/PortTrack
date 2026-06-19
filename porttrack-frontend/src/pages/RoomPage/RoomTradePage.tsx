import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Zap, Info, ArrowUpRight, ArrowDownRight, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { roomService, type RoomDashboardData, type StockPriceData } from '../../services/roomService';

interface RoomContext {
  dashboard: RoomDashboardData | null;
  currentCashBalance: number | null;
  roomId: number;
  reloadRoomData: () => Promise<void>;
  isRoomRefreshing: boolean;
}

export const RoomTradePage: React.FC = () => {
  const { dashboard, currentCashBalance, roomId, reloadRoomData, isRoomRefreshing } = useOutletContext<RoomContext>();
  const [symbol, setSymbol] = useState('');
  const [mode, setMode] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState<number>(0);
  const [quote, setQuote] = useState<StockPriceData | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const formatNumber = (amount?: number | null) => {
    if (amount === null || amount === undefined) return '--';
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const handleSearch = async () => {
    setMessage('');
    setError('');
    setQuote(null);
    setQuantity(0);

    const normalizedSymbol = symbol.trim().toUpperCase();
    if (!normalizedSymbol) {
      setError('Enter a stock symbol before searching.');
      return;
    }

    try {
      setIsSearching(true);
      const result = await roomService.getStockPrice(normalizedSymbol);
      setQuote(result);
      setSymbol(result.symbol);
    } catch (err) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message ?? 'Could not find price data for this stock.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!quote) {
      setError('Search for the stock price before submitting an order.');
      return;
    }

    if (!quote.marketOpen) {
      setError('Trading is unavailable because the market session is closed.');
      return;
    }

    if (quantity < 100 || quantity % 100 !== 0) {
      setError('Order quantity must be a multiple of 100.');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await roomService.executeTrade(roomId, {
        stockSymbol: quote.symbol,
        action: mode,
        quantity,
      });
      await reloadRoomData();
      setMessage(result);
      setQuantity(0);
    } catch (err) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError.response?.data?.message ?? 'Trade request failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPlayer = currentCashBalance !== null;
  const marketOpen = quote?.marketOpen ?? false;
  const canTrade = isPlayer && !!quote && marketOpen;
  const isValidLot = quantity >= 100 && quantity % 100 === 0;
  const estimatedValue = quote ? quote.price * quantity : 0;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-white tracking-tight">Market Terminal</h1>
        <p className="text-slate-400 mt-2 font-medium">
          {dashboard?.name ? `Trading in ${dashboard.name}` : 'Search a stock symbol before placing an order.'}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-slate-800/40 border border-slate-700/60 p-8 rounded-[2rem] backdrop-blur-sm shadow-xl">
          {!isPlayer && (
            <div className="mb-6 flex gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
              <AlertCircle className="mt-0.5 shrink-0 text-amber-400" size={18} />
              <p>This account is viewing the room as owner. Trading requires joining the room as a student.</p>
            </div>
          )}

          {quote && !marketOpen && (
            <div className="mb-6 flex gap-3 rounded-2xl border border-slate-500/30 bg-slate-500/10 p-4 text-sm text-slate-200">
              <AlertCircle className="mt-0.5 shrink-0 text-slate-300" size={18} />
              <p>Market session is closed. Buy and sell orders are unavailable.</p>
            </div>
          )}

          {message && (
            <div className="mb-6 flex gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-400" size={18} />
              <p>{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 flex gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
              <AlertCircle className="mt-0.5 shrink-0 text-rose-400" size={18} />
              <p>{error}</p>
            </div>
          )}

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Stock Symbol</label>
              <div className="flex gap-3">
                <div className="relative group flex-1">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={22} />
                  <input
                    type="text"
                    className="w-full bg-slate-950/80 border-2 border-slate-700 rounded-2xl py-5 pl-14 pr-6 text-2xl font-black text-white uppercase focus:border-blue-500 focus:outline-none transition-all shadow-inner placeholder:text-slate-700"
                    placeholder="E.G. VND, FPT..."
                    value={symbol}
                    onChange={(event) => {
                      setSymbol(event.target.value.toUpperCase());
                      setQuote(null);
                      setQuantity(0);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={isSearching || !symbol.trim()}
                  className="px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                  Search
                </button>
              </div>
            </div>

            <div className="flex gap-4 p-1.5 bg-slate-950/50 rounded-2xl border border-slate-800">
              <button
                type="button"
                disabled={!canTrade}
                onClick={() => setMode('BUY')}
                className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 font-black text-sm tracking-wider transition-all disabled:cursor-not-allowed ${mode === 'BUY' && canTrade ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(5,150,105,0.4)]' : canTrade ? 'text-slate-500 hover:text-slate-300' : 'text-slate-600 bg-slate-900/60'}`}
              >
                <ArrowUpRight size={18} strokeWidth={3} />
                {quote && !marketOpen ? 'CLOSED SESSION' : 'BUY ORDER'}
              </button>
              <button
                type="button"
                disabled={!canTrade}
                onClick={() => setMode('SELL')}
                className={`flex-1 py-4 rounded-xl flex items-center justify-center gap-2 font-black text-sm tracking-wider transition-all disabled:cursor-not-allowed ${mode === 'SELL' && canTrade ? 'bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)]' : canTrade ? 'text-slate-500 hover:text-slate-300' : 'text-slate-600 bg-slate-900/60'}`}
              >
                <ArrowDownRight size={18} strokeWidth={3} />
                {quote && !marketOpen ? 'CLOSED SESSION' : 'SELL ORDER'}
              </button>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Quantity</label>
              <input
                type="number"
                min={100}
                step={100}
                disabled={!canTrade}
                className="w-full bg-slate-950/80 border-2 border-slate-700 rounded-2xl py-5 px-6 text-3xl font-mono font-black text-white focus:border-blue-500 focus:outline-none transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
                value={quantity || ''}
                onChange={(event) => setQuantity(Math.max(0, parseInt(event.target.value) || 0))}
              />
              <p className={`ml-1 text-xs font-medium ${quantity > 0 && !isValidLot ? 'text-rose-400' : 'text-slate-500'}`}>
                Orders must use lots of 100 shares (100, 200, 300, ...).
              </p>
            </div>

            <button
              disabled={!canTrade || isSubmitting || !isValidLot}
              className={`w-full py-6 rounded-2xl font-black text-lg uppercase tracking-widest transition-all flex items-center justify-center gap-3 border-2 ${!canTrade || isSubmitting || !isValidLot ? 'bg-slate-900 border-slate-800 text-slate-600 grayscale cursor-not-allowed' : mode === 'BUY' ? 'bg-emerald-600 border-emerald-500 text-white hover:bg-emerald-500 shadow-[0_0_30px_rgba(5,150,105,0.4)] hover:-translate-y-1' : 'bg-rose-600 border-rose-500 text-white hover:bg-rose-500 shadow-[0_0_30px_rgba(225,29,72,0.4)] hover:-translate-y-1'}`}
            >
              <Zap size={22} className={canTrade ? 'fill-white' : 'fill-transparent'} />
              {isSubmitting ? 'Submitting...' : quote && !marketOpen ? 'Market Closed' : 'Confirm Order'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
            <div className={`absolute -top-20 -right-20 w-40 h-40 blur-[80px] rounded-full pointer-events-none transition-colors duration-500 ${mode === 'BUY' ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}></div>

            <div className="flex items-center gap-2 mb-8 relative z-10">
              <Info size={18} className={mode === 'BUY' ? 'text-emerald-500' : 'text-rose-500'} />
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Stock Quote</h3>
            </div>

            <div className="space-y-5 relative z-10">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-950/50 border border-slate-800/50">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Price</span>
                <span className="text-lg font-mono font-black text-white">
                  {quote ? formatCurrency(quote.price) : '--'}
                </span>
              </div>

              <div className="px-1 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Symbol</span>
                  <span className="text-sm font-mono font-bold text-slate-300">{quote?.symbol ?? '--'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Open Price</span>
                  <span className="text-sm font-mono font-bold text-slate-300">{quote?.openPrice ? formatCurrency(quote.openPrice) : '--'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Volume</span>
                  <span className="text-sm font-mono font-bold text-slate-300">{formatNumber(quote?.volume)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Trade Date</span>
                  <span className="text-sm font-mono font-bold text-slate-300">
                    {quote?.tradeDate ? new Date(quote.tradeDate).toLocaleDateString('vi-VN') : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Market Session</span>
                  <span className={`text-sm font-black ${quote?.marketOpen ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {quote ? (quote.marketOpen ? 'Open' : 'Closed') : '--'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Estimated Value</span>
                  <span className="text-sm font-mono font-bold text-slate-300">{formatCurrency(estimatedValue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-500 uppercase">Available Cash</span>
                  <span className="text-sm font-mono font-bold text-slate-300">
                    {currentCashBalance === null ? 'Owner view' : formatCurrency(currentCashBalance)}
                    {isRoomRefreshing && <span className="ml-2 text-xs text-blue-300">Updating...</span>}
                  </span>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-800">
                <p className="text-xs leading-relaxed text-slate-400">
                  Prices are fetched from DNSE chart data. Orders are enabled only during Vietnam market sessions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
