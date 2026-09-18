import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Wallet } from 'lucide-react';

interface BalanceCardProps {
  balance: string;
  currency?: string;
  totalSent?: string;
  totalReceived?: string;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  currency = 'INR',
  totalSent = '0.00',
  totalReceived = '0.00',
}) => {
  const formatted = (val: string) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(parseFloat(val || '0'));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
          <Wallet className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs text-slate-500 font-medium">Ledger Balance</span>
          <div className="text-lg font-bold text-slate-900 font-mono">{formatted(balance)}</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
          <ArrowDownLeft className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs text-slate-500 font-medium">Total Inbound</span>
          <div className="text-lg font-bold text-slate-900 font-mono text-emerald-700">
            +{formatted(totalReceived)}
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
          <ArrowUpRight className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs text-slate-500 font-medium">Total Outbound</span>
          <div className="text-lg font-bold text-slate-900 font-mono text-slate-700">
            -{formatted(totalSent)}
          </div>
        </div>
      </div>
    </div>
  );
};
