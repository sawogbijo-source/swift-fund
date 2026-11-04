import React from 'react';
import { UserProfile, TabType } from '../types';
import { Wallet, Clock, CheckCircle, ArrowUpRight, ShieldCheck, Sparkles, MessageCircle } from 'lucide-react';
import { openSmartsuppChat } from '../utils/chat';

interface DashboardViewProps {
  user: UserProfile;
  availableBalance: number;
  pendingBalance: number;
  activeLoanAmount: number;
  activeLoanStatus?: string;
  onNavigate: (tab: TabType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  availableBalance,
  pendingBalance,
  activeLoanAmount,
  activeLoanStatus,
  onNavigate,
}) => {
  const formattedAvailable = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(availableBalance);

  const formattedPending = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(pendingBalance);

  const formattedLoan = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(activeLoanAmount);

  return (
    <div className="space-y-6 pb-24">
      {/* Welcome Heading & Account Status (Exact replica of Screenshot 1) */}
      <div className="pt-2">
        <h1
          className="text-3xl sm:text-4xl font-extrabold text-[#0A1F44] tracking-tight"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          Welcome, {user.name}
        </h1>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm font-medium text-slate-500">Account status:</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
            {user.accountStatus}
          </span>
        </div>
      </div>

      {/* Available Balance - Big Navy Card */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0A1F44] text-white p-6 shadow-xl shadow-[#0A1F44]/15 border border-[#1e3a6d]">
        {/* Subtle geometric pattern glow */}
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-36 h-36 bg-[#F2B705]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">Available balance</span>
          <div className="w-8 h-8 rounded-lg bg-[#F2B705]/15 flex items-center justify-center text-[#F2B705]">
            <Wallet className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-4 mb-3">
          <div className="text-4xl font-bold tracking-tight text-white font-sans">
            {formattedAvailable}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-slate-300">
          <span>Verified funds only</span>
          <button
            onClick={() => onNavigate('deposit')}
            className="flex items-center gap-1 text-[#F2B705] font-semibold hover:underline cursor-pointer"
          >
            <span>+ Fund Wallet</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Pending Deposits - White Card */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">Pending funding</span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-[#F2B705]">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-4 mb-2">
          <div className="text-3xl font-bold tracking-tight text-slate-900 font-sans">
            {formattedPending}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Not yet available</span>
          {pendingBalance > 0 && (
            <span className="text-amber-600 font-medium animate-pulse">Awaiting blockchain / bank confirmation</span>
          )}
        </div>
      </div>

      {/* Approved / Active Loans - White Card */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">Approved / active loans</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-4 mb-2 flex items-baseline justify-between">
          <div className="text-3xl font-bold tracking-tight text-slate-900 font-sans">
            {formattedLoan}
          </div>
          {activeLoanStatus && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {activeLoanStatus}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>
            {activeLoanAmount > 0 ? 'Active repayment term in progress' : 'No active loan balance'}
          </span>
          <button
            onClick={() => onNavigate('loan')}
            className="text-[#0A1F44] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>{activeLoanAmount > 0 ? 'View Details' : 'Apply Now'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Action Highlights */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={() => onNavigate('loan')}
          className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-300/40 text-left hover:border-amber-400 transition cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-[#F2B705] text-[#0A1F44] flex items-center justify-center font-bold mb-2 shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-sm font-bold text-[#0A1F44] group-hover:text-amber-700">Apply for Loan</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Up to $100,000 (10% upfront payment)</div>
        </button>

        <button
          onClick={() => onNavigate('deposit')}
          className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-300/40 text-left hover:border-blue-400 transition cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-[#0A1F44] text-[#F2B705] flex items-center justify-center font-bold mb-2 shadow-sm">
            <Wallet className="w-4 h-4" />
          </div>
          <div className="text-sm font-bold text-[#0A1F44] group-hover:text-blue-800">Fund Wallet</div>
          <div className="text-[11px] text-slate-500 mt-0.5">NOWPayments Crypto & Instant deposit</div>
        </button>
      </div>

      {/* Live Support Banner */}
      <div className="rounded-2xl bg-slate-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F2B705] text-[#0A1F44] flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Need help with your application?</div>
            <div className="text-xs text-slate-300">Live chat agents available 24/7</div>
          </div>
        </div>
        <button
          onClick={() => openSmartsuppChat('Hello, I am on my Dashboard and have a question about my loan / wallet.')}
          className="px-3.5 py-1.5 rounded-xl bg-[#F2B705] hover:bg-[#DDA200] text-[#0A1F44] font-bold text-xs shadow-sm transition active:scale-95 shrink-0 cursor-pointer"
        >
          Chat Now
        </button>
      </div>

      {/* Compliance reassurance */}
      <div className="pt-2 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Swift Fund complies with US Lending Regulations. 10% upfront commitment required for disbursement.</span>
      </div>
    </div>
  );
};
