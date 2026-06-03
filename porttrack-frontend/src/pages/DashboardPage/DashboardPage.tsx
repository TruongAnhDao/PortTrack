import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, KeyRound, ShieldCheck, TrendingUp, Loader2 } from 'lucide-react';
import { roomService, type RoomCardData } from '../../services/roomService';
import { RoomCard } from '../../components/dashboard/RoomCard';
import { CreateRoomModal } from '../../components/dashboard/CreateRoomModal';
import { JoinRoomModal } from '../../components/dashboard/JoinRoomModal';
import { Header } from '../../components/layout/Header';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'managed' | 'joined'>('managed');
  const [rooms, setRooms] = useState<RoomCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const [counts, setCounts] = useState({ managed: 0, joined: 0 });

  const fetchRooms = useCallback(async (targetTab = activeTab) => {
    setIsLoading(true);
    try {
      setLoadError('');
      const [ownedData, joinedData] = await Promise.all([
        roomService.getOwnedRooms(),
        roomService.getJoinedRooms(),
      ]);
      const managedRooms = Array.isArray(ownedData) ? ownedData : [];
      const joinedRooms = Array.isArray(joinedData)
        ? joinedData.map((joined) => ({
            ...joined.roomInfo,
            currentCashBalance: joined.currentCashBalance,
          }))
        : [];

      setCounts({ managed: managedRooms.length, joined: joinedRooms.length });
      setRooms(targetTab === 'managed' ? managedRooms : joinedRooms);
    } catch (error) {
      console.error(error);
      setLoadError('Unable to load rooms. Please refresh the page or try again later.');
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    const loadRooms = window.setTimeout(() => {
      void fetchRooms(activeTab);
    }, 0);

    return () => window.clearTimeout(loadRooms);
  }, [activeTab, fetchRooms]);

  const refreshAfterCreate = async () => {
    setActiveTab('managed');
    await fetchRooms('managed');
  };

  const refreshAfterJoin = async () => {
    setActiveTab('joined');
    await fetchRooms('joined');
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-50 relative overflow-hidden bg-slate-950">
      
      {/* KHU VỰC BACKGROUND ĐỘC LẬP CHO DASHBOARD */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Ánh sáng Gradient ở giữa */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(30,58,138,0.25)_0%,rgba(2,6,23,1)_70%)]"></div>
        {/* Lưới Grid */}
        <div 
          className="absolute inset-0 opacity-20" 
          style={{ 
            backgroundImage: 'linear-gradient(rgba(148, 163, 184, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.2) 1px, transparent 1px)', 
            backgroundSize: '40px 40px' 
          }}
        ></div>
      </div>
      
      {/* HEADER */}
      <Header />

      {/* MAIN CONTENT (Bọc z-10 để đè lên Background) */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-6 pt-28 py-10 relative z-10">
        
        {/* TOP SECTION */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">Trading Lobby</h1>
            <p className="text-slate-400 text-lg font-medium">Manage your trading rooms and join competitions.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:-translate-y-1"
            >
              <Plus size={20} strokeWidth={3} /> CREATE ROOM
            </button>
            <button 
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-cyan-500 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 text-sm font-bold transition-all hover:-translate-y-1 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            >
              <KeyRound size={20} strokeWidth={3} /> JOIN CODE
            </button>
          </div>
        </section>

        {/* TABS NAVIGATION */}
        <div className="flex gap-10 border-b-2 border-slate-800/80 mb-10 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('managed')}
            className={`pb-4 flex items-center gap-2.5 text-base font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'managed' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <ShieldCheck size={20} /> Rooms I Manage
            <span className={`ml-1 px-2 py-0.5 rounded-md text-[11px] ${activeTab === 'managed' ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-800 text-slate-500'}`}>
              {counts.managed}
            </span>
            {activeTab === 'managed' && <div className="absolute bottom-[-2px] left-0 w-full h-[4px] bg-blue-500 rounded-t-full shadow-[0_-2px_10px_rgba(59,130,246,0.5)]"></div>}
          </button>
          
          <button 
            onClick={() => setActiveTab('joined')}
            className={`pb-4 flex items-center gap-2.5 text-base font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === 'joined' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <TrendingUp size={20} /> Rooms I Joined
            <span className={`ml-1 px-2 py-0.5 rounded-md text-[11px] ${activeTab === 'joined' ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-800 text-slate-500'}`}>
              {counts.joined}
            </span>
            {activeTab === 'joined' && <div className="absolute bottom-[-2px] left-0 w-full h-[4px] bg-blue-500 rounded-t-full shadow-[0_-2px_10px_rgba(59,130,246,0.5)]"></div>}
          </button>
        </div>

        {/* CONTENT GRID */}
        {isLoading ? (
          <div className="flex justify-center items-center py-32">
             <Loader2 size={48} className="text-blue-500 animate-spin" />
          </div>
        ) : loadError ? (
          <div className="rounded-[2rem] border border-rose-500/30 bg-rose-500/10 p-8 text-center text-rose-100">
            <p className="text-xl font-bold">{loadError}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rooms.length === 0 ? (
               <div className="col-span-full text-center py-24 bg-slate-800/40 rounded-[2rem] border-2 border-slate-700/60 border-dashed backdrop-blur-sm">
                 <p className="text-xl font-bold text-slate-300 mb-2">No rooms found in this category.</p>
                 <p className="text-slate-500">Start by creating or joining a room to see them here.</p>
               </div>
            ) : (
              rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  variant={activeTab}
                  onActionClick={(id) => navigate(activeTab === 'managed' ? `/owner/rooms/${id}` : `/room/${id}/trade`)}
                />
              ))
            )}
          </div>
        )}
      </main>

      <CreateRoomModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onSuccess={refreshAfterCreate} />
      <JoinRoomModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} onSuccess={refreshAfterJoin} />
    </div>
  );
};
