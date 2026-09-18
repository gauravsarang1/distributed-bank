import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { Account } from '../types/index.ts';
import { ArrowDownCircle, CheckCircle2, AlertCircle } from 'lucide-react';

interface DepositFormProps {
  account: Account;
  onSuccess: (updatedAccount: Account, message: string) => void;
}

export const DepositForm: React.FC<DepositFormProps> = ({ account, onSuccess }) => {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const quickAmounts = ['1000', '2000', '5000', '10000'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const parsed = parseFloat(amount);
    if (isNaN(parsed) || parsed <= 0) {
      setError('Please enter a valid deposit amount greater than zero.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.accounts.deposit(account.id, amount);
      const msg = res.message || `₹${parsed.toLocaleString('en-IN')} added to your account.`;
      setSuccessMsg(`Deposit successful. ${msg}`);
      setAmount('');
      onSuccess(res.account, msg);
    } catch (err: any) {
      setError(err.message || 'Deposit failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form id="deposit-form" onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
          Deposit Amount
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-semibold">
            ₹
          </span>
          <input
            id="deposit-amount-input"
            type="number"
            step="0.01"
            min="1"
            placeholder="5000"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError(null);
            }}
            disabled={isLoading}
            className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 font-mono text-slate-900 bg-white"
            required
          />
        </div>
      </div>

      {/* Quick Amount Buttons */}
      <div className="flex flex-wrap gap-1.5">
        {quickAmounts.map((amt) => (
          <button
            key={amt}
            type="button"
            onClick={() => setAmount(amt)}
            disabled={isLoading}
            className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors"
          >
            +₹{parseInt(amt).toLocaleString('en-IN')}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-start gap-2 p-3 text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <button
        id="submit-deposit-btn"
        type="submit"
        disabled={isLoading || !amount}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <ArrowDownCircle className="w-4 h-4" />
        <span>{isLoading ? 'Depositing...' : 'Deposit Money'}</span>
      </button>
    </form>
  );
};
