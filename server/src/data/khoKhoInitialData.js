/**
 * Kho-Kho Arena Initial Demonstration & Fallback Dataset
 * Covers Tutorials, Match Highlights, Player Performance, Team Stats & Daily Practice Drills.
 */
import { OFFICIAL_BOYS_ROSTER, OFFICIAL_GIRLS_ROSTER } from '../config/roster.js';

export const initialTutorialVideos = [
  {
    id: "tut-1",
    title: "Official Kho-Kho Rules, Court Dimensions & Field Markings",
    description: "Comprehensive guide to standard Kho-Kho court dimensions (27m x 16m), central lane, 8 cross-lanes, free zones, poles, and fundamental scoring regulations.",
    level: "BEGINNER",
    category: "RULES",
    videoUrl: "https://www.youtube.com/embed/s52490M_wLQ",
    thumbnailUrl: "https://img.youtube.com/vi/s52490M_wLQ/hqdefault.jpg",
    duration: "06:45",
    skills: ["Court Dimensions", "Central Lane Rules", "Foul Calling", "Free Zone Movement"],
    order: 1,
    views: 1420,
    likes: 215,
    author: "Head Coach Dhyanesh"
  },
  {
    id: "tut-2",
    title: "Chasing Fundamentals: Master the Instant 'KHO!' Touch & Voice Call",
    description: "Learn how to sit in alternating squares with optimal posture, call 'KHO!' loudly while touching the back, and explode into the active chase line without stepping foul.",
    level: "BEGINNER",
    category: "CHASING",
    videoUrl: "https://www.youtube.com/embed/TDc-_snVlUY",
    thumbnailUrl: "https://img.youtube.com/vi/TDc-_snVlUY/hqdefault.jpg",
    duration: "08:12",
    skills: ["Alternating Sitting Posture", "Back Touch Release", "Immediate Acceleration", "Foul Prevention"],
    order: 2,
    views: 1890,
    likes: 310,
    author: "Coach Muthuvel Raja"
  },
  {
    id: "tut-3",
    title: "Defensive Mastery: The Official 3-to-3 Chain Running System",
    description: "Master the 3-to-3 chain running format where defenders move in synchronized batch trios, crossing squares strategically to keep chasers divided across the central line.",
    level: "INTERMEDIATE",
    category: "CHAIN_KHO",
    videoUrl: "https://www.youtube.com/embed/XkquHjDtSQs",
    thumbnailUrl: "https://img.youtube.com/vi/XkquHjDtSQs/hqdefault.jpg",
    duration: "11:30",
    skills: ["3-to-3 Batch Formation", "Central Line Crossing", "Triangle Defense", "Patience Under Pressure"],
    order: 3,
    views: 2450,
    likes: 450,
    author: "Coach Keerthana"
  },
  {
    id: "tut-4",
    title: "Advanced Pole Diving: The Flat Tap & Sky Dive Breakdown",
    description: "Step-by-step biomechanics of turning around the wooden pole at maximum centrifugal speed and launching a horizontal sky dive to dismiss running defenders.",
    level: "ADVANCED",
    category: "POLE_DIVING",
    videoUrl: "https://www.youtube.com/embed/aQqgIdg_v-k",
    thumbnailUrl: "https://img.youtube.com/vi/aQqgIdg_v-k/hqdefault.jpg",
    duration: "09:15",
    skills: ["Pole Grip Pivot", "Centrifugal Acceleration", "Airborne Extension", "Safe Landing Roll"],
    order: 4,
    views: 3120,
    likes: 580,
    author: "Head Coach Dhyanesh"
  },
  {
    id: "tut-5",
    title: "Chasing Tactics: Sudden Judgment Turning & Fake Kho Traps",
    description: "Deceive active defenders using sudden judgment turns, fake shoulder feints, and unexpected long-range dives to breach defensive chains.",
    level: "INTERMEDIATE",
    category: "CHASING",
    videoUrl: "https://www.youtube.com/embed/bdZgFuWf-9o",
    thumbnailUrl: "https://img.youtube.com/vi/bdZgFuWf-9o/hqdefault.jpg",
    duration: "07:40",
    skills: ["Judgment Turn Timing", "Shoulder Deception", "Blind Spot Hunting", "Low Body Center"],
    order: 5,
    views: 1670,
    likes: 290,
    author: "Coach Muthuvel Raja"
  },
  {
    id: "tut-6",
    title: "Ring Game Strategy: Circular Evasion & Clock-Draining Defense",
    description: "How solo defenders stay alive on the court for 3+ minutes through circular ring patterns, forcing chasers into wasteful Kho transfers.",
    level: "ADVANCED",
    category: "DEFENSE",
    videoUrl: "https://www.youtube.com/embed/_AyEjxYwY2U",
    thumbnailUrl: "https://img.youtube.com/vi/_AyEjxYwY2U/hqdefault.jpg",
    duration: "10:05",
    skills: ["Ring Footwork", "Clock Management", "Fake Reverse Steps", "Mental Endurance"],
    order: 6,
    views: 2840,
    likes: 495,
    author: "Coach Keerthana"
  },
  {
    id: "tut-7",
    title: "Explosive Footwork: Low-Stance Sprint & Deceleration Drills",
    description: "Sprint mechanics tailored specifically for the loose clay/synthetic Kho-Kho ground. Maximize friction, protect ankles, and execute sharp 90-degree cuts.",
    level: "BEGINNER",
    category: "RUNNING",
    videoUrl: "https://www.youtube.com/embed/GkjSyD9LFGQ",
    thumbnailUrl: "https://img.youtube.com/vi/GkjSyD9LFGQ/hqdefault.jpg",
    duration: "06:20",
    skills: ["Low Stance Center", "Clay Grip Cutting", "Braking Mechanics", "Fast Turnover"],
    order: 7,
    views: 1980,
    likes: 340,
    author: "Head Coach Dhyanesh"
  },
  {
    id: "tut-8",
    title: "Batch Rotation & 30-Second Entry Protocol in Official Matches",
    description: "Detailed breakdown of the 30-second rule: entry coordination of the next 3 runners when a batch is dismissed, preventing entry fouls and penalties.",
    level: "ADVANCED",
    category: "CHAIN_KHO",
    videoUrl: "https://www.youtube.com/embed/blNPfp_D4YM",
    thumbnailUrl: "https://img.youtube.com/vi/blNPfp_D4YM/hqdefault.jpg",
    duration: "08:50",
    skills: ["30-Second Entry Clock", "Runner Sequence Strategy", "Referee Signaling", "Bench Sync"],
    order: 8,
    views: 2210,
    likes: 385,
    author: "Coaching Staff"
  }
];

