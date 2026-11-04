import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FastForward, Sparkles } from 'lucide-react';

interface SplashIntroProps {
  onComplete: () => void;
}

export const SplashIntro: React.FC<SplashIntroProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 3800; // ~3.8 seconds
    const intervalTime = 40;
    const step = 100 / (duration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-30 flex flex-col items-center justify-between bg-[#0A1F44] text-white overflow-hidden select-none">
      {/* Background radial spotlight and particle effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(242,183,5,0.18)_0%,rgba(10,31,68,0.95)_75%,#0A1F44_100%)] pointer-events-none" />

      {/* Stage ambient lights & floor reflection */}
      <div className="absolute bottom-0 w-full h-44 bg-gradient-to-t from-[#061229] to-transparent pointer-events-none" />
      <div className="absolute bottom-28 w-full h-[1px] bg-gradient-to-r from-transparent via-[#F2B705]/40 to-transparent pointer-events-none" />

      {/* Top micro badge */}
      <div className="relative z-10 pt-8 flex items-center gap-2 text-xs tracking-widest uppercase font-semibold text-[#F2B705]/80">
        <Sparkles className="w-3.5 h-3.5 text-[#F2B705] animate-pulse" />
        <span>USA Premier Lending Network</span>
      </div>

      {/* Center Branding Area */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-lg">
        {/* Monogram Badge */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F2B705] to-[#DDA200] flex items-center justify-center shadow-lg shadow-[#F2B705]/20 mb-6 border border-[#FDE68A]/30"
        >
          <span className="text-2xl font-black text-[#0A1F44] tracking-tight font-serif-header">SF</span>
        </motion.div>

        {/* SWIFT FUND Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, delay: 0.5, ease: 'easeOut' }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#F2B705] drop-shadow-[0_4px_24px_rgba(242,183,5,0.4)]"
          style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
        >
          SWIFT FUND
        </motion.h1>

        {/* Slogan */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.1, ease: 'easeOut' }}
          className="mt-3 text-lg md:text-xl font-medium text-slate-200 tracking-wide"
        >
          Fast Loans. Easy Funding.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="mt-2 text-xs tracking-wider text-[#F2B705]/70 font-semibold"
        >
          NO UPFRONT FEES • ZERO HIDDEN COSTS • USD ($)
        </motion.div>
      </div>

      {/* Moonwalk Animation Section: Man in black suit sliding backwards from right to left */}
      <div className="relative w-full h-44 overflow-hidden z-20 flex items-end">
        {/* Stage surface gloss */}
        <div className="absolute bottom-6 w-full h-1 bg-gradient-to-r from-transparent via-[#F2B705]/30 to-transparent" />

        {/* Moonwalking character moving right to left */}
        <motion.div
          initial={{ x: '100vw' }}
          animate={{ x: '-100vw' }}
          transition={{
            duration: 3.5,
            ease: 'linear',
          }}
          className="absolute bottom-6 flex flex-col items-center"
        >
          {/* Animated Michael Jackson Moonwalk Silhouette */}
          <div className="relative w-28 h-36">
            {/* Fedora Hat */}
            <motion.div
              animate={{ rotate: [-2, 2, -2] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              className="absolute top-1 left-9 z-20"
            >
              {/* Hat crown */}
              <div className="w-10 h-5 bg-neutral-900 rounded-t-full relative shadow-md">
                {/* White hatband */}
                <div className="absolute bottom-0 w-full h-1 bg-slate-100" />
              </div>
              {/* Hat brim tilted forward */}
              <div className="w-14 h-1.5 bg-neutral-900 rounded-full -ml-2 transform -rotate-6 shadow" />
            </motion.div>

            {/* Head & Neck */}
            <div className="absolute top-6 left-12 w-4 h-4 bg-amber-100 rounded-full z-10" />

            {/* Torso & Suit Jacket */}
            <div className="absolute top-9 left-9 w-10 h-14 bg-neutral-900 rounded-sm z-10 shadow-lg flex justify-center">
              {/* White collar & tie */}
              <div className="w-2.5 h-6 bg-slate-100 flex flex-col items-center pt-0.5">
                <div className="w-1.5 h-4 bg-neutral-900 rounded-b" />
              </div>
              {/* Left arm extended forward smoothly */}
              <motion.div
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="absolute -left-2 top-1 w-2.5 h-10 bg-neutral-900 origin-top rounded-full transform -rotate-20"
              >
                <div className="absolute bottom-0 w-2.5 h-2.5 bg-slate-100 rounded-full" />
              </motion.div>
              {/* Right arm bent at chest/hat */}
              <motion.div
                animate={{ rotate: [10, 0, 10] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="absolute -right-2 top-1 w-2.5 h-9 bg-neutral-900 origin-top rounded-full transform rotate-15"
              >
                <div className="absolute bottom-0 w-2.5 h-2.5 bg-slate-100 rounded-full" />
              </motion.div>
            </div>

            {/* Cropped Slim Trousers & Moonwalk Feet */}
            <div className="absolute top-22 left-10 w-8 h-12 flex justify-between">
              {/* Left Leg: gliding flat */}
              <motion.div
                animate={{
                  y: [0, -2, 0],
                  x: [0, 6, 0],
                }}
                transition={{ repeat: Infinity, duration: 0.45, ease: 'easeInOut' }}
                className="w-3 h-9 bg-neutral-900 flex flex-col items-center"
              >
                {/* Stark White Socks */}
                <div className="mt-auto w-3 h-2 bg-slate-100" />
                {/* Shiny Black Shoe sliding flat */}
                <div className="w-5 h-2 bg-neutral-950 rounded-b shadow" />
              </motion.div>

              {/* Right Leg: heel raised in classic moonwalk push */}
              <motion.div
                animate={{
                  y: [-3, 0, -3],
                  x: [6, 0, 6],
                }}
                transition={{ repeat: Infinity, duration: 0.45, ease: 'easeInOut', delay: 0.22 }}
                className="w-3 h-9 bg-neutral-900 flex flex-col items-center"
              >
                {/* Stark White Socks */}
                <div className="mt-auto w-3 h-2 bg-slate-100" />
                {/* Shiny Black Shoe on toe tip */}
                <div className="w-3.5 h-2.5 bg-neutral-950 rounded-t-sm transform rotate-12 shadow" />
              </motion.div>
            </div>

            {/* Subtle shadow on floor */}
            <div className="absolute -bottom-1 left-7 w-16 h-2 bg-black/60 rounded-full blur-[2px]" />
          </div>
        </motion.div>
      </div>

      {/* Bottom Controls: Progress & Skip Button */}
      <div className="relative z-30 w-full px-6 pb-8 flex items-center justify-between max-w-xl">
        {/* Subtle progress indicator */}
        <div className="w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#F2B705] to-[#FFE066] transition-all duration-75 ease-out rounded-full"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>

        {/* Skip Button */}
        <button
          onClick={onComplete}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-800/80 hover:bg-slate-700 active:scale-95 border border-[#F2B705]/40 text-[#F2B705] font-semibold text-sm transition-all shadow-md backdrop-blur-sm cursor-pointer"
        >
          <span>Skip</span>
          <FastForward className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
