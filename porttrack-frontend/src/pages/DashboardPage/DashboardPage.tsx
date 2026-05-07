import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Kiểm tra xem đã đăng nhập chưa
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('username');
    
    if (!token) {
      navigate('/login'); // Chưa có token thì đá về login
    } else {
      setUsername(storedUser || 'Trader');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8 flex flex-col items-center justify-center">
      <div className="bg-slate-900 border border-slate-800 p-10 rounded-3xl shadow-[0_0_50px_rgba(37,99,235,0.15)] text-center max-w-2xl w-full relative overflow-hidden">
        
        {/* Glow background effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/20 blur-[80px] rounded-full z-0 pointer-events-none"></div>

        <div className="relative z-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 mb-4">
            Welcome to PortTrack Dashboard!
          </h1>
          <p className="text-xl text-slate-300 mb-8">
            Hello, <span className="font-bold text-white">{username}</span>. Your virtual portfolio is ready.
          </p>
          
          <button 
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500 transition-all font-semibold"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};