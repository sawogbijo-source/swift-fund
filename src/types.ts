export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountStatus: 'Active' | 'Pending Verification' | 'Suspended';
  createdAt: string;
}

export type TabType = 'dashboard' | 'deposit' | 'loan' | 'paybills' | 'history';

export interface LoanApplication {
  id: string;
  amount: number;
  purpose: string;
  purposeDetail: string;
  bankName: string;
  accountHolder: string;
  accountNumberMasked: string;
  routingNumberMasked: string;
  accountType: 'Checking' | 'Savings';
  termDays: number;
  upfrontAmount: number;
  interestRate: number;
  interestAmount: number;
  totalRepay: number;
  dueDate: string;
  status: 'Pending Approval' | 'Under Review' | 'Approved' | 'Disbursed';
  submittedAt: string;
}

export interface TransactionItem {
  id: string;
  type: 'deposit' | 'loan' | 'bill';
  title: string;
  subtitle: string;
  amount: number;
  currency: string;
  method?: string;
  status: 'Completed' | 'Pending' | 'Under Review' | 'Processing';
  date: string;
  refId: string;
  details?: Record<string, any>;
}

export interface CryptoDepositInfo {
  paymentId: string;
  orderId: string;
  currency: string;
  amountUsd: number;
  cryptoAmount: number;
  payAddress: string;
  invoiceUrl?: string;
  status: 'waiting' | 'confirming' | 'finished' | 'failed';
  createdAt: string;
}
