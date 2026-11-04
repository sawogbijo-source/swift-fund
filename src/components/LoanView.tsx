import React, { useState } from 'react';
import { LoanApplication, TabType } from '../types';
import {
  ShieldCheck,
  Building2,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  FileText,
  DollarSign,
  HelpCircle,
  Clock,
  Wallet,
} from 'lucide-react';
import { openSmartsuppChat } from '../utils/chat';

interface LoanViewProps {
  onLoanSubmitted: (loan: LoanApplication) => void;
  onNavigate: (tab: TabType) => void;
}

const LOAN_AMOUNTS = [1000, 5000, 10000, 25000, 50000, 100000];

const LOAN_PURPOSES = [
  'Personal Expenses',
  'Business',
  'Medical Bills',
  'Rent / Housing',
  'Car Repair',
  'Education',
  'Debt Consolidation',
  'Other',
];

const LOAN_TERMS = [
  { days: 7, label: '7 Days', rate: 0.035, note: 'Short-term bridge' },
  { days: 14, label: '14 Days', rate: 0.048, note: 'Bi-weekly cycle' },
  { days: 30, label: '30 Days', rate: 0.059, note: 'Monthly standard' },
  { days: 90, label: '90 Days', rate: 0.075, note: 'Quarterly extended' },
];

const POPULAR_BANKS = [
  'JPMorgan Chase Bank',
  'Bank of America',
  'Wells Fargo Bank',
  'Citibank',
  'Capital One',
  'U.S. Bank',
  'PNC Bank',
  'Truist Bank',
  'Chime / The Bancorp Bank',
  'Other Financial Institution',
];

