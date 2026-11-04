import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, CheckCheck, Sparkles, ShieldCheck } from 'lucide-react';
import { openSmartsuppChat } from '../utils/chat';

interface Bubble {
  id: number;
  colorType: 'gold' | 'white' | 'blue';
  size: number;
  xOffset: number;
  duration: number;
  swayDistance: number;
}

interface ChatMessage {
  id: string;
  sender: 'agent' | 'user';
  text: string;
  timestamp: string;
}

interface ChatBubbleAnimationProps {
  isChatOpen?: boolean;
}

const QUICK_ACTIONS = [
  'How to deposit via NOWPayments?',
  'How do I deposit with Cash App?',
  'When will my loan be approved?',
  'What is the 10% deposit fee?',
];

export const ChatBubbleAnimation: React.FC<ChatBubbleAnimationProps> = ({
  isChatOpen = false,
}) => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  // Local state to open/close chat window
  const [isChatWindowOpen, setIsChatWindowOpen] = useState<boolean>(isChatOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'agent',
      text: 'Hello! Welcome to Swift Fund 24/7 Live Support. My name is Sarah. How can I assist you with your loan application, NOWPayments crypto funding, or Cash App deposit today?',
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync external chat open prop
  useEffect(() => {
    if (isChatOpen !== isChatWindowOpen) {
      setIsChatWindowOpen(isChatOpen);
    }
  }, [isChatOpen]);

  // Hook into Smartsupp events and custom open-swift-chat events
  useEffect(() => {
    const handleCustomOpen = (e: any) => {
      setIsChatWindowOpen(true);
      const prefill = e.detail?.message;
      if (prefill) {
        handleSendMessage(prefill);
      }
    };

    window.addEventListener('open-swift-chat', handleCustomOpen);

    if (typeof window !== 'undefined' && window.smartsupp) {
      try {
        window.smartsupp('on', 'chat:open', () => setIsChatWindowOpen(true));
        window.smartsupp('on', 'chat:close', () => setIsChatWindowOpen(false));
      } catch {}
    }

    return () => {
      window.removeEventListener('open-swift-chat', handleCustomOpen);
    };
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (isChatWindowOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isChatWindowOpen, isTyping]);

  // BUBBLE ANIMATION ENGINE:
  // - Small round bubbles in Gold #F2B705, White, and Light Blue
  // - Appear every 1-2 seconds, rise up slowly, get bigger small-small, then fade and pop
  // - Look like the chat box is blowing bubbles
  // - 5-7 bubbles at a time
  // - Behind the chat button (pointer-events-none)
  // - Paused when chat window is open; resumes when chat window closes
  useEffect(() => {
    if (isChatWindowOpen) {
      // Pause bubbles when chat window is open
      setBubbles([]);
      return;
    }

    const colorChoices: Array<'gold' | 'white' | 'blue'> = [
      'gold',
      'white',
      'blue',
      'gold',
      'blue',
      'white',
    ];

    const generateBubble = (indexOffset = 0): Bubble => ({
      id: Date.now() + Math.random() + indexOffset,
      colorType: colorChoices[Math.floor(Math.random() * colorChoices.length)],
      size: Math.floor(Math.random() * 10) + 12, // 12px to 22px
      xOffset: (Math.random() - 0.5) * 32, // -16px to +16px drift
      duration: 3.2 + Math.random() * 1.5, // 3.2s - 4.7s float duration
      swayDistance: (Math.random() - 0.5) * 20,
    });

    // Seed 2 initial bubbles immediately so bubbles are visible right away
    setBubbles([generateBubble(1), generateBubble(2)]);

    const interval = setInterval(() => {
      setBubbles((prev) => {
        // Enforce 5-7 bubbles maximum at any moment
        const trimmed = prev.length >= 7 ? prev.slice(prev.length - 6) : prev;
        return [...trimmed, generateBubble()];
      });
    }, 1400); // 1.4s interval (between 1-2 seconds as requested)

    return () => clearInterval(interval);
  }, [isChatWindowOpen]);

  // Clean up finished bubble
  const handleBubbleComplete = (id: number) => {
    setBubbles((prev) => prev.filter((b) => b.id !== id));
  };

  // Toggle chat
  const handleChatToggle = () => {
    const nextState = !isChatWindowOpen;
    setIsChatWindowOpen(nextState);

    // Call Smartsupp SDK API if loaded
    if (nextState) {
      openSmartsuppChat();
    } else {
      if (typeof window !== 'undefined' && window.smartsupp) {
        try {
          window.smartsupp('chat:close');
        } catch {}
      }
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // Forward message to Smartsupp if available
    if (typeof window !== 'undefined' && window.smartsupp) {
      try {
        window.smartsupp('message', text);
      } catch {}
    }

    // Smart, helpful automated assistant response
    setTimeout(() => {
      setIsTyping(false);
      let reply = "Thank you for reaching out to Swift Fund! A support specialist is reviewing your inquiry. Please ensure you keep your account active.";
      const lower = text.toLowerCase();

      if (lower.includes('crypto') || lower.includes('nowpayments') || lower.includes('bitcoin') || lower.includes('invoice')) {
        reply = "For Crypto deposits via NOWPayments, accept the 10% fee and click 'Create Invoice via NOWPayments'. Your unique Bitcoin address and QR code will pop out instantly. Transfers are credited upon blockchain confirmation.";
      } else if (lower.includes('cash app') || lower.includes('cashtag') || lower.includes('tag')) {
        reply = "Hello! For Cash App deposits, please chat directly with our live agent right here. Tell us your deposit amount and your Cash App $cashtag, and we will provide the active verified Cashtag and credit your wallet immediately.";
      } else if (lower.includes('fee') || lower.includes('10%')) {
        reply = "Swift Fund deposits have a transparent 10% processing fee. For example, a $100 USD deposit will credit $90 USD directly to your Available Balance.";
      } else if (lower.includes('loan') || lower.includes('approval') || lower.includes('borrow')) {
        reply = "Loan approvals take between 15-30 minutes during US banking hours. If your application shows 'Approved - Upfront Fee Required', visit Fund Wallet to fulfill the requirement.";
      }

      const agentReply: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'agent',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, agentReply]);
    }, 900);
  };

  return (
    <>
      {/* ========================================================
          SWIFT FUND 24/7 LIVE SUPPORT CHAT WINDOW
          Pops open whenever chat bubble is clicked!
         ======================================================== */}
      <AnimatePresence>
        {isChatWindowOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-[88px] right-3 sm:right-6 z-[95] w-[92vw] max-w-[360px] h-[min(480px,calc(100vh-104px))] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden font-sans"
          >
            {/* Header */}
            <div className="bg-[#0A1F44] text-white p-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-[#F2B705] text-[#0A1F44] flex items-center justify-center font-bold text-sm shadow-inner">
                    SF
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0A1F44]" />
                </div>
                <div>
                  <div className="font-bold text-sm flex items-center gap-1.5">
                    <span>Swift Fund Live Chat</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#F2B705]" />
                  </div>
                  <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Agent Sarah • Online 24/7
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={handleChatToggle}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                aria-label="Close Chat Window"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Smartsupp status notice bar */}
            <div className="bg-amber-50 px-3.5 py-2 border-b border-amber-200/80 text-[11px] text-amber-900 flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate font-medium">Smartsupp Script Loaded</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                Live Support Online
              </span>
            </div>

            {/* Messages Body */}
            <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#F8FAFC]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
                      msg.sender === 'user'
                        ? 'bg-[#0A1F44] text-white rounded-br-xs'
                        : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-2xl px-3 py-2 w-16 text-slate-400">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Chips */}
            <div className="p-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
              {QUICK_ACTIONS.map((action, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(action)}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-[#F2B705]/20 hover:text-[#0A1F44] text-slate-700 text-[10px] font-medium transition cursor-pointer border border-slate-200 shrink-0"
                >
                  {action}
                </button>
              ))}
            </div>

            {/* Message Input Footer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#0A1F44] text-slate-800"
              />
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 rounded-xl bg-[#0A1F44] text-[#F2B705] hover:bg-[#122c5e] disabled:opacity-40 transition cursor-pointer shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================
          BUBBLE ANIMATION + CHAT BUTTON
          Positioned bottom-[74px] right-4 (above bottom navigation)
         ======================================================== */}
      <div className="fixed bottom-[74px] right-4 z-[90] select-none flex flex-col items-center pointer-events-none">
        {/* Floating Bubbles Container: positioned behind the chat button */}
        <div className="relative w-14 h-14 flex items-center justify-center">
          <AnimatePresence>
            {!isChatWindowOpen &&
              bubbles.map((bubble) => {
                let bgStyle = 'bg-[#F2B705]/85 border-[#FDE68A] shadow-[0_0_10px_rgba(242,183,5,0.5)]';
                let glintStyle = 'bg-white/80';

                if (bubble.colorType === 'white') {
                  bgStyle = 'bg-white/90 border-white/70 shadow-[0_0_10px_rgba(255,255,255,0.6)]';
                  glintStyle = 'bg-white';
                } else if (bubble.colorType === 'blue') {
                  bgStyle = 'bg-sky-300/85 border-sky-100 shadow-[0_0_10px_rgba(186,230,253,0.6)]';
                  glintStyle = 'bg-white/90';
                }

                return (
                  <motion.div
                    key={bubble.id}
                    initial={{
                      opacity: 0,
                      scale: 0.35,
                      y: 0,
                      x: bubble.xOffset * 0.3,
                    }}
                    animate={{
                      opacity: [0, 0.85, 0.9, 0.8, 0],
                      scale: [0.35, 0.75, 1.05, 1.15, 1.3],
                      y: -140 - Math.random() * 40,
                      x: [
                        bubble.xOffset * 0.3,
                        bubble.xOffset + bubble.swayDistance,
                        bubble.xOffset - bubble.swayDistance * 0.5,
                        bubble.xOffset,
                      ],
                    }}
                    transition={{
                      duration: bubble.duration,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    onAnimationComplete={() => handleBubbleComplete(bubble.id)}
                    style={{
                      width: `${bubble.size}px`,
                      height: `${bubble.size}px`,
                    }}
                    className={`absolute rounded-full border backdrop-blur-[1px] pointer-events-none z-30 ${bgStyle}`}
                  >
                    {/* Specular shine */}
                    <div
                      className={`absolute top-[18%] left-[20%] w-[26%] h-[26%] rounded-full ${glintStyle} opacity-90`}
                    />
                    <div
                      className={`absolute bottom-[20%] right-[22%] w-[15%] h-[15%] rounded-full ${glintStyle} opacity-60`}
                    />
                  </motion.div>
                );
              })}
          </AnimatePresence>

          {/* CHAT BUBBLE BUTTON - Smartsupp Trigger in Swift Fund Gold #F2B705 */}
          <button
            type="button"
            onClick={handleChatToggle}
            className="relative z-[92] w-14 h-14 rounded-full bg-[#F2B705] hover:bg-[#DDA200] text-[#0A1F44] shadow-xl shadow-[#F2B705]/40 border-2 border-white flex items-center justify-center transition-all duration-200 transform hover:scale-105 active:scale-95 cursor-pointer pointer-events-auto touch-manipulation ring-2 ring-[#0A1F44]/15 group"
            title="Chat with Swift Fund Live Support"
            aria-label="Open Smartsupp Live Chat"
          >
            {isChatWindowOpen ? (
              <X className="w-6 h-6 text-[#0A1F44] stroke-[2.5]" />
            ) : (
              <MessageSquare className="w-6 h-6 text-[#0A1F44] stroke-[2.3] group-hover:rotate-6 transition-transform" />
            )}

            {/* Online active status badge */}
            <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
          </button>
        </div>
      </div>
    </>
  );
};
