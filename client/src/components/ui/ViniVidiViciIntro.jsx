import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// High-Performance Ambient & Burst Sprinkles/Sparkles Canvas
function SprinklesCanvas({ stage }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Color palettes by stage
    const whiteColors = ['#ffffff', '#f8fafc', '#f1f5f9', '#fef08a', '#e2e8f0', '#fffbeb'];
    const blueColors = ['#60a5fa', '#3b82f6', '#2563eb', '#93c5fd', '#38bdf8', '#00e5ff'];
    const redColors = ['#ef4444', '#dc2626', '#f87171', '#fb923c', '#ff3366', '#ff6b6b'];
    const trinityColors = [
      '#ffffff',
      '#60a5fa',
      '#3b82f6',
      '#ef4444',
      '#f87171',
      '#fef08a',
      '#00e5ff',
      '#ffdf7e',
      '#ff3366',
    ];

    const getColorsForStage = (stg) => {
      if (stg === 1) return whiteColors;
      if (stg === 2) return blueColors;
      if (stg === 3) return redColors;
      if (stg >= 4) return trinityColors;
      return whiteColors;
    };

    // Ambient floating sprinkles
    const ambientCount = 90;
    const sprinkles = [];
    for (let i = 0; i < ambientCount; i++) {
      sprinkles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: -Math.random() * 0.9 - 0.25,
        radius: Math.random() * 2.8 + 1.2,
        alpha: Math.random() * 0.8 + 0.2,
        color: whiteColors[Math.floor(Math.random() * whiteColors.length)],
        isStar: Math.random() > 0.45,
        twinkleSpeed: Math.random() * 0.05 + 0.02,
        phase: Math.random() * Math.PI * 2,
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.03,
      });
    }

    // Burst sprinkles pool
    const bursts = [];

    const spawnBurst = (cx, cy, count, colors) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 7.5 + 2.5;
        bursts.push({
          x: cx + (Math.random() - 0.5) * 45,
          y: cy + (Math.random() - 0.5) * 45,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2,
          radius: Math.random() * 3.5 + 1.6,
          alpha: 1,
          decay: Math.random() * 0.022 + 0.012,
          gravity: 0.07,
          color: colors[Math.floor(Math.random() * colors.length)],
          isStar: Math.random() > 0.35,
          rotation: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.08,
        });
      }
    };

    // Trigger burst on stage change
    const isMobile = width < 768;
    if (stage === 1) {
      // VINI burst (left / top on mobile)
      const cx = isMobile ? width * 0.5 : width * 0.25;
      const cy = isMobile ? height * 0.35 : height * 0.5;
      spawnBurst(cx, cy, 70, whiteColors);
    } else if (stage === 2) {
      // VIDI burst (center)
      const cx = width * 0.5;
      const cy = height * 0.5;
      spawnBurst(cx, cy, 80, blueColors);
    } else if (stage === 3) {
      // VICI burst (right / bottom on mobile)
      const cx = isMobile ? width * 0.5 : width * 0.75;
      const cy = isMobile ? height * 0.65 : height * 0.5;
      spawnBurst(cx, cy, 85, redColors);
    } else if (stage >= 4) {
      // Grand Trinity celebration burst
      spawnBurst(width * 0.25, height * 0.5, 50, whiteColors);
      spawnBurst(width * 0.5, height * 0.5, 60, blueColors);
      spawnBurst(width * 0.75, height * 0.5, 60, redColors);
    }

    // Interactive pointer sparkles
    const pointerSprinkles = [];
    const handlePointer = (e) => {
      const px = e.clientX || (e.touches && e.touches[0]?.clientX);
      const py = e.clientY || (e.touches && e.touches[0]?.clientY);
      if (!px || !py) return;

      const colors = getColorsForStage(stage);
      for (let i = 0; i < 3; i++) {
        pointerSprinkles.push({
          x: px + (Math.random() - 0.5) * 16,
          y: py + (Math.random() - 0.5) * 16,
          vx: (Math.random() - 0.5) * 2.8,
          vy: -Math.random() * 2.8 - 0.5,
          radius: Math.random() * 2.5 + 1.2,
          alpha: 1,
          decay: 0.038,
          color: colors[Math.floor(Math.random() * colors.length)],
          isStar: Math.random() > 0.45,
          rotation: Math.random() * Math.PI,
          rotSpeed: (Math.random() - 0.5) * 0.09,
        });
      }
    };

    window.addEventListener('mousemove', handlePointer);
    window.addEventListener('touchmove', handlePointer);

    // Helpers to draw sparkles and glowing fairy-dust orbs
    const drawSparkle = (x, y, radius, alpha, color, rotation = 0) => {
      if (alpha <= 0.01) return;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = radius * 4.5;

      // 4-point diamond star
      ctx.beginPath();
      const inner = radius * 0.28;
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        const innerAngle = angle + Math.PI / 4;
        ctx.lineTo(Math.cos(innerAngle) * inner, Math.sin(innerAngle) * inner);
      }
      ctx.closePath();
      ctx.fill();

      // Bright white central jewel
      ctx.beginPath();
      ctx.arc(0, 0, inner * 0.9, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      ctx.restore();
    };

    const drawOrb = (x, y, radius, alpha, color) => {
      if (alpha <= 0.01) return;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      const grad = ctx.createRadialGradient(x, y, 0, x, y, radius * 1.5);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.35, color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    let t = 0;

    const render = () => {
      t += 0.04;
      ctx.clearRect(0, 0, width, height);

      // Additive blending for luminous energy
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      const currentStageColors = getColorsForStage(stage);

      // 1. Render ambient floating sprinkles
      for (let i = 0; i < sprinkles.length; i++) {
        const p = sprinkles[i];
        p.x += p.vx + Math.sin(t * 0.8 + p.phase) * 0.35;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        // Wrap around boundaries
        if (p.y < -20) {
          p.y = height + 10;
          p.x = Math.random() * width;
          p.color = currentStageColors[Math.floor(Math.random() * currentStageColors.length)];
        }
        if (p.x < -20) p.x = width + 10;
        if (p.x > width + 20) p.x = -10;

        const dynamicAlpha = p.alpha * (0.6 + 0.4 * Math.sin(t * 1.5 + p.phase));

        if (p.isStar) {
          drawSparkle(p.x, p.y, p.radius * 2.2, dynamicAlpha, p.color, p.rotation);
        } else {
          drawOrb(p.x, p.y, p.radius, dynamicAlpha, p.color);
        }
      }

      // 2. Render burst sprinkles
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.x += b.vx;
        b.y += b.vy;
        b.vy += b.gravity;
        b.vx *= 0.97;
        b.vy *= 0.97;
        b.alpha -= b.decay;
        b.rotation += b.rotSpeed;

        if (b.alpha <= 0) {
          bursts.splice(i, 1);
          continue;
        }

        if (b.isStar) {
          drawSparkle(b.x, b.y, b.radius * 2.4, b.alpha, b.color, b.rotation);
        } else {
          drawOrb(b.x, b.y, b.radius, b.alpha, b.color);
        }
      }

      // 3. Render interactive pointer sprinkles
      for (let i = pointerSprinkles.length - 1; i >= 0; i--) {
        const sp = pointerSprinkles[i];
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.alpha -= sp.decay;
        sp.rotation += sp.rotSpeed;

        if (sp.alpha <= 0) {
          pointerSprinkles.splice(i, 1);
          continue;
        }

        if (sp.isStar) {
          drawSparkle(sp.x, sp.y, sp.radius * 2.2, sp.alpha, sp.color, sp.rotation);
        } else {
          drawOrb(sp.x, sp.y, sp.radius, sp.alpha, sp.color);
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handlePointer);
      window.removeEventListener('touchmove', handlePointer);
      cancelAnimationFrame(animId);
    };
  }, [stage]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-20 w-full h-full"
    />
  );
}

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

    // Stage 5: Automatic smooth transition to the Fiery Sword screen at 5200ms
    const t5 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 5200);

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
            opacity: stage === 1 ? 0.45 : stage >= 4 ? 0.25 : 0,
            scale: stage === 1 ? 1.25 : 1,
          }}
          transition={{ duration: 0.6 }}
          className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-white/20 blur-[130px] rounded-full"
        />

        {/* Blue glow for VIDI */}
        <motion.div
          animate={{
            opacity: stage === 2 ? 0.55 : stage >= 4 ? 0.35 : 0,
            scale: stage === 2 ? 1.35 : 1,
          }}
          transition={{ duration: 0.6 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] bg-blue-600/35 blur-[140px] rounded-full"
        />

        {/* Red glow for VICI */}
        <motion.div
          animate={{
            opacity: stage === 3 ? 0.6 : stage >= 4 ? 0.35 : 0,
            scale: stage === 3 ? 1.35 : 1,
          }}
          transition={{ duration: 0.6 }}
          className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] bg-red-600/35 blur-[140px] rounded-full"
        />
      </div>

      {/* Sparkling Sprinkles Layer */}
      <SprinklesCanvas stage={stage} />

      {/* Main Dramatic Sequence: Only the pure words */}
      <div className="relative z-10 w-full max-w-6xl px-6 flex flex-col items-center justify-center text-center">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 lg:gap-16 my-4">
          {/* Word 1: VINI (White) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 30 }}
            animate={{
              opacity: stage >= 1 ? 1 : 0,
              scale: stage === 1 ? [0.7, 1.12, 1] : 1,
              y: stage >= 1 ? 0 : 30,
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center relative"
          >
            <span
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-editorial tracking-tight text-white select-none"
              style={{
                textShadow:
                  '0 0 35px rgba(255, 255, 255, 0.8), 0 0 70px rgba(255, 255, 255, 0.4), 0 0 110px rgba(254, 240, 138, 0.3)',
              }}
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
              animate={{ opacity: 0.35, scale: 1 }}
              className="hidden md:inline-block text-3xl text-slate-500 font-thin select-none"
            >
              •
            </motion.span>
          )}

          {/* Word 2: VIDI (Blue) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 30 }}
            animate={{
              opacity: stage >= 2 ? 1 : 0,
              scale: stage === 2 ? [0.7, 1.12, 1] : 1,
              y: stage >= 2 ? 0 : 30,
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center relative"
          >
            <span
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-editorial tracking-tight text-blue-500 select-none"
              style={{
                color: '#3b82f6',
                textShadow:
                  '0 0 35px rgba(59, 130, 246, 0.9), 0 0 75px rgba(37, 99, 235, 0.65), 0 0 120px rgba(0, 229, 255, 0.35)',
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
              animate={{ opacity: 0.35, scale: 1 }}
              className="hidden md:inline-block text-3xl text-slate-500 font-thin select-none"
            >
              •
            </motion.span>
          )}

          {/* Word 3: VICI (Red) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 30 }}
            animate={{
              opacity: stage >= 3 ? 1 : 0,
              scale: stage === 3 ? [0.7, 1.12, 1] : 1,
              y: stage >= 3 ? 0 : 30,
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center relative"
          >
            <span
              className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-editorial tracking-tight text-red-500 select-none"
              style={{
                color: '#ef4444',
                textShadow:
                  '0 0 35px rgba(239, 68, 68, 0.95), 0 0 75px rgba(220, 38, 38, 0.7), 0 0 120px rgba(251, 146, 60, 0.4)',
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
