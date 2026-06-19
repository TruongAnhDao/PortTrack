import React, { useState } from 'react';
import { Copy, CheckCircle2, Users, Wallet, Settings, Zap, Globe, Lock } from 'lucide-react';
import type { RoomCardData } from '../../services/roomService';

interface RoomCardProps {
  room: RoomCardData;
  variant: 'managed' | 'joined';
  onActionClick: (roomId: number) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, variant, onActionClick }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  const moneyLabel = variant === 'managed'
    ? `${(room.initialBalance / 1000000).toFixed(0)}M`
    : formatCurrency(room.currentCashBalance ?? room.initialBalance).replace('₫', '').trim();
  const playerCount = room.playerCount ?? (variant === 'joined' ? 1 : 0);

  return (
    <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-3xl p-6 hover:border-blue-500 transition-all hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] flex flex-col h-full group relative overflow-hidden">
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/10 blur-[50px] rounded-full group-hover:bg-blue-500/30 transition-colors"></div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="space-y-1.5 w-full">
          <h3 className="text-xl font-extrabold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
            {room.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded shadow-sm uppercase tracking-wider ${room.type === 'PRIVATE' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
              {room.type === 'PRIVATE' ? <Lock size={12} /> : <Globe size={12} />}
              {room.type}
            </span>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded shadow-sm bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
              {room.status}
            </span>
          </div>
        </div>
      </div>

      <div
        onClick={handleCopy}
        className="relative z-10 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer mb-6 w-fit shadow-inner"
      >
        <span className="text-sm font-mono font-bold uppercase tracking-widest text-cyan-400">ID: {room.code}</span>
        {copied ? <CheckCircle2 size={16} className="text-emerald-400" /> : <Copy size={16} />}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-700/60 shadow-inner">
          <div className="flex items-center gap-2 text-slate-400 mb-1.5">
            <Users size={16} className="text-blue-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Students</span>
          </div>
          <p className="text-2xl font-black text-white">{playerCount}</p>
        </div>

        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-700/60 shadow-inner overflow-hidden">
          <div className="flex items-center gap-2 text-slate-400 mb-1.5">
            <Wallet size={16} className="text-cyan-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {variant === 'managed' ? 'Initial' : 'Cash'}
            </span>
          </div>
          <p className={`text-xl font-black truncate ${variant === 'joined' ? 'text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]' : 'text-white'}`}>
            {moneyLabel}
          </p>
        </div>
      </div>

      <div className="mt-auto relative z-10">
        {variant === 'managed' ? (
          <button
            onClick={() => onActionClick(room.id)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-slate-600 hover:border-blue-500 text-slate-200 hover:text-white font-bold transition-all bg-slate-800 hover:bg-slate-700 shadow-md"
          >
            <Settings size={20} /> Manage Room
          </button>
        ) : (
          <button
            onClick={() => onActionClick(room.id)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:-translate-y-0.5"
          >
            <Zap size={20} className="fill-white" /> Trade Now
          </button>
        )}
      </div>
    </div>
  );
};
