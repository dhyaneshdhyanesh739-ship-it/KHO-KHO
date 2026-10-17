import React, { useRef, useState, useEffect, Suspense, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

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
    console.warn('[3D Canvas Error - Rendering 2D Fallback]', error.message);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// 3D Sitting Chaser Figure (Alternating Directions)
function SittingChaser({ position, facingDirection, isGirls = false }) {
  const jerseyColor = isGirls ? '#e11d48' : '#ea580c';

  return (
    <group position={position} rotation={[0, facingDirection ? Math.PI / 2 : -Math.PI / 2, 0]}>
      {/* Sitting player body */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <boxGeometry args={[0.35, 0.45, 0.35]} />
        <meshStandardMaterial color={jerseyColor} roughness={0.4} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshStandardMaterial color="#fcd34d" roughness={0.3} />
      </mesh>
    </group>
  );
}

// 3D Wooden Pole (Standard Kho-Kho Pole at court ends)
function WoodenPole({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.1, 24]} />
        <meshStandardMaterial color="#78350f" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.09, 1.5, 24]} />
        <meshStandardMaterial color="#d97706" metalness={0.2} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.58, 0]}>
        <sphereGeometry args={[0.11, 16, 16]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.6} roughness={0.2} />
      </mesh>
    </group>
  );
}

// 3D Moving Active Chaser
function ActiveChaser({ isGirls }) {
  const chaserRef = useRef();

  useFrame((state) => {
    if (chaserRef.current) {
      const time = state.clock.getElapsedTime();
      chaserRef.current.position.x = Math.sin(time * 1.2) * 3.8;
      chaserRef.current.position.z = Math.cos(time * 0.8) * 0.6;
    }
  });

  return (
    <group ref={chaserRef} position={[0, 0.45, 0]}>
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.18, 0.5, 16]} />
        <meshStandardMaterial color={isGirls ? '#be123c' : '#c2410c'} />
      </mesh>
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#fcd34d" />
      </mesh>
      <pointLight color="#ea580c" intensity={0.5} distance={2} />
    </group>
  );
}

// 3D Court Ground and Markings
function CourtPlane() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[11, 6.5]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[9.5, 5.2]} />
        <meshBasicMaterial color="#fdba74" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <planeGeometry args={[9.3, 5.0]} />
        <meshStandardMaterial color="#fff7ed" roughness={0.6} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <planeGeometry args={[7.6, 0.08]} />
        <meshBasicMaterial color="#ea580c" />
      </mesh>

      {[-3.0, -2.14, -1.28, -0.42, 0.42, 1.28, 2.14, 3.0].map((x, i) => (
        <group key={i}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.007, 0]}>
            <planeGeometry args={[0.06, 4.4]} />
            <meshBasicMaterial color="#ea580c" />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.008, 0]}>
            <planeGeometry args={[0.45, 0.45]} />
            <meshBasicMaterial color="#fed7aa" />
          </mesh>
        </group>
      ))}

      {[-3.8, 3.8].map((x, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.006, 0]}>
          <planeGeometry args={[1.2, 4.4]} />
          <meshBasicMaterial color="#ffedd5" />
        </mesh>
      ))}
    </group>
  );
}

function SceneContent({ isGirls }) {
  const crossX = [-3.0, -2.14, -1.28, -0.42, 0.42, 1.28, 2.14, 3.0];

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[6, 8, 5]} intensity={1.2} />
      <pointLight position={[-4, 3, 2]} intensity={0.4} color="#ea580c" />

      <CourtPlane />

      <WoodenPole position={[-3.8, 0, 0]} />
      <WoodenPole position={[3.8, 0, 0]} />

      {crossX.map((x, index) => (
        <SittingChaser
          key={index}
          position={[x, 0, 0]}
          facingDirection={index % 2 === 0}
          isGirls={isGirls}
        />
      ))}

      <ActiveChaser isGirls={isGirls} />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.3}
        autoRotate
        autoRotateSpeed={0.8}
      />
    </>
  );
}

// Interactive Vector 2D Fallback Court
export function StaticFallback({ isGirls = false }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-saffron-50/60 via-white to-amber-50/60 p-6">
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
  const [webGLSupported, setWebGLSupported] = useState(false);

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

  return (
    <div className={`relative w-full h-[360px] md:h-[460px] rounded-3xl overflow-hidden bg-gradient-to-b from-white via-saffron-50/40 to-slate-50 border border-slate-200/80 shadow-card ${className}`}>
      {viewMode === '3d' && webGLSupported ? (
        <ThreeErrorBoundary fallback={<StaticFallback isGirls={isGirls} />}>
          <Suspense fallback={<StaticFallback isGirls={isGirls} />}>
            <Canvas
              camera={{ position: [0, 6, 6.5], fov: 42 }}
              style={{ width: '100%', height: '100%' }}
              onCreated={({ gl }) => {
                gl.setClearColor('#fdfbf7', 1);
              }}
            >
              <SceneContent isGirls={isGirls} />
            </Canvas>
          </Suspense>
        </ThreeErrorBoundary>
      ) : (
        <StaticFallback isGirls={isGirls} />
      )}

      {/* View Switcher Button (3D / 2D) */}
      <div className="absolute top-4 right-4 z-10">
        <button
          type="button"
          onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
          className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-slate-200 text-xs font-bold text-navy-800 shadow-sm hover:bg-slate-50 transition-colors"
        >
          {viewMode === '3d' ? '📐 2D Diagram' : '🎮 Interactive 3D'}
        </button>
      </div>

      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-saffron-200 text-xs font-bold text-saffron-700 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-saffron-500 animate-pulse" />
          {viewMode === '3d' ? 'Interactive 3D Kho-Kho Court' : 'Regulation Court Layout'}
        </span>
      </div>
    </div>
  );
}