export const initialMatchHighlights = [
  {
    id: "match-hl-1",
    title: "Ultimate Kho Kho Championship: Super Clashes & Top Sky Dives",
    description: "An electrifying championship fixture highlighting modern Kho-Kho power plays, sky dives, and synchronized 3-to-3 chain running.",
    tournament: "Ultimate Kho Kho Season 2026",
    team1: "Boys Squad (Our Team)",
    team2: "Tamil Nadu Titans",
    score1: 48,
    score2: 38,
    division: "BOYS",
    matchDate: "2026-11-15T15:30:00.000Z",
    venue: "Jawaharlal Nehru Indoor Stadium, Chennai",
    videoUrl: "https://www.youtube.com/embed/twUjb7B_qoA",
    thumbnailUrl: "https://img.youtube.com/vi/twUjb7B_qoA/hqdefault.jpg",
    duration: "14:22",
    mvpPlayer: "S.E.D (#10)",
    featuredPlayers: ["S.E.D", "VIMAL.S", "MOHAN"],
    keyMoments: [
      { time: "02:15", description: "VIMAL.S initiates with 4 quick outs in first 90 seconds" },
      { time: "07:45", description: "S.E.D executes sensational horizontal pole dive" },
      { time: "11:20", description: "Unbroken 3m 45s Dream Run defense by Batch 1" },
      { time: "13:50", description: "Final whistle buzzer beater out sealing championship gold" }
    ],
    views: 3840
  },
  {
    id: "match-hl-2",
    title: "National Trophy Showcase: Epic 5-Minute Defensive Dream Run",
    description: "A defensive masterclass as Batch 2 survives for a staggering 5 minutes and 12 seconds, setting a tournament defensive record.",
    tournament: "All-India National Trophy 2026",
    team1: "Girls Squad (Our Team)",
    team2: "Western Warriors",
    score1: 42,
    score2: 34,
    division: "GIRLS",
    matchDate: "2026-11-08T17:00:00.000Z",
    venue: "Kalinga Sports Complex, Bhubaneswar",
    videoUrl: "https://www.youtube.com/embed/T_2lYkicR7c",
    thumbnailUrl: "https://img.youtube.com/vi/T_2lYkicR7c/hqdefault.jpg",
    duration: "16:40",
    mvpPlayer: "KEERTHANA (#1)",
    featuredPlayers: ["KEERTHANA", "SABIKSHA", "ATSHAYA"],
    keyMoments: [
      { time: "01:30", description: "SABIKSHA clean zigzag evasion across squares 3 & 4" },
      { time: "08:10", description: "KEERTHANA sets 5m 12s single-turn defensive survival record" },
      { time: "14:05", description: "Rapid counter-chase yields 12 points in under 3 minutes" }
    ],
    views: 4210
  },
  {
    id: "match-hl-3",
    title: "Picture Perfect Pole Dives Compilation | Ultimate Kho Kho",
    description: "High-tempo professional league showcase highlighting modern Kho-Kho power plays, sky dives, and synchronized 3-to-3 chain running.",
    tournament: "National Super League Showcase",
    team1: "Super Chasers",
    team2: "Iron Defenders",
    score1: 56,
    score2: 52,
    division: "COMBINED",
    matchDate: "2026-10-24T18:30:00.000Z",
    venue: "Indira Gandhi Indoor Arena, New Delhi",
    videoUrl: "https://www.youtube.com/embed/aQqgIdg_v-k",
    thumbnailUrl: "https://img.youtube.com/vi/aQqgIdg_v-k/hqdefault.jpg",
    duration: "12:15",
    mvpPlayer: "HARSHAD (#5)",
    featuredPlayers: ["HARSHAD", "KARAN", "JEEVA"],
    keyMoments: [
      { time: "03:40", description: "Triple sky dive sequence by attacking chasers" },
      { time: "09:12", description: "Ring game deadlock broken by judgment line fake" }
    ],
    views: 5120
  },
  {
    id: "match-hl-4",
    title: "Ultimate Kho Kho League High-Octane Championship Clash",
    description: "Dominant 50-point offensive rout with flawless Kho calling and lightning pole turnouts.",
    tournament: "South Zone Inter-Collegiate Clash",
    team1: "Boys Squad (Our Team)",
    team2: "Southern Strikers",
    score1: 50,
    score2: 32,
    division: "BOYS",
    matchDate: "2026-10-12T14:00:00.000Z",
    venue: "Marina Sports Ground, Chennai",
    videoUrl: "https://www.youtube.com/embed/rrkaD6wD48M",
    thumbnailUrl: "https://img.youtube.com/vi/rrkaD6wD48M/hqdefault.jpg",
    duration: "11:55",
    mvpPlayer: "VIMAL.S (#7)",
    featuredPlayers: ["VIMAL.S", "SANJAY", "KISHOR"],
    keyMoments: [
      { time: "02:00", description: "Blistering first-turn shutout of Batch 1" },
      { time: "06:30", description: "Direct cross-lane intercept tap by SANJAY" }
    ],
    views: 2950
  }
];

