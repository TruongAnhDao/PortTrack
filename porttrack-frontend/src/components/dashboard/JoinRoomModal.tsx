import React, { useState } from 'react';
import { X, KeyRound, AlertCircle } from 'lucide-react';
import { roomService } from '../../services/roomService';
import { getApiErrorMessage } from '../../utils/apiError';

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void | Promise<void>; }

export const JoinRoomModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await roomService.joinRoom({ code, password });
      await onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Invalid room code or password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><KeyRound className="text-cyan-400"/> Join a Room</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-rose-500/10 border border-rose-500/50 text-rose-400 text-sm rounded-lg flex items-center gap-2"><AlertCircle size={16}/> {error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Room Code</label>
            <input required type="text" maxLength={6} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none font-mono text-center text-2xl uppercase tracking-widest" value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="XXXXXX" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password (If private)</label>
            <input type="password" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password if required" />
          </div>

          <div className="pt-4 flex gap-3">
            <button type="submit" disabled={loading || code.length < 3} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] disabled:opacity-70">{loading ? 'Joining...' : 'Confirm Join'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
