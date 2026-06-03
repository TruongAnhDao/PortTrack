import React, { useState } from 'react';
import { X, PlusCircle, AlertCircle } from 'lucide-react';
import { roomService, type CreateRoomData } from '../../services/roomService';
import { getApiErrorMessage } from '../../utils/apiError';

interface Props { isOpen: boolean; onClose: () => void; onSuccess: () => void | Promise<void>; }

export const CreateRoomModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateRoomData>({
    name: '', type: 'PUBLIC', password: '', initialBalance: 100000000, startTime: '', endTime: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await roomService.createRoom(formData);
      await onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to create room. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white flex items-center gap-2"><PlusCircle className="text-blue-500"/> Create New Room</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-rose-500/10 border border-rose-500/50 text-rose-400 text-sm rounded-lg flex items-center gap-2"><AlertCircle size={16}/> {error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Room Name</label>
            <input required type="text" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. K59 Finance Class" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Room Type</label>
              <select className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as CreateRoomData['type']})}>
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Initial Balance (VND)</label>
              <input required type="number" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-emerald-400 font-mono font-bold focus:border-blue-500 focus:outline-none" value={formData.initialBalance} onChange={e => setFormData({...formData, initialBalance: Number(e.target.value)})} />
            </div>
          </div>

          {formData.type === 'PRIVATE' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input required type="text" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Secret key to join" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Start Time</label>
              <input required type="datetime-local" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none [color-scheme:dark]" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">End Time</label>
              <input required type="datetime-local" className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:border-blue-500 focus:outline-none [color-scheme:dark]" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] disabled:opacity-70">{loading ? 'Creating...' : 'Create Room'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
