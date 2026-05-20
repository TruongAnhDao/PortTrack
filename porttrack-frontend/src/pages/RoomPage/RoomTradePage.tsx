import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Info, AlertCircle, Zap } from 'lucide-react';

export const RoomTradePage: React.FC = () => {
  const [symbol, setSymbol] = useState('');
  const [tradeMode, setTradeMode] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState<number>(0);
  const [price, setPrice] = useState<number>(0); // Giá fetch được từ Stock API
  
  // Mock dữ liệu từ Portfolio và Room Rules
  const userCash = 85450000;
  const availableStockInPortfolio = 500; // Giả sử đang có 500 cổ phiếu này
  const transactionFeeRate = 0.0015; // 0.15%
  const taxRate = 0.001; // 0.1%

  // Giả lập fetch giá khi nhập mã chứng khoán
  useEffect(() => {
    if (symbol.length >= 3) {
      // Sau này gọi API: getStockPrice(symbol)
      setPrice(Math.floor(Math.random() * (150000 - 10000) + 10000));
    } else {
      setPrice(0);
    }
  }, [symbol]);

  // Tính toán các thông số
  const maxBuy = price > 0 ? Math.floor(userCash / (price * (1 + transactionFeeRate))) : 0;
  const estValue = quantity * price;
  const totalCost = tradeMode === 'BUY' 
    ? estValue * (1 + transactionFeeRate) 
    : estValue * (1 - transactionFeeRate - taxRate);

  const formatVNĐ = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  const handleTrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return alert("Khối lượng phải lớn hơn 0");
    if (tradeMode === 'BUY' && quantity > maxBuy) return alert("Vượt quá sức mua!");
    if (tradeMode === 'SELL' && quantity > availableStockInPortfolio) return alert("Không đủ cổ phiếu để bán!");
    
    console.log("Gửi lệnh:", { symbol, tradeMode, quantity, totalCost });
    // Gọi API: roomService.executeTrade(...)
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white">Market Terminal</h1>
        <p className="text-slate-400 font-medium font-serif italic">Thực thi lệnh mua bán chứng khoán thời gian thực.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* KHỐI TRÁI: FORM ĐẶT LỆNH */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
            <form onSubmit={handleTrade} className="space-y-6">
              {/* Tìm kiếm mã */}
              <div className="relative">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 tracking-widest">Stock Symbol</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input 
                    type="text" 
                    placeholder="Nhập mã chứng khoán (VD: VND, FPT...)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-xl font-black text-white uppercase focus:border-blue-500 focus:outline-none transition-all"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  />
                </div>
              </div>

              {/* Nút Chế độ */}
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setTradeMode('BUY')}
                  className={`flex-1 py-4 rounded-2xl font-black transition-all border-2 flex items-center justify-center gap-2 ${tradeMode === 'BUY' ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/20' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                >
                  <TrendingUp size={20} /> BUY
                </button>
                <button 
                  type="button"
                  onClick={() => setTradeMode('SELL')}
                  className={`flex-1 py-4 rounded-2xl font-black transition-all border-2 flex items-center justify-center gap-2 ${tradeMode === 'SELL' ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-600/20' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                >
                  <TrendingDown size={20} /> SELL
                </button>
              </div>

              {/* Nhập khối lượng */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Quantity</label>
                  <span className="text-xs font-bold text-blue-400 cursor-pointer hover:underline" onClick={() => setQuantity(tradeMode === 'BUY' ? maxBuy : availableStockInPortfolio)}>
                    {tradeMode === 'BUY' ? `Sức mua tối đa: ${formatVNĐ(maxBuy)}` : `Có sẵn: ${formatVNĐ(availableStockInPortfolio)}`}
                  </span>
                </div>
                <input 
                  type="number" 
                  className="w-full bg-slate-950 border border-slate-700 rounded-2xl py-4 px-6 text-2xl font-mono font-bold text-white focus:border-blue-500 focus:outline-none"
                  value={quantity || ''}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                />
              </div>

              {/* Submit */}
              <button 
                type="submit"
                disabled={!price || quantity <= 0}
                className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-lg transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 disabled:grayscale uppercase tracking-widest flex items-center justify-center gap-3"
              >
                <Zap size={22} className="fill-white" /> Khớp Lệnh Ngay
              </button>
            </form>
          </div>
        </div>

        {/* KHỐI PHẢI: THÔNG TIN CHI TIẾT & TỔNG KẾT */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Info size={16} className="text-blue-500" /> Order Summary
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-500">Current Price</span>
                <span className="font-bold text-white font-mono">{price > 0 ? `${formatVNĐ(price)} đ` : '---'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-bold text-white font-mono">{formatVNĐ(estValue)} đ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Trading Fee (0.15%)</span>
                <span className="font-bold text-rose-400 font-mono">+{formatVNĐ(estValue * transactionFeeRate)} đ</span>
              </div>
              {tradeMode === 'SELL' && (
                 <div className="flex justify-between">
                   <span className="text-slate-500">Tax (0.1%)</span>
                   <span className="font-bold text-rose-400 font-mono">+{formatVNĐ(estValue * taxRate)} đ</span>
                 </div>
              )}
              <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
                <span className="text-slate-200 font-bold uppercase text-xs">Total Est. Value</span>
                <span className="text-2xl font-black text-blue-500 font-mono">{formatVNĐ(totalCost)} đ</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-amber-500/5 border border-amber-500/20 flex gap-4">
             <AlertCircle className="text-amber-500 shrink-0" size={20} />
             <p className="text-xs text-amber-200/70 leading-relaxed">
               Lưu ý: Mọi giao dịch tại PortTrack là giả lập. Bạn đang sử dụng tiền ảo và dữ liệu thị trường thực tế để rèn luyện kỹ năng.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};