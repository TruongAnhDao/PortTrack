import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, Outlet, useLocation, useParams } from 'react-router-dom';
import { BarChart3, ChevronLeft, LayoutDashboard, Loader2, ReceiptText, Settings, Trophy, Users } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { roomService, type OwnerRoomDashboardData } from '../../services/roomService';

export interface OwnerRoomContext {
  roomId: number;
  dashboard: OwnerRoomDashboardData | null;
  reloadDashboard: () => Promise<void>;
  ownerDataVersion: number;
}

export const OwnerRoomLayout: React.FC = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const numericRoomId = Number(roomId);
  const [dashboard, setDashboard] = useState<OwnerRoomDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ownerDataVersion, setOwnerDataVersion] = useState(0);
  const [error, setError] = useState('');
  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const loadDashboard = useCallback(async () => {
    if (!numericRoomId) return;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const result = await roomService.getOwnerDashboard(numericRoomId);
    if (!isMountedRef.current || requestId !== requestIdRef.current) return;
    setDashboard(result);
    setOwnerDataVersion((version) => version + 1);
  }, [numericRoomId]);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError('');
        await loadDashboard();
      } catch (err) {
        const apiError = err as { response?: { data?: { message?: string } } };
        if (isMountedRef.current) setError(apiError.response?.data?.message ?? 'Unable to load owner room.');
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    };

    void load();
  }, [loadDashboard]);

  useEffect(() => {
    if (!numericRoomId) return undefined;

    const refreshOnFocus = () => {
      if (document.visibilityState === 'visible') {
        void loadDashboard().catch(console.error);
      }
    };

    const intervalId = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void loadDashboard().catch(console.error);
      }
    }, 60_000);

    document.addEventListener('visibilitychange', refreshOnFocus);
    window.addEventListener('focus', refreshOnFocus);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', refreshOnFocus);
      window.removeEventListener('focus', refreshOnFocus);
    };
  }, [loadDashboard, numericRoomId]);

  const roomStats = useMemo(() => {
    if (!dashboard) return undefined;
    return {
      cash: dashboard.averagePortfolioValue,
      totalAssets: dashboard.topPortfolioValue,
    };
  }, [dashboard]);

  const menuItems = [
    { name: 'Dashboard', path: `/owner/rooms/${roomId}`, icon: <LayoutDashboard size={18} /> },
    { name: 'Players', path: `/owner/rooms/${roomId}/players`, icon: <Users size={18} /> },
    { name: 'Transactions', path: `/owner/rooms/${roomId}/transactions`, icon: <ReceiptText size={18} /> },
    { name: 'Leaderboard', path: `/owner/rooms/${roomId}/leaderboard`, icon: <Trophy size={18} /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50 relative overflow-hidden">
      <Header roomStats={roomStats} />

      <div className="flex flex-1 pt-20 max-w-[1600px] mx-auto w-full relative z-10">
        <aside className="w-72 fixed left-0 top-20 bottom-0 border-r border-slate-800/70 p-6 hidden xl:block bg-slate-950/80 backdrop-blur-xl">
          <Link to="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-blue-400 mb-8 transition-colors group w-fit">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Back to Lobby</span>
          </Link>

          <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                <Settings size={18} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-black text-white">{dashboard?.room.name ?? 'Owner Room'}</p>
                <p className="mt-1 flex items-center gap-2 text-xs font-mono text-cyan-300">
                  <BarChart3 size={14} />
                  {dashboard?.room.code ?? '------'}
                </p>
              </div>
            </div>
          </div>

          <nav className="space-y-3">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all relative overflow-hidden group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-[0_0_22px_rgba(37,99,235,0.35)]'
                      : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span className="text-sm tracking-wide">{item.name}</span>
                  {isActive && <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-cyan-400 rounded-l-full shadow-[0_0_10px_rgba(34,211,238,0.8)]" />}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 xl:ml-72 p-6 lg:p-10 relative">
          {isLoading ? (
            <div className="min-h-[50vh] flex items-center justify-center text-slate-400">
              <Loader2 className="animate-spin mr-3" size={22} />
              Loading owner room...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-rose-200">
              {error}
            </div>
          ) : (
            <Outlet context={{ roomId: numericRoomId, dashboard, reloadDashboard: loadDashboard, ownerDataVersion } satisfies OwnerRoomContext} />
          )}
        </main>
      </div>
    </div>
  );
};
