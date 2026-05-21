import React from 'react';
import { Construction } from 'lucide-react';

interface RoomComingSoonPageProps {
  title: string;
}

export const RoomComingSoonPage: React.FC<RoomComingSoonPageProps> = ({ title }) => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="max-w-xl w-full rounded-[2rem] border border-slate-700/60 bg-slate-800/40 p-10 text-center shadow-xl backdrop-blur-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-500/30 bg-blue-500/10 text-blue-400">
          <Construction size={32} />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">{title}</h1>
        <p className="mt-3 text-slate-400 font-medium">This feature is under development.</p>
      </div>
    </div>
  );
};
