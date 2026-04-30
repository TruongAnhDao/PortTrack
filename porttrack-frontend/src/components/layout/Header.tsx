import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

export const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-0">
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
        <Link 
          to="/login" 
          className="text-sm font-bold text-slate-300 hover:text-cyan-400 transition-colors uppercase tracking-widest"
        >
          Login
        </Link>
      </div>
    </header>
  );
};