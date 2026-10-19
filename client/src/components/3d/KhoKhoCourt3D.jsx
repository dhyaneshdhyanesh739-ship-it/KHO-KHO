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

// Interactive Vector 2D Fallback Court
export function StaticFallback({ isGirls = false }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-saffron-50/60 via-white to-amber-50/60 p-6 select-none">
      <div className="relative w-full max-w-md aspect-[16/10] bg-orange-50/70 rounded-2xl border-2 border-saffron-300 p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] font-bold text-saffron-800 uppercase tracking-wider">
          <span>Pole Free Zone</span>
          <span>Center Line (27m)</span>
          <span>Pole Free Zone</span>
        </div>

        {/* SVG Representation */}
        <svg viewBox="0 0 400 220" className="w-full h-auto my-2">
          {/* Border */}
          <rect x="15" y="15" width="370" height="190" fill="#fff7ed" stroke="#ea580c" strokeWidth="2.5" rx="8" />
          {/* Free zones */}
          <rect x="15" y="15" width="40" height="190" fill="#fed7aa" opacity="0.4" />
          <rect x="345" y="15" width="40" height="190" fill="#fed7aa" opacity="0.4" />
          {/* Center line */}
          <line x1="55" y1="110" x2="345" y2="110" stroke="#ea580c" strokeWidth="3" />
          {/* Wooden Poles */}
          <circle cx="55" cy="110" r="9" fill="#d97706" stroke="#78350f" strokeWidth="2" />
          <circle cx="345" cy="110" r="9" fill="#d97706" stroke="#78350f" strokeWidth="2" />
          {/* 8 Cross Lanes & Sitting Chasers */}
          {[90, 125, 160, 195, 205, 240, 275, 310].map((x, i) => (
            <g key={i}>
              <line x1={x} y1="30" x2={x} y2="190" stroke="#fdba74" strokeWidth="2" strokeDasharray="3 2" />
              <rect
                x={x - 9}
                y={101}
                width="18"
                height="18"
                fill={i % 2 === 0 ? (isGirls ? '#e11d48' : '#ea580c') : '#10b981'}
                rx="4"
              />
              <text x={x} y={114} fontSize="9" fontWeight="bold" fill="white" textAnchor="middle">
                {i % 2 === 0 ? '▼' : '▲'}
              </text>
            </g>
          ))}
        </svg>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-saffron-600 inline-block" />
            Facing Left
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" />
            Facing Right
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
            Turn Poles
          </span>
        </div>
      </div>

      <p className="mt-3 text-xs font-bold uppercase tracking-wider text-saffron-700">
        Regulation Kho-Kho Court (Official 27m × 16m Layout)
      </p>
    </div>
  );
}

export default function KhoKhoCourt3D({ isGirls = false, className = '' }) {
  const [viewMode, setViewMode] = useState('3d'); // '3d' | '2d'
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
    <div className={`relative w-full h-[380px] md:h-[480px] rounded-3xl overflow-hidden bg-gradient-to-b from-white via-saffron-50/40 to-slate-50 border border-slate-200/80 shadow-card ${className}`}>
      {viewMode === '3d' && webGLSupported ? (
        <ThreeErrorBoundary resetKey={viewMode} fallback={<StaticFallback isGirls={isGirls} />}>
          <KhoKhoCanvas3D key="interactive-khokho-3d" isGirls={isGirls} />
        </ThreeErrorBoundary>
      ) : (
        <StaticFallback isGirls={isGirls} />
      )}

      {/* Segmented View Mode Switcher (3D vs 2D) */}
      <div className="absolute top-4 right-4 z-10">
        <div className="inline-flex p-1 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-md">
          <button
            type="button"
            onClick={() => setViewMode('3d')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === '3d'
                ? `${activeThemeColor} text-white shadow-sm`
                : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
            }`}
          >
            <span>🎮</span>
            <span>3D Court</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('2d')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === '2d'
                ? `${activeThemeColor} text-white shadow-sm`
                : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
            }`}
          >
            <span>📐</span>
            <span>2D Layout</span>
          </button>
        </div>
      </div>

      {/* Active Mode Badge */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-saffron-200 text-xs font-bold text-saffron-800 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-saffron-500 animate-pulse" />
          {viewMode === '3d' ? 'Interactive 3D Kho-Kho Court' : 'Regulation Court Layout'}
        </span>
      </div>
    </div>
  );
}
