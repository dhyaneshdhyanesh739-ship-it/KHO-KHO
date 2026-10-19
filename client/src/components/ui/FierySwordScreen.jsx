import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, ArrowRight, Sparkles } from 'lucide-react';

// Advanced Procedural Fire Simulation with Realistic Teardrop Flame Tongues & Embers
function RealFireCanvas({ orientation = 'vertical' }) {
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

    // Interactive pointer sparks
    const pointerSparks = [];
    const handlePointer = (e) => {
      const cx = e.clientX || (e.touches && e.touches[0]?.clientX);
      const cy = e.clientY || (e.touches && e.touches[0]?.clientY);
      if (!cx || !cy) return;

      for (let i = 0; i < 4; i++) {
        pointerSparks.push({
          x: cx + (Math.random() - 0.5) * 20,
          y: cy + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 3,
          vy: -Math.random() * 4 - 1.5,
          radius: Math.random() * 2.5 + 1,
          life: 1,
          decay: Math.random() * 0.035 + 0.02,
          color: Math.random() > 0.4 ? '#fef08a' : '#f97316',
        });
      }
    };

    window.addEventListener('mousemove', handlePointer);
    window.addEventListener('touchmove', handlePointer);

    // Realistic Teardrop Flame Tongues
    // Spawns from the text spine
    const flameTongueCount = orientation === 'vertical' ? 120 : 160;
    const flameTongues = [];

    const getSpawnBounds = () => {
      if (orientation === 'vertical') {
        return {
          minX: width / 2 - 45,
          maxX: width / 2 + 45,
          minY: height / 2 - 240,
          maxY: height / 2 + 220,
        };
      } else {
        return {
          minX: width / 2 - Math.min(width * 0.38, 420),
          maxX: width / 2 + Math.min(width * 0.38, 420),
          minY: height / 2 - 40,
          maxY: height / 2 + 50,
        };
      }
    };

    for (let i = 0; i < flameTongueCount; i++) {
      const b = getSpawnBounds();
      flameTongues.push({
        x: b.minX + Math.random() * (b.maxX - b.minX),
        y: b.minY + Math.random() * (b.maxY - b.minY),
        baseX: 0,
        vx: (Math.random() - 0.5) * 0.6,
        vy: -Math.random() * 2.8 - 1.5,
        w: Math.random() * 16 + 10,
        h: Math.random() * 45 + 25,
        life: Math.random(),
        decay: Math.random() * 0.025 + 0.015,
        curl: (Math.random() - 0.5) * 1.8,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Rising burning embers & glowing ash
    const emberCount = 85;
    const embers = [];
    for (let i = 0; i < emberCount; i++) {
      const b = getSpawnBounds();
      embers.push({
        x: b.minX - 60 + Math.random() * (b.maxX - b.minX + 120),
        y: height * 0.25 + Math.random() * (height * 0.75),
        radius: Math.random() * 2.2 + 0.8,
        speedY: Math.random() * 2.2 + 0.8,
        speedX: (Math.random() - 0.5) * 0.8,
        alpha: Math.random() * 0.9 + 0.1,
        color: Math.random() > 0.45 ? '#fef08a' : Math.random() > 0.35 ? '#fb923c' : '#ef4444',
        decay: Math.random() * 0.008 + 0.003,
      });
    }

    let t = 0;

    const render = () => {
      t += 0.045;
      ctx.clearRect(0, 0, width, height);

      // Draw with additive blending for glowing incendiary heat
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      const bounds = getSpawnBounds();

      // 1. Draw Organic Teardrop Flame Tongues
      flameTongues.forEach((f) => {
        f.y += f.vy;
        f.x += f.vx + Math.sin(t * 1.5 + f.phase) * 0.8;
        f.life -= f.decay;
        f.w *= 0.985;
        f.h *= 0.99;

        if (f.life <= 0 || f.h <= 4) {
          f.x = bounds.minX + Math.random() * (bounds.maxX - bounds.minX);
          f.y = bounds.minY + Math.random() * (bounds.maxY - bounds.minY);
          f.vx = (Math.random() - 0.5) * 0.6;
          f.vy = -Math.random() * 2.8 - 1.5;
          f.w = Math.random() * 16 + 10;
          f.h = Math.random() * 45 + 25;
          f.life = 1;
        }

        const flameGrad = ctx.createLinearGradient(f.x, f.y, f.x, f.y - f.h);
        if (f.life > 0.55) {
          // Blazing white/yellow core
          flameGrad.addColorStop(0, `rgba(255, 255, 240, ${f.life * 0.95})`);
          flameGrad.addColorStop(0.25, `rgba(254, 240, 138, ${f.life * 0.85})`);
          flameGrad.addColorStop(0.65, `rgba(249, 115, 22, ${f.life * 0.6})`);
          flameGrad.addColorStop(1, 'rgba(220, 38, 38, 0)');
        } else if (f.life > 0.25) {
          // Hot fiery orange
          flameGrad.addColorStop(0, `rgba(254, 215, 170, ${f.life * 0.85})`);
          flameGrad.addColorStop(0.4, `rgba(249, 115, 22, ${f.life * 0.7})`);
          flameGrad.addColorStop(0.8, `rgba(220, 38, 38, ${f.life * 0.4})`);
          flameGrad.addColorStop(1, 'rgba(153, 27, 27, 0)');
        } else {
          // Ruby smoke tip
          flameGrad.addColorStop(0, `rgba(239, 68, 68, ${f.life * 0.5})`);
          flameGrad.addColorStop(1, 'rgba(127, 29, 29, 0)');
        }

        ctx.fillStyle = flameGrad;

        // Draw curved flame tongue path (tapered teardrop)
        ctx.beginPath();
        const tipX = f.x + Math.sin(t * 2 + f.phase) * f.curl * 8;
        const tipY = f.y - f.h;
        ctx.moveTo(f.x - f.w * 0.5, f.y);
        ctx.quadraticCurveTo(f.x - f.w * 0.6, f.y - f.h * 0.5, tipX, tipY);
        ctx.quadraticCurveTo(f.x + f.w * 0.6, f.y - f.h * 0.5, f.x + f.w * 0.5, f.y);
        ctx.closePath();
        ctx.fill();
      });

      // 2. Draw Floating Sparks & Embers
      embers.forEach((e) => {
        e.y -= e.speedY;
        e.x += e.speedX + Math.sin(e.y * 0.02 + t) * 0.7;
        e.alpha -= e.decay;

        if (e.alpha <= 0 || e.y <= 0) {
          e.x = bounds.minX - 60 + Math.random() * (bounds.maxX - bounds.minX + 120);
          e.y = height * 0.85 + Math.random() * 100;
          e.alpha = Math.random() * 0.9 + 0.2;
          e.speedY = Math.random() * 2.4 + 0.9;
        }

        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
        ctx.fillStyle = e.color;
        ctx.globalAlpha = Math.max(0, e.alpha);
        ctx.shadowBlur = 10;
        ctx.shadowColor = e.color;
        ctx.fill();
      });

      // 3. Draw Pointer Interaction Sparks
      for (let i = pointerSparks.length - 1; i >= 0; i--) {
        const s = pointerSparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;

        if (s.life <= 0) {
          pointerSparks.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * s.life, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.life;
        ctx.shadowBlur = 12;
        ctx.shadowColor = s.color;
        ctx.fill();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointer);
      window.removeEventListener('touchmove', handlePointer);
      cancelAnimationFrame(animationFrameId);
    };
  }, [orientation]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-10 w-full h-full"
    />
  );
}

export default function FierySwordScreen({ onEnterHome }) {
  // Default to the authentic vertical blade layout as requested from the sword image, with quick toggle
  const [orientation, setOrientation] = useState('vertical'); // 'vertical' | 'horizontal'

  const letters = ['K', 'H', 'O', '—', 'K', 'H', 'O'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.9, ease: 'easeInOut' }}
      className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-between overflow-hidden select-none p-4 sm:p-6"
    >
      {/* Background Click Zone to Enter Arena */}
      <div
        onClick={onEnterHome}
        className="absolute inset-0 z-0 cursor-pointer"
        title="Click anywhere to enter Kho-Kho Arena"
      />

      {/* Dynamic Animated Realistic Fire & Ember Canvas */}
      <RealFireCanvas orientation={orientation} />

      {/* Atmospheric Deep Radial Fire Glow Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Deep Ruby Core Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[750px] bg-red-600/35 blur-[160px] rounded-full animate-pulse" />
        {/* Blazing Amber Secondary Core Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[520px] bg-orange-500/30 blur-[110px] rounded-full" />
        {/* Hot Molten Core Accent */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[300px] bg-amber-300/25 blur-[75px] rounded-full" />
      </div>

      {/* Top Header: Tagline & Orientation Switcher */}
      <div className="relative z-30 w-full max-w-5xl flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-pulse" />
          <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-orange-300/90 font-bold">
            INDIAN INDIGENOUS SPEED SPORT
          </span>
        </div>

        {/* Orientation Switcher Pill (Stop Propagation so clicking doesn't enter home) */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="inline-flex p-1 rounded-xl bg-neutral-900/90 backdrop-blur-md border border-neutral-800 text-xs shadow-xl"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOrientation('vertical');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              orientation === 'vertical'
                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            ↕ Blade Format
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOrientation('horizontal');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              orientation === 'horizontal'
                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            ↔ Horizontal
          </button>
        </div>
      </div>

      {/* Center Stage: REAL TEXT FORMAT with Fire Effects */}
      <div
        onClick={onEnterHome}
        className="relative z-20 flex-1 flex flex-col items-center justify-center w-full my-auto cursor-pointer"
      >
        <AnimatePresence mode="wait">
          {orientation === 'vertical' ? (
            /* VERTICAL BLADE FORMAT (Recreating the Sword Inscription in Pure Text & Fire) */
            <motion.div
              key="vertical-fire-blade"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col items-center justify-center py-2"
            >
              {/* Flame Crown / Top Aura */}
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-2"
              >
                <Flame className="w-8 h-8 text-orange-400 fill-orange-400 drop-shadow-[0_0_15px_rgba(249,115,22,0.9)]" />
              </motion.div>

              {/* Vertical Column of Molten Letters */}
              <div className="relative flex flex-col items-center space-y-1 sm:space-y-2">
                {/* Background Backlit Glow Column */}
                <div
                  className="absolute inset-0 blur-2xl opacity-75 pointer-events-none select-none text-red-600 font-editorial font-black text-5xl sm:text-6xl md:text-7xl flex flex-col items-center leading-none"
                  aria-hidden="true"
                >
                  {letters.map((char, i) => (
                    <span key={i} className={char === '—' ? 'rotate-90 text-2xl my-1' : ''}>
                      {char}
                    </span>
                  ))}
                </div>

                {/* Main Blazing Fiery Letters */}
                {letters.map((char, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * index, duration: 0.5 }}
                    className={`relative font-editorial font-black leading-none bg-gradient-to-t from-red-600 via-orange-500 to-amber-100 bg-clip-text text-transparent animate-fire-text tracking-wider ${
                      char === '—'
                        ? 'text-2xl sm:text-3xl text-orange-400 my-1 rotate-90 font-sans'
                        : 'text-5xl sm:text-6xl md:text-7xl drop-shadow-[0_0_20px_rgba(249,115,22,0.85)]'
                    }`}
                    style={{
                      WebkitTextStroke: '1px rgba(254, 240, 138, 0.35)',
                    }}
                  >
                    {char}
                  </motion.span>
                ))}
              </div>

              {/* Sub-label under vertical blade */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-[11px] sm:text-xs font-mono uppercase tracking-[0.35em] text-orange-300 font-semibold"
                style={{ textShadow: '0 0 15px rgba(249, 115, 22, 0.9)' }}
              >
                SPEED • STRATEGY • SPIRIT
              </motion.p>
            </motion.div>
          ) : (
            /* HORIZONTAL MONUMENTAL FORMAT */
            <motion.div
              key="horizontal-fire-text"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex flex-col items-center justify-center text-center px-4"
            >
              {/* Top Pill Badge */}
              <div className="mb-4 sm:mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/60 border border-orange-500/40 text-orange-200 text-xs sm:text-sm uppercase tracking-[0.35em] font-bold shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                  ★ SPEED • STRATEGY • SPIRIT ★
                </span>
              </div>

              {/* Monumental Horizontal Text */}
              <div className="relative group select-none py-2">
                {/* Backlit Fire Silhouette Glow */}
                <div
                  className="absolute inset-0 blur-2xl opacity-75 pointer-events-none select-none text-red-600 font-editorial font-black text-6xl sm:text-8xl md:text-9xl lg:text-[10.5rem] tracking-wider leading-none"
                  aria-hidden="true"
                >
                  KHO - KHO
                </div>

                <h1
                  className="relative font-editorial font-black text-6xl sm:text-8xl md:text-9xl lg:text-[10.5rem] tracking-wider leading-none bg-gradient-to-t from-red-600 via-orange-500 to-amber-100 bg-clip-text text-transparent animate-fire-text"
                  style={{
                    WebkitTextStroke: '1.5px rgba(254, 240, 138, 0.4)',
                  }}
                >
                  KHO - KHO
                </h1>
              </div>

              <p
                className="mt-4 sm:mt-6 text-sm sm:text-base font-medium tracking-[0.3em] uppercase text-orange-200 font-mono"
                style={{ textShadow: '0 0 20px rgba(249, 115, 22, 0.85)' }}
              >
                Chasers • Defenders • Champions
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Prompt: Tap to Enter Arena */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        onClick={onEnterHome}
        className="z-30 relative mb-3 cursor-pointer"
      >
        <span className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-red-950/80 border border-orange-500/60 text-orange-200 text-xs sm:text-sm tracking-[0.25em] uppercase font-mono shadow-[0_0_30px_rgba(239,68,68,0.6)] hover:bg-red-900/80 transition-colors">
          <Flame className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
          <span>Tap or click to enter Arena</span>
          <ArrowRight className="w-4 h-4 text-orange-400" />
        </span>
      </motion.div>
    </motion.div>
  );
}
