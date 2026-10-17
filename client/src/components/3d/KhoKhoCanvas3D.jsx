import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

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

export default function KhoKhoCanvas3D({ isGirls = false }) {
  return (
    <Canvas
      camera={{ position: [0, 6, 6.5], fov: 42 }}
      style={{ width: '100%', height: '100%' }}
      onCreated={({ gl }) => {
        gl.setClearColor('#fdfbf7', 1);
      }}
    >
      <SceneContent isGirls={isGirls} />
    </Canvas>
  );
}