const buildPerformanceRecord = (p) => {
  const isBoys = p.team === 'BOYS';
  
  // Custom stats matching position
  let outs = 40 + (p.jersey % 7) * 4;
  let defs = 30 + (p.jersey % 5) * 5;
  let defSec = 1800 + (p.jersey % 6) * 240;
  let divePct = 88.0 + (p.jersey % 5) * 1.5;
  let turnPct = 89.0 + (p.jersey % 4) * 1.8;
  let rating = parseFloat((9.0 + ((25 - p.jersey) % 9) * 0.1).toFixed(1));

  if (p.pos === 'Pole Diver') {
    outs = 60 + (p.jersey % 5) * 4;
    divePct = 93.0 + (p.jersey % 3) * 1.2;
    rating = Math.min(9.8, parseFloat((9.3 + (p.jersey % 5) * 0.1).toFixed(1)));
  } else if (p.pos === 'Defender') {
    defs = 45 + (p.jersey % 6) * 3;
    defSec = 2600 + (p.jersey % 5) * 180;
    turnPct = 94.0 + (p.jersey % 3) * 1.0;
    rating = Math.min(9.7, parseFloat((9.1 + (p.jersey % 6) * 0.1).toFixed(1)));
  } else if (p.pos === 'All-Rounder') {
    outs = 55 + (p.jersey % 6) * 3;
    defs = 40 + (p.jersey % 5) * 3;
    rating = Math.min(9.8, parseFloat((9.2 + (p.jersey % 5) * 0.1).toFixed(1)));
  }

  // Standout ratings for team leaders
  if (p.username === 's.e.d') {
    rating = 9.8;
    outs = 78;
    defs = 42;
  } else if (p.username === 'keerthana') {
    rating = 9.7;
    outs = 54;
    defs = 58;
  } else if (p.username === 'vimal.s') {
    rating = 9.6;
    outs = 71;
    defs = 35;
  } else if (p.username === 'mohan') {
    rating = 9.5;
    outs = 68;
    defs = 32;
  } else if (p.username === 'sabiksha') {
    rating = 9.4;
    outs = 48;
    defs = 52;
  }

  const opp1 = isBoys ? 'Tamil Nadu Titans' : 'Western Warriors';
  const opp2 = isBoys ? 'Southern Strikers' : 'Northern Stars';

  return {
    id: `perf-${p.id.toLowerCase()}`,
    playerId: p.id,
    name: p.name,
    jerseyNumber: p.jersey,
    team: p.team,
    position: p.pos,
    photoUrl: "",
    matchesPlayed: 24 + (p.jersey % 5),
    matchesParticipated: 24 + (p.jersey % 5),
    defendersEliminated: outs,
    successfulDefenses: defs,
    defenseTimeSec: defSec,
    diveSuccessPct: divePct,
    turnAccuracyPct: turnPct,
    rating,
    form: ["W", "W", (p.jersey % 2 === 0 ? "W" : "L"), "W", "W"],
    isVerified: true,
    recentMatchStats: [
      { opponent: opp1, outs: Math.max(2, Math.floor(outs / 10)), defenseMin: `${Math.floor(defSec / 600)}m ${defSec % 60}s`, dives: 3, rating },
      { opponent: opp2, outs: Math.max(1, Math.floor(outs / 12)), defenseMin: `${Math.floor(defSec / 700)}m 10s`, dives: 2, rating: Math.max(8.0, parseFloat((rating - 0.2).toFixed(1))) }
    ]
  };
};

