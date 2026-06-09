import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { LogOut } from 'lucide-react';
import { clearSession } from '../../utils/auth';

interface HeaderProps {
  roomStats?: {
    cash: number;
    totalAssets: number;
  };
}

export const Header: React.FC<HeaderProps> = ({ roomStats }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(localStorage.getItem('token'));
  const username = localStorage.getItem('username') || 'Trader';
  const isInsideRoom = location.pathname.includes('/room/');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' VND';
  };

  const handleLogout = () => {
    clearSession();
    navigate('/');
  };

  // Logic hiển thị Navigation Bar ở giữa tùy theo trang
  const renderNavigation = () => {
    // Nếu đang ở trong Room -> Hiển thị thông số tài chính
    if (isInsideRoom && roomStats) {
      return (
        <div className="hidden lg:flex items-center gap-8 bg-slate-900/50 px-6 py-2 rounded-2xl border border-slate-800 shadow-inner animate-in fade-in zoom-in duration-300">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Available Cash</span>
            <span className="text-sm font-mono font-black text-emerald-400">{formatCurrency(roomStats.cash)}</span>
          </div>
          <div className="h-6 w-[2px] bg-slate-800 rounded-full"></div>
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total NAV</span>
            <span className="text-sm font-mono font-black text-blue-400">{formatCurrency(roomStats.totalAssets)}</span>
          </div>
        </div>
      );
    }
    
    // Nếu ở trang Landing Page (/) thì hiện mỏ neo cuộn trang
    if (location.pathname === '/') {
      return (
        <nav className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-base font-semibold text-slate-300 hover:text-cyan-400 hover:-translate-y-0.5 transition-colors">
            How it works
          </a>
          <a href="#why-porttrack" className="text-base font-semibold text-slate-300 hover:text-cyan-400 hover:-translate-y-0.5 transition-colors">
            Why us?
          </a>
          <a href="#who-is-it-for" className="text-base font-semibold text-slate-300 hover:text-cyan-400 hover:-translate-y-0.5 transition-colors">
            For whom?
          </a>
        </nav>
      );
    }
    
    // Nếu ở Dashboard hoặc các trang khác sau này (Home, Summary), bạn có thể thêm logic ở đây
    return null; 
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-slate-950/70 backdrop-blur-xl border-b border-slate-800/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* KHỐI BÊN TRÁI: Logo + Nav */}
        <div className="flex items-center gap-10 lg:gap-16">
          <Link to="/" className="flex items-center gap-1 group">
            <img 
              src={logo} 
              alt="PortTrack Logo" 
              className="h-8 w-auto mix-blend-screen contrast-125 group-hover:scale-105 transition-transform" 
              onError={(e) => { e.currentTarget.style.display = 'none'; }} 
            />
            <span className="text-2xl font-extrabold text-white tracking-wider">
              PORT<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">TRACK</span>
            </span>
          </Link>
          
          {renderNavigation()}
        </div>

        {/* KHỐI BÊN PHẢI: Auth hoặc User Info */}
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            // GIAO DIỆN KHI ĐÃ ĐĂNG NHẬP
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 px-2 py-1.5 rounded-full bg-slate-900 border border-slate-700/50 shadow-inner">
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center font-bold text-sm text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                  {username[0]?.toUpperCase()}
                </div>
                <span className="font-bold text-sm text-slate-200 pr-3 hidden sm:block">{username}</span>
              </div>
              <button 
                onClick={handleLogout} 
                className="text-slate-400 hover:text-white bg-slate-900 hover:bg-rose-500 transition-colors p-2.5 rounded-xl border border-slate-700/50"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            // GIAO DIỆN KHI CHƯA ĐĂNG NHẬP
            <div className="flex items-center gap-6">
              <Link 
                to="/login" 
                className="text-sm font-bold text-slate-300 hover:text-blue-400 transition-colors uppercase tracking-widest hidden sm:block"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] uppercase tracking-widest"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
