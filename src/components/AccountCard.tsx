import React, { useState } from 'react';
import { Account } from '../types/index.ts';
import { Check, Copy, RefreshCw, ShieldCheck } from 'lucide-react';

interface AccountCardProps {
  account: Account | null;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  account,
  onRefresh,
  isLoading = false,
}) => {
  const [copied, setCopied] = useState(false);

  if (!account) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-200 rounded w-1/4"></div>
          <div className="h-8 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const copyAccountNumber = () => {
    navigator.clipboard.writeText(account.accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedBalance = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: account.currency || 'INR',
    minimumFractionDigits: 2,
  }).format(parseFloat(account.balance));

  return (
    <div
      id="account-card"
      className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm relative overflow-hidden"
    >
      <div className="flex items-start justify-between pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500 block mb-1">
            Available Balance
          </span>
          <div className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 font-mono">
            {formattedBalance}
          </div>
        </div>
        <button
          id="refresh-balance-btn"
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="Refresh authoritative balance"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 text-sm">
        <div>
          <span className="text-xs text-slate-500 block">Account Number</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="font-mono font-semibold text-slate-800 text-base">
              {account.accountNumber}
            </span>
            <button
              onClick={copyAccountNumber}
              className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
              title="Copy account number"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-500 block">Currency</span>
          <span className="font-medium text-slate-800 mt-0.5 block">{account.currency || 'INR'}</span>
        </div>

        <div>
          <span className="text-xs text-slate-500 block">Account Status</span>
          <div className="flex items-center gap-1 mt-0.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {account.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
