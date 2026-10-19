import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function KhoKhoCanvas3D({ isGirls = false }) {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const isSpinningRef = useRef(true);
  const [isAutoSpinning, setIsAutoSpinning] = useState(true);

  const toggleAutoSpin = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const next = !isSpinningRef.current;
    isSpinningRef.current = next;
    if (controlsRef.current) {
      controlsRef.current.autoRotate = next;
      if (!next && controlsRef.current.sphericalDelta) {
        controlsRef.current.sphericalDelta.set(0, 0, 0);
      }
    }
    setIsAutoSpinning(next);
  };

  const resetCamera = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (controlsRef.current) {
      controlsRef.current.reset();
      isSpinningRef.current = true;
      controlsRef.current.autoRotate = true;
      setIsAutoSpinning(true);
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#faf8f5');

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 9.5, 12);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.autoRotate = isSpinningRef.current;
    controls.autoRotateSpeed = 2.4;
    controls.minDistance = 5;
    controls.maxDistance = 22;
    controls.minPolarAngle = Math.PI / 9;
    controls.maxPolarAngle = Math.PI / 2.15; // Don't allow camera to go below ground
    controls.target.set(0, 0.2, 0);
    controls.saveState();

    // 5. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 1.4);
    dirLight.position.set(7, 12, 8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 30;
    dirLight.shadow.camera.left = -9;
    dirLight.shadow.camera.right = 9;
    dirLight.shadow.camera.top = 9;
    dirLight.shadow.camera.bottom = -9;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xbfdbfe, 0.4);
    fillLight.position.set(-8, 6, -6);
    scene.add(fillLight);

    const primaryColor = isGirls ? 0xe11d48 : 0xea580c;
    const accentLight = new THREE.PointLight(primaryColor, 0.5, 14);
    accentLight.position.set(0, 3, 0);
    scene.add(accentLight);

    // 6. Materials
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xf1ece4,
      roughness: 0.85,
      metalness: 0.05,
    });
    const courtBorderMat = new THREE.MeshBasicMaterial({ color: 0xfdba74 });
    const courtFloorMat = new THREE.MeshStandardMaterial({
      color: 0xfffcf7,
      roughness: 0.5,
      metalness: 0.05,
    });
    const lineMat = new THREE.MeshBasicMaterial({ color: isGirls ? 0xbe123c : 0xc2410c });
    const boxMat = new THREE.MeshBasicMaterial({ color: isGirls ? 0xfecdd3 : 0xfed7aa });
    const freeZoneMat = new THREE.MeshBasicMaterial({
      color: isGirls ? 0xffe4e6 : 0xffedd5,
      transparent: true,
      opacity: 0.7,
    });
    const woodPoleMat = new THREE.MeshStandardMaterial({
      color: 0x92400e,
      roughness: 0.35,
      metalness: 0.15,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      metalness: 0.8,
    });

    const chaserJerseyMat = new THREE.MeshStandardMaterial({
      color: isGirls ? 0xe11d48 : 0xea580c,
      roughness: 0.4,
    });
    const chaserShortsMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
    });
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xfcd34d,
      roughness: 0.4,
    });
    const activeJerseyMat = new THREE.MeshStandardMaterial({
      color: isGirls ? 0x9f1239 : 0x9a3412,
      roughness: 0.3,
    });

    // 7. Court Dimensions (scaled: 13.5 units long, 7.5 units wide)
    const courtGroup = new THREE.Group();

    // Base arena platform
    const basePlane = new THREE.Mesh(new THREE.PlaneGeometry(16, 9.5), groundMat);
    basePlane.rotation.x = -Math.PI / 2;
    basePlane.position.y = 0;
    basePlane.receiveShadow = true;
    courtGroup.add(basePlane);

    // Court border
    const courtBorder = new THREE.Mesh(new THREE.PlaneGeometry(14.0, 7.8), courtBorderMat);
    courtBorder.rotation.x = -Math.PI / 2;
    courtBorder.position.y = 0.003;
    courtGroup.add(courtBorder);

    // Main Court surface
    const courtFloor = new THREE.Mesh(new THREE.PlaneGeometry(13.6, 7.4), courtFloorMat);
    courtFloor.rotation.x = -Math.PI / 2;
    courtFloor.position.y = 0.006;
    courtFloor.receiveShadow = true;
    courtGroup.add(courtFloor);

    // Free Zones at both ends (beyond the poles)
    const leftFreeZone = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 6.2), freeZoneMat);
    leftFreeZone.rotation.x = -Math.PI / 2;
    leftFreeZone.position.set(-5.4, 0.009, 0);
    courtGroup.add(leftFreeZone);

    const rightFreeZone = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 6.2), freeZoneMat);
    rightFreeZone.rotation.x = -Math.PI / 2;
    rightFreeZone.position.set(5.4, 0.009, 0);
    courtGroup.add(rightFreeZone);

    // Center Line running between the two turn poles
    const centerLine = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 0.09), lineMat);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.set(0, 0.012, 0);
    courtGroup.add(centerLine);

    // 8 Cross Lanes & Sitting Chaser Squares
    const crossX = [-4.2, -3.0, -1.8, -0.6, 0.6, 1.8, 3.0, 4.2];

    crossX.forEach((x) => {
      // Cross lane line
      const crossLane = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 6.2), lineMat);
      crossLane.rotation.x = -Math.PI / 2;
      crossLane.position.set(x, 0.012, 0);
      courtGroup.add(crossLane);

      // Chaser sitting square (30cm x 30cm)
      const chaserSquare = new THREE.Mesh(new THREE.PlaneGeometry(0.65, 0.65), boxMat);
      chaserSquare.rotation.x = -Math.PI / 2;
      chaserSquare.position.set(x, 0.014, 0);
      courtGroup.add(chaserSquare);
    });

    // Outer boundary line box
    const outerBorderGroup = new THREE.Group();
    const createCourtLine = (w, h, x, z) => {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(w, h), lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(x, 0.013, z);
      return line;
    };
    outerBorderGroup.add(createCourtLine(12.2, 0.07, 0, 3.1));
    outerBorderGroup.add(createCourtLine(12.2, 0.07, 0, -3.1));
    outerBorderGroup.add(createCourtLine(0.07, 6.2, 6.1, 0));
    outerBorderGroup.add(createCourtLine(0.07, 6.2, -6.1, 0));
    courtGroup.add(outerBorderGroup);

    // 8. Wooden Turn Poles (Regulation Kho-Kho Poles at ends of center line)
    const createPole = (xPos) => {
      const poleGroup = new THREE.Group();
      poleGroup.position.set(xPos, 0, 0);

      // Base ring
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.12, 24), woodPoleMat);
      base.position.y = 0.06;
      base.receiveShadow = true;
      poleGroup.add(base);

      // Wooden column (1.2m regulation height)
      const column = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 1.35, 24), woodPoleMat);
      column.position.y = 0.75;
      column.castShadow = true;
      poleGroup.add(column);

      // Brass/Golden sphere on top
      const finial = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 24), goldMat);
      finial.position.y = 1.48;
      finial.castShadow = true;
      poleGroup.add(finial);

      return poleGroup;
    };

    courtGroup.add(createPole(-4.8));
    courtGroup.add(createPole(4.8));

    // 9. 8 Sitting Chaser Players (Alternating Directions - Rule of Kho-Kho!)
    const createSittingPlayer = (facingDirection) => {
      const player = new THREE.Group();
      // facingDirection: true = facing +Z, false = facing -Z
      player.rotation.y = facingDirection ? 0 : Math.PI;

      // Shorts / Legs
      const legs = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.22, 0.38), chaserShortsMat);
      legs.position.set(0, 0.11, 0);
      legs.castShadow = true;
      legs.receiveShadow = true;
      player.add(legs);

      // Jersey Torso (crouched slightly forward)
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.38, 0.3), chaserJerseyMat);
      torso.position.set(0, 0.34, 0.02);
      torso.rotation.x = 0.15; // crouch forward
      torso.castShadow = true;
      player.add(torso);

      // Head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 16), skinMat);
      head.position.set(0, 0.61, 0.06);
      head.castShadow = true;
      player.add(head);

      // Hair
      const hair = new THREE.Mesh(
        new THREE.SphereGeometry(0.142, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2.2),
        new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 })
      );
      hair.position.set(0, 0.62, 0.06);
      hair.rotation.x = -0.2;
      player.add(hair);

      return player;
    };

    crossX.forEach((x, index) => {
      const player = createSittingPlayer(index % 2 === 0);
      player.position.set(x, 0, 0);
      courtGroup.add(player);
    });

    // 10. Active Running Chaser (Animated)
    const activeChaser = new THREE.Group();
    activeChaser.position.set(0, 0, 0.8);

    const runnerTorso = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.42, 0.26), activeJerseyMat);
    runnerTorso.position.set(0, 0.48, 0);
    runnerTorso.castShadow = true;
    activeChaser.add(runnerTorso);

    const runnerShorts = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.25, 0.28), chaserShortsMat);
    runnerShorts.position.set(0, 0.22, 0);
    runnerShorts.castShadow = true;
    activeChaser.add(runnerShorts);

    const runnerHead = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), skinMat);
    runnerHead.position.set(0, 0.77, 0);
    runnerHead.castShadow = true;
    activeChaser.add(runnerHead);

    // Active chaser indicator aura
    const auraMesh = new THREE.Mesh(
      new THREE.RingGeometry(0.28, 0.38, 24),
      new THREE.MeshBasicMaterial({
        color: primaryColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7,
      })
    );
    auraMesh.rotation.x = -Math.PI / 2;
    auraMesh.position.set(0, 0.015, 0);
    activeChaser.add(auraMesh);

    courtGroup.add(activeChaser);
    scene.add(courtGroup);

    // 11. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();
    let animTime = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);

      if (isSpinningRef.current) {
        animTime += delta;
        controls.autoRotate = true;
        controls.autoRotateSpeed = 2.4;
      } else {
        controls.autoRotate = false;
      }

      // Animate active chaser sprinting along the center line
      const runPathX = Math.sin(animTime * 1.5) * 4.4;
      const runPathZ = Math.cos(animTime * 1.5) * 0.9;
      activeChaser.position.x = runPathX;
      activeChaser.position.z = runPathZ;
      // Slight running bob
      activeChaser.position.y = Math.abs(Math.sin(animTime * 8)) * 0.08;
      // Face movement direction
      const facingAngle = Math.atan2(
        Math.cos(animTime * 1.5) * -0.9,
        Math.cos(animTime * 1.5) * 4.4
      );
      activeChaser.rotation.y = -facingAngle + Math.PI / 2;

      // Pulse the aura
      auraMesh.scale.setScalar(1 + Math.sin(animTime * 5) * 0.12);

      controls.update(delta);
      renderer.render(scene, camera);
    };

    animate();

    // 12. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 13. Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      controls.dispose();

      // Dispose geometries & materials
      scene.traverse((obj) => {
        if (obj.isMesh) {
          if (obj.geometry) obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else if (obj.material) {
            obj.material.dispose();
          }
        }
      });

      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [isGirls]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating 3D Interaction Controls */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-3 left-3 z-20 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={toggleAutoSpin}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer select-none ${
            isAutoSpinning
              ? 'bg-white/95 hover:bg-slate-50 text-slate-800 border-slate-200/90 shadow-slate-900/5'
              : 'bg-saffron-500 hover:bg-saffron-600 text-white border-saffron-600 shadow-saffron-500/30'
          }`}
          title={isAutoSpinning ? 'Pause 3D Court Auto-Spin' : 'Start 3D Court Auto-Spin'}
        >
          {isAutoSpinning ? (
            <>
              <Pause className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
              <span>Pause Spin</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white text-white" />
              <span>Resume Spin</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={resetCamera}
          className="px-2.5 py-1.5 rounded-xl bg-white/95 hover:bg-slate-50 text-slate-700 border border-slate-200/90 text-xs font-bold transition-all shadow-md shadow-slate-900/5 flex items-center gap-1.5 cursor-pointer select-none"
          title="Reset Camera View to Default"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset View</span>
        </button>
      </div>

      {/* Interactive Helper Hint */}
      <div className="absolute bottom-3 right-3 z-10 pointer-events-none hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200/60 text-[11px] font-medium text-slate-500 shadow-xs">
        <span>🖱️ Drag to rotate</span>
        <span>•</span>
        <span>🔍 Scroll to zoom</span>
      </div>
    </div>
  );
}