export const LoanView: React.FC<LoanViewProps> = ({ onLoanSubmitted, onNavigate }) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Amount
  const [selectedAmount, setSelectedAmount] = useState<number>(10000);

  // Step 2: Purpose (Required)
  const [purpose, setPurpose] = useState<string>('Personal Expenses');
  const [purposeDetail, setPurposeDetail] = useState<string>('');

  // Step 3: Bank Details (Required)
  const [bankName, setBankName] = useState<string>('JPMorgan Chase Bank');
  const [customBankName, setCustomBankName] = useState<string>('');
  const [accountHolder, setAccountHolder] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [routingNumber, setRoutingNumber] = useState<string>('');
  const [accountType, setAccountType] = useState<'Checking' | 'Savings'>('Checking');

  // Step 4: Term
  const [selectedTermDays, setSelectedTermDays] = useState<number>(30);

  // Feedback & Modal
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);
  const [submittedLoanData, setSubmittedLoanData] = useState<LoanApplication | null>(null);

  // Calculations: 10% Upfront calculation + Interest
  const upfrontPaymentAmount = Math.round(selectedAmount * 0.1 * 100) / 100; // Exact 10% upfront
  const activeTermConfig = LOAN_TERMS.find((t) => t.days === selectedTermDays) || LOAN_TERMS[2];
  const interestAmount = Math.round(selectedAmount * activeTermConfig.rate * 100) / 100;
  const totalToRepay = selectedAmount + interestAmount;

  const getDueDate = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  const dueDateStr = getDueDate(selectedTermDays);

  // Step Validation
  const handleNext = () => {
    setErrorMessage('');

    if (currentStep === 1) {
      if (!selectedAmount || selectedAmount < 500) {
        setErrorMessage('Please select a valid loan amount.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!purpose) {
        setErrorMessage('Please select the purpose of your loan.');
        return;
      }
      if (!purposeDetail.trim()) {
        setErrorMessage('Please describe the purpose of your loan.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      const activeBank = bankName === 'Other Financial Institution' ? customBankName : bankName;
      if (!activeBank.trim()) {
        setErrorMessage('Please enter your Bank Name.');
        return;
      }
      if (!accountHolder.trim()) {
        setErrorMessage('Please enter the Account Holder legal name.');
        return;
      }
      const rawAcc = accountNumber.replace(/\D/g, '');
      if (rawAcc.length < 9 || rawAcc.length > 17) {
        setErrorMessage('Account number must be between 9 and 17 digits.');
        return;
      }
      const rawRouting = routingNumber.replace(/\D/g, '');
      if (rawRouting.length !== 9) {
        setErrorMessage('USA Routing transit number must be exactly 9 digits.');
        return;
      }
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep(5);
    }
  };

  const handleBack = () => {
    setErrorMessage('');
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Final Submission
  const handleSubmitApplication = () => {
    const activeBank = bankName === 'Other Financial Institution' ? customBankName : bankName;
    const maskedAcc = `•••• ${accountNumber.slice(-4)}`;
    const maskedRoute = `•••• ${routingNumber.slice(-4)}`;

    const newLoan: LoanApplication = {
      id: `LN-${Date.now().toString().slice(-6)}`,
      amount: selectedAmount,
      purpose,
      purposeDetail,
      bankName: activeBank,
      accountHolder,
      accountNumberMasked: maskedAcc,
      routingNumberMasked: maskedRoute,
      accountType,
      termDays: selectedTermDays,
      upfrontAmount: upfrontPaymentAmount,
      interestRate: activeTermConfig.rate,
      interestAmount,
      totalRepay: totalToRepay,
      dueDate: dueDateStr,
      status: 'Pending Approval',
      submittedAt: new Date().toISOString(),
    };

    setSubmittedLoanData(newLoan);
    onLoanSubmitted(newLoan);
    setShowApprovalModal(true);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Title & Subtitle */}
      <div>
        <h1
          className="text-3xl sm:text-4xl font-extrabold text-[#0A1F44] tracking-tight"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          Apply for a Loan
        </h1>
        <p className="mt-2 text-sm text-slate-500 leading-relaxed">
          Fast USA lending approval with transparent 10% upfront payment. Approval is subject to eligibility verification.
        </p>
      </div>

      {/* Stepper Progress Bar (5 Steps - replica of Screenshot 3) */}
      <div className="grid grid-cols-5 gap-2 pt-1">
        {[1, 2, 3, 4, 5].map((step) => {
          const isCompleteOrActive = step <= currentStep;
          return (
            <div
              key={step}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                isCompleteOrActive ? 'bg-[#F2B705]' : 'bg-slate-200'
              }`}
            />
          );
        })}
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: AMOUNT SELECTION (Screenshot 3 layout + 10% upfront indicator) */}
      {currentStep === 1 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Step 1: Select Loan Amount
            </span>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              10% Upfront Required
            </span>
          </div>

          {/* Grid of 6 big pill cards matching screenshot 3 with 10% upfront calculation */}
          <div className="grid grid-cols-2 gap-3.5">
            {LOAN_AMOUNTS.map((amt) => {
              const isSelected = selectedAmount === amt;
              const formattedAmt = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                maximumFractionDigits: 0,
              }).format(amt);

              const upfront = amt * 0.1;

              return (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setSelectedAmount(amt)}
                  className={`py-4 px-3 rounded-3xl border text-center transition-all cursor-pointer shadow-sm ${
                    isSelected
                      ? 'border-[#F2B705] ring-2 ring-[#F2B705]/50 bg-amber-50/25 text-[#0A1F44]'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                  }`}
                >
                  <div className="text-xl sm:text-2xl font-bold tracking-tight">
                    {formattedAmt}
                  </div>
                  <div className="text-[11px] font-semibold text-amber-700 mt-1">
                    10% Upfront: ${upfront.toLocaleString()}
                  </div>
                </button>
              );
            })}
          </div>

          {/* 10% Upfront Calculation Indicator Box */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-600 font-medium">Selected Principal:</span>
              <span className="text-base font-extrabold text-[#0A1F44]">
                ${selectedAmount.toLocaleString()} USD
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-amber-200/60">
              <span className="text-amber-900 font-bold flex items-center gap-1">
                <span>10% Upfront Payment Required:</span>
              </span>
              <span className="text-sm font-black text-amber-700">
                ${upfrontPaymentAmount.toLocaleString()} USD
              </span>
            </div>
            <p className="text-[11px] text-slate-500 pt-0.5">
              Payable upon review via the Fund Wallet tab or digital transfer to finalize disbursement.
            </p>
          </div>
        </div>
      )}

      {/* STEP 2: PURPOSE OF LOAN (REQUIRED) */}
      {currentStep === 2 && (
        <div className="space-y-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Step 2: Purpose of Loan (Required)
          </span>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Loan Category <span className="text-red-500">*</span>
            </label>
            <select
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-[#0A1F44] focus:outline-none bg-slate-50/50"
            >
              {LOAN_PURPOSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Describe Purpose <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              value={purposeDetail}
              onChange={(e) => setPurposeDetail(e.target.value)}
              placeholder="e.g. Funding inventory expansion for retail business / Home emergency repairs..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0A1F44] focus:outline-none bg-slate-50/50"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Provides regulatory clarity for underwriting review.
            </p>
          </div>
        </div>
      )}

      {/* STEP 3: WHERE TO RECEIVE LOAN (REQUIRED) */}
      {currentStep === 3 && (
        <div className="space-y-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Step 3: USA Bank Account Disbursement (Required)
          </span>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Financial Institution / Bank Name <span className="text-red-500">*</span>
            </label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-[#0A1F44] focus:outline-none bg-slate-50/50"
            >
              {POPULAR_BANKS.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>

            {bankName === 'Other Financial Institution' && (
              <input
                type="text"
                value={customBankName}
                onChange={(e) => setCustomBankName(e.target.value)}
                placeholder="Enter bank or credit union name"
                className="mt-2 w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0A1F44] focus:outline-none"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Account Holder Full Legal Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              placeholder="e.g. Johnathan Doe"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-[#0A1F44] focus:outline-none bg-slate-50/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Routing Number (9 Digits) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={9}
                value={routingNumber}
                onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="123456789"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-[#0A1F44] focus:outline-none bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Account Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                maxLength={17}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="9-17 digits"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-[#0A1F44] focus:outline-none bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Account Type
            </label>
            <div className="flex gap-3">
              {(['Checking', 'Savings'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAccountType(type)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border cursor-pointer ${
                    accountType === type
                      ? 'bg-[#0A1F44] text-white border-[#0A1F44]'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: TERM & REPAYMENT WITH 10% UPFRONT CALCULATION */}
      {currentStep === 4 && (
        <div className="space-y-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Step 4: Select Repayment Term & Loan Calculation
          </span>

          <div className="grid grid-cols-2 gap-3">
            {LOAN_TERMS.map((term) => {
              const isSelected = selectedTermDays === term.days;
              return (
                <button
                  key={term.days}
                  type="button"
                  onClick={() => setSelectedTermDays(term.days)}
                  className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                    isSelected
                      ? 'border-[#F2B705] ring-2 ring-[#F2B705]/50 bg-amber-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-lg font-bold text-slate-900">{term.label}</div>
                  <div className="text-xs text-amber-700 font-semibold mt-0.5">
                    {(term.rate * 100).toFixed(1)}% APR
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">{term.note}</div>
                </button>
              );
            })}
          </div>

          {/* Full Loan Calculation Breakdown with 10% Upfront */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Principal Amount:</span>
              <span className="font-bold text-slate-900">${selectedAmount.toLocaleString()} USD</span>
            </div>

            {/* 10% Upfront Payment Line (Requirement 2) */}
            <div className="flex justify-between items-center py-1 px-2.5 rounded-lg bg-amber-100/70 text-amber-950 font-semibold border border-amber-200">
              <span>Required 10% Upfront Payment:</span>
              <span className="font-extrabold text-amber-800 text-sm">
                ${upfrontPaymentAmount.toLocaleString()} USD
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Fixed Interest ({activeTermConfig.days} days @ {(activeTermConfig.rate * 100).toFixed(1)}%):</span>
              <span className="font-bold text-slate-900">${interestAmount.toLocaleString()} USD</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Repayment Due Date:</span>
              <span className="font-bold text-slate-900">{dueDateStr}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-[#0A1F44]">
              <span>Total to Repay at Term:</span>
              <span className="text-base text-amber-600">${totalToRepay.toLocaleString()} USD</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              The 10% upfront payment (${upfrontPaymentAmount.toLocaleString()}) acts as your commitment verification and is credited toward your underwriting clearance.
            </p>
          </div>
        </div>
      )}

      {/* STEP 5: REVIEW & SUBMIT WITH 10% UPFRONT HIGHLIGHT */}
      {currentStep === 5 && (
        <div className="space-y-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#F2B705]" />
            <h3 className="text-base font-bold text-slate-900 font-sans">
              Review Loan Summary
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Requested Loan Principal:</span>
              <span className="font-extrabold text-[#0A1F44] text-sm">
                ${selectedAmount.toLocaleString()} USD
              </span>
            </div>

            {/* Prominent 10% Upfront display */}
            <div className="flex justify-between items-center py-1.5 px-2.5 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-950 font-bold">
              <span>10% Upfront Commitment Required:</span>
              <span className="text-amber-800 text-sm">
                ${upfrontPaymentAmount.toLocaleString()} USD
              </span>
            </div>

            <div className="flex justify-between">
              <span>Loan Purpose:</span>
              <span className="font-semibold text-slate-900 text-right">{purpose}</span>
            </div>
            <div className="flex justify-between">
              <span>Disbursement Bank:</span>
              <span className="font-semibold text-slate-900 text-right">
                {bankName === 'Other Financial Institution' ? customBankName : bankName}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Account Holder:</span>
              <span className="font-semibold text-slate-900">{accountHolder}</span>
            </div>
            <div className="flex justify-between">
              <span>Bank Account:</span>
              <span className="font-mono font-semibold text-slate-900">
                •••• {accountNumber.slice(-4)} ({accountType})
              </span>
            </div>
            <div className="flex justify-between">
              <span>Repayment Term:</span>
              <span className="font-semibold text-slate-900">{selectedTermDays} Days</span>
            </div>
            <div className="flex justify-between">
              <span>Due Date:</span>
              <span className="font-semibold text-slate-900">{dueDateStr}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-[#0A1F44]">
              <span>Total to Repay:</span>
              <span className="text-base text-amber-600">${totalToRepay.toLocaleString()} USD</span>
            </div>
          </div>

          {/* Upfront Payment Guidance */}
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              <strong>10% Upfront Payment Notice:</strong> Your 10% upfront commitment of <strong>${upfrontPaymentAmount.toLocaleString()} USD</strong> can be paid through your Swift Fund wallet or via live chat support for rapid bank disbursement.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center gap-3 pt-2">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
        )}

        {currentStep < 5 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 py-3 px-4 rounded-xl bg-[#0A1F44] hover:bg-[#122c5e] text-white font-semibold text-sm transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
          >
            <span>Continue</span>
            <ArrowRight className="w-4 h-4 text-[#F2B705]" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmitApplication}
            className="flex-1 py-3 px-4 rounded-xl bg-[#0A1F44] hover:bg-[#122c5e] text-white font-bold text-sm transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <CheckCircle className="w-4 h-4 text-[#F2B705]" />
            <span>Submit Loan Application</span>
          </button>
        )}
      </div>

      {/* Live Chat help trigger */}
      <div className="text-center pt-2">
        <button
          type="button"
          onClick={() =>
            openSmartsuppChat(
              `Hello, I am reviewing a loan application for $${selectedAmount.toLocaleString()} USD with a 10% upfront payment of $${upfrontPaymentAmount.toLocaleString()} USD and would like more information.`
            )
          }
          className="text-xs text-slate-500 hover:text-[#0A1F44] font-semibold underline cursor-pointer"
        >
          Have questions about your 10% upfront payment? Chat with Live Agent
        </button>
      </div>

      {/* REQUIREMENT 7: POPUP MODAL AFTER SUBMISSION */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border border-slate-100 transform animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 text-[#F2B705] flex items-center justify-center mb-4 border border-amber-200 shadow-sm">
              <Clock className="w-8 h-8 text-[#F2B705] animate-pulse" />
            </div>

            <h3
              className="text-xl font-bold text-[#0A1F44] mb-2"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              Application Submitted
            </h3>

            {/* Exact Required Text with 10% info */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-slate-800 text-sm font-medium leading-relaxed mb-4">
              Please wait for the approval of your loan or ask the live chat agent for more info
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 mb-5">
              <span>Required 10% Upfront: </span>
              <strong className="text-amber-800 font-bold">
                ${submittedLoanData?.upfrontAmount.toLocaleString()} USD
              </strong>
            </div>

            <div className="space-y-2.5">
              {/* Ask Live Chat Agent Button */}
              <button
                type="button"
                onClick={() => {
                  setShowApprovalModal(false);
                  openSmartsuppChat(
                    `Hello, I just submitted loan #${submittedLoanData?.id} for $${submittedLoanData?.amount.toLocaleString()} USD (10% upfront: $${submittedLoanData?.upfrontAmount.toLocaleString()} USD). Please provide approval info.`
                  );
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#F2B705] hover:bg-[#DDA200] text-[#0A1F44] font-bold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 text-[#0A1F44]" />
                <span>Ask Live Chat Agent</span>
              </button>

              {/* Fund 10% Upfront in Wallet */}
              <button
                type="button"
                onClick={() => {
                  setShowApprovalModal(false);
                  onNavigate('deposit');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0A1F44] hover:bg-[#122c5e] text-white font-semibold text-xs transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Wallet className="w-3.5 h-3.5 text-[#F2B705]" />
                <span>Pay 10% Upfront via Fund Wallet</span>
              </button>

              {/* View in History */}
              <button
                type="button"
                onClick={() => {
                  setShowApprovalModal(false);
                  onNavigate('history');
                }}
                className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition active:scale-95 cursor-pointer"
              >
                View in History
              </button>

              {/* Return to Dashboard */}
              <button
                type="button"
                onClick={() => {
                  setShowApprovalModal(false);
                  onNavigate('dashboard');
                }}
                className="w-full text-xs text-slate-400 hover:text-slate-600 py-1 transition cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
