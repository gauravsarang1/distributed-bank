import React from 'react';
import { User } from '../types/index.ts';
import { Building2, LogOut, User as UserIcon } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onRefresh?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-emerald-600 flex items-center justify-center text-white shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="font-semibold text-lg tracking-tight text-white block leading-tight">
              Distributed Bank
            </span>
            <span className="text-xs text-slate-400 font-mono">Core Banking V1</span>
          </div>
        </div>

        {/* User Info & Actions */}
        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded border border-slate-700 text-sm">
              <UserIcon className="w-4 h-4 text-emerald-400" />
              <div className="text-left hidden sm:block">
                <span className="font-medium text-slate-200">{user.name}</span>
                <span className="text-xs text-slate-400 block">{user.email}</span>
              </div>
              <span className="sm:hidden font-medium text-slate-200">{user.name}</span>
            </div>

            <button
              id="logout-button"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
