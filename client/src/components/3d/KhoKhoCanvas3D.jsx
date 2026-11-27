import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Shield, Zap, Award, Flame, Eye, RefreshCw } from 'lucide-react';

export default function KhoKhoCanvas3D({ isGirls = false, activeBatch = 1, onBatchChange }) {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const soundEnabledRef = useRef(true);
  const resetSimulationRef = useRef(null);

  // Match State
  const [matchStatus, setMatchStatus] = useState('COUNTDOWN'); // 'COUNTDOWN' | 'PLAYING' | 'PAUSED' | 'BATCH_TRANSITION' | 'ALL_OUT'
  const [countdownValue, setCountdownValue] = useState(3);
  const [matchTime, setMatchTime] = useState(0);
  const [outsCount, setOutsCount] = useState(0);
  const [currentTargetId, setCurrentTargetId] = useState(1);
  const [transitionCountdown, setTransitionCountdown] = useState(3);
  const [defendersStatus, setDefendersStatus] = useState([
    { id: 1, active: true, name: 'R1' },
    { id: 2, active: true, name: 'R2' },
    { id: 3, active: true, name: 'R3' },
  ]);
  const [actionAlert, setActionAlert] = useState('Match starting... Teams in position');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cameraMode, setCameraMode] = useState('broadcast'); // 'broadcast' | 'follow' | 'overhead'

  // Refs for animation loop
  const gameStateRef = useRef({
    status: 'COUNTDOWN',
    countdown: 3.5,
    matchTime: 0,
    activeBatch: 1,
    outsCount: 0,
    transitionTimer: 0,
    currentTargetId: 1,
    actionAlert: 'Ready at poles...',
    activeChaserIndex: -1, // -1 means starting chaser from pole
    chaserPos: { x: -4.8, z: 0.85 },
    chaserVel: { x: 0, z: 0 },
    chaserDir: 1, // 1 = sprinting East (+X), -1 = sprinting West (-X)
    chaserLane: 1, // 1 = +Z lane, -1 = -Z lane
    isTurningPole: false,
    poleTurnProgress: 0,
    poleTurnStartLane: 1,
    poleTurnPoleId: 'LEFT',
    khoCooldown: 2.5,
    targetOutTimes: [14.0, 25.5, 40.0], // Out 1 (~14s), Out 2 (~25.5s), Out 3 strictly between 30s and 50s!
    lastDodgeAlertTime: 0,
    restartTrigger: 0,
  });

  // Sound Synthesizer (Web Audio API - authentic whistle and countdown beeps)
  const playSound = (type) => {
    if (!soundEnabledRef.current) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'beep') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      } else if (type === 'whistle') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(2600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1900, ctx.currentTime + 0.15);
        osc.frequency.exponentialRampToValueAtTime(2800, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.14, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else if (type === 'tag') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      // Audio autoplay policy fallback
    }
  };

  const handlePlayNextBatch = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const nextBatch = (activeBatch % 3) + 1; // Cycles: 1 -> 2 -> 3 -> 1
    if (onBatchChange) {
      onBatchChange(nextBatch);
    }
    gameStateRef.current.activeBatch = nextBatch;
    if (resetSimulationRef.current) {
      resetSimulationRef.current(nextBatch);
    }
  };

  const handleRestartMatch = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (resetSimulationRef.current) {
      resetSimulationRef.current(activeBatch);
    }
  };

  const toggleMatchPause = () => {
    if (matchStatus === 'PLAYING') {
      setMatchStatus('PAUSED');
      gameStateRef.current.status = 'PAUSED';
    } else if (matchStatus === 'PAUSED') {
      setMatchStatus('PLAYING');
      gameStateRef.current.status = 'PLAYING';
    } else if (matchStatus === 'ALL_OUT') {
      handlePlayNextBatch();
    }
  };

  const prevBatchRef = useRef(activeBatch);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    if (prevBatchRef.current !== activeBatch) {
      prevBatchRef.current = activeBatch;
      gameStateRef.current.activeBatch = activeBatch;
      if (resetSimulationRef.current) {
        resetSimulationRef.current(activeBatch);
      }
    }
  }, [activeBatch]);

  // Main 3D Canvas Initialization & Simulation Engine
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

    // 1. Three.js Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isDark ? '#080d1a' : '#f5f0e8');
    scene.fog = new THREE.FogExp2(isDark ? '#080d1a' : '#f5f0e8', 0.025);

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 9.5, 12.5);

    // 3. Renderer with soft shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2.12; // Prevent camera sinking under ground
    controls.minDistance = 4.5;
    controls.maxDistance = 22;
    controls.target.set(0, 0.3, 0);

    // 5. Stadium & Court Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    // Main floodlight from above
    const floodlight1 = new THREE.DirectionalLight(0xfffbf2, 1.5);
    floodlight1.position.set(6, 14, 8);
    floodlight1.castShadow = true;
    floodlight1.shadow.mapSize.width = 1024;
    floodlight1.shadow.mapSize.height = 1024;
    floodlight1.shadow.bias = -0.0004;
    floodlight1.shadow.camera.near = 0.5;
    floodlight1.shadow.camera.far = 30;
    floodlight1.shadow.camera.left = -9;
    floodlight1.shadow.camera.right = 9;
    floodlight1.shadow.camera.top = 9;
    floodlight1.shadow.camera.bottom = -9;
    scene.add(floodlight1);

    // Fill light
    const fillLight = new THREE.DirectionalLight(0xcfd8dc, 0.45);
    fillLight.position.set(-8, 8, -6);
    scene.add(fillLight);

    // 6. Materials
    const groundMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x0f172a : 0xede4d3,
      roughness: 0.9,
      metalness: 0.02,
    });
    const courtMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x162032 : 0xfcf8f2,
      roughness: 0.55,
      metalness: 0.05,
    });
    const lineMat = new THREE.MeshBasicMaterial({ color: isGirls ? 0xbe123c : 0xc2410c });
    const freeZoneMat = new THREE.MeshBasicMaterial({
      color: isGirls ? 0xffe4e6 : (isDark ? 0x1e293b : 0xfef3c7),
      transparent: true,
      opacity: 0.45,
    });
    const poleWoodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.3, metalness: 0.1 });
    const brassFinialMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.85 });

    // Team Mats
    const chaserJerseyColor = isGirls ? 0xe11d48 : 0xea580c;
    const defenderJerseyColor = isGirls ? 0x0284c7 : 0x059669;

    const chaserJerseyMat = new THREE.MeshStandardMaterial({ color: chaserJerseyColor, roughness: 0.4 });
    const chaserActiveJerseyMat = new THREE.MeshStandardMaterial({ color: isGirls ? 0x9f1239 : 0x9a3412, roughness: 0.3 });
    const chaserShortsMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
    const defenderJerseyMat = new THREE.MeshStandardMaterial({ color: defenderJerseyColor, roughness: 0.4 });
    const defenderShortsMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfcd34d, roughness: 0.4 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.8 });
    const shoeMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });

    // 7. Court Geometry
    const courtGroup = new THREE.Group();

    // Base stadium platform
    const baseArena = new THREE.Mesh(new THREE.PlaneGeometry(16.5, 10.5), groundMat);
    baseArena.rotation.x = -Math.PI / 2;
    baseArena.receiveShadow = true;
    courtGroup.add(baseArena);

    // Court Surface (Regulation 27m x 16m scaled)
    const courtFloor = new THREE.Mesh(new THREE.PlaneGeometry(13.8, 7.6), courtMat);
    courtFloor.rotation.x = -Math.PI / 2;
    courtFloor.position.y = 0.005;
    courtFloor.receiveShadow = true;
    courtGroup.add(courtFloor);

    // Free Zones beyond poles
    const leftFreeZone = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 6.2), freeZoneMat);
    leftFreeZone.rotation.x = -Math.PI / 2;
    leftFreeZone.position.set(-5.5, 0.008, 0);
    courtGroup.add(leftFreeZone);

    const rightFreeZone = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 6.2), freeZoneMat);
    rightFreeZone.rotation.x = -Math.PI / 2;
    rightFreeZone.position.set(5.5, 0.008, 0);
    courtGroup.add(rightFreeZone);

    // Center Line running between the two turn poles
    const centerLine = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 0.08), lineMat);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.set(0, 0.012, 0);
    courtGroup.add(centerLine);

    // 8 Cross Lanes & Sitting Chaser Squares (30cm x 30cm)
    const crossX = [-4.2, -3.0, -1.8, -0.6, 0.6, 1.8, 3.0, 4.2];
    const sittingSquares = [];

    crossX.forEach((x, i) => {
      // Cross lane line
      const crossLane = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 6.2), lineMat);
      crossLane.rotation.x = -Math.PI / 2;
      crossLane.position.set(x, 0.011, 0);
      courtGroup.add(crossLane);

      // Chaser square box
      const chaserSquare = new THREE.Mesh(
        new THREE.PlaneGeometry(0.66, 0.66),
        new THREE.MeshBasicMaterial({ color: isDark ? 0x26334d : 0xfed7aa })
      );
      chaserSquare.rotation.x = -Math.PI / 2;
      chaserSquare.position.set(x, 0.013, 0);
      courtGroup.add(chaserSquare);
      sittingSquares.push({ x, facing: i % 2 === 0 ? 1 : -1 }); // 1 = +Z, -1 = -Z
    });

    // Outer boundary line box
    const makeBorderLine = (w, h, x, z) => {
      const line = new THREE.Mesh(new THREE.PlaneGeometry(w, h), lineMat);
      line.rotation.x = -Math.PI / 2;
      line.position.set(x, 0.012, z);
      return line;
    };
    courtGroup.add(makeBorderLine(12.4, 0.07, 0, 3.1));
    courtGroup.add(makeBorderLine(12.4, 0.07, 0, -3.1));
    courtGroup.add(makeBorderLine(0.07, 6.2, 6.2, 0));
    courtGroup.add(makeBorderLine(0.07, 6.2, -6.2, 0));

    // Wooden Poles (Regulation Kho-Kho Poles at ends of center line)
    const createPole = (xPos) => {
      const poleGroup = new THREE.Group();
      poleGroup.position.set(xPos, 0, 0);

      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.12, 24), poleWoodMat);
      base.position.y = 0.06;
      base.receiveShadow = true;
      poleGroup.add(base);

      const column = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.09, 1.35, 24), poleWoodMat);
      column.position.y = 0.75;
      column.castShadow = true;
      poleGroup.add(column);

      const finial = new THREE.Mesh(new THREE.SphereGeometry(0.12, 24, 24), brassFinialMat);
      finial.position.y = 1.48;
      finial.castShadow = true;
      poleGroup.add(finial);

      return poleGroup;
    };

    courtGroup.add(createPole(-4.8));
    courtGroup.add(createPole(4.8));

    // 8. Articulated Player Factory (Full limbs, running animation, natural limbs)
    const createArticulatedPlayer = (role = 'CHASER', label = '1') => {
      const root = new THREE.Group();
      const isChaser = role === 'CHASER' || role === 'ACTIVE_CHASER';

      // Pelvis / Shorts
      const pelvis = new THREE.Group();
      pelvis.position.y = 0.42;

      const shortsMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.24, 0.26),
        isChaser ? chaserShortsMat : defenderShortsMat
      );
      shortsMesh.castShadow = true;
      pelvis.add(shortsMesh);
      root.add(pelvis);

      // Torso / Jersey
      const torso = new THREE.Group();
      torso.position.y = 0.14;

      const chestMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.4, 0.24),
        role === 'ACTIVE_CHASER' ? chaserActiveJerseyMat : isChaser ? chaserJerseyMat : defenderJerseyMat
      );
      chestMesh.position.y = 0.2;
      chestMesh.castShadow = true;
      torso.add(chestMesh);

      // Head & Neck
      const headGroup = new THREE.Group();
      headGroup.position.y = 0.48;

      const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), skinMat);
      headMesh.castShadow = true;
      headGroup.add(headMesh);

      const hairMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.124, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2.1),
        hairMat
      );
      hairMesh.rotation.x = -0.15;
      headGroup.add(hairMesh);

      // Team Headband
      const headbandMesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.122, 0.015, 8, 24),
        new THREE.MeshBasicMaterial({ color: isChaser ? 0xea580c : 0x10b981 })
      );
      headbandMesh.rotation.x = Math.PI / 2;
      headGroup.add(headbandMesh);

      torso.add(headGroup);

      // Arms with Upper Arm and Forearm joints
      const createArm = (isLeft) => {
        const armGroup = new THREE.Group();
        armGroup.position.set(isLeft ? -0.19 : 0.19, 0.34, 0);

        const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.08), skinMat);
        upperArm.position.y = -0.11;
        upperArm.castShadow = true;
        armGroup.add(upperArm);

        const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.2, 0.07), skinMat);
        forearm.position.set(0, -0.22, 0.06);
        forearm.rotation.x = -0.4; // athletic elbow bend
        armGroup.add(forearm);

        return armGroup;
      };

      const leftArm = createArm(true);
      const rightArm = createArm(false);
      torso.add(leftArm);
      torso.add(rightArm);
      pelvis.add(torso);

      // Legs with Hip and Knee joints
      const createLeg = (isLeft) => {
        const legGroup = new THREE.Group();
        legGroup.position.set(isLeft ? -0.09 : 0.09, -0.1, 0);

        const thigh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.22, 0.1), skinMat);
        thigh.position.y = -0.11;
        thigh.castShadow = true;
        legGroup.add(thigh);

        const shin = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.22, 0.09), skinMat);
        shin.position.y = -0.28;
        shin.castShadow = true;
        legGroup.add(shin);

        const foot = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.07, 0.18), shoeMat);
        foot.position.set(0, -0.4, 0.04);
        foot.castShadow = true;
        legGroup.add(foot);

        return legGroup;
      };

      const leftLeg = createLeg(true);
      const rightLeg = createLeg(false);
      pelvis.add(leftLeg);
      pelvis.add(rightLeg);

      // Aura Ring on Floor
      const aura = new THREE.Mesh(
        new THREE.RingGeometry(0.25, 0.38, 24),
        new THREE.MeshBasicMaterial({
          color: isChaser ? chaserJerseyColor : defenderJerseyColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75,
        })
      );
      aura.rotation.x = -Math.PI / 2;
      aura.position.y = 0.015;
      root.add(aura);

      // 3D Billboard Sprite Label (Always faces camera)
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const texture = new THREE.CanvasTexture(canvas);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false }));
      sprite.scale.set(0.48, 0.48, 1);
      sprite.position.set(0, 1.25, 0);
      root.add(sprite);

      const setBadge = (txt, bgHex = null) => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 128, 128);
        ctx.beginPath();
        ctx.arc(64, 64, 54, 0, Math.PI * 2);
        ctx.fillStyle = bgHex || (isChaser ? '#ea580c' : '#059669');
        ctx.fill();
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        ctx.font = '900 48px system-ui, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(txt, 64, 66);
        texture.needsUpdate = true;
      };

      setBadge(label);

      // Poses
      const setSeatedPose = (facing) => {
        root.rotation.y = facing === 1 ? 0 : Math.PI;
        pelvis.position.y = 0.22;
        torso.rotation.x = 0.25; // ready crouch
        leftLeg.rotation.x = -Math.PI / 2.2;
        rightLeg.rotation.x = -Math.PI / 2.2;
        leftArm.rotation.x = 0.3;
        rightArm.rotation.x = 0.3;
      };

      const setRunningPose = (speed = 1.0, animTime = 0, timeOffset = 0) => {
        const t = (animTime || 0) + (timeOffset || 0);
        pelvis.position.y = 0.42 + Math.abs(Math.sin(t * 12 * speed)) * 0.05;
        const stride = t * 12 * speed;
        const legAngle = Math.sin(stride) * 0.72;
        leftLeg.rotation.x = legAngle;
        rightLeg.rotation.x = -legAngle;
        leftArm.rotation.x = -legAngle * 0.8;
        rightArm.rotation.x = legAngle * 0.8;
        torso.rotation.x = 0.2; // athletic sprint forward lean
      };

      const setSidelineSittingPose = () => {
        pelvis.position.y = 0.22;
        torso.rotation.x = 0.08;
        leftLeg.rotation.x = -Math.PI / 2.2;
        rightLeg.rotation.x = -Math.PI / 2.2;
        leftArm.rotation.x = 0.25;
        rightArm.rotation.x = 0.25;
      };

      const setStandingReady = () => {
        pelvis.position.y = 0.42;
        torso.rotation.x = 0.1;
        leftLeg.rotation.x = 0;
        rightLeg.rotation.x = 0;
        leftArm.rotation.x = 0.1;
        rightArm.rotation.x = -0.1;
      };

      return {
        root,
        pelvis,
        torso,
        leftLeg,
        rightLeg,
        leftArm,
        rightArm,
        aura,
        setBadge,
        setSeatedPose,
        setRunningPose,
        setSidelineSittingPose,
        setStandingReady,
      };
    };

    // 9. Instantiate 8 Seated Chasers in Alternating Squares
    const seatedPlayers = sittingSquares.map((sq, idx) => {
      const player = createArticulatedPlayer('CHASER', `${idx + 1}`);
      player.root.position.set(sq.x, 0, 0);
      player.setSeatedPose(sq.facing);
      courtGroup.add(player.root);
      return { ...player, squareIndex: idx, x: sq.x, facing: sq.facing, isSitting: true };
    });

    // 10. Instantiate 1 Active Chaser (Starts from Pole 1)
    const activeChaser = createArticulatedPlayer('ACTIVE_CHASER', 'CHASE');
    activeChaser.root.position.set(-4.8, 0, 0.85); // Starts right by Pole 1
    activeChaser.setStandingReady();
    courtGroup.add(activeChaser.root);

    // 11. Instantiate 3 Defenders in Match Format (Batch 1 & 2: 3-to-3 Format, Batch 3: Chain & Round Pin Format)
    const startNum = (activeBatch - 1) * 3 + 1;
    const defender1 = createArticulatedPlayer('DEFENDER', `R${startNum}`);
    const defender2 = createArticulatedPlayer('DEFENDER', `R${startNum + 1}`);
    const defender3 = createArticulatedPlayer('DEFENDER', `R${startNum + 2}`);

    // Initial positions inside court based on defensive format:
    const initP1 = activeBatch === 3 ? { x: -3.6, z: -1.1 } : { x: -2.2, z: -1.3 };
    const initP2 = activeBatch === 3 ? { x: -0.2, z: 1.2 } : { x: 0.0, z: 1.3 };
    const initP3 = activeBatch === 3 ? { x: 3.6, z: -1.1 } : { x: 2.2, z: -1.3 };

    defender1.root.position.set(initP1.x, 0, initP1.z);
    defender2.root.position.set(initP2.x, 0, initP2.z);
    defender3.root.position.set(initP3.x, 0, initP3.z);

    courtGroup.add(defender1.root);
    courtGroup.add(defender2.root);
    courtGroup.add(defender3.root);

    const defenders = [
      { player: defender1, id: 1, pos: { ...initP1 }, vel: { x: 0, z: 0 }, isOut: false, label: `R${startNum}` },
      { player: defender2, id: 2, pos: { ...initP2 }, vel: { x: 0, z: 0 }, isOut: false, label: `R${startNum + 1}` },
      { player: defender3, id: 3, pos: { ...initP3 }, vel: { x: 0, z: 0 }, isOut: false, label: `R${startNum + 2}` },
    ];

    scene.add(courtGroup);

    // 12. Simulation Loop Variables
    let animationFrameId;
    let clock = new THREE.Clock();
    let lastSecondInt = 3;

    // Register full simulation reset handler
    resetSimulationRef.current = (batchNumber) => {
      const b = batchNumber || gameStateRef.current.activeBatch || 1;
      const state = gameStateRef.current;
      state.activeBatch = b;
      const start = (b - 1) * 3 + 1;
      const labels = [`R${start}`, `R${start + 1}`, `R${start + 2}`];

      // Schedule dismissals strictly between 30s and 50s total:
      // Out 1: ~13s to ~15.5s
      // Out 2: ~24s to ~27.5s
      // Out 3 (ALL OUT): strictly in [35.0s, 45.0s] (NEVER <30s, NEVER >50s!)
      const t1 = 13.0 + Math.random() * 2.5;
      const t2 = 24.0 + Math.random() * 3.5;
      const t3 = 35.0 + Math.random() * 10.0;
      state.targetOutTimes = [t1, t2, t3];
      state.lastDodgeAlertTime = 0;

      // 1. Reset all 3 defenders state, poses, positions, badges, and auras
      defenders.forEach((d, idx) => {
        d.isOut = false;
        d.label = labels[idx];
        d.sidelineTarget = null;
        let initialPos;
        if (b === 3) {
          // Batch 3: Chain & Round Pin initial spread (R7 near Pole 1, R8 center chain, R9 near Pole 2)
          initialPos = idx === 0 ? { x: -3.6, z: -1.1 } : idx === 1 ? { x: -0.2, z: 1.2 } : { x: 3.6, z: -1.1 };
        } else {
          // Batches 1 & 2: 3-to-3 format synchronized trio positions
          initialPos = idx === 0 ? { x: -2.2, z: -1.3 } : idx === 1 ? { x: 0.0, z: 1.3 } : { x: 2.2, z: -1.3 };
        }
        d.pos = { ...initialPos };
        d.vel = { x: 0, z: 0 };
        d.player.root.position.set(initialPos.x, 0, initialPos.z);
        d.player.root.rotation.y = 0;
        d.player.setStandingReady();
        d.player.setBadge(labels[idx], isGirls ? '#0284c7' : '#059669');
        d.player.aura.material.color.setHex(isGirls ? 0x0284c7 : 0x10b981);
        d.player.aura.material.opacity = 0.75;
        d.player.aura.scale.set(1, 1, 1);
      });

      // 2. Reset active chaser back to starting pole
      state.chaserPos = { x: -4.8, z: 0.85 };
      state.chaserVel = { x: 0, z: 0 };
      state.chaserDir = 1; // Always starts sprinting East (+X) into court
      state.chaserLane = 1; // +Z lane
      state.isTurningPole = false;
      state.poleTurnProgress = 0;
      state.khoCooldown = 2.5; // Clear cooldown so chaser runs cleanly past Pole 1 and Chaser 1
      activeChaser.root.position.set(-4.8, 0, 0.85);
      activeChaser.root.rotation.y = Math.PI / 2;
      activeChaser.setStandingReady();
      activeChaser.setBadge('CHASE', isGirls ? '#be123c' : '#ea580c');

      // 3. Reset 8 seated chasers
      seatedPlayers.forEach((sp, idx) => {
        sp.setSeatedPose(sp.facing);
        sp.setBadge(`${idx + 1}`, '#ea580c');
      });

      // 4. Reset simulation state
      state.status = 'COUNTDOWN';
      state.countdown = 3.5;
      state.matchTime = 0;
      state.outsCount = 0;
      state.transitionTimer = 0;
      state.currentTargetId = 1;
      const formatDescription = b === 3
        ? 'Chain & Round Pin Format (30s-50s Regulation)'
        : `3-to-3 Format (30s-50s Regulation)`;
      state.actionAlert = `Batch ${b} Ready (${labels.join(', ')}) • ${formatDescription}`;

      lastSecondInt = 3;
      setMatchStatus('COUNTDOWN');
      setCountdownValue(3);
      setOutsCount(0);
      setMatchTime(0);
      setCurrentTargetId(1);
      setTransitionCountdown(3);
      setActionAlert(`Batch ${b} Ready (${labels.join(', ')}) • ${formatDescription}`);
      setDefendersStatus([
        { id: 1, active: true, name: labels[0] },
        { id: 2, active: true, name: labels[1] },
        { id: 3, active: true, name: labels[2] },
      ]);
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const state = gameStateRef.current;

      // ==================== STATE 1: COUNTDOWN ====================
      if (state.status === 'COUNTDOWN') {
        state.countdown -= delta;
        const currentInt = Math.ceil(state.countdown);

        if (currentInt !== lastSecondInt && currentInt > 0) {
          lastSecondInt = currentInt;
          setCountdownValue(currentInt);
          playSound('beep');
        }

        // Active chaser in ready posture at Pole 1
        state.chaserPos = { x: -4.8, z: 0.85 };
        state.chaserDir = 1;
        state.chaserLane = 1;
        state.isTurningPole = false;
        state.poleTurnProgress = 0;
        state.khoCooldown = 2.5;
        activeChaser.root.position.set(-4.8, 0, 0.85);
        activeChaser.root.rotation.y = Math.PI / 2; // Facing the court (+X)
        activeChaser.setStandingReady();

        // 3 Defenders take positions based on batch format
        if (state.activeBatch === 3) {
          // Batch 3: Chain & Round Pin stance (R7 near Pole 1, R8 center chain, R9 near Pole 2)
          defender1.root.position.set(-3.6, 0, -1.1);
          defender2.root.position.set(-0.2, 0, 1.2);
          defender3.root.position.set(3.6, 0, -1.1);
        } else {
          // Batches 1 & 2: 3-to-3 format synchronized stance
          defender1.root.position.set(-2.2, 0, -1.3);
          defender2.root.position.set(0.0, 0, 1.3);
          defender3.root.position.set(2.2, 0, -1.3);
        }
        defender1.setStandingReady();
        defender2.setStandingReady();
        defender3.setStandingReady();

        if (state.countdown <= 0) {
          state.status = 'PLAYING';
          setMatchStatus('PLAYING');
          const formatTag = state.activeBatch === 3 ? 'Chain & Round Pin' : '3-to-3';
          setActionAlert(`⚡ WHISTLE! Match Started — Chaser sprinting off Pole! (${formatTag} Defense Active)`);
          playSound('whistle');
        }
      }

      // ==================== STATE 2: ACTIVE MATCH PLAY ====================
      else if (state.status === 'PLAYING') {
        state.matchTime += delta;
        setMatchTime(state.matchTime);

        const currentTargetTime = (state.targetOutTimes && state.targetOutTimes[state.outsCount]) || 36.0;
        const canTriggerNextOut = state.matchTime >= currentTargetTime;
        const isBatch3 = state.activeBatch === 3;
        const isBatch2 = state.activeBatch === 2;

        // --- A. DEFENDERS: 3-TO-3 FORMAT (BATCH 1 & 2) vs CHAIN & ROUND PIN FORMAT (BATCH 3) ---
        defenders.forEach((d, idx) => {
          // If defender is OUT, smoothly jog to the sideline lobby bench outside the court
          if (d.isOut) {
            if (d.sidelineTarget) {
              const dx = d.sidelineTarget.x - d.pos.x;
              const dz = d.sidelineTarget.z - d.pos.z;
              const dist = Math.hypot(dx, dz);
              if (dist > 0.08) {
                d.pos.x += (dx / dist) * 2.4 * delta;
                d.pos.z += (dz / dist) * 2.4 * delta;
                d.player.root.position.set(d.pos.x, 0, d.pos.z);
                const jogAngle = Math.atan2(dz, dx);
                d.player.root.rotation.y = -jogAngle + Math.PI / 2;
                d.player.setRunningPose(0.85, state.matchTime);
              } else {
                d.pos.x = d.sidelineTarget.x;
                d.pos.z = d.sidelineTarget.z;
                d.player.root.position.set(d.pos.x, 0, d.pos.z);
                d.player.root.rotation.y = 0; // Face active court (+Z)
                d.player.setSidelineSittingPose();
              }
            }
            return;
          }

          // Active defender: Calculate avoidance vector from active chaser
          const dxChaser = d.pos.x - state.chaserPos.x;
          const dzChaser = d.pos.z - state.chaserPos.z;
          const distChaser = Math.hypot(dxChaser, dzChaser);

          // Evasion dodging mode:
          // Defender is scheduled for next out if index matches current outsCount (or solo defender remaining)
          const isTargetDefender = (state.outsCount === 0 && idx === 0) ||
                                  (state.outsCount === 1 && idx === 1) ||
                                  (state.outsCount >= 2);
          const isInvincible = !canTriggerNextOut || (!isTargetDefender && state.outsCount < 2);

          let targetX = d.pos.x;
          let targetZ = d.pos.z;
          let chainSeparationX = 0;
          let chainSeparationZ = 0;

          if (isBatch3) {
            // =========================================================================
            // BATCH 3: CHAIN FORMAT & ROUND PIN FORMAT (RING GAME & POLE ROTATION)
            // =========================================================================
            const isSoloDefender = state.outsCount >= 2;

            if (isSoloDefender) {
              // Solo defender in Batch 3 executes iconic Round Pin ring game between poles!
              const cycle = (state.matchTime * 0.42) % 2.0; // 0..1 towards Pole 1, 1..2 towards Pole 2
              if (cycle < 0.38) {
                // Round Pin rotation around Pole 1 (at X = -4.8)
                const pinAngle = state.matchTime * 3.4;
                targetX = -4.8 + Math.cos(pinAngle) * 0.88;
                targetZ = Math.sin(pinAngle) * 0.88;
              } else if (cycle < 1.0) {
                // Sprinting East along cross lanes, weaving across center line
                const tSprint = (cycle - 0.38) / 0.62;
                targetX = -3.8 + tSprint * 7.6;
                targetZ = Math.sin(state.matchTime * 3.2) * 1.5;
              } else if (cycle < 1.38) {
                // Round Pin rotation around Pole 2 (at X = +4.8)
                const pinAngle = state.matchTime * 3.4 + Math.PI;
                targetX = 4.8 + Math.cos(pinAngle) * 0.88;
                targetZ = Math.sin(pinAngle) * 0.88;
              } else {
                // Sprinting West back towards Pole 1
                const tSprint = (cycle - 1.38) / 0.62;
                targetX = 3.8 - tSprint * 7.6;
                targetZ = -Math.sin(state.matchTime * 3.2) * 1.5;
              }
            } else {
              // Trio / Pair in Batch 3:
              // R7 (idx 0): Executes Round Pin rotation at Pole 1
              // R9 (idx 2): Executes Round Pin rotation at Pole 2
              // R8 (idx 1): Acts as connecting S-curve Chain Link between cross-lanes
              if (idx === 0) {
                // Defender R7: Pole 1 Round Pin & Left Wing Defense
                const pinAngle = state.matchTime * 2.8;
                const isNearPole1 = d.pos.x < -3.2 || (Math.floor(state.matchTime / 4) % 2 === 0);
                if (isNearPole1) {
                  targetX = -4.8 + Math.cos(pinAngle) * 0.88;
                  targetZ = Math.sin(pinAngle) * 0.88;
                } else {
                  targetX = -2.5 + Math.sin(state.matchTime * 1.8) * 1.1;
                  targetZ = Math.cos(state.matchTime * 2.2) * 1.4;
                }
              } else if (idx === 2) {
                // Defender R9: Pole 2 Round Pin & Right Wing Defense
                const pinAngle = state.matchTime * 2.8 + Math.PI;
                const isNearPole2 = d.pos.x > 3.2 || (Math.floor(state.matchTime / 4) % 2 === 0);
                if (isNearPole2) {
                  targetX = 4.8 + Math.cos(pinAngle) * 0.88;
                  targetZ = Math.sin(pinAngle) * 0.88;
                } else {
                  targetX = 2.5 + Math.sin(state.matchTime * 1.8) * 1.1;
                  targetZ = Math.cos(state.matchTime * 2.2 + 1.0) * 1.4;
                }
              } else {
                // Defender R8 (idx 1): Center Chain Link
                // Forms connected S-curve Chain between R7 and R9
                targetX = Math.sin(state.matchTime * 1.8) * 2.2;
                targetZ = Math.cos(state.matchTime * 2.5) * 1.5;
              }

              // Connected Chain link spacing
              defenders.forEach((other, oIdx) => {
                if (oIdx !== idx && !other.isOut) {
                  const dx = d.pos.x - other.pos.x;
                  const dz = d.pos.z - other.pos.z;
                  const dist = Math.hypot(dx, dz);
                  if (dist < 1.5 && dist > 0.001) {
                    chainSeparationX += (dx / dist) * (1.5 - dist) * 0.9;
                    chainSeparationZ += (dz / dist) * (1.5 - dist) * 0.9;
                  }
                }
              });
            }

            // Cross central dividing line evasion if chaser approaches
            if (Math.sign(state.chaserPos.z) === Math.sign(d.pos.z) && distChaser < 2.1) {
              targetZ = -Math.sign(d.pos.z) * 1.5;
            }

          } else {
            // =========================================================================
            // BATCHES 1 & 2: 3-TO-3 DEFENSIVE FORMAT (SYNCHRONIZED TRIO)
            // =========================================================================
            // Synchronized 3-defender unit covering cross-lanes
            const isSoloDefender = state.outsCount >= 2;

            if (isSoloDefender) {
              // Solo defender in 3-to-3 uses agile wide-court patrol
              const orbitAngle = state.matchTime * 2.1;
              targetX = Math.sin(orbitAngle) * 3.6;
              if (Math.sign(state.chaserPos.z) === Math.sign(d.pos.z) && distChaser < 2.4) {
                targetZ = -Math.sign(d.pos.z) * 1.6;
              }
            } else {
              // 3-to-3 Synchronized Trio:
              // Batch 1: Classic synchronized 3-to-3 (-2.2, 0.0, +2.2)
              // Batch 2: 3-to-3 with wide flank coverage (-2.8, 0.0, +2.8)
              const baseSpread = isBatch2 ? 2.8 : 2.2;
              const baseAnchorX = idx === 0 ? -baseSpread : idx === 1 ? 0.0 : baseSpread;
              const waveFreq = isBatch2 ? 1.6 : 1.4;
              const wavePhase = idx * (isBatch2 ? 0.6 : 0.35);

              targetX = baseAnchorX + Math.sin(state.matchTime * waveFreq + wavePhase) * (isBatch2 ? 1.1 : 0.85);

              // Synchronized opposite-lane positioning
              const oppositeLane = -state.chaserLane;
              if (Math.sign(state.chaserPos.z) === Math.sign(d.pos.z) && distChaser < 2.4) {
                // Trio cuts across central line together
                targetZ = oppositeLane * (1.3 + (idx % 2) * 0.4);
              } else {
                targetZ = oppositeLane * (1.35 + (idx % 2) * 0.3);
              }

              // Mutual 3-to-3 triangular spacing
              defenders.forEach((other, oIdx) => {
                if (oIdx !== idx && !other.isOut) {
                  const dx = d.pos.x - other.pos.x;
                  const dz = d.pos.z - other.pos.z;
                  const dist = Math.hypot(dx, dz);
                  if (dist < 2.2 && dist > 0.001) {
                    chainSeparationX += (dx / dist) * (2.2 - dist) * 0.85;
                    chainSeparationZ += (dz / dist) * (2.2 - dist) * 0.85;
                  }
                }
              });
            }
          }

          // Agility burst: if not due for tag yet and chaser closes in, dodge with athletic burst
          let dodgeForceX = 0;
          let dodgeForceZ = 0;
          if (isInvincible && distChaser < 1.6) {
            dodgeForceX = (dxChaser / (distChaser + 0.01)) * 3.4;
            dodgeForceZ = (dzChaser / (distChaser + 0.01)) * 3.6;

            if (state.matchTime - (state.lastDodgeAlertTime || 0) > 3.0) {
              state.lastDodgeAlertTime = state.matchTime;
              if (state.matchTime >= 30.0) {
                setActionAlert(`⏱️ 30s Crossed! Solo runner ${d.label} surviving in regulation!`);
              } else if (isBatch3) {
                if (Math.abs(d.pos.x) > 3.4) {
                  setActionAlert(`🔄 Round Pin! Defender ${d.label} circling Pole in evasive orbit!`);
                } else {
                  setActionAlert(`⛓️ Chain Weave! Defender ${d.label} slips past chaser via chain evasion!`);
                }
              } else {
                setActionAlert(`🛡️ 3-to-3 Shift! Defender ${d.label} feints and synchronizes lane crossing!`);
              }
            }
          }

          // Smooth velocity steering
          const steerX = (targetX - d.pos.x) * 0.85 + (dxChaser / (distChaser + 0.1)) * 1.5 + chainSeparationX + dodgeForceX;
          const steerZ = (targetZ - d.pos.z) * 1.2 + (dzChaser / (distChaser + 0.1)) * 1.8 + chainSeparationZ + dodgeForceZ;

          d.vel.x += (steerX - d.vel.x) * delta * 5.2;
          d.vel.z += (steerZ - d.vel.z) * delta * 5.2;

          // Court boundary clamp (within the 27m x 16m regulation boundary)
          d.pos.x = Math.max(-5.2, Math.min(5.2, d.pos.x + d.vel.x * delta));
          d.pos.z = Math.max(-2.6, Math.min(2.6, d.pos.z + d.vel.z * delta));

          // Apply to 3D mesh with dynamic limb strides
          d.player.root.position.set(d.pos.x, 0, d.pos.z);
          const moveAngle = Math.atan2(d.vel.z, d.vel.x);
          d.player.root.rotation.y = -moveAngle + Math.PI / 2;
          d.player.setRunningPose(1.35, state.matchTime, idx * 0.35);
        });

        // --- B. ACTIVE CHASER AI: ONE-BY-ONE DEFENDER CHASE ---
        state.khoCooldown -= delta;

        // In official Kho-Kho, the chaser targets active defenders strictly ONE BY ONE:
        // Defender 1 is pursued until OUT -> then Defender 2 is pursued until OUT -> then Defender 3 is pursued until OUT
        const activeDefenders = defenders.filter((d) => !d.isOut);
        const targetDefender = activeDefenders.length > 0 ? activeDefenders[0] : null;

        if (targetDefender && targetDefender.id !== currentTargetId) {
          setCurrentTargetId(targetDefender.id);
        }

        // Highlight the currently pursued target defender with an amber gold aura
        defenders.forEach((d) => {
          if (!d.isOut) {
            if (targetDefender && d.id === targetDefender.id) {
              d.player.aura.material.color.setHex(0xf59e0b); // Amber gold target aura
              d.player.aura.material.opacity = 0.95;
            } else {
              d.player.aura.material.color.setHex(state.activeBatch === 3 ? 0x2563eb : (isGirls ? 0x0284c7 : 0x10b981));
              d.player.aura.material.opacity = 0.65;
            }
          }
        });

        const chaserSpeed = canTriggerNextOut ? 4.1 : 3.5;

        // 1. POLE TURNING STATE MACHINE (Guaranteed Non-Interruptible Turn)
        if (state.isTurningPole) {
          state.poleTurnProgress += delta * 2.6;
          const t = Math.min(1.0, state.poleTurnProgress);
          const isLeft = state.poleTurnPoleId === 'LEFT';
          const xPole = isLeft ? -4.8 : 4.8;
          const signPole = isLeft ? -1 : 1;

          // Universal smooth semi-circular arc into the safe Free Zone
          state.chaserPos.x = xPole + signPole * 0.42 * Math.sin(t * Math.PI);
          state.chaserPos.z = state.poleTurnStartLane * 0.85 * Math.cos(t * Math.PI);

          // Face along the turning tangent
          const tangentX = signPole * Math.cos(t * Math.PI);
          const tangentZ = -state.poleTurnStartLane * Math.sin(t * Math.PI);
          const turnAngle = Math.atan2(tangentZ, tangentX);
          activeChaser.root.rotation.y = -turnAngle + Math.PI / 2;

          if (t >= 1.0) {
            // Turn completed! Cleanly emerge on the opposite lane heading the opposite direction
            state.isTurningPole = false;
            state.poleTurnProgress = 0;
            state.chaserLane = -state.poleTurnStartLane;
            state.chaserDir = -signPole; // Left Pole emerges heading +1 (East), Right Pole emerges heading -1 (West)
            state.chaserPos.x = xPole - signPole * 0.15;
            state.chaserPos.z = state.chaserLane * 0.85;
            state.khoCooldown = 2.0; // Cooldown before allowing KHO after turning pole
            setActionAlert(isLeft ? '🔄 Chaser rounded Pole 1! Attack accelerating!' : '🔄 Chaser rounded Pole 2! Racing back down court!');
          }
        }
        // 2. CHECK FOR POLE REACH (Trigger turn when reaching far pole)
        else if (state.chaserDir === 1 && state.chaserPos.x >= 4.65) {
          // Reached Right Pole (Pole 2 at +4.8)
          state.isTurningPole = true;
          state.poleTurnPoleId = 'RIGHT';
          state.poleTurnProgress = 0;
          state.poleTurnStartLane = state.chaserLane;
        } else if (state.chaserDir === -1 && state.chaserPos.x <= -4.65) {
          // Reached Left Pole (Pole 1 at -4.8)
          state.isTurningPole = true;
          state.poleTurnPoleId = 'LEFT';
          state.poleTurnProgress = 0;
          state.poleTurnStartLane = state.chaserLane;
        }
        // 3. NORMAL LANE SPRINTING (Unbroken forward commitment along lane)
        else {
          state.chaserPos.x += state.chaserDir * chaserSpeed * delta;
          state.chaserPos.x = Math.max(-4.7, Math.min(4.7, state.chaserPos.x));
          state.chaserPos.z = state.chaserLane * 0.85;
          activeChaser.root.rotation.y = state.chaserDir === 1 ? Math.PI / 2 : -Math.PI / 2;

          // 4. TACTICAL "KHO!" CALL TO SEATED TEAMMATE
          // If all remaining active defenders are on the opposite side of the center line:
          const targetOnOppositeSide = targetDefender && Math.sign(targetDefender.pos.z) !== state.chaserLane;
          // Must not trigger too close to either pole (only between X = -3.8 and X = +3.8)
          const inKhoZone = state.chaserPos.x >= -3.8 && state.chaserPos.x <= 3.8;

          if (state.khoCooldown <= 0 && targetOnOppositeSide && inKhoZone) {
            let bestSeated = null;
            let bestDist = Infinity;

            seatedPlayers.forEach((sp) => {
              // Teammate must face the opposite side
              if (sp.facing !== state.chaserLane) {
                // Must be slightly ahead or at the chaser in current running direction
                const diffX = (sp.x - state.chaserPos.x) * state.chaserDir;
                if (diffX >= -0.1 && diffX <= 1.2) {
                  const dist = Math.abs(sp.x - state.chaserPos.x);
                  if (dist < bestDist) {
                    bestDist = dist;
                    bestSeated = sp;
                  }
                }
              }
            });

            if (bestSeated) {
              state.khoCooldown = 3.2; // Tactical pause before next KHO
              state.chaserLane = bestSeated.facing; // Switch to other lane
              state.chaserPos.z = state.chaserLane * 0.85;
              // Do NOT touch state.chaserPos.x - chaser keeps running forward smoothly!
              playSound('beep');
              setActionAlert(`⚡ "KHO!" called to Chaser #${bestSeated.squareIndex + 1}! Attack switched!`);

              bestSeated.setBadge('KHO!', '#dc2626');
              setTimeout(() => {
                if (bestSeated) bestSeated.setBadge(`${bestSeated.squareIndex + 1}`);
              }, 1200);
            }
          }
        }

        activeChaser.root.position.set(state.chaserPos.x, 0, state.chaserPos.z);
        activeChaser.setRunningPose(1.6, state.matchTime);

        // --- C. DIVE / REACH TAG COLLISION CHECK ---
        // STRICT TIMING RULES (30s to 50s):
        // 1. Tag only occurs when state.matchTime >= currentTargetTime (or deadline >= 48.5s)
        // 2. Final 3rd Out (ALL OUT) CANNOT happen before 30.0s!
        // 3. Batch MUST be ALL OUT by 50.0s!
        if (targetDefender) {
          const distToTarget = Math.hypot(targetDefender.pos.x - state.chaserPos.x, targetDefender.pos.z - state.chaserPos.z);
          const isFinalOut = state.outsCount === 2;
          const meetsDistance = distToTarget < 1.05;
          const meetsTime = state.matchTime >= currentTargetTime;
          const hardDeadline = state.matchTime >= 48.5; // Guarantees match finishes before 50.0s!

          const isTagValid = (meetsTime && meetsDistance) || hardDeadline;

          if (isTagValid) {
            // Guard: STRICT USER REQUIREMENT - Batch MUST run for at least 30.0s!
            if (isFinalOut && state.matchTime < 30.0) {
              // Final defender survives until >= 30.0s!
              return;
            }

            // Tag successful!
            const dismissedDefender = targetDefender;
            dismissedDefender.isOut = true;
            state.outsCount += 1;
            setOutsCount(state.outsCount);
            playSound('tag');

            dismissedDefender.player.setBadge('OUT!', '#dc2626');
            dismissedDefender.player.aura.material.color.setHex(0xdc2626);
            dismissedDefender.player.aura.material.opacity = 0.35;

            // Assign sideline lobby sitting target outside boundary
            dismissedDefender.sidelineTarget = {
              x: -3.2 + (state.outsCount - 1) * 2.0,
              z: 3.55,
            };

            // Update status array for React UI
            setDefendersStatus((prev) =>
              prev.map((d) => (d.id === dismissedDefender.id ? { ...d, active: false } : d))
            );

            // Commentary & ALL OUT check
            const formatTag = state.activeBatch === 3 ? 'Chain & Round Pin' : '3-to-3';
            if (state.outsCount === 1) {
              const remainingRunners = defenders.filter((d) => !d.isOut).map((d) => d.label).join(' & ');
              setActionAlert(`🎯 OUT! Defender ${dismissedDefender.label} caught at ${state.matchTime.toFixed(1)}s! Remaining 2 defenders (${remainingRunners}) continue running!`);
            } else if (state.outsCount === 2) {
              const soloRunner = defenders.find((d) => !d.isOut)?.label || 'R3';
              setActionAlert(`🎯 OUT! Defender ${dismissedDefender.label} caught at ${state.matchTime.toFixed(1)}s! Solo runner ${soloRunner} running & avoiding capture!`);
            } else if (state.outsCount >= 3) {
              // ALL 3 DEFENDERS IN BATCH OUT! AUTOMATIC TRANSITION TO NEXT BATCH!
              state.status = 'BATCH_TRANSITION';
              state.transitionTimer = 3.5;
              setMatchStatus('BATCH_TRANSITION');
              setTransitionCountdown(3);
              const nextBatchNumber = (state.activeBatch % 3) + 1;
              const nextLabels = nextBatchNumber === 1 ? ['R1', 'R2', 'R3'] : nextBatchNumber === 2 ? ['R4', 'R5', 'R6'] : ['R7', 'R8', 'R9'];
              setActionAlert(`🏆 ALL OUT! Batch ${state.activeBatch} dismissed in ${state.matchTime.toFixed(1)}s! Batch ${nextBatchNumber} (${nextLabels.join(', ')}) entering court...`);
              playSound('whistle');
            }
          }
        }
      }

      // ==================== STATE 3: BATCH TRANSITION (NEXT BATCH ENTERS COURT) ====================
      else if (state.status === 'BATCH_TRANSITION') {
        state.transitionTimer -= delta;
        const remainingSec = Math.max(1, Math.ceil(state.transitionTimer));
        setTransitionCountdown(remainingSec);

        // All 3 defenders in current batch complete jogging to sideline bench
        defenders.forEach((d) => {
          if (d.sidelineTarget) {
            const dx = d.sidelineTarget.x - d.pos.x;
            const dz = d.sidelineTarget.z - d.pos.z;
            const dist = Math.hypot(dx, dz);
            if (dist > 0.08) {
              d.pos.x += (dx / dist) * 2.4 * delta;
              d.pos.z += (dz / dist) * 2.4 * delta;
              d.player.root.position.set(d.pos.x, 0, d.pos.z);
              d.player.setRunningPose(0.85, state.matchTime);
            } else {
              d.pos.x = d.sidelineTarget.x;
              d.pos.z = d.sidelineTarget.z;
              d.player.root.position.set(d.pos.x, 0, d.pos.z);
              d.player.root.rotation.y = 0;
              d.player.setSidelineSittingPose();
            }
          }
        });

        // When transition timer reaches 0, AUTOMATICALLY ENTER NEXT BATCH!
        if (state.transitionTimer <= 0) {
          const nextBatch = (state.activeBatch % 3) + 1;
          state.activeBatch = nextBatch;
          if (onBatchChange) {
            onBatchChange(nextBatch);
          }
          if (resetSimulationRef.current) {
            resetSimulationRef.current(nextBatch);
          }
        }
      }

      // Camera view positioning
      controls.update(delta);
      renderer.render(scene, camera);
    };

    animate();

    // 13. Resize Handler
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

    // 14. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      controls.dispose();

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

      {/* TOP BROADCAST SCOREBOARD HUD */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Match Timer & Outs Status */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-md">
          <div className="flex items-center gap-1.5 pr-2 border-r border-slate-200 dark:border-slate-800">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span className="font-mono text-xs font-black text-navy-900 dark:text-white">
              {Math.floor(matchTime / 60)
                .toString()
                .padStart(2, '0')}
              :
              {Math.floor(matchTime % 60)
                .toString()
                .padStart(2, '0')}
            </span>
            <span
              className={`text-[9.5px] font-black px-1.5 py-0.5 rounded-md transition-colors ${
                matchTime >= 30.0
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
              title="Official Batch Duration Regulation: 30 to 50 seconds"
            >
              {matchTime >= 30.0 ? '✓ 30s+' : '30-50s'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Outs:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((num) => (
                <span
                  key={num}
                  className={`w-3.5 h-3.5 rounded-full text-[9px] font-black flex items-center justify-center transition-colors ${
                    num <= outsCount
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                  }`}
                >
                  {num <= outsCount ? '✕' : num}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Live Commentary & Action Banner */}
        <div className="pointer-events-auto max-w-sm px-3 py-1.5 rounded-2xl bg-navy-950/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-700/60 shadow-md text-white text-[11px] font-bold flex items-center gap-2 truncate">
          <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
          <span className="truncate">{actionAlert}</span>
        </div>
      </div>

      {/* BIG COUNTDOWN OVERLAY (3, 2, 1) */}
      {matchStatus === 'COUNTDOWN' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none bg-navy-950/20 backdrop-blur-[2px] animate-fade-in">
          <div className="w-24 h-24 rounded-3xl bg-white/95 dark:bg-slate-900/95 border-2 border-saffron-500 shadow-2xl flex flex-col items-center justify-center transform animate-scale-up">
            <span className="font-editorial text-5xl font-black text-saffron-600 dark:text-saffron-400">
              {countdownValue}
            </span>
          </div>
          <p className="mt-3 text-xs font-black uppercase tracking-widest text-white drop-shadow-md">
            {activeBatch === 3
              ? 'Match Starting • Chain & Round Pin Defense Ready'
              : 'Match Starting • 3-to-3 Defense Ready'}
          </p>
        </div>
      )}

      {/* BATCH TRANSITION / ALL OUT OVERLAY (Automatic Next Batch Entry) */}
      {(matchStatus === 'BATCH_TRANSITION' || matchStatus === 'ALL_OUT') && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-navy-950/45 backdrop-blur-[3px] animate-fade-in pointer-events-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/80 dark:border-emerald-500/60 shadow-2xl text-center space-y-3.5 max-w-sm mx-4 pointer-events-auto relative z-50 transform animate-scale-up"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <Award className="w-7 h-7 animate-bounce" />
            </div>
            <h3 className="font-editorial text-2xl font-black text-navy-900 dark:text-white">
              BATCH {activeBatch} ALL OUT!
            </h3>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 text-xs font-black text-emerald-800 dark:text-emerald-300 shadow-xs mx-auto">
              <span>⏱️ Batch Survival: {matchTime.toFixed(1)}s (Regulation 30s–50s)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              All 3 defenders from <strong>Batch {activeBatch}</strong> dismissed one-by-one!
            </p>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-left">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Next Batch Entering Court
                </span>
                <span className="text-sm font-black text-navy-900 dark:text-white">
                  Batch {(activeBatch % 3) + 1}{' '}
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                    ({(activeBatch % 3) + 1 === 3 ? 'Chain & Round Pin' : '3-to-3 Format'})
                  </span>
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-editorial text-xl font-black flex items-center justify-center shrink-0 shadow-sm animate-pulse">
                {transitionCountdown}s
              </div>
            </div>
            <div className="pt-1 flex gap-2">
              <button
                type="button"
                onClick={handlePlayNextBatch}
                className="w-full btn-primary py-2.5 px-4 text-xs font-black justify-center shadow-lg shadow-orange-600/30 cursor-pointer select-none active:scale-95 transition-transform"
              >
                <span>Enter Next Batch Now (Batch {(activeBatch % 3) + 1}) ➔</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING BOTTOM INTERACTION CONTROLS */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute bottom-3 left-3 z-20 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={toggleMatchPause}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer select-none ${
            matchStatus === 'PLAYING'
              ? 'bg-white/95 dark:bg-slate-900/95 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white border-slate-200/90 dark:border-slate-800'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-emerald-600/30'
          }`}
          title={matchStatus === 'PLAYING' ? 'Pause Match Simulation' : 'Resume Match'}
        >
          {matchStatus === 'PLAYING' ? (
            <>
              <Pause className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
              <span>Pause Match</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white text-white" />
              <span>{matchStatus === 'ALL_OUT' || matchStatus === 'BATCH_TRANSITION' ? 'New Batch' : 'Play Match'}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleRestartMatch}
          className="px-2.5 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-800 text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer select-none"
          title="Restart Match Countdown"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Restart</span>
        </button>

        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/90 dark:border-slate-800 text-xs font-bold transition-all shadow-md cursor-pointer select-none"
          title={soundEnabled ? 'Mute Whistle & Audio' : 'Enable Match Whistle & Audio'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
        </button>
      </div>

      {/* DEFENDERS TRIO MINI-STATUS (Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 shadow-md">
        {activeBatch === 3 ? (
          <>
            <RotateCcw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-navy-900 dark:text-white">Chain &amp; Round Pin:</span>
          </>
        ) : (
          <>
            <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-navy-900 dark:text-white">3-to-3 Format:</span>
          </>
        )}
        <div className="flex items-center gap-1">
          {defendersStatus.map((d) => {
            const isTarget = currentTargetId === d.id && d.active && matchStatus === 'PLAYING';
            return (
              <span
                key={d.id}
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-black transition-all ${
                  d.active
                    ? isTarget
                      ? 'bg-amber-100 text-amber-900 ring-2 ring-amber-500 font-extrabold shadow-sm animate-pulse'
                      : activeBatch === 3
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 line-through opacity-60'
                }`}
                title={isTarget ? `Currently being chased one-by-one by the Chaser!` : d.active ? 'Actively running & evading' : 'Tagged OUT'}
              >
                {isTarget ? `🎯 ${d.name}` : d.name}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
