import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function ViniVidiViciIntro({ onComplete }) {
  // Stages:
  // 0: Initial black
  // 1: VINI (White)
  // 2: VIDI (Blue)
  // 3: VICI (Red)
  // 4: Trinity (All three words united with ambient energy)
  const [stage, setStage] = useState(0);

  useEffect(() => {
    // Stage 1: VINI appears at 300ms
    const t1 = setTimeout(() => setStage(1), 300);

    // Stage 2: VIDI appears at 1500ms
    const t2 = setTimeout(() => setStage(2), 1500);

    // Stage 3: VICI appears at 2700ms
    const t3 = setTimeout(() => setStage(3), 2700);

    // Stage 4: Trinity glow at 3800ms
    const t4 = setTimeout(() => setStage(4), 3800);

    // Stage 5: Automatic smooth transition to the Fiery Sword screen at 5000ms
    const t5 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 5000);

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
      onClick={onComplete}
      className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center overflow-hidden select-none cursor-pointer"
      title="Click anywhere to proceed"
    >
      {/* Dynamic Colored Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* White glow for VINI */}
        <motion.div
          animate={{
            opacity: stage === 1 ? 0.4 : stage >= 4 ? 0.2 : 0,
            scale: stage === 1 ? 1.25 : 1,
          }}
          transition={{ duration: 0.6 }}
          className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-white/20 blur-[130px] rounded-full"
        />

        {/* Blue glow for VIDI */}
        <motion.div
          animate={{
            opacity: stage === 2 ? 0.5 : stage >= 4 ? 0.3 : 0,
            scale: stage === 2 ? 1.35 : 1,
          }}
          transition={{ duration: 0.6 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] bg-blue-600/35 blur-[140px] rounded-full"
        />

        {/* Red glow for VICI */}
        <motion.div
          animate={{
            opacity: stage === 3 ? 0.55 : stage >= 4 ? 0.3 : 0,
            scale: stage === 3 ? 1.35 : 1,
          }}
          transition={{ duration: 0.6 }}
          className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] bg-red-600/35 blur-[140px] rounded-full"
        />
      </div>

      {/* Main Dramatic Sequence: Only the pure words */}
      <div className="relative z-10 w-full max-w-6xl px-6 flex flex-col items-center justify-center text-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 lg:gap-16 my-4">
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
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-editorial tracking-tight text-white"
              style={{ textShadow: '0 0 45px rgba(255, 255, 255, 0.7), 0 0 90px rgba(255, 255, 255, 0.35)' }}
            >
              VINI
            </span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: stage >= 1 ? 0.75 : 0 }}
              transition={{ delay: 0.2 }}
              className="mt-3 text-xs sm:text-sm tracking-[0.35em] uppercase text-slate-300 font-mono font-medium"
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
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-editorial tracking-tight text-blue-500"
              style={{
                color: '#3b82f6',
                textShadow: '0 0 45px rgba(59, 130, 246, 0.85), 0 0 95px rgba(37, 99, 235, 0.55)'
              }}
            >
              VIDI
            </span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: stage >= 2 ? 0.85 : 0 }}
              transition={{ delay: 0.2 }}
              className="mt-3 text-xs sm:text-sm tracking-[0.35em] uppercase text-blue-300 font-mono font-medium"
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
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-editorial tracking-tight text-red-500"
              style={{
                color: '#ef4444',
                textShadow: '0 0 45px rgba(239, 68, 68, 0.9), 0 0 95px rgba(220, 38, 38, 0.6)'
              }}
            >
              VICI
            </span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: stage >= 3 ? 0.85 : 0 }}
              transition={{ delay: 0.2 }}
              className="mt-3 text-xs sm:text-sm tracking-[0.35em] uppercase text-red-300 font-mono font-medium"
            >
              I Conquered
            </motion.span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
