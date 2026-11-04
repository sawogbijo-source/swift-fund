import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, LoanApplication } from '../types';
import {
  MessageSquare,
  X,
  Send,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  User,
  Clock,
  CheckCheck,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  timestamp: string;
}

interface SmartsuppWidgetProps {
  user: UserProfile | null;
  latestLoan?: LoanApplication | null;
  onNavigateTab?: (tab: any) => void;
}

export const SmartsuppWidget: React.FC<SmartsuppWidgetProps> = ({
  user,
  latestLoan,
  onNavigateTab,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [hasUnread, setHasUnread] = useState<boolean>(true);
  const [showTooltip, setShowTooltip] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userName = user?.name || 'Visitor';

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'agent',
      text: `Hello ${userName}! 👋 Welcome to Swift Fund USA Support. I'm Sarah, your loan and funding specialist. How can I assist you with your loan application, the 10% upfront payment, or wallet funding today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Hook into window.smartsupp API
  useEffect(() => {
    // Intercept or hook into smartsupp API calls
    if (typeof window !== 'undefined') {
      const origSmartsupp = window.smartsupp;
      window.smartsupp = function (...args: any[]) {
        if (origSmartsupp && typeof origSmartsupp === 'function') {
          try {
            origSmartsupp.apply(this, args);
          } catch {}
        }
        const cmd = args[0];
        if (cmd === 'chat:open' || cmd === 'open' || cmd === 'show' || cmd === 'chat:show') {
          setIsOpen(true);
          setShowTooltip(false);
          setHasUnread(false);
          if (args[1] && typeof args[1] === 'string') {
            addUserMessage(args[1]);
          }
        } else if (cmd === 'chat:close' || cmd === 'close' || cmd === 'hide') {
          setIsOpen(false);
        } else if (cmd === 'message' && typeof args[1] === 'string') {
          addUserMessage(args[1]);
        }
      };

      // Also listen to custom event
      const handleOpenEvent = (e: any) => {
        setIsOpen(true);
        setShowTooltip(false);
        setHasUnread(false);
        if (e.detail?.message) {
          addUserMessage(e.detail.message);
        }
      };

      window.addEventListener('swiftfund:open-chat', handleOpenEvent);
      return () => {
        window.removeEventListener('swiftfund:open-chat', handleOpenEvent);
      };
    }
  }, [user, latestLoan]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Tooltip auto-hide after 10s if not clicked
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  const addUserMessage = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    triggerAgentReply(text.trim());
  };

  const triggerAgentReply = (userQuery: string) => {
    setIsTyping(true);
    const q = userQuery.toLowerCase();

    setTimeout(() => {
      let reply = '';
      const loanAmount = latestLoan ? latestLoan.amount : 10000;
      const upfront = (loanAmount * 0.1).toLocaleString();

      if (q.includes('10%') || q.includes('upfront') || q.includes('fee') || q.includes('pay') || q.includes('down')) {
        reply = `Regarding the 10% upfront payment: Swift Fund requires a 10% commitment deposit ($${upfront} USD for a $${loanAmount.toLocaleString()} loan) to finalize underwriting clearance. You can deposit this via the "Fund Wallet" tab using Bitcoin (BTC), USDT, Ethereum, Litecoin, or Cash App. Once verified, full loan disbursement is released to your USA bank account.`;
      } else if (q.includes('status') || q.includes('approval') || q.includes('ln-') || q.includes('review') || q.includes('wait')) {
        if (latestLoan) {
          reply = `Application #${latestLoan.id} for $${latestLoan.amount.toLocaleString()} USD is currently marked as "Pending Approval". Once your 10% upfront verification payment ($${upfront} USD) is confirmed in the Fund Wallet, the underwriting team automatically authorizes ACH transfer to ${latestLoan.bankName}.`;
        } else {
          reply = `Your Swift Fund account is active! Once you apply for a loan in the "Loan" tab, approvals are granted rapidly after the 10% upfront commitment is confirmed.`;
        }
      } else if (q.includes('wallet') || q.includes('fund') || q.includes('crypto') || q.includes('deposit') || q.includes('btc')) {
        reply = `To fund your wallet: navigate to the "Deposit / Fund Wallet" tab, choose your cryptocurrency or payment method, enter the amount, and copy the deposit address or checkout with NOWPayments. Then paste your transaction hash for instant verification!`;
      } else if (q.includes('bank') || q.includes('routing') || q.includes('disburse')) {
        reply = `Disbursements are processed via Federal ACH directly into your verified USA checking or savings account. No payout wallet is required.`;
      } else {
        reply = `Thank you for reaching out, ${userName}. Your query regarding "${userQuery}" has been registered with our senior loan underwriting team. You can proceed with your 10% upfront deposit in the Fund Wallet tab for priority clearance, or let me know if you have any questions!`;
      }

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
    }, 900);
  };

  const handleSendForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    const text = inputMessage;
    setInputMessage('');
    addUserMessage(text);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 select-none">
      {/* 1. CHAT BUBBLE BUTTON - Smartsupp style in Swift Fund Gold #F2B705 */}
      {!isOpen && (
        <div className="relative flex flex-col items-end">
          {/* Unread / greeting tooltip */}
          {showTooltip && (
            <div
              onClick={() => {
                setIsOpen(true);
                setShowTooltip(false);
              }}
              className="mb-2 mr-1 px-3.5 py-2 rounded-2xl bg-white text-slate-800 text-xs font-semibold shadow-xl border border-slate-200 cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-300 flex items-center gap-2 max-w-[210px]"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
              <span>Questions about loans or 10% upfront? Chat with us!</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTooltip(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          <button
            type="button"
            id="smartsupp-chat-bubble"
            onClick={() => {
              setIsOpen(true);
              setShowTooltip(false);
              setHasUnread(false);
            }}
            className="w-14 h-14 rounded-full bg-[#F2B705] hover:bg-[#DDA200] text-[#0A1F44] shadow-2xl shadow-[#F2B705]/50 border-2 border-white flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-[#0A1F44]/10 relative group"
            title="Chat with Swift Fund Support"
            aria-label="Smartsupp Live Chat"
          >
            <MessageSquare className="w-7 h-7 text-[#0A1F44] stroke-[2.2] group-hover:rotate-6 transition-transform" />

            {/* Active Online Indicator */}
            <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />

            {/* Unread badge if closed */}
            {hasUnread && (
              <span className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
                1
              </span>
            )}
          </button>
        </div>
      )}

      {/* 2. OPENED SMARTSUPP CHAT WINDOW */}
      {isOpen && (
        <div className="w-[calc(100vw-32px)] sm:w-[380px] h-[520px] max-h-[85vh] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-200">
          {/* Header styled with Swift Fund Navy and Gold theme */}
          <div className="bg-[#0A1F44] text-white px-4 py-3.5 flex items-center justify-between shrink-0 border-b border-[#F2B705]/30">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F2B705] to-[#DDA200] text-[#0A1F44] flex items-center justify-center font-extrabold text-sm shadow">
                  SF
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#0A1F44]" />
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-1.5 leading-tight">
                  <span>Swift Fund Support</span>
                </div>
                <div className="text-[11px] text-[#F2B705] font-semibold flex items-center gap-1">
                  <span>Smartsupp Live Chat</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-normal">Sarah is active</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Minimize Chat"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                title="Close Chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Underwriting Notice Header */}
          <div className="bg-amber-50/90 px-3.5 py-1.5 border-b border-amber-200/70 text-[11px] text-amber-900 flex items-center justify-between shrink-0">
            <span className="truncate">
              ⚡ <strong>10% Upfront Policy:</strong> Required for loan clearance.
            </span>
            {onNavigateTab && (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onNavigateTab('deposit');
                }}
                className="text-[#0A1F44] font-bold underline shrink-0 cursor-pointer ml-2"
              >
                Deposit
              </button>
            )}
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/60 text-xs">
            {messages.map((m) => {
              const isAgent = m.sender === 'agent';
              return (
                <div
                  key={m.id}
                  className={`flex gap-2 ${isAgent ? 'justify-start' : 'justify-end'}`}
                >
                  {isAgent && (
                    <div className="w-6 h-6 rounded-lg bg-[#0A1F44] text-[#F2B705] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 shadow-sm">
                      SF
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-xs ${
                      isAgent
                        ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                        : 'bg-[#0A1F44] text-white rounded-tr-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    <div
                      className={`text-[9px] mt-1 text-right flex items-center justify-end gap-1 ${
                        isAgent ? 'text-slate-400' : 'text-slate-300'
                      }`}
                    >
                      <span>{m.timestamp}</span>
                      {!isAgent && <CheckCheck className="w-3 h-3 text-[#F2B705]" />}
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-lg bg-[#0A1F44] text-[#F2B705] flex items-center justify-center font-bold text-[10px] shrink-0">
                  SF
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-3.5 py-2 text-xs text-slate-500 shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-150" />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-300" />
                  <span className="ml-1 text-[10px]">Sarah is typing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick FAQ Chips */}
          <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <button
              type="button"
              onClick={() => addUserMessage('How do I pay the 10% upfront fee?')}
              className="px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-semibold whitespace-nowrap cursor-pointer transition"
            >
              10% Upfront Info
            </button>
            <button
              type="button"
              onClick={() => addUserMessage('What is the status of my loan?')}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium whitespace-nowrap cursor-pointer transition"
            >
              Loan Status
            </button>
            <button
              type="button"
              onClick={() => addUserMessage('How do I fund my wallet with NOWPayments?')}
              className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium whitespace-nowrap cursor-pointer transition"
            >
              Crypto Deposit
            </button>
          </div>

          {/* Chat Input */}
          <form
            onSubmit={handleSendForm}
            className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Sarah about your loan or funding..."
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A1F44] bg-slate-50"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2 rounded-xl bg-[#0A1F44] hover:bg-[#122c5e] text-[#F2B705] transition active:scale-95 disabled:opacity-40 cursor-pointer shadow-sm shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Smartsupp Branding Footer */}
          <div className="bg-slate-50 px-3 py-1 border-t border-slate-100 text-center text-[10px] text-slate-400">
            Powered by Smartsupp • 256-Bit SSL Encrypted
          </div>
        </div>
      )}
    </div>
  );
};
