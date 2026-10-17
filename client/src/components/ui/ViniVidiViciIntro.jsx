import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function ViniVidiViciIntro({ onComplete }) {
  // Stages:
  // 0: Initial black
  // 1: VINI (White)
  // 2: VIDI (Blue)
  // 3: VICI (Red)
  // 4: Full Trinity (VINI VIDI VICI united)
  // 5: Fade out / Exit
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage 1: VINI appears at 400ms
    const t1 = setTimeout(() => setStage(1), 400);

    // Stage 2: VIDI appears at 1600ms
    const t2 = setTimeout(() => setStage(2), 1600);

    // Stage 3: VICI appears at 2800ms
    const t3 = setTimeout(() => setStage(3), 2800);

    // Stage 4: Trinity assembly at 4000ms
    const t4 = setTimeout(() => setStage(4), 4000);

    // Stage 5: Smooth exit into home page at 5500ms
    const t5 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 5500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center overflow-hidden select-none"
    >
      {/* Dynamic Colored Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* White glow for VINI */}
        <motion.div
          animate={{
            opacity: stage === 1 ? 0.35 : stage >= 4 ? 0.15 : 0,
            scale: stage === 1 ? 1.2 : 1,
          }}
          transition={{ duration: 0.6 }}
          className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/20 blur-[130px] rounded-full"
        />

        {/* Blue glow for VIDI */}
        <motion.div
          animate={{
            opacity: stage === 2 ? 0.45 : stage >= 4 ? 0.25 : 0,
            scale: stage === 2 ? 1.3 : 1,
          }}
          transition={{ duration: 0.6 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/30 blur-[140px] rounded-full"
        />

        {/* Red glow for VICI */}
        <motion.div
          animate={{
            opacity: stage === 3 ? 0.5 : stage >= 4 ? 0.25 : 0,
            scale: stage === 3 ? 1.3 : 1,
          }}
          transition={{ duration: 0.6 }}
          className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-red-600/30 blur-[140px] rounded-full"
        />

        {/* Ambient Dark Grid / Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />
      </div>

      {/* Top Bar with Skip Button */}
      <div className="absolute top-6 right-6 z-20">
        <button
          type="button"
          onClick={onComplete}
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-400 hover:text-white transition-all tracking-wider uppercase"
        >
          <span>Next: The Blade</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Main Dramatic Sequence Container */}
      <div className="relative z-10 w-full max-w-6xl px-6 flex flex-col items-center justify-center text-center">
        {/* Subtle Pre-header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: stage >= 1 ? 1 : 0, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs tracking-[0.25em] uppercase font-mono"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>The Warrior's Creed</span>
        </motion.div>

        {/* The Three Words Display (Responsive Layout) */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 lg:gap-12 my-4">
          {/* Word 1: VINI (White) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 30 }}
            animate={{
              opacity: stage >= 1 ? 1 : 0,
              scale: stage === 1 ? [0.7, 1.08, 1] : 1,
              y: stage >= 1 ? 0 : 30,
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <span
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-editorial tracking-tight text-white drop-shadow-[0_0_35px_rgba(255,255,255,0.7)]"
              style={{ textShadow: '0 0 40px rgba(255, 255, 255, 0.6), 0 0 80px rgba(255, 255, 255, 0.3)' }}
            >
              VINI
            </span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: stage >= 1 ? 0.7 : 0 }}
              transition={{ delay: 0.2 }}
              className="mt-2 text-xs sm:text-sm tracking-[0.3em] uppercase text-slate-300 font-mono font-medium"
            >
              I Came
            </motion.span>
          </motion.div>

          {/* Separator 1 */}
          {stage >= 2 && (
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.3, scale: 1 }}
              className="hidden md:inline-block text-3xl text-slate-600 font-thin select-none"
            >
              •
            </motion.span>
          )}

          {/* Word 2: VIDI (Blue) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 30 }}
            animate={{
              opacity: stage >= 2 ? 1 : 0,
              scale: stage === 2 ? [0.7, 1.08, 1] : 1,
              y: stage >= 2 ? 0 : 30,
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <span
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-editorial tracking-tight text-blue-500 drop-shadow-[0_0_40px_rgba(59,130,246,0.85)]"
              style={{
                color: '#3b82f6',
                textShadow: '0 0 40px rgba(59, 130, 246, 0.8), 0 0 90px rgba(37, 99, 235, 0.5)'
              }}
            >
              VIDI
            </span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: stage >= 2 ? 0.8 : 0 }}
              transition={{ delay: 0.2 }}
              className="mt-2 text-xs sm:text-sm tracking-[0.3em] uppercase text-blue-300 font-mono font-medium"
            >
              I Saw
            </motion.span>
          </motion.div>

          {/* Separator 2 */}
          {stage >= 3 && (
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 0.3, scale: 1 }}
              className="hidden md:inline-block text-3xl text-slate-600 font-thin select-none"
            >
              •
            </motion.span>
          )}

          {/* Word 3: VICI (Red) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 30 }}
            animate={{
              opacity: stage >= 3 ? 1 : 0,
              scale: stage === 3 ? [0.7, 1.08, 1] : 1,
              y: stage >= 3 ? 0 : 30,
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <span
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-editorial tracking-tight text-red-500 drop-shadow-[0_0_40px_rgba(239,68,68,0.85)]"
              style={{
                color: '#ef4444',
                textShadow: '0 0 40px rgba(239, 68, 68, 0.85), 0 0 90px rgba(220, 38, 38, 0.55)'
              }}
            >
              VICI
            </span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: stage >= 3 ? 0.8 : 0 }}
              transition={{ delay: 0.2 }}
              className="mt-2 text-xs sm:text-sm tracking-[0.3em] uppercase text-red-300 font-mono font-medium"
            >
              I Conquered
            </motion.span>
          </motion.div>
        </div>

        {/* Subtitle / Climax Announcement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: stage >= 4 ? 1 : 0,
            y: stage >= 4 ? 0 : 20,
          }}
          transition={{ duration: 0.6 }}
          className="mt-10 flex flex-col items-center space-y-3"
        >
          <div className="h-0.5 w-24 bg-gradient-to-r from-white via-blue-500 to-red-500 rounded-full" />
          <p className="text-base sm:text-lg font-editorial tracking-wide text-slate-300 font-semibold">
            WELCOME TO <span className="text-white font-black tracking-wider">KHO-KHO ARENA</span>
          </p>
          <p className="text-xs text-slate-500 font-mono tracking-widest uppercase">
            Entering Indigenous Sports Management Portal...
          </p>

          <button
            type="button"
            onClick={onComplete}
            className="mt-4 px-6 py-2.5 rounded-full bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-slate-200 transition-all shadow-lg shadow-white/10 flex items-center gap-2 cursor-pointer"
          >
            <span>Proceed to The Blade</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* Bottom Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 5.5, ease: 'linear' }}
          className="h-full bg-gradient-to-r from-white via-blue-500 to-red-500"
        />
      </div>
    </motion.div>
  );
}