export const initialPlayerPerformance = [
  ...OFFICIAL_BOYS_ROSTER.map((p) => buildPerformanceRecord(p)),
  ...OFFICIAL_GIRLS_ROSTER.map((p) => buildPerformanceRecord(p)),
];

export const initialTeamPerformance = [
  {
    team: "BOYS",
    matchesPlayed: 32,
    won: 28,
    lost: 3,
    tied: 1,
    winPercentage: 87.5,
    ranking: 1,
    totalPointsScored: 1420,
    pointsConceded: 980,
    history: [
      { opponent: "Tamil Nadu Titans", result: "WON", score: "48 - 38", date: "2026-11-15" },
      { opponent: "Southern Strikers", result: "WON", score: "50 - 32", date: "2026-10-12" },
      { opponent: "Deccan Eagles", result: "WON", score: "44 - 36", date: "2026-09-28" },
      { opponent: "Mumbai Marauders", result: "LOST", score: "39 - 41", date: "2026-09-14" },
      { opponent: "Bengal Blitzers", result: "WON", score: "46 - 30", date: "2026-08-30" }
    ]
  },
  {
    team: "GIRLS",
    matchesPlayed: 28,
    won: 25,
    lost: 2,
    tied: 1,
    winPercentage: 89.3,
    ranking: 1,
    totalPointsScored: 1260,
    pointsConceded: 840,
    history: [
      { opponent: "Western Warriors", result: "WON", score: "42 - 34", date: "2026-11-08" },
      { opponent: "Northern Stars", result: "WON", score: "45 - 28", date: "2026-10-20" },
      { opponent: "Coastal Queens", result: "WON", score: "40 - 31", date: "2026-10-02" },
      { opponent: "Central Challengers", result: "LOST", score: "36 - 38", date: "2026-09-19" },
      { opponent: "Southern Sapphires", result: "WON", score: "43 - 26", date: "2026-09-05" }
    ]
  }
];

