import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-1">
          <img 
            src={logo} 
            alt="PortTrack Logo" 
            className="h-8 w-auto object-contain" 
            onError={(e) => { e.currentTarget.style.display = 'none'; }} 
          />
          <span className="text-2xl font-extrabold text-white tracking-wider">
            PORT<span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">TRACK</span>
          </span>
        </Link>
        
        {/* Auth Buttons */}
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
      </div>
    </header>
  );
};