import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';
import logo from '../../assets/logo.png';
import { LogIn } from 'lucide-react';
import { getApiErrorMessage } from '../../utils/apiError';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('reason') === 'session-expired';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const data = await authService.login({ username, password });
      // Giả sử backend trả về object có chứa token (tùy format DTO của bạn)
      const token = typeof data === 'string' ? data : data.accessToken || data.token || ''; 
      
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Login failed. Please check your credentials.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-[0_0_40px_rgba(37,99,235,0.1)]">
        
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/">
            <img src={logo} alt="Logo" className="h-12 w-auto mix-blend-screen contrast-125 mb-4" />
          </Link>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-slate-400 text-sm mt-1">Sign in to continue to PortTrack</p>
        </div>

        {/* Lỗi */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm text-center">
            {error}
          </div>
        )}
        {!error && sessionExpired && (
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/50 text-amber-300 text-sm text-center">
            Your session has expired. Please sign in again.
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
            <input 
              type="text" 
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="Enter your username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-70 mt-2"
          >
            {isLoading ? 'Signing in...' : <><LogIn size={20} /> Sign In</>}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:text-cyan-400 font-semibold transition-colors">
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
};
