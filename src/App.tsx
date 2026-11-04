import React, { useState, useEffect } from 'react';
import { UserProfile, TabType, LoanApplication, TransactionItem } from './types';
import { SplashIntro } from './components/SplashIntro';
import { AuthScreen } from './components/AuthScreen';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { FundWalletView } from './components/FundWalletView';
import { LoanView } from './components/LoanView';
import { PayBillsView } from './components/PayBillsView';
import { HistoryView } from './components/HistoryView';
import { ChatBubbleAnimation } from './components/ChatBubbleAnimation';
import { updateSmartsuppUser } from './utils/chat';

export default function App() {
  // Splash state
  const [showSplash, setShowSplash] = useState<boolean>(true);

  // Auth user state
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('swift_fund_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Balances
  const [availableBalance, setAvailableBalance] = useState<number>(() => {
    const saved = localStorage.getItem('swift_fund_balance');
    return saved ? parseFloat(saved) : 0.0;
  });

  const [pendingBalance, setPendingBalance] = useState<number>(() => {
    const saved = localStorage.getItem('swift_fund_pending');
    return saved ? parseFloat(saved) : 0.0;
  });

  // Active Loan amount & status
  const [activeLoans, setActiveLoans] = useState<LoanApplication[]>(() => {
    try {
      const saved = localStorage.getItem('swift_fund_loans');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Transactions list
  const [transactions, setTransactions] = useState<TransactionItem[]>(() => {
    try {
      const saved = localStorage.getItem('swift_fund_transactions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save changes to localStorage & sync user to Smartsupp
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('swift_fund_user', JSON.stringify(currentUser));
      updateSmartsuppUser(currentUser.name, currentUser.email, currentUser.phone);
    } else {
      localStorage.removeItem('swift_fund_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('swift_fund_balance', String(availableBalance));
  }, [availableBalance]);

  useEffect(() => {
    localStorage.setItem('swift_fund_pending', String(pendingBalance));
  }, [pendingBalance]);

  useEffect(() => {
    localStorage.setItem('swift_fund_loans', JSON.stringify(activeLoans));
  }, [activeLoans]);

  useEffect(() => {
    localStorage.setItem('swift_fund_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Handle Login
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  // Handle Logout
  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // Handle Deposit actions
  const handleAddPendingDeposit = (amount: number, details: any) => {
    setPendingBalance((prev) => prev + amount);

    const newTx: TransactionItem = {
      id: `DEP-${Date.now().toString().slice(-6)}`,
      type: 'deposit',
      title: `${details.method || 'Crypto'} Deposit`,
      subtitle: details.payAddress ? `Address: ${details.payAddress.slice(0, 10)}...` : 'Pending Confirmation',
      amount: amount,
      currency: 'USD',
      status: 'Pending',
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      refId: details.paymentId || `REF-${Math.floor(Math.random() * 899999 + 100000)}`,
      details,
    };

    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleConfirmDeposit = (amount: number, details: any) => {
    setPendingBalance((prev) => Math.max(0, prev - amount));
    setAvailableBalance((prev) => prev + amount);

    // Update the transaction status to completed
    setTransactions((prev) =>
      prev.map((t, idx) =>
        idx === 0
          ? { ...t, status: 'Completed', subtitle: 'Verified & Credited' }
          : t
      )
    );
  };

  // Handle Loan Submission
  const handleLoanSubmitted = (loan: LoanApplication) => {
    setActiveLoans((prev) => [loan, ...prev]);

    const newTx: TransactionItem = {
      id: loan.id,
      type: 'loan',
      title: `Loan Request - ${loan.purpose}`,
      subtitle: `${loan.bankName} (${loan.accountNumberMasked})`,
      amount: loan.amount,
      currency: 'USD',
      status: 'Under Review',
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      refId: loan.id,
      details: {
        term: `${loan.termDays} Days`,
        '10% Upfront Required': `$${loan.upfrontAmount.toLocaleString()} USD`,
        interest: `$${loan.interestAmount} USD`,
        totalRepayment: `$${loan.totalRepay} USD`,
        dueDate: loan.dueDate,
        bank: loan.bankName,
      },
    };

    setTransactions((prev) => [newTx, ...prev]);
  };

  // Handle Bill Payment
  const handleBillPaid = (tx: TransactionItem) => {
    setTransactions((prev) => [tx, ...prev]);
  };

  // 0. Splash Intro check: Chat bubble shows on EVERY page including Splash
  if (showSplash) {
    return (
      <div className="relative min-h-screen">
        <SplashIntro onComplete={() => setShowSplash(false)} />
        <ChatBubbleAnimation />
      </div>
    );
  }

  // Active Loan stats
  const latestLoan = activeLoans.length > 0 ? activeLoans[0] : null;
  const activeLoanAmount = latestLoan ? latestLoan.amount : 0;
  const activeLoanStatus = latestLoan ? latestLoan.status : undefined;

  // 1. Auth check: user must be logged in to view dashboard, but Chat bubble shows on EVERY page (including Login/Signup)
  if (!currentUser) {
    return (
      <div className="relative min-h-screen">
        <AuthScreen onLoginSuccess={handleLoginSuccess} />
        {/* Continuous Bubble Animation + Smartsupp Chat Trigger on Login/Signup */}
        <ChatBubbleAnimation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between">
      {/* Top Navbar Header */}
      <Navbar onLogout={handleLogout} />

      {/* Main Content Area: Responsive container replicating mobile app viewport */}
      <main className="flex-1 w-full max-w-md md:max-w-xl mx-auto px-4 pt-4 sm:pt-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            user={currentUser}
            availableBalance={availableBalance}
            pendingBalance={pendingBalance}
            activeLoanAmount={activeLoanAmount}
            activeLoanStatus={activeLoanStatus}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'deposit' && (
          <FundWalletView
            onAddPendingDeposit={handleAddPendingDeposit}
            onConfirmDeposit={handleConfirmDeposit}
          />
        )}

        {activeTab === 'loan' && (
          <LoanView
            onLoanSubmitted={handleLoanSubmitted}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'paybills' && (
          <PayBillsView
            availableBalance={availableBalance}
            onBillPaid={handleBillPaid}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView transactions={transactions} />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

      {/* Floating Smartsupp Chat Bubble with continuous Gold, White, and Blue bubbles */}
      <ChatBubbleAnimation />
    </div>
  );
}
