import React, { useState } from 'react';
import {
  Zap,
  Wifi,
  Smartphone,
  Droplets,
  AlertCircle,
  X,
  CheckCircle,
  DollarSign,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { TransactionItem } from '../types';

interface PayBillsViewProps {
  availableBalance: number;
  onBillPaid: (transaction: TransactionItem) => void;
}

interface BillCategory {
  id: string;
  title: string;
  providerCount: string;
  icon: React.ComponentType<{ className?: string }>;
  providers: string[];
}

const BILL_CATEGORIES: BillCategory[] = [
  {
    id: 'electricity',
    title: 'Electricity',
    providerCount: '4 providers',
    icon: Zap,
    providers: ['Duke Energy', 'Con Edison', 'Pacific Gas & Electric (PG&E)', 'Florida Power & Light (FPL)'],
  },
  {
    id: 'internet',
    title: 'Internet',
    providerCount: '4 providers',
    icon: Wifi,
    providers: ['Comcast Xfinity', 'AT&T Fiber', 'Spectrum / Charter', 'Verizon Fios'],
  },
  {
    id: 'mobile',
    title: 'Mobile Phone',
    providerCount: '3 providers',
    icon: Smartphone,
    providers: ['Verizon Wireless', 'AT&T Mobility', 'T-Mobile USA'],
  },
  {
    id: 'water',
    title: 'Water',
    providerCount: '2 providers',
    icon: Droplets,
    providers: ['American Water Works', 'Aqua America'],
  },
];

export const PayBillsView: React.FC<PayBillsViewProps> = ({ availableBalance, onBillPaid }) => {
  const [selectedCategory, setSelectedCategory] = useState<BillCategory | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [billAmount, setBillAmount] = useState<string>('75.00');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  const handleOpenCategory = (cat: BillCategory) => {
    setSelectedCategory(cat);
    setSelectedProvider(cat.providers[0]);
    setAccountNumber('');
    setPaymentSuccess(false);
    setFormError('');
  };

  const handlePayBill = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!accountNumber.trim()) {
      setFormError('Please enter your utility bill account number.');
      return;
    }

    const amt = parseFloat(billAmount) || 50;
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);

      const tx: TransactionItem = {
        id: `TX-BILL-${Date.now().toString().slice(-6)}`,
        type: 'bill',
        title: `${selectedCategory?.title} - ${selectedProvider}`,
        subtitle: `Acct: •••• ${accountNumber.slice(-4)} (Demo Mode)`,
        amount: amt,
        currency: 'USD',
        status: 'Completed',
        date: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        refId: `BILL-${Math.floor(Math.random() * 899999 + 100000)}`,
        details: {
          category: selectedCategory?.title,
          provider: selectedProvider,
          accountMasked: `•••• ${accountNumber.slice(-4)}`,
          note: 'Processed in Demonstration Mode',
        },
      };

      onBillPaid(tx);
    }, 900);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Title (Exact replica of Screenshot 2) */}
      <div>
        <h1
          className="text-3xl sm:text-4xl font-extrabold text-[#0A1F44] tracking-tight"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          Bill Payments
        </h1>
      </div>

      {/* Demonstration mode yellow notice box (Exact replica of Screenshot 2) */}
      <div className="rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] p-4 text-[#92400E] shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-5 h-5 rounded-full border border-[#D97706] text-[#D97706] flex items-center justify-center font-bold text-xs shrink-0">
            i
          </div>
          <p className="text-sm leading-relaxed font-normal">
            Demonstration mode: payments are recorded but no money is moved and your balance is not charged until an authorized payment provider is connected.
          </p>
        </div>
      </div>

      {/* 2x2 Grid of Bill Services (Exact replica of Screenshot 2) */}
      <div className="grid grid-cols-2 gap-4">
        {BILL_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleOpenCategory(cat)}
              className="p-5 rounded-3xl bg-white border border-slate-200/90 hover:border-[#F2B705] text-left transition-all cursor-pointer shadow-sm group hover:shadow-md"
            >
              {/* Golden Icon */}
              <div className="w-12 h-12 rounded-2xl bg-amber-50/50 flex items-center justify-center text-[#F2B705] mb-4 group-hover:scale-105 transition-transform">
                <Icon className="w-7 h-7 stroke-[2]" />
              </div>

              <div className="text-base font-bold text-slate-900 group-hover:text-[#0A1F44]">
                {cat.title}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {cat.providerCount}
              </div>
            </button>
          );
        })}
      </div>

      {/* Helper Banner */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-500 flex items-center justify-between">
        <span>Pay USA utility bills directly with verified funds.</span>
        <span className="font-semibold text-[#0A1F44]">Instant Receipts</span>
      </div>

      {/* Interactive Bill Payment Modal */}
      {selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {!paymentSuccess ? (
              <form onSubmit={handlePayBill} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#F2B705] flex items-center justify-center">
                    <selectedCategory.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{selectedCategory.title}</h3>
                    <p className="text-xs text-slate-400">Pay USA Utility Bill</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Select Utility Provider
                  </label>
                  <select
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-[#0A1F44] focus:outline-none bg-slate-50"
                  >
                    {selectedCategory.providers.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account / Meter Number
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 984029103"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-[#0A1F44] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amount to Pay (USD)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={billAmount}
                      onChange={(e) => setBillAmount(e.target.value)}
                      required
                      className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 text-sm font-bold focus:ring-2 focus:ring-[#0A1F44] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 text-[#92400E] text-xs">
                  Demonstration mode: Your balance will not be charged.
                </div>

                {formError && (
                  <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-semibold">
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0A1F44] hover:bg-[#122c5e] text-white font-semibold text-sm transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 shadow-md"
                >
                  <span>{isProcessing ? 'Processing payment...' : 'Confirm Bill Payment'}</span>
                  <ArrowRight className="w-4 h-4 text-[#F2B705]" />
                </button>
              </form>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">Payment Recorded</h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Receipt for ${billAmount} to {selectedProvider} recorded in History.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="w-full py-2.5 rounded-xl bg-[#0A1F44] text-white text-xs font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
