import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Target, Users, Award, PlayCircle, ChevronRight } from 'lucide-react';

export default function AboutKhoKhoSection() {
  const [activeTab, setActiveTab] = useState('rules'); // 'rules' | 'roles' | 'etiquette'

  const rulesList = [
    {
      title: '9 Court Players (The Playing Nine)',
      desc: 'Each team fields 9 players on court during a turn. For the chasing side, 8 players sit inside the cross-lane squares while 1 active chaser pursues the defenders.',
    },
    {
      title: 'Alternating Seating Direction',
      desc: 'Adjacent sitting chasers must face opposite directions across the center line. This prevents unfair blockage and demands sharp visual coordination.',
    },
    {
      title: 'Defenders in 3-Player Batches',
      desc: 'The defending team sends in runners in batches of three. When all three defenders in a batch are tagged, the next batch enters the court immediately.',
    },
    {
      title: 'The "Kho" Call & Back Touch',
      desc: 'An active chaser passes pursuit priority to a teammate by firmly tapping them on the back and audibly calling "Kho". The tapped player then rises and continues the chase.',
    },
    {
      title: 'Center Line & Pole Turning Law',
      desc: 'An active chaser cannot cross the central dividing line while chasing directly across squares. To change sides, they must run around either of the two wooden poles at the court ends.',
    },
    {
      title: 'Turn Duration & Inning Format',
      desc: 'A standard regulation Kho-Kho match comprises two innings. Each inning consists of chasing and defending turns of 9 minutes each, with timed tactical intervals.',
    },
  ];

  const playerRoles = [
    {
      name: 'Active Chaser',
      badge: 'Speed & Agility',
      desc: 'The player currently pursuing the defenders. Needs explosive acceleration, peripheral vision, and rapid directional cutting around the poles.',
    },
    {
      name: 'Pole Diver',
      badge: 'Specialist Tagger',
      desc: 'Specialized chaser renowned for airborne diving tags around the wooden poles, catching elusive defenders at the edge of the free zone.',
    },
    {
      name: 'Running Defender',
      badge: 'Evasion & Endurance',
      desc: 'Enters the court in a trio to evade the active chasers. Utilizes feints, deceptive zigzag footwork, and tactical positioning behind sitting chasers.',
    },
    {
      name: 'All-Rounder',
      badge: 'Versatile Core',
      desc: 'Athletes proficient in both defending batches and swift chasing rotations, maintaining team momentum through both halves of the match.',
    },
  ];

  return (
    <section id="about-kho-kho" className="py-20 md:py-28 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-50 border border-saffron-200 text-saffron-700 text-xs font-bold uppercase tracking-wider mb-3">
            Heritage & Modern Regulations
          </div>
          <h2 className="font-editorial text-3xl sm:text-5xl font-black text-navy-900 tracking-tight">
            The Science & Art of Kho-Kho
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            One of India's oldest and most dynamic traditional sports, modern competitive Kho-Kho is an electrifying contest of explosive sprinting, strategic evasion, and telepathic teamwork.
          </p>

          {/* Interactive Navigation Tabs */}
          <div className="flex items-center justify-center gap-2 mt-8 p-1.5 rounded-2xl bg-slate-100 max-w-md mx-auto">
            <button
              type="button"
              onClick={() => setActiveTab('rules')}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'rules'
                  ? 'bg-white text-saffron-600 shadow-sm'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              Regulation Rules
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('roles')}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'roles'
                  ? 'bg-white text-saffron-600 shadow-sm'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              Specialist Roles
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('etiquette')}
              className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'etiquette'
                  ? 'bg-white text-saffron-600 shadow-sm'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              Sportsmanship
            </button>
          </div>
        </div>

        {/* Tab Content 1: Rules */}
        {activeTab === 'rules' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rulesList.map((rule, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="card-premium p-6 hover:border-saffron-300 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-saffron-100 text-saffron-700 font-editorial font-black text-sm flex items-center justify-center mb-4">
                  0{idx + 1}
                </div>
                <h3 className="font-editorial text-lg font-bold text-navy-900 mb-2">{rule.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{rule.desc}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tab Content 2: Player Roles */}
        {activeTab === 'roles' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {playerRoles.map((role, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="card-premium p-6 flex flex-col justify-between"
              >
                <div>
                  <span className="badge-tag bg-amber-100 text-amber-800 mb-3">{role.badge}</span>
                  <h3 className="font-editorial text-xl font-bold text-navy-900 mb-2">{role.name}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{role.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-saffron-600 font-bold">
                  <span>Tracked in Roster</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tab Content 3: Sportsmanship & Culture */}
        {activeTab === 'etiquette' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-premium p-8 max-w-4xl mx-auto space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-navy-900 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-sportsGreen-dark" />
                  Fair Play & Respect
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Kho-Kho strictly emphasizes non-violent, respectful contact. Violent pushing, shirt-pulling, or deliberate tripping results in immediate penalty fouls and warning cards.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-navy-900 mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-saffron-600" />
                  Batch Unity
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Defending trios must move in tight synchronized coordination. Mutual trust between defenders saves vital seconds and frustrates opposing chasers.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <h4 className="font-bold text-navy-900 mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  Referee Reverence
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Decisions made by the umpires, referee, and timekeeper are accepted with humility, preserving the noble heritage of indigenous Indian sportsmanship.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
