import React, { useState, useEffect, Component } from 'react';
import KhoKhoCanvas3D from './KhoKhoCanvas3D';

// Safe Error Boundary for 3D Canvas
class ThreeErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.warn('[3D Canvas Fallback Engaged]', error?.message || error);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Interactive Vector 2D Fallback Court with 3-to-3 Running Structure
export function StaticFallback({ isGirls = false, activeBatch = 1 }) {
  const startNum = (activeBatch - 1) * 3 + 1;
  const runnerLabels = [`R${startNum}`, `R${startNum + 1}`, `R${startNum + 2}`];

  return (
    <div className="w-full h-full flex flex-col items-center justify-between p-3 sm:p-5 select-none overflow-y-auto">
      <div className="w-full max-w-lg bg-orange-50/70 dark:bg-slate-900/90 rounded-2xl border border-saffron-300/80 dark:border-slate-800 p-3 sm:p-4 shadow-sm flex flex-col justify-between">
        
        {/* Top Header inside Court */}
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-saffron-800 dark:text-saffron-400 uppercase tracking-wider mb-1">
          <span>Pole Free Zone</span>
          <span>Center Line (27m)</span>
          <span>Pole Free Zone</span>
        </div>

        {/* SVG Representation with 3-to-3 Running Structure */}
        <svg viewBox="0 0 400 210" className="w-full h-auto my-1">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill={isGirls ? '#be123c' : '#ea580c'} />
            </marker>
          </defs>

          {/* Outer Border */}
          <rect x="15" y="15" width="370" height="180" fill="#fff7ed" stroke="#ea580c" strokeWidth="2.5" rx="8" className="dark:fill-slate-900 dark:stroke-orange-500" />
          
          {/* Free zones */}
          <rect x="15" y="15" width="40" height="180" fill="#fed7aa" opacity="0.35" className="dark:fill-slate-800" />
          <rect x="345" y="15" width="40" height="180" fill="#fed7aa" opacity="0.35" className="dark:fill-slate-800" />
          
          {/* Center line */}
          <line x1="55" y1="105" x2="345" y2="105" stroke="#ea580c" strokeWidth="3" />
          
          {/* Wooden Poles */}
          <circle cx="55" cy="105" r="8" fill="#d97706" stroke="#78350f" strokeWidth="2" />
          <circle cx="345" cy="105" r="8" fill="#d97706" stroke="#78350f" strokeWidth="2" />

          {/* 8 Cross Lanes & Sitting Chasers */}
          {[90, 125, 160, 195, 205, 240, 275, 310].map((x, i) => (
            <g key={i}>
              <line x1={x} y1="20" x2={x} y2="190" stroke="#fdba74" strokeWidth="1.5" strokeDasharray="3 2" className="dark:stroke-slate-700" />
              <rect
                x={x - 8}
                y={97}
                width="16"
                height="16"
                fill={i % 2 === 0 ? (isGirls ? '#e11d48' : '#ea580c') : (isGirls ? '#9f1239' : '#c2410c')}
                rx="3"
              />
              <text x={x} y={109} fontSize="9" fontWeight="bold" fill="white" textAnchor="middle">
                {i % 2 === 0 ? '▼' : '▲'}
              </text>
            </g>
          ))}

          {/* Active Chaser (in pursuit along lane) */}
          <g>
            <circle cx="160" cy="80" r="10" fill={isGirls ? '#be123c' : '#ea580c'} stroke="#ffffff" strokeWidth="2" />
            <text x="160" y="83.5" fontSize="7.5" fontWeight="black" fill="white" textAnchor="middle">CHASE</text>
            <line x1="150" y1="74" x2="115" y2="58" stroke={isGirls ? '#be123c' : '#ea580c'} strokeWidth="1.6" strokeDasharray="2 2" markerEnd="url(#arrow)" />
          </g>

          {/* 3 RUNNERS IN 3-TO-3 RUNNING FORMAT */}
          {/* Runner 1: Ring Evasion near Pole 1 */}
          <g>
            <ellipse cx="85" cy="65" rx="30" ry="22" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
            <circle cx="95" cy="55" r="10.5" fill="#059669" stroke="#ffffff" strokeWidth="2" />
            <text x="95" y="58.5" fontSize="8.5" fontWeight="black" fill="white" textAnchor="middle">
              {runnerLabels[0]}
            </text>
          </g>

          {/* Runner 2: Center Zigzag Dodger */}
          <g>
            <path d="M 185 145 Q 200 115 215 150" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
            <circle cx="200" cy="150" r="10.5" fill="#059669" stroke="#ffffff" strokeWidth="2" />
            <text x="200" y="153.5" fontSize="8.5" fontWeight="black" fill="white" textAnchor="middle">
              {runnerLabels[1]}
            </text>
          </g>

          {/* Runner 3: Deep Anchor near Pole 2 */}
          <g>
            <ellipse cx="310" cy="62" rx="30" ry="22" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.7" />
            <circle cx="300" cy="62" r="10.5" fill="#059669" stroke="#ffffff" strokeWidth="2" />
            <text x="300" y="65.5" fontSize="8.5" fontWeight="black" fill="white" textAnchor="middle">
              {runnerLabels[2]}
            </text>
          </g>
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-600 dark:text-slate-300 font-semibold flex-wrap gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 mt-1">
          <span className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-sm ${isGirls ? 'bg-rose-600' : 'bg-saffron-600'} inline-block`} />
            8 Sitting Chasers
          </span>
          <span className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isGirls ? 'bg-rose-800' : 'bg-orange-700'} inline-block`} />
            1 Active Chaser
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            3 Defenders ({runnerLabels.join(', ')})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
            Turn Poles
          </span>
        </div>
      </div>
    </div>
  );
}

