import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Flame, ArrowRight } from 'lucide-react';

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

    // Particle pool for flame sparks and embers
    const particleCount = 75;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: width / 2 + (Math.random() - 0.5) * 320,
        y: height * 0.35 + Math.random() * (height * 0.65),
        radius: Math.random() * 2.5 + 1,
        speedY: Math.random() * 2.2 + 1.2,
        speedX: (Math.random() - 0.5) * 0.8,
        alpha: Math.random() * 0.85 + 0.15,
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
          p.x = width / 2 + (Math.random() - 0.5) * 300;
          p.y = height * 0.8 + Math.random() * 100;
          p.alpha = Math.random() * 0.85 + 0.25;
          p.speedY = Math.random() * 2.4 + 1.2;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.shadowBlur = 14;
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

export default function FierySwordScreen({ onEnterHome }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.9, ease: 'easeInOut' }}
      onClick={onEnterHome}
      className="fixed inset-0 z-[100] bg-black text-white flex flex-col items-center justify-center overflow-hidden select-none cursor-pointer p-4"
      title="Click anywhere to enter Kho-Kho Arena"
    >
      {/* Dynamic Floating Fire Embers Particle Canvas */}
      <FireEmbersCanvas />

      {/* Atmospheric Background Flame Radiance Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Core Red Flame Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[800px] bg-red-600/30 blur-[150px] rounded-full animate-pulse" />
        {/* Amber Secondary Core Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[580px] bg-orange-600/25 blur-[110px] rounded-full" />
      </div>

      {/* Center Stage: The Fiery Sword Tattoo Alone */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center max-h-[82vh]">
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative flex items-center justify-center"
        >
          {/* Animated Red Aura behind the Sword */}
          <div className="absolute inset-0 bg-red-600/35 blur-3xl rounded-full scale-110 pointer-events-none animate-pulse" />

          {/* The Fiery Sword Tattoo */}
          <div className="relative z-10 max-h-[72vh] flex items-center justify-center">
            <img
              src="/fiery_kho_kho_sword.jpg"
              alt="Kho-Kho Fiery Sword Tattoo"
              className="max-h-[70vh] w-auto object-contain drop-shadow-[0_0_40px_rgba(239,68,68,0.95)] filter contrast-125 select-none pointer-events-none"
            />
          </div>
        </motion.div>
      </div>

      {/* Subtle Bottom Click / Tap to Enter Prompt */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        className="z-20 relative mb-4 pointer-events-none"
      >
        <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-950/40 border border-red-800/40 text-red-300 text-xs tracking-[0.25em] uppercase font-mono shadow-lg">
          <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
          <span>Tap or click to enter</span>
          <ArrowRight className="w-3.5 h-3.5 text-red-400" />
        </span>
      </motion.div>
    </motion.div>
  );
}
