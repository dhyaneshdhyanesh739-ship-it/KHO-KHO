import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// 3D Sitting Chaser Figure (Alternating Directions)
function SittingChaser({ position, facingDirection, isGirls = false }) {
  const meshRef = useRef();
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
      {/* Player number back */}
      <mesh position={[0, 0.35, -0.18]}>
        <planeGeometry args={[0.2, 0.2]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

// 3D Wooden Pole (Standard Kho-Kho Pole at court ends)
function WoodenPole({ position }) {
  return (
    <group position={position}>
      {/* Base ring */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.1, 24]} />
        <meshStandardMaterial color="#78350f" roughness={0.5} />
      </mesh>
      {/* Main wooden pole */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.09, 1.5, 24]} />
        <meshStandardMaterial color="#d97706" metalness={0.2} roughness={0.4} />
      </mesh>
      {/* Pole Top Cap */}
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
  const [angle, setAngle] = useState(0);

  useFrame((state, delta) => {
    if (chaserRef.current) {
      const time = state.clock.getElapsedTime();
      // Smooth animated pacing between poles along the court
      chaserRef.current.position.x = Math.sin(time * 1.2) * 3.8;
      chaserRef.current.position.z = Math.cos(time * 0.8) * 0.6;
      chaserRef.current.rotation.y = time * 1.2 > 0 ? 0 : Math.PI;
    }
  });

  return (
    <group ref={chaserRef} position={[0, 0.45, 0]}>
      {/* Upper Torso */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.18, 0.5, 16]} />
        <meshStandardMaterial color={isGirls ? '#be123c' : '#c2410c'} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#fcd34d" />
      </mesh>
      {/* Running dynamic indicator */}
      <pointLight color="#ea580c" intensity={0.5} distance={2} />
    </group>
  );
}

// 3D Kho-Kho Court Ground and Markings
function CourtPlane() {
  return (
    <group>
      {/* Outdoor Mat / Synthetic Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[11, 6.5]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.8} />
      </mesh>

      {/* Court Outer Border Line (Orange) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <planeGeometry args={[9.5, 5.2]} />
        <meshBasicMaterial color="#fdba74" />
      </mesh>

      {/* Main Playing Area (Warm Court Color) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <planeGeometry args={[9.3, 5.0]} />
        <meshStandardMaterial color="#fff7ed" roughness={0.6} />
      </mesh>

      {/* Center Line connecting the two poles */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <planeGeometry args={[7.6, 0.08]} />
        <meshBasicMaterial color="#ea580c" />
      </mesh>

      {/* 8 Cross Lanes */}
      {[-3.0, -2.14, -1.28, -0.42, 0.42, 1.28, 2.14, 3.0].map((x, i) => (
        <group key={i}>
          {/* Cross lane line */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.007, 0]}>
            <planeGeometry args={[0.06, 4.4]} />
            <meshBasicMaterial color="#ea580c" />
          </mesh>
          {/* Sitting Chaser Square Box */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.008, 0]}>
            <planeGeometry args={[0.45, 0.45]} />
            <meshBasicMaterial color="#fed7aa" />
          </mesh>
        </group>
      ))}

      {/* Pole Free Zones (D-Zones / Rectangular zones at ends) */}
      {[-3.8, 3.8].map((x, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.006, 0]}>
          <planeGeometry args={[1.2, 4.4]} />
          <meshBasicMaterial color="#ffedd5" />
        </mesh>
      ))}
    </group>
  );
}

// Entire 3D Scene Container
function SceneContent({ isGirls }) {
  // Cross lane positions for 8 sitting chasers
  const crossX = [-3.0, -2.14, -1.28, -0.42, 0.42, 1.28, 2.14, 3.0];

  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[6, 8, 5]} intensity={1.2} castShadow shadow-mapSize={1024} />
      <pointLight position={[-4, 3, 2]} intensity={0.4} color="#ea580c" />
      <pointLight position={[4, 3, -2]} intensity={0.4} color="#10b981" />

      {/* Court Ground & Lines */}
      <CourtPlane />

      {/* Two Regulation Wooden Poles */}
      <WoodenPole position={[-3.8, 0, 0]} />
      <WoodenPole position={[3.8, 0, 0]} />

      {/* 8 Sitting Chasers facing alternate directions */}
      {crossX.map((x, index) => (
        <SittingChaser
          key={index}
          position={[x, 0, 0]}
          facingDirection={index % 2 === 0}
          isGirls={isGirls}
        />
      ))}

      {/* Active Runner / Chaser */}
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

// Static Fallback Component (for low-end devices or WebGL issues)
function StaticFallback() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-saffron-50 via-white to-amber-50 rounded-2xl p-6 border border-saffron-200 shadow-card">
      <div className="relative w-full max-w-sm aspect-[16/9] bg-orange-50/80 rounded-xl border-2 border-dashed border-saffron-300 flex items-center justify-center p-4">
        {/* SVG Representation of Kho-Kho Court */}
        <svg viewBox="0 0 400 240" className="w-full h-full">
          {/* Border */}
          <rect x="20" y="20" width="360" height="200" fill="#fff7ed" stroke="#ea580c" strokeWidth="3" rx="8" />
          {/* Center line */}
          <line x1="60" y1="120" x2="340" y2="120" stroke="#ea580c" strokeWidth="3" />
          {/* Poles */}
          <circle cx="60" cy="120" r="8" fill="#d97706" />
          <circle cx="340" cy="120" r="8" fill="#d97706" />
          {/* 8 Cross Lanes */}
          {[95, 130, 165, 200, 235, 270, 305].map((x, i) => (
            <g key={i}>
              <line x1={x} y1="35" x2={x} y2="205" stroke="#ea580c" strokeWidth="2" strokeDasharray="3 3" />
              <rect x={x - 8} y="112" width="16" height="16" fill={i % 2 === 0 ? '#ea580c' : '#10b981'} rx="3" />
            </g>
          ))}
        </svg>
      </div>
      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-saffron-700">Official Kho-Kho Arena Court (Interactive 3D Simulation)</p>
    </div>
  );
}

export default function KhoKhoCourt3D({ isGirls = false, className = '' }) {
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return <StaticFallback />;
  }

  return (
    <div className={`relative w-full h-[360px] md:h-[460px] rounded-3xl overflow-hidden bg-gradient-to-b from-white via-saffron-50/40 to-slate-50 border border-slate-200/80 shadow-card ${className}`}>
      {/* 3D Court Canvas */}
      <Suspense fallback={<StaticFallback />}>
        <Canvas
          shadows
          camera={{ position: [0, 6, 6.5], fov: 42 }}
          style={{ pointerEvents: 'auto' }}
        >
          <SceneContent isGirls={isGirls} />
        </Canvas>
      </Suspense>

      {/* Floating 3D Badge Overlay */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-saffron-200 text-xs font-bold text-saffron-700 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-saffron-500 animate-pulse"></span>
          Interactive 3D Kho-Kho Court
        </span>
      </div>

      <div className="absolute bottom-4 right-4 z-10 pointer-events-none">
        <span className="text-[11px] font-medium text-slate-500 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-200">
          Drag to rotate • 8 Sitting Chasers & Poles
        </span>
      </div>
    </div>
  );
}