export default function KhoKhoCourt3D({ isGirls = false, className = '' }) {
  const [viewMode, setViewMode] = useState('3d'); // '3d' | '2d'
  const [activeBatch, setActiveBatch] = useState(1); // 1 | 2 | 3
  const [webGLSupported, setWebGLSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const supported = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
      setWebGLSupported(supported);
      if (!supported) {
        setViewMode('2d');
      }
    } catch (e) {
      setWebGLSupported(false);
      setViewMode('2d');
    }
  }, []);

  const activeThemeColor = isGirls ? 'bg-rose-600 hover:bg-rose-700' : 'bg-saffron-600 hover:bg-saffron-700';

  return (
    <div className={`relative w-full h-[470px] sm:h-[520px] rounded-3xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-card flex flex-col ${className}`}>
      
      {/* Top Header Bar: Clean, Unified, Perfectly Aligned & Never Colliding */}
      <div className="px-3 py-2.5 sm:px-4 sm:py-3 border-b border-slate-100 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-2.5 z-20 shrink-0">
        
        {/* Left: 3-to-3 Tag & Batch Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-wider">
              3-to-3 Running Format • 30-50s
            </span>
          </div>

          {/* Batches 1, 2, 3 Switcher */}
          <div className="inline-flex p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700">
            {[1, 2, 3].map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setActiveBatch(b)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  activeBatch === b
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white'
                }`}
                title={`Defending Batch ${b} (Runners ${b === 1 ? '1, 2, 3' : b === 2 ? '4, 5, 6' : '7, 8, 9'})`}
              >
                Batch {b} <span className="text-[10px] opacity-75 font-mono">({b === 1 ? 'R1-3' : b === 2 ? 'R4-6' : 'R7-9'})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: 3D Court vs 2D Layout Switcher */}
        <div className="inline-flex p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === '3d'
                ? `${activeThemeColor} text-white shadow-xs`
                : 'text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white'
            }`}
          >
            <span>🎮</span>
            <span>3D Court</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('2d')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === '2d'
                ? `${activeThemeColor} text-white shadow-xs`
                : 'text-slate-600 dark:text-slate-400 hover:text-navy-900 dark:hover:text-white'
            }`}
          >
            <span>📐</span>
            <span>2D Layout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Takes 100% of remaining height cleanly without any overlay obstruction */}
      <div className="relative flex-1 w-full overflow-hidden bg-gradient-to-b from-white via-saffron-50/30 to-slate-50 dark:from-[#0b1120] dark:via-[#0f172a] dark:to-[#0b1120]">
        {viewMode === '3d' && webGLSupported ? (
          <ThreeErrorBoundary resetKey={`${viewMode}-${isGirls}`} fallback={<StaticFallback isGirls={isGirls} activeBatch={activeBatch} />}>
            <KhoKhoCanvas3D key="interactive-khokho-3d" isGirls={isGirls} activeBatch={activeBatch} onBatchChange={setActiveBatch} />
          </ThreeErrorBoundary>
        ) : (
          <StaticFallback isGirls={isGirls} activeBatch={activeBatch} />
        )}
      </div>
    </div>
  );
}
