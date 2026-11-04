import React, { useState } from 'react';
import { TransactionItem } from '../types';
import { Search, ArrowDownLeft, ArrowUpRight, Banknote, ShieldCheck, FileText, CheckCircle2, Clock } from 'lucide-react';

interface HistoryViewProps {
  transactions: TransactionItem[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ transactions }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'loans' | 'bills'>('all');
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);

  // Filter transactions
  const filtered = transactions.filter((tx) => {
    // Type tab
    if (activeFilter === 'loans' && tx.type !== 'loan') return false;
    if (activeFilter === 'bills' && tx.type !== 'bill') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = tx.title.toLowerCase().includes(q);
      const matchSubtitle = tx.subtitle.toLowerCase().includes(q);
      const matchRef = tx.refId.toLowerCase().includes(q);
      return matchTitle || matchSubtitle || matchRef;
    }

    return true;
  });

  return (
    <div className="space-y-5 pb-24">
      {/* Title (Exact replica of Screenshot 5) */}
      <div>
        <h1
          className="text-3xl sm:text-4xl font-extrabold text-[#0A1F44] tracking-tight"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          Transaction History
        </h1>
      </div>

      {/* Search Input (Exact replica of Screenshot 5) */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0A1F44] shadow-sm"
        />
      </div>

      {/* Filter Tabs (Exact replica of Screenshot 5) */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-[#0A1F44] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Transactions
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('loans')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeFilter === 'loans'
              ? 'bg-[#0A1F44] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Loans
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('bills')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeFilter === 'bills'
              ? 'bg-[#0A1F44] text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Bill payments
        </button>
      </div>

      {/* List or Empty State */}
      {filtered.length === 0 ? (
        <div className="pt-20 pb-28 text-center">
          {/* Exact text from Screenshot 5 */}
          <p className="text-base text-slate-500 font-medium">
            No transactions found.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isDeposit = item.type === 'deposit';
            const isLoan = item.type === 'loan';
            const isBill = item.type === 'bill';

            return (
              <div
                key={item.id}
                onClick={() => setSelectedTx(item)}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 transition-all cursor-pointer shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isDeposit
                        ? 'bg-emerald-50 text-emerald-600'
                        : isLoan
                        ? 'bg-amber-50 text-[#F2B705]'
                        : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    {isDeposit ? (
                      <ArrowDownLeft className="w-5 h-5" />
                    ) : isLoan ? (
                      <FileText className="w-5 h-5 text-amber-500" />
                    ) : (
                      <Banknote className="w-5 h-5" />
                    )}
                  </div>

                  <div>
                    <div className="text-sm font-bold text-slate-900 leading-tight">
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {item.subtitle} • {item.date}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`text-sm font-extrabold ${
                      isDeposit ? 'text-emerald-600' : isLoan ? 'text-[#0A1F44]' : 'text-slate-800'
                    }`}
                  >
                    {isDeposit ? '+' : isLoan ? '' : '-'}${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      item.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : item.status === 'Pending' || item.status === 'Under Review'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Transaction Details Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Transaction Details</h3>
              <span className="text-xs font-mono text-slate-400">{selectedTx.refId}</span>
            </div>

            <div className="text-center py-2">
              <div className="text-2xl font-black text-[#0A1F44]">
                ${selectedTx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD
              </div>
              <div className="text-xs text-slate-500 mt-1">{selectedTx.title}</div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl text-xs space-y-2 text-slate-600 border border-slate-200">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-semibold text-slate-900">{selectedTx.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span className="font-semibold text-slate-900">{selectedTx.date}</span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-semibold uppercase text-slate-900">{selectedTx.type}</span>
              </div>
              {selectedTx.details && (
                Object.entries(selectedTx.details).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="capitalize">{k}:</span>
                    <span className="font-medium text-slate-800">{String(v)}</span>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedTx(null)}
              className="w-full py-2.5 rounded-xl bg-[#0A1F44] text-white text-xs font-bold hover:bg-[#122c5e] cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
