import React from 'react';
import { Payment } from '../types/index.ts';
import { ArrowDownLeft, ArrowUpRight, Clock, RefreshCw } from 'lucide-react';

interface TransactionListProps {
  payments: Payment[];
  isLoading: boolean;
  onRefresh: () => void;
  currentAccountNumber?: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  payments,
  isLoading,
  onRefresh,
  currentAccountNumber,
}) => {
  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const formatAmount = (amt: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(parseFloat(amt));
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 text-base">Recent Transactions</h3>
          <p className="text-xs text-slate-500">Official immutable payment ledger</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          title="Refresh transaction history"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
        </button>
      </div>

      {isLoading && payments.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          <div className="animate-pulse flex flex-col items-center justify-center gap-2">
            <Clock className="w-6 h-6 text-slate-300 animate-spin" />
            <span>Loading payment records...</span>
          </div>
        </div>
      ) : payments.length === 0 ? (
        <div className="p-8 text-center text-slate-500 text-sm">
          <p className="font-medium text-slate-700">No transactions yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Transfers and account activity will appear in this ledger.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                <th className="py-3 px-4 sm:px-6">Type</th>
                <th className="py-3 px-4">Counterparty</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 sm:px-6">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => {
                const isSent =
                  p.type === 'SENT' ||
                  (currentAccountNumber && p.senderAccountNumber === currentAccountNumber);

                return (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 sm:px-6">
                      <div className="flex items-center gap-2">
                        {isSent ? (
                          <div className="p-1.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <div className="p-1.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          </div>
                        )}
                        <span className="font-medium text-slate-800">
                          {isSent ? 'Sent' : 'Received'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-xs text-slate-600">
                      {isSent ? (
                        <span>To: {p.receiverAccountNumber || p.receiverAccountId.slice(0, 8)}</span>
                      ) : (
                        <span>From: {p.senderAccountNumber || p.senderAccountId.slice(0, 8)}</span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold">
                      <span className={isSent ? 'text-slate-900' : 'text-emerald-700'}>
                        {isSent ? '-' : '+'} {formatAmount(p.amount)}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          p.status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : p.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 sm:px-6 text-xs text-slate-500 whitespace-nowrap">
                      {formatDate(p.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
