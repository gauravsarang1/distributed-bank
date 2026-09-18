import React, { useState } from 'react';
import { api, tokenStorage } from '../services/api.ts';
import { User } from '../types/index.ts';
import { Building2, AlertCircle, ArrowRight, KeyRound } from 'lucide-react';

interface LoginProps {
  onSuccess: (user: User) => void;
  onNavigateRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess, onNavigateRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.auth.login(email, password);
      tokenStorage.set(res.token);
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (testEmail: string) => {
    setEmail(testEmail);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md mb-4">
          <Building2 className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Distributed Bank
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Sign in to access your accounts & funds
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-xl sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Email Address
              </label>
              <input
                id="login-email-input"
                type="email"
                required
                placeholder="gaurav@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none text-slate-900 text-sm bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <input
                id="login-password-input"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-600 focus:outline-none text-slate-900 text-sm bg-white"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm shadow-sm transition-colors disabled:opacity-50"
            >
              <span>{isLoading ? 'Signing in...' : 'Login'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-2.5">
              <KeyRound className="w-3.5 h-3.5 text-slate-400" />
              <span>Quick Test Accounts (V1 Seed):</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('usera@test.com')}
                className="p-2 text-left bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
              >
                <div className="font-semibold text-slate-800">User A</div>
                <div className="text-slate-500 text-[11px] truncate">usera@test.com</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('userb@test.com')}
                className="p-2 text-left bg-slate-50 hover:bg-slate-100 rounded border border-slate-200 transition-colors"
              >
                <div className="font-semibold text-slate-800">User B</div>
                <div className="text-slate-500 text-[11px] truncate">userb@test.com</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-slate-600">
            <span>Don't have an account? </span>
            <button
              onClick={onNavigateRegister}
              className="font-medium text-emerald-600 hover:text-emerald-700 underline"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
