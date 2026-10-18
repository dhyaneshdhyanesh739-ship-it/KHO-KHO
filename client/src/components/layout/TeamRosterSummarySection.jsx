import React from 'react';
import { Users, Trophy, Shield, ArrowRight, UserCheck, Flame } from 'lucide-react';

export default function TeamRosterSummarySection({ onOpenLogin }) {
  const teams = [
    {
      id: 'BOYS',
      name: 'Boys Kho-Kho Squad',
      title: 'The Chhatrapati Chasers',
      rosterCount: 23,
      squadLimit: 15,
      headCoach: 'Coach Dhyanesh.S.E & MuthuvelRaja.S',
      badgeColor: 'bg-saffron-100 text-saffron-800 border-saffron-200',
      gradient: 'from-orange-50/60 to-white',
      accentColor: 'text-saffron-600',
      tagline: 'Precision Pole Turns & Blistering Zigzag Footwork',
      stats: [
        { label: 'Active Roster', val: '23 Athletes' },
        { label: 'Match Squad', val: '15 Max' },
        { label: 'Defensive Units', val: '7 Batches' },
      ],
      description: 'The Boys team brings explosive pole velocity and aggressive chasing depth. Rigorous morning sprint drills ensure every chaser maintains high-speed turnaround endurance.',
    },
    {
      id: 'GIRLS',
      name: 'Girls Kho-Kho Squad',
      title: 'The Sahyadri Strikers',
      rosterCount: 18,
      squadLimit: 14,
      headCoach: 'Coach Keerthana',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      gradient: 'from-rose-50/60 to-white',
      accentColor: 'text-rose-600',
      tagline: 'Synchronized Evasion & High-Agility Batch Running',
      stats: [
        { label: 'Active Roster', val: '18 Athletes' },
        { label: 'Match Squad', val: '14 Max' },
        { label: 'Defensive Units', val: '6 Batches' },
      ],
      description: 'Renowned for razor-sharp peripheral anticipation and prolonged batch survival times, the Girls team exemplifies strategic patience, evasion discipline, and tactical communication.',
    },
  ];

  return (
    <section id="teams" className="py-20 md:py-28 bg-court-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200 text-navy-800 text-xs font-bold uppercase tracking-wider mb-3">
            Two Strong Divisions • One Collective Arena
          </div>
          <h2 className="font-editorial text-3xl sm:text-5xl font-black text-navy-900 tracking-tight">
            Our Championship Contingents
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Boys and Girls teams operate on independent training regimens, customized squad size limits, and isolated administrative management portals.
          </p>
        </div>

        {/* 2 Big Team Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {teams.map((t) => (
            <div
              key={t.id}
              className={`rounded-3xl p-8 border border-slate-200 bg-gradient-to-b ${t.gradient} shadow-card hover:shadow-xl transition-all duration-300 flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-6">
                  <span className={`badge-tag border ${t.badgeColor}`}>
                    {t.id} Division
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {t.title}
                  </span>
                </div>

                <h3 className="font-editorial text-2xl sm:text-3xl font-black text-navy-900 mb-2">
                  {t.name}
                </h3>
                <p className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${t.accentColor} mb-4`}>
                  {t.tagline}
                </p>

                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {t.description}
                </p>

                {/* Team Stats Matrix */}
                <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm mb-6">
                  {t.stats.map((s, idx) => (
                    <div key={idx} className="text-center">
                      <p className="font-editorial text-base sm:text-lg font-bold text-navy-900">{s.val}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{s.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-6">
                  <UserCheck className="w-4 h-4 text-sportsGreen-dark" />
                  <span>Head Coach: <strong className="text-navy-900">{t.headCoach}</strong></span>
                </div>
              </div>

              {/* Login / Portal Link */}
              <button
                type="button"
                onClick={onOpenLogin}
                className="w-full btn-secondary py-3 text-sm justify-between group border-slate-300 hover:border-slate-400"
              >
                <span>Enter {t.id === 'BOYS' ? 'Boys' : 'Girls'} Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
