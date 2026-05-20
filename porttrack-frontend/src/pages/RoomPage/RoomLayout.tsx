import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { 
  Home, 
  Briefcase, 
  ArrowLeftRight, 
  History, 
  Wallet, 
  BarChart3 
} from 'lucide-react';

export const RoomLayout: React.FC = () => {
  const { roomId } = useParams();
  const location = useLocation();
  
  // Mock data tài chính (Sau này sẽ fetch từ API dựa trên roomId)
  const [roomInfo] = useState({
    name: "K65 Đầu tư Chứng khoán - Group A",
    cash: 85450000,
    totalAssets: 112300000
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const navItems = [
    { name: 'Home', path: `/room/${roomId}`, icon: <Home size={20} /> },
    { name: 'Portfolio', path: `/room/${roomId}/portfolio`, icon: <Briefcase size={20} /> },
    { name: 'Trade', path: `/room/${roomId}/trade`, icon: <ArrowLeftRight size={20} /> },
    { name: 'Summary', path: `/room/${roomId}/summary`, icon: <History size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      {/* 1. ROOM HEADER (Chứa thông tin tài chính real-time) */}
      <div className="sticky top-0 z-40 w-full bg-slate-900 border-b border-slate-800 shadow-md">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400">
               <History size={18} className="rotate-180" />
            </Link>
            <h2 className="text-lg font-bold text-white border-l border-slate-700 pl-4 uppercase tracking-tight">
              {roomInfo.name}
            </h2>
          </div>

          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Available Cash</p>
              <p className="text-lg font-black text-emerald-400 font-mono leading-none">
                {formatCurrency(roomInfo.cash)}
              </p>
            </div>
            <div className="h-8 w-[1px] bg-slate-800"></div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Total Assets</p>
              <p className="text-lg font-black text-blue-400 font-mono leading-none">
                {formatCurrency(roomInfo.totalAssets)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 max-w-[1600px] mx-auto w-full">
        {/* 2. SIDEBAR (Trái) */}
        <aside className="w-64 border-r border-slate-900 p-4 space-y-2 hidden md:block">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                location.pathname === item.path 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                : 'text-slate-500 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
          
          <div className="pt-10">
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
               <p className="text-xs text-slate-500 mb-2 font-bold uppercase">Quick Stats</p>
               <div className="flex justify-between text-sm mb-1">
                 <span className="text-slate-400">Day Change</span>
                 <span className="text-emerald-400 font-bold">+2.4%</span>
               </div>
               <div className="flex justify-between text-sm">
                 <span className="text-slate-400">Rank</span>
                 <span className="text-amber-400 font-bold">#04</span>
               </div>
            </div>
          </div>
        </aside>

        {/* 3. MAIN CONTENT (Nơi render Home/Trade/Portfolio) */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};