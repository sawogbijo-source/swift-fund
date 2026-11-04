import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, LoanApplication } from '../types';
import {
  X,
  Send,
  MessageCircle,
  ShieldCheck,
  Bot,
  User,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  timestamp: string;
}

interface LiveChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  initialMessage?: string;
  latestLoan?: LoanApplication | null;
  onNavigateTab?: (tab: any) => void;
}

export const LiveChatDrawer: React.FC<LiveChatDrawerProps> = ({
  isOpen,
  onClose,
  user,
  initialMessage,
  latestLoan,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-1',
        sender: 'agent',
        text: `Hello ${user.name}! Welcome to Swift Fund USA Support. I'm Sarah, your personal loan officer. How can I assist you with your loan application, the 10% upfront payment, or wallet funding today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Handle incoming initial message if opened via trigger
  useEffect(() => {
    if (initialMessage && isOpen) {
      // Add user message if not already added
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.text !== initialMessage) {
        const userMsg: ChatMessage = {
          id: `usr-${Date.now()}`,
          sender: 'user',
          text: initialMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, userMsg]);
        handleAgentAutoReply(initialMessage);
      }
    }
  }, [initialMessage, isOpen]);

  const handleAgentAutoReply = (userQuery: string) => {
    setIsTyping(true);
    const q = userQuery.toLowerCase();

    setTimeout(() => {
      let reply = '';

      if (q.includes('10%') || q.includes('upfront') || q.includes('down payment')) {
        const upfrontVal = latestLoan ? (latestLoan.amount * 0.1).toLocaleString() : '1,000';
        const loanAmt = latestLoan ? latestLoan.amount.toLocaleString() : '10,000';
        reply = `Regarding the 10% upfront payment: For your loan request of $${loanAmt} USD, the 10% upfront commitment is $${upfrontVal} USD. This guarantees loan clearance and underwriting approval. You can deposit this easily via the "Fund Wallet" tab using Bitcoin (BTC), USDT, Ethereum, Litecoin, or Cash App. Once verified, disbursement is released to your USA bank account.`;
      } else if (q.includes('approval') || q.includes('status') || q.includes('ln-') || q.includes('review')) {
        if (latestLoan) {
          reply = `I have pulled up your application #${latestLoan.id} for $${latestLoan.amount.toLocaleString()} USD to ${latestLoan.bankName}. Your file is currently under review by our underwriting desk. As soon as your 10% upfront payment ($${(latestLoan.amount * 0.1).toLocaleString()} USD) is confirmed, your funds are scheduled for ACH release.`;
        } else {
          reply = `Your account status is Active. Once you submit a loan application from the "Loan" tab, approvals typically take less than 15 minutes following receipt of the required 10% upfront verification payment.`;
        }
      } else if (q.includes('wallet') || q.includes('crypto') || q.includes('deposit') || q.includes('btc') || q.includes('nowpayments')) {
        reply = `To fund your wallet: navigate to the "Deposit" tab, select your preferred crypto (BTC, USDT, ETH, LTC) or Cash App, enter your amount, and send to the Swift Fund deposit address or complete via NOWPayments. Once sent, paste your Transaction ID to credit your balance!`;
      } else if (q.includes('bank') || q.includes('receive') || q.includes('disburse')) {
        reply = `Funds are transferred directly via Federal ACH / Direct Deposit to the USA checking or savings account specified in your application. No payout wallet is required.`;
      } else {
        reply = `Thank you for your message. An underwriting agent has recorded your inquiry regarding "${userQuery}". You can also complete your 10% upfront payment through the "Fund Wallet" tab to expedite immediate disbursement. Is there anything else I can clarify for you?`;
      }

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, agentMsg]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const text = inputMessage.trim();
    setInputMessage('');

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Also dispatch to Smartsupp window if available
    try {
      if (typeof window !== 'undefined' && window.smartsupp) {
        window.smartsupp('message', text);
      }
    } catch {}

    handleAgentAutoReply(text);
  };

  const handleQuickQuestion = (question: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: question,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    handleAgentAutoReply(question);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg h-[90vh] sm:h-[620px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-6 duration-200">
        {/* Chat Header */}
        <div className="bg-[#0A1F44] text-white px-5 py-4 flex items-center justify-between shrink-0 shadow-sm border-b border-[#F2B705]/20">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F2B705] to-[#DDA200] text-[#0A1F44] flex items-center justify-center font-bold text-sm shadow">
                SF
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#0A1F44]" />
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-1.5">
                <span>Swift Fund Live Agent</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#F2B705] text-[#0A1F44] font-black uppercase">
                  Live
                </span>
              </div>
              <div className="text-xs text-slate-300 flex items-center gap-1">
                <span>Sarah (Senior Underwriter)</span>
                <span>•</span>
                <span className="text-emerald-400">Replies instantly</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            title="Close Chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 10% Upfront & Status Notice Banner */}
        <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 text-xs text-amber-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 truncate">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="truncate">
              <strong>Loan Policy:</strong> 10% upfront payment required for disbursement.
            </span>
          </div>
          {onNavigateTab && (
            <button
              onClick={() => {
                onClose();
                onNavigateTab('deposit');
              }}
              className="text-[#0A1F44] font-bold text-[11px] underline shrink-0 cursor-pointer ml-2"
            >
              Fund Wallet
            </button>
          )}
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/70">
          {messages.map((msg) => {
            const isAgent = msg.sender === 'agent';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isAgent ? 'justify-start' : 'justify-end'}`}
              >
                {isAgent && (
                  <div className="w-7 h-7 rounded-lg bg-[#0A1F44] text-[#F2B705] flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                    SF
                  </div>
                )}
                <div
                  className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isAgent
                      ? 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                      : 'bg-[#0A1F44] text-white rounded-tr-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <div
                    className={`text-[10px] mt-1 text-right ${
                      isAgent ? 'text-slate-400' : 'text-slate-300'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-2.5 justify-start">
              <div className="w-7 h-7 rounded-lg bg-[#0A1F44] text-[#F2B705] flex items-center justify-center text-xs font-bold shrink-0">
                SF
              </div>
              <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs text-slate-500 shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-150" />
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-300" />
                <span className="ml-1 text-[11px]">Sarah is typing...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Chips */}
        <div className="px-4 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => handleQuickQuestion('How does the 10% upfront payment work?')}
            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition"
          >
            10% Upfront Info
          </button>
          <button
            type="button"
            onClick={() => handleQuickQuestion('Check status of my loan application')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition"
          >
            Check Loan Status
          </button>
          <button
            type="button"
            onClick={() => handleQuickQuestion('How do I fund my wallet with crypto?')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer transition"
          >
            Crypto Wallet Funding
          </button>
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message to Swift Fund support..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A1F44] bg-slate-50"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className="p-2.5 rounded-xl bg-[#0A1F44] hover:bg-[#122c5e] text-[#F2B705] transition active:scale-95 disabled:opacity-50 cursor-pointer shadow"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
