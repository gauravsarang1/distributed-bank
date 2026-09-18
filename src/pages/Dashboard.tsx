import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.ts';
import { Account, Payment, User } from '../types/index.ts';
import { AccountCard } from '../components/AccountCard.tsx';
import { DepositForm } from '../components/DepositForm.tsx';
import { WithdrawForm } from '../components/WithdrawForm.tsx';
import { TransferForm } from '../components/TransferForm.tsx';
import { TransactionList } from '../components/TransactionList.tsx';
import { ArrowDownCircle, ArrowUpCircle, Send, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  user: User;
}

type ActionTab = 'deposit' | 'withdraw' | 'transfer';

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState<ActionTab>('deposit');
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(true);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchAccounts = useCallback(async () => {
    try {
      setIsLoadingAccounts(true);
      setError(null);
      const accs = await api.accounts.getAll();
      setAccounts(accs);
      if (accs.length > 0 && !selectedAccountId) {
        setSelectedAccountId(accs[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch accounts from authoritative ledger.');
    } finally {
      setIsLoadingAccounts(false);
    }
  }, [selectedAccountId]);

  const fetchPayments = useCallback(async () => {
    try {
      setIsLoadingPayments(true);
      const history = await api.payments.getAll();
      setPayments(history);
    } catch (err: any) {
      console.error('Failed to load transaction history:', err);
    } finally {
      setIsLoadingPayments(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
    fetchPayments();
  }, [fetchAccounts, fetchPayments]);

  const activeAccount =
    accounts.find((a) => a.id === selectedAccountId) || accounts[0] || null;

  const handleDepositSuccess = (updatedAccount: Account, message: string) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === updatedAccount.id ? updatedAccount : a))
    );
    setFeedback({ type: 'success', message });
    fetchPayments();
  };

  const handleWithdrawSuccess = (updatedAccount: Account, message: string) => {
    setAccounts((prev) =>
      prev.map((a) => (a.id === updatedAccount.id ? updatedAccount : a))
    );
    setFeedback({ type: 'success', message });
    fetchPayments();
  };

  const handleTransferSuccess = (_payment: Payment, message: string) => {
    setFeedback({ type: 'success', message });
    // Refresh authoritative accounts & payment history
    fetchAccounts();
    fetchPayments();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Account Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Welcome, <span className="font-semibold text-slate-800">{user.name}</span>. Manage balances and initiate transfers.
          </p>
        </div>

        {/* Test scenario quick badge */}
        <div className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-auto font-mono">
          V1 Verified Ledger: {accounts.length} Account(s)
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Authoritative Ledger Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {feedback && (
        <div
          className={`p-4 rounded-xl text-sm flex items-start justify-between gap-2 border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Primary Account & Balance Card */}
      <AccountCard
        account={activeAccount}
        onRefresh={fetchAccounts}
        isLoading={isLoadingAccounts}
      />

      {/* Transaction Actions: Deposit, Withdraw, Transfer */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tab Buttons (Section 41) */}
        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5">
          <button
            id="tab-deposit"
            onClick={() => {
              setActiveTab('deposit');
              setFeedback(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'deposit'
                ? 'bg-white text-emerald-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
            <span>Deposit</span>
          </button>

          <button
            id="tab-withdraw"
            onClick={() => {
              setActiveTab('withdraw');
              setFeedback(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'withdraw'
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <ArrowUpCircle className="w-4 h-4 text-slate-700" />
            <span>Withdraw</span>
          </button>

          <button
            id="tab-transfer"
            onClick={() => {
              setActiveTab('transfer');
              setFeedback(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'transfer'
                ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
            }`}
          >
            <Send className="w-4 h-4 text-blue-600" />
            <span>Transfer</span>
          </button>
        </div>

        {/* Tab Content Form */}
        <div className="p-6 max-w-xl mx-auto">
          {activeAccount ? (
            <>
              {activeTab === 'deposit' && (
                <DepositForm
                  account={activeAccount}
                  onSuccess={handleDepositSuccess}
                />
              )}

              {activeTab === 'withdraw' && (
                <WithdrawForm
                  account={activeAccount}
                  onSuccess={handleWithdrawSuccess}
                />
              )}

              {activeTab === 'transfer' && (
                <TransferForm
                  accounts={accounts}
                  selectedAccountId={selectedAccountId || activeAccount.id}
                  onSelectAccount={(id) => setSelectedAccountId(id)}
                  onSuccess={handleTransferSuccess}
                />
              )}
            </>
          ) : (
            <div className="text-center py-6 text-slate-500 text-sm">
              Loading account information...
            </div>
          )}
        </div>
      </div>

      {/* Transaction History Ledger (Section 46) */}
      <TransactionList
        payments={payments}
        isLoading={isLoadingPayments}
        onRefresh={fetchPayments}
        currentAccountNumber={activeAccount?.accountNumber}
      />
    </div>
  );
};
