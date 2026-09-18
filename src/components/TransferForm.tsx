import React, { useState } from 'react';
import { api } from '../services/api.ts';
import { Account, Payment } from '../types/index.ts';
import { Send, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

interface TransferFormProps {
  accounts: Account[];
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
  onSuccess: (payment: Payment, message: string) => void;
}

export const TransferForm: React.FC<TransferFormProps> = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
  onSuccess,
}) => {
  const [receiverIdentifier, setReceiverIdentifier] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const currentAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  const quickAmounts = ['500', '1000', '2000', '5000'];

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!currentAccount) {
      setError('Please select an origin account.');
      return;
    }

    if (!receiverIdentifier.trim()) {
      setError('Please enter a recipient Account Number or Account ID.');
      return;
    }

    // Invariant 4 check
    if (
      receiverIdentifier.trim() === currentAccount.accountNumber ||
      receiverIdentifier.trim() === currentAccount.id
    ) {
      setError('Cannot transfer money to the same account.');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid transfer amount greater than zero.');
      return;
    }

    const currentBalance = parseFloat(currentAccount.balance);
    if (parsedAmount > currentBalance) {
      setError('Insufficient balance');
      return;
    }

    try {
      setIsLoading(true);
      const res = await api.payments.transfer(
        currentAccount.id,
        receiverIdentifier.trim(),
        amount
      );

      const msg =
        res.message ||
        `₹${parsedAmount.toLocaleString('en-IN')} transferred successfully.`;
      setSuccessMsg(`Transfer successful. ${msg}`);
      setAmount('');
      setReceiverIdentifier('');
      onSuccess(res.payment, msg);
    } catch (err: any) {
      setError(err.message || 'Transfer failed. Please check details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form id="transfer-form" onSubmit={handleTransfer} className="space-y-4">
      {/* From Account Selector */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
          From Account
        </label>
        {accounts.length > 1 ? (
          <select
            id="from-account-select"
            value={selectedAccountId}
            onChange={(e) => onSelectAccount(e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2.5 rounded-lg border border-slate-300 font-mono text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.accountNumber} — ₹{parseFloat(acc.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ({acc.currency})
              </option>
            ))}
          </select>
        ) : (
          <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between font-mono text-sm">
            <span className="font-semibold text-slate-800">
              {currentAccount?.accountNumber || '100000001'}
            </span>
            <span className="text-slate-500 font-medium">
              ₹{parseFloat(currentAccount?.balance || '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>

      {/* To Account Number */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
            To Account Number
          </label>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400">Quick fill test account:</span>
            {currentAccount?.accountNumber === '100000001' ? (
              <button
                type="button"
                onClick={() => setReceiverIdentifier('100000002')}
                className="text-blue-600 hover:text-blue-800 font-medium underline"
              >
                100000002 (User B)
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setReceiverIdentifier('100000001')}
                className="text-blue-600 hover:text-blue-800 font-medium underline"
              >
                100000001 (User A)
              </button>
            )}
          </div>
        </div>
        <input
          id="to-account-input"
          type="text"
          placeholder="e.g. 100000002"
          value={receiverIdentifier}
          onChange={(e) => {
            setReceiverIdentifier(e.target.value);
            setError(null);
          }}
          disabled={isLoading}
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-slate-900 bg-white"
          required
        />
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
          Amount
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-semibold">
            ₹
          </span>
          <input
            id="transfer-amount-input"
            type="number"
            step="0.01"
            min="1"
            placeholder="2000"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError(null);
            }}
            disabled={isLoading}
            className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-slate-900 bg-white"
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
            ₹{parseInt(amt).toLocaleString('en-IN')}
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
        id="submit-transfer-btn"
        type="submit"
        disabled={isLoading || !amount || !receiverIdentifier}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="w-4 h-4" />
        <span>{isLoading ? 'Transferring...' : 'Transfer Money'}</span>
      </button>
    </form>
  );
};
