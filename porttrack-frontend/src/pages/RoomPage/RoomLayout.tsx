import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import { Header } from '../../components/layout/Header';
import { LayoutDashboard, ArrowLeftRight, Briefcase, History, ChevronLeft, ReceiptText } from 'lucide-react';
import { roomService, type RoomDashboardData } from '../../services/roomService';

export const RoomLayout: React.FC = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const numericRoomId = Number(roomId);
  const [dashboard, setDashboard] = useState<RoomDashboardData | null>(null);
  const [currentCashBalance, setCurrentCashBalance] = useState<number | null>(null);
  const [totalNav, setTotalNav] = useState<number | null>(null);
  const [roomDataVersion, setRoomDataVersion] = useState(0);
  const [isRoomRefreshing, setIsRoomRefreshing] = useState(false);
  const [error, setError] = useState('');
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const loadRoomContext = useCallback(async () => {
    if (!numericRoomId) return;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    try {
      setIsRoomRefreshing(true);
      setError('');
      const [dashboardData, portfolio] = await Promise.all([
        roomService.getRoomDashboard(numericRoomId),
        roomService.getPortfolio(numericRoomId),
      ]);

      if (!isMountedRef.current || requestId !== requestIdRef.current) return;

      setDashboard(dashboardData);
      setCurrentCashBalance(portfolio.cashBalance);
      setTotalNav(portfolio.totalPortfolioValue);
      setRoomDataVersion((version) => version + 1);
    } catch (err) {
      if (isMountedRef.current && requestId === requestIdRef.current) {
        console.error(err);
        setError('Unable to load room data.');
      }
    } finally {
      if (isMountedRef.current && requestId === requestIdRef.current) {
        setIsRoomRefreshing(false);
      }
    }
  }, [numericRoomId]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const loadContext = window.setTimeout(() => {
      void loadRoomContext();
    }, 0);

    return () => window.clearTimeout(loadContext);
  }, [loadRoomContext]);

  useEffect(() => {
    if (!numericRoomId) return undefined;

    const refreshOnFocus = () => {
      if (document.visibilityState === 'visible') {
        void loadRoomContext();
      }
    };

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void loadRoomContext();
      }
    }, 60_000);

    document.addEventListener('visibilitychange', refreshOnFocus);
    window.addEventListener('focus', refreshOnFocus);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', refreshOnFocus);
      window.removeEventListener('focus', refreshOnFocus);
    };
  }, [loadRoomContext, numericRoomId]);

  const roomStats = useMemo(() => {
    if (!dashboard) return undefined;

    const cash = currentCashBalance ?? dashboard.initialBalance;
    return {
      cash,
      totalAssets: totalNav ?? cash,
    };
  }, [currentCashBalance, dashboard, totalNav]);

  const menuItems = [
    { name: 'Dashboard', path: `/room/${roomId}`, icon: <LayoutDashboard size={18} /> },
    { name: 'My Portfolio', path: `/room/${roomId}/portfolio`, icon: <Briefcase size={18} /> },
    { name: 'Trade Hub', path: `/room/${roomId}/trade`, icon: <ArrowLeftRight size={18} /> },
    { name: 'Transaction History', path: `/room/${roomId}/transactions`, icon: <ReceiptText size={18} /> },
    { name: 'Summary', path: `/room/${roomId}/summary`, icon: <History size={18} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50 relative overflow-hidden">
      <Header roomStats={roomStats} />

      <div className="flex flex-1 pt-20 max-w-[1600px] mx-auto w-full relative z-10">
        
        {/* SIDEBAR (Trái) */}
        <aside className="w-64 fixed left-0 top-20 bottom-0 border-r border-slate-800/60 p-6 hidden xl:block bg-slate-900/30 backdrop-blur-xl">
          <Link to="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-blue-400 mb-10 transition-colors group w-fit">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Back to Lobby</span>
          </Link>

          <nav className="space-y-3">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all relative overflow-hidden group ${
                    isActive 
                    ? 'bg-blue-600 text-white shadow-premium' 
                    : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm tracking-wide">{item.name}</span>
                  {isActive && <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-cyan-400 rounded-l-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 xl:ml-64 p-6 lg:p-10 relative">
          {error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-200">
              {error}
            </div>
          ) : (
            <Outlet context={{ dashboard, currentCashBalance, roomId: numericRoomId, reloadRoomData: loadRoomContext, roomDataVersion, isRoomRefreshing }} />
          )}
        </main>
      </div>
    </div>
  );
};
