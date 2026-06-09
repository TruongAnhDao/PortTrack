import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import logo from '../../assets/logo.png';
import { ChevronDown, UserPlus } from 'lucide-react';
import { getApiErrorMessage } from '../../utils/apiError';
import { saveSession, type UserRole } from '../../utils/auth';

export const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('STUDENT');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const data = await authService.register({ username, password, role });
      if (typeof data === 'string' || !data.role) {
        throw new Error('Invalid registration response.');
      }
      const token = data.accessToken || data.token || '';
      saveSession(token, data.username || username, data.role);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Registration failed. The username may already exist.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-[0_0_40px_rgba(37,99,235,0.1)]">
        
        <div className="flex flex-col items-center mb-8">
          <Link to="/">
            <img src={logo} alt="Logo" className="h-12 w-auto mix-blend-screen contrast-125 mb-4" />
          </Link>
          <h2 className="text-2xl font-bold text-white">Create Account</h2>
          <p className="text-slate-400 text-sm mt-1">Join PortTrack for free</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
            <input 
              type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Choose a username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Account Type</label>
            <div className="relative">
              <select
                required
                value={role}
                onChange={(event) => setRole(event.target.value as UserRole)}
                className="w-full appearance-none bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 pr-11 text-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="STUDENT">Student</option>
                <option value="LECTURER">Lecturer</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input 
              type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Create a secure password"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Confirm Password</label>
            <input 
              type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-50 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Confirm your password"
            />
          </div>

          <button 
            type="submit" disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-70 mt-4"
          >
            {isLoading ? 'Creating...' : <><UserPlus size={20} /> Sign Up</>}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-cyan-400 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
