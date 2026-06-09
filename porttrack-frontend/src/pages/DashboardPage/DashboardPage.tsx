import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Loader2, Plus, ShieldCheck, TrendingUp } from 'lucide-react';
import { roomService, type RoomCardData } from '../../services/roomService';
import { RoomCard } from '../../components/dashboard/RoomCard';
import { CreateRoomModal } from '../../components/dashboard/CreateRoomModal';
import { JoinRoomModal } from '../../components/dashboard/JoinRoomModal';
import { Header } from '../../components/layout/Header';
import { getStoredRole } from '../../utils/auth';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const role = getStoredRole();
  const isLecturer = role === 'LECTURER';
  const roomVariant = isLecturer ? 'managed' : 'joined';
  const [rooms, setRooms] = useState<RoomCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    try {
      setLoadError('');

      if (isLecturer) {
        const ownedData = await roomService.getOwnedRooms();
        setRooms(Array.isArray(ownedData) ? ownedData : []);
      } else {
        const joinedData = await roomService.getJoinedRooms();
        setRooms(
          Array.isArray(joinedData)
            ? joinedData.map((joined) => ({
                ...joined.roomInfo,
                currentCashBalance: joined.currentCashBalance,
              }))
            : [],
        );
      }
    } catch (error) {
      console.error(error);
      setLoadError('Unable to load rooms. Please refresh the page or try again later.');
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  }, [isLecturer]);

  useEffect(() => {
    const loadRooms = window.setTimeout(() => {
      void fetchRooms();
    }, 0);

    return () => window.clearTimeout(loadRooms);
  }, [fetchRooms]);

  return (
    <div className="min-h-screen flex flex-col text-slate-50 relative overflow-hidden bg-slate-950">
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(30,58,138,0.25)_0%,rgba(2,6,23,1)_70%)]" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'linear-gradient(rgba(148, 163, 184, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.2) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <Header />

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 pt-28 py-10 relative z-10">
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">Trading Lobby</h1>
            <p className="text-slate-400 text-lg font-medium">
              {isLecturer
                ? 'Create and manage your investment simulation rooms.'
                : 'Join investment rooms and continue your trading competitions.'}
            </p>
          </div>

          {isLecturer ? (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:-translate-y-1"
            >
              <Plus size={20} strokeWidth={3} /> CREATE ROOM
            </button>
          ) : (
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border-2 border-cyan-500 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 text-sm font-bold transition-all hover:-translate-y-1 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            >
              <KeyRound size={20} strokeWidth={3} /> JOIN CODE
            </button>
          )}
        </section>

        <div className="flex items-center gap-2.5 border-b-2 border-slate-800/80 pb-4 mb-10 text-base font-black uppercase tracking-widest text-white">
          {isLecturer ? <ShieldCheck size={20} /> : <TrendingUp size={20} />}
          {isLecturer ? 'Rooms I Manage' : 'Rooms I Joined'}
          <span className="ml-1 px-2 py-0.5 rounded-md bg-blue-500 text-[11px] text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]">
            {rooms.length}
          </span>
        </div>

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
                <p className="text-xl font-bold text-slate-300 mb-2">
                  {isLecturer ? 'You have not created any rooms yet.' : 'You have not joined any rooms yet.'}
                </p>
                <p className="text-slate-500">
                  {isLecturer ? 'Create a room to start managing a class.' : 'Use a room code to join a competition.'}
                </p>
              </div>
            ) : (
              rooms.map((room) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  variant={roomVariant}
                  onActionClick={(id) => navigate(isLecturer ? `/owner/rooms/${id}` : `/room/${id}/trade`)}
                />
              ))
            )}
          </div>
        )}
      </main>

      {isLecturer && (
        <CreateRoomModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchRooms}
        />
      )}
      {!isLecturer && (
        <JoinRoomModal
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
          onSuccess={fetchRooms}
        />
      )}
    </div>
  );
};