export const initialPracticeTasks = [
  {
    id: "drill-1",
    name: "Shuttle Sprint & Quick Deceleration Bursts",
    description: "High-intensity sprint drills simulating chasing lines and sudden 180-degree pole turn stops.",
    instructions: [
      "Set 4 cones 7 meters apart matching Kho-Kho cross-lane distances.",
      "Sprint to Cone 1 at 100% effort, drop body center of mass, tap ground.",
      "Backpedal 3.5 meters, immediately explode forward to Cone 2.",
      "Repeat 6 reps per set with 45s rest."
    ],
    category: "RUNNING",
    difficulty: "BEGINNER",
    durationMinutes: 15,
    skillsDeveloped: ["Sprint Acceleration", "Low Center of Gravity", "Rapid Deceleration", "Ankle Strength"],
    targetReps: "4 sets x 6 reps",
    restPeriodSec: 45,
    intensity: "HIGH",
    order: 1
  },
  {
    id: "drill-2",
    name: "Zigzag Ladder Agility & Lateral Footwork",
    description: "Rapid footwork ladder drills designed to enhance defender evasive maneuvers and dodge agility.",
    instructions: [
      "Lay out standard speed agility ladder or mark chalk lines on court.",
      "Perform two-in-two-out lateral shuffle through all 10 rungs.",
      "Immediately transition into diagonal zigzag cut around 3 markers.",
      "Maintain eyes forward, knees flexed, light on the balls of your feet."
    ],
    category: "SPEED_AGILITY",
    difficulty: "BEGINNER",
    durationMinutes: 20,
    skillsDeveloped: ["Footwork Quickness", "Lateral Mobility", "Reaction Reflex", "Balance Control"],
    targetReps: "5 sets x 4 rounds",
    restPeriodSec: 30,
    intensity: "MEDIUM",
    order: 2
  },
  {
    id: "drill-3",
    name: "3-to-3 Synchronized Chain Movement Drill",
    description: "Defensive trio simulation where runners coordinate square crossings to keep chasers separated.",
    instructions: [
      "Form a 3-player batch: Runner 1 (Anchor), Runner 2 (Bridge), Runner 3 (Scout).",
      "On coach's whistle, move synchronously across squares 2, 4, and 6.",
      "Anchor dictates lane switch while Bridge covers the central line flank.",
      "Practice switching directions simultaneously without bumping or colliding."
    ],
    category: "CHAIN_KHO",
    difficulty: "INTERMEDIATE",
    durationMinutes: 25,
    skillsDeveloped: ["Batch Spatial Awareness", "Chain Communication", "Central Line Defense", "Patience"],
    targetReps: "6 sets x 3 mins",
    restPeriodSec: 60,
    intensity: "HIGH",
    order: 3
  },
  {
    id: "drill-4",
    name: "Centrifugal Pole-Pivot & Sky Dive Practice",
    description: "Mat-assisted pole diving drill focusing on centrifugal whip acceleration and soft, rolling landings.",
    instructions: [
      "Place high-density safety mats around the pole base.",
      "Approach the pole at 70% speed from the outer sideline angle.",
      "Lock inner arm around the wooden pole, pivot 180 degrees using centrifugal force.",
      "Launch body horizontally forward, extend leading hand for tag target, execute chest-to-shoulder roll on mat."
    ],
    category: "POLE_DIVING",
    difficulty: "INTERMEDIATE",
    durationMinutes: 25,
    skillsDeveloped: ["Centrifugal Speed Whip", "Horizontal Flight Length", "Soft Roll Landing", "Core Explosion"],
    targetReps: "4 sets x 8 dives",
    restPeriodSec: 60,
    intensity: "EXTREME",
    order: 4
  },
  {
    id: "drill-5",
    name: "Judgment Turn & Fake Kho Release Drills",
    description: "Sharpen chaser decision-making when selecting which defender to chase upon touching a sitting teammate.",
    instructions: [
      "2 defenders positioned in squares 3 and 6, moving unpredictably.",
      "Chaser gives 'KHO!' to sitting player 4 with sudden vocal emphasis.",
      "Newly released chaser must read defender hips in 0.3 seconds and commit to the open flank.",
      "Incorporate shoulder feint to bait defender into turning the wrong way."
    ],
    category: "CHASING",
    difficulty: "INTERMEDIATE",
    durationMinutes: 20,
    skillsDeveloped: ["Visual Reading of Defender Hips", "0.3s Decision Reaction", "Vocal KHO Timing", "Shoulder Deception"],
    targetReps: "5 sets x 6 releases",
    restPeriodSec: 45,
    intensity: "HIGH",
    order: 5
  },
  {
    id: "drill-6",
    name: "Whistle-Drop Sprint & Blind Reaction Reflex",
    description: "Neuro-muscular quickness drill where players react instantly to auditory cues from a back-turned stance.",
    instructions: [
      "Athletes face away from the coach in an athletic low squat stance.",
      "Coach blows whistle (High pitch = Left sprint, Low pitch = Right sprint, Double whistle = Drop dive).",
      "Player must pivot 180 degrees and cover 5 meters under 1.1 seconds.",
      "Focus on eliminating wasted false steps before driving forward."
    ],
    category: "REACTION_TIME",
    difficulty: "BEGINNER",
    durationMinutes: 15,
    skillsDeveloped: ["Auditory Reflex", "Zero-False-Step Acceleration", "Peripheral Awareness", "Mental Sharpness"],
    targetReps: "4 sets x 8 triggers",
    restPeriodSec: 30,
    intensity: "HIGH",
    order: 6
  },
  {
    id: "drill-7",
    name: "Ring Game Multi-Chaser Evasion Tactics",
    description: "Endurance-heavy evasion practice forcing defenders to navigate small circular orbits under heavy pressure.",
    instructions: [
      "Define a 6m x 6m circular zone around squares 4 and 5.",
      "Single defender enters; 2 chasers cycle active pursuit every 20 seconds.",
      "Defender must remain in continuous rhythm, using quick change-of-pace stops.",
      "Goal: Survive 2 minutes without stepping out of bounds or being tagged."
    ],
    category: "DEFENSIVE",
    difficulty: "ADVANCED",
    durationMinutes: 30,
    skillsDeveloped: ["Anaerobic Stamina", "Tight Orbit Footwork", "Pressure Resistance", "Body Control"],
    targetReps: "4 sets x 2 mins survival",
    restPeriodSec: 90,
    intensity: "EXTREME",
    order: 7
  },
  {
    id: "drill-8",
    name: "Batch Handoff Communication & Whistle Call Sync",
    description: "Full team coordination drill syncing sitting chasers, active chaser, and coach tactical signals.",
    instructions: [
      "All 8 sitting chasers practice rhythmic tapping and audible vocal echo ('KHO!').",
      "Active chaser calls out flank instructions before diving.",
      "Substitute bench athletes track stopwatch and signal 30s defender countdown.",
      "Builds unmatched on-court synergy and team telepathy under championship stress."
    ],
    category: "TEAM_COORDINATION",
    difficulty: "ADVANCED",
    durationMinutes: 25,
    skillsDeveloped: ["Bench-to-Court Vocal Synergy", "Tactical Audible Calling", "Match Stress Management", "Team Unity"],
    targetReps: "3 full match simulation sets",
    restPeriodSec: 90,
    intensity: "HIGH",
    order: 8
  }
];
