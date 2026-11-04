import React from 'react';
import { LogOut, MessageSquare, Download } from 'lucide-react';
import { openSmartsuppChat } from '../utils/chat';

interface NavbarProps {
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLogout }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100">
      <div className="max-w-md md:max-w-xl mx-auto px-5 py-3.5 flex items-center justify-between">
        {/* Brand Logo & Name cloned from YYNAB header style */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0A1F44] flex items-center justify-center shadow-sm border border-[#F2B705]/40 text-[#F2B705]">
            <span className="font-extrabold text-base tracking-tighter font-serif-header">SF</span>
          </div>
          <div className="flex flex-col">
            <span
              className="font-black text-xl tracking-tight text-[#0A1F44]"
              style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
            >
              SWIFT FUND
            </span>
          </div>
        </div>

        {/* Right Action Icons: Download App, Live Support & Logout */}
        <div className="flex items-center gap-1.5">
          <a
            href="/download-app"
            download="swift-fund-app.zip"
            className="p-2 rounded-xl text-slate-500 hover:text-[#0A1F44] hover:bg-slate-100 transition active:scale-95 cursor-pointer flex items-center gap-1 text-xs font-semibold text-slate-600"
            title="Download App Source Code (.ZIP)"
          >
            <Download className="w-5 h-5 text-[#0A1F44]" />
          </a>

          <button
            onClick={() => openSmartsuppChat('Hello, I need assistance with my Swift Fund account.')}
            className="p-2 rounded-xl text-slate-500 hover:text-[#0A1F44] hover:bg-slate-100 transition active:scale-95 cursor-pointer relative"
            title="Chat with Live Support"
          >
            <MessageSquare className="w-5 h-5 text-amber-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
          </button>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition active:scale-95 cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
