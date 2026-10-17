import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, ArrowRight, RotateCcw } from 'lucide-react';

// Dynamic HTML5 Canvas for Floating Fire Embers & Sparks
function FireEmbersCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle pool
    const particleCount = 65;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 320,
        y: height * 0.4 + Math.random() * (height * 0.6),
        radius: Math.random() * 2.5 + 1,
        speedY: Math.random() * 2 + 1.2,
        speedX: (Math.random() - 0.5) * 0.8,
        alpha: Math.random() * 0.8 + 0.2,
        color: Math.random() > 0.4 ? '#ef4444' : Math.random() > 0.5 ? '#f97316' : '#facc15',
        decay: Math.random() * 0.006 + 0.003,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.y -= p.speedY;
        p.x += p.speedX + Math.sin(p.y * 0.02) * 0.5;
        p.alpha -= p.decay;

        if (p.alpha <= 0 || p.y <= 0) {
          p.x = width / 2 + (Math.random() - 0.5) * 280;
          p.y = height * 0.75 + Math.random() * 120;
          p.alpha = Math.random() * 0.8 + 0.3;
          p.speedY = Math.random() * 2.2 + 1.2;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.shadowBlur = 12;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full"
    />
  );
}

export default function FierySwordScreen({ onEnterHome, onBackToCreed }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.9, ease: 'easeInOut' }}
      className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-between overflow-hidden select-none py-6 px-4"
    >
      {/* Dynamic Floating Fire Embers Particle Canvas */}
      <FireEmbersCanvas />

      {/* Atmospheric Background Flame Radiance Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Core Red Flame Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[750px] bg-red-600/25 blur-[140px] rounded-full animate-pulse" />
        {/* Amber Secondary Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[550px] bg-orange-600/20 blur-[100px] rounded-full" />
        {/* Subtle Dark Vignette */}
        <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />
      </div>

      {/* Top Header Navigation */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between z-20 relative px-4">
        <button
          type="button"
          onClick={onBackToCreed}
          className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-400 hover:text-white transition-all uppercase tracking-wider"
        >
          <RotateCcw className="w-3.5 h-3.5 group-hover:-rotate-90 transition-transform" />
          <span>Vini Vidi Vici</span>
        </button>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/60 text-red-400 text-xs tracking-[0.25em] uppercase font-mono shadow-lg shadow-red-950/50">
          <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
          <span>The Blade of Kho-Kho</span>
        </div>

        <button
          type="button"
          onClick={onEnterHome}
          className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-400 hover:text-white transition-all uppercase tracking-wider"
        >
          <span>Skip to Home</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Center Stage: The Fiery Sword Tattoo */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center my-2 max-h-[75vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center"
        >
          {/* Animated Red Aura behind the Sword */}
          <div className="absolute inset-0 bg-red-600/30 blur-3xl rounded-full scale-110 pointer-events-none animate-pulse" />

          {/* The Fiery Sword Image with Fire Shader Filters */}
          <div className="relative z-10 max-h-[64vh] flex items-center justify-center">
            <img
              src="/fiery_kho_kho_sword.jpg"
              alt="Kho-Kho Fiery Sword Tattoo"
              className="max-h-[62vh] w-auto object-contain drop-shadow-[0_0_35px_rgba(239,68,68,0.85)] filter contrast-125 select-none pointer-events-none"
            />
          </div>
        </motion.div>

        {/* Caption Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="mt-3 text-center space-y-1"
        >
          <p
            className="text-2xl sm:text-3xl font-black font-editorial tracking-[0.2em] text-red-500 uppercase drop-shadow-[0_0_20px_rgba(239,68,68,0.9)]"
            style={{
              textShadow: '0 0 25px rgba(239, 68, 68, 0.9), 0 0 50px rgba(220, 38, 38, 0.6)'
            }}
          >
            KHO - KHO
          </p>
          <p className="text-xs text-orange-400 font-mono tracking-widest uppercase">
            Strength • Speed • Strategy
          </p>
        </motion.div>
      </div>

      {/* Bottom CTA to Enter Home Page */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="z-20 relative flex flex-col items-center gap-2 mb-2"
      >
        <button
          type="button"
          onClick={onEnterHome}
          className="group relative px-8 py-3.5 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white font-bold text-sm uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-red-600/40 hover:scale-105 active:scale-95 flex items-center gap-3 cursor-pointer"
        >
          <Flame className="w-4 h-4 text-amber-300 fill-amber-300 animate-bounce" />
          <span>Enter Kho-Kho Arena</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="text-[11px] text-slate-500 font-mono">
          Click above or tap screen to enter the portal
        </p>
      </motion.div>
    </motion.div>
  );
}
