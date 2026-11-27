import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Flame, Video, Trophy, Users, Shield, Target,
  Play, CheckCircle2, ChevronRight, Award, Star, Activity, Sparkles,
  TrendingUp, Calendar, Zap, ArrowRight, X
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';

export default function InteractivePublicDashboard({ onNavigateSection, onOpenLogin }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeVideoModal, setActiveVideoModal] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.dashboard.getStats();
        if (res && res.data) {
          setDashboardData(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const summary = dashboardData?.summary || {
    totalTutorials: 8,
    totalHighlights: 4,
    totalDrills: 8,
    totalAthletes: 16,
    boysWinRate: '87.5%',
    girlsWinRate: '89.3%',
  };

  const recentTutorials = dashboardData?.recentTutorials || [];
  const recentHighlights = dashboardData?.recentHighlights || [];
  const topPerformers = dashboardData?.topPerformers || [];
  const achievements = dashboardData?.achievements || [];
  const weeklyActivityTrend = dashboardData?.weeklyActivityTrend || [];

  return (
    <section id="interactive-hub" className="py-20 bg-white border-b border-slate-200/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-50 border border-saffron-200 text-saffron-700 text-xs font-bold uppercase tracking-wider">
              <LayoutDashboard className="w-3.5 h-3.5 text-saffron-600" />
              <span>Unified Kho-Kho Athletic Hub</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl font-black text-navy-900 tracking-tight">
              Interactive <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-600 to-amber-500">Live Dashboard</span>
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Consolidated center bringing together daily practice conditioning, fresh masterclasses, match highlights, player ratings, and championship milestones.
            </p>
          </div>

          {/* Quick Jump Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigateSection && onNavigateSection('learn-kho-kho')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              Academy Videos →
            </button>
            <button
              type="button"
              onClick={() => onNavigateSection && onNavigateSection('player-performance')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              Player Records →
            </button>
            <button
              type="button"
              onClick={() => onNavigateSection && onNavigateSection('daily-practice')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold btn-primary cursor-pointer shadow-sm"
            >
              Start Daily Practice 🔥
            </button>
          </div>
        </div>

        {/* 4 Big KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          <div className="bg-court-sand/60 rounded-3xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Tutorial Videos</span>
              <Video className="w-4 h-4 text-saffron-600" />
            </div>
            <p className="font-editorial text-3xl font-black text-navy-900">{summary.totalTutorials}</p>
            <p className="text-[11px] text-slate-500 mt-1">Rules, Pole Dives &amp; Evasion</p>
          </div>

          <div className="bg-court-sand/60 rounded-3xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Match Highlights</span>
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <p className="font-editorial text-3xl font-black text-navy-900">{summary.totalHighlights}</p>
            <p className="text-[11px] text-slate-500 mt-1">State &amp; National Finals</p>
          </div>

          <div className="bg-court-sand/60 rounded-3xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Boys Squad Win Rate</span>
              <Zap className="w-4 h-4 text-saffron-600" />
            </div>
            <p className="font-editorial text-3xl font-black text-saffron-600">{summary.boysWinRate}</p>
            <p className="text-[11px] text-slate-500 mt-1">State Champions #1 Rank</p>
          </div>

          <div className="bg-court-sand/60 rounded-3xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500">Girls Squad Win Rate</span>
              <Shield className="w-4 h-4 text-rose-500" />
            </div>
            <p className="font-editorial text-3xl font-black text-rose-600">{summary.girlsWinRate}</p>
            <p className="text-[11px] text-slate-500 mt-1">5m 12s Dream Run Record</p>
          </div>
        </div>

        {/* Dashboard 2-Column Core: Left = Recent Tutorials + Match Highlights, Right = Top Athletes + Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Left Column (8 cols): Training Progress Chart + Recent Videos */}
          <div className="lg:col-span-7 space-y-8">
            {/* Weekly Training Volume Chart */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-editorial text-lg font-bold text-navy-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-saffron-600" />
                    <span>Weekly Practice Volume &amp; Attack Drills</span>
                  </h3>
                  <p className="text-xs text-slate-500">Total practice minutes logged across all squad athletes</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  +18% Peak Form
                </span>
              </div>

              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyActivityTrend}>
                    <defs>
                      <linearGradient id="dashVol" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ea580c" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                    />
                    <Area type="monotone" dataKey="defenseMins" name="Defense Minutes" stroke="#ea580c" strokeWidth={2.5} fillOpacity={1} fill="url(#dashVol)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Fresh Masterclass Tutorials */}
            <div className="bg-court-sand/30 rounded-3xl p-6 border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-editorial text-lg font-bold text-navy-900 flex items-center gap-2">
                  <Video className="w-4 h-4 text-saffron-600" />
                  <span>Recently Uploaded Tutorials</span>
                </h3>
                <button
                  type="button"
                  onClick={() => onNavigateSection && onNavigateSection('learn-kho-kho')}
                  className="text-xs font-bold text-saffron-600 hover:text-saffron-700 flex items-center gap-0.5 cursor-pointer"
                >
                  <span>View All</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentTutorials.slice(0, 2).map((tut) => (
                  <div
                    key={tut.id}
                    onClick={() => setActiveVideoModal(tut)}
                    className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="relative aspect-video bg-black overflow-hidden">
                      <img
                        src={tut.thumbnailUrl}
                        alt={tut.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-9 h-9 rounded-full bg-saffron-500 text-white flex items-center justify-center shadow-md">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
                        {tut.duration}
                      </span>
                    </div>
                    <div className="p-3.5">
                      <span className="text-[10px] font-black uppercase text-saffron-600">{tut.level}</span>
                      <p className="font-bold text-xs text-navy-900 line-clamp-1 mt-0.5 group-hover:text-saffron-600">
                        {tut.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Top Athletes Spotlight + Weekly Achievements */}
          <div className="lg:col-span-5 space-y-6">
            {/* Top Athletes Spotlight */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-editorial text-lg font-bold text-navy-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Top Player Spotlights</span>
                </h3>
                <button
                  type="button"
                  onClick={() => onNavigateSection && onNavigateSection('player-performance')}
                  className="text-xs font-bold text-saffron-600 hover:text-saffron-700 flex items-center gap-0.5 cursor-pointer"
                >
                  <span>Leaderboard</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3">
                {topPerformers.slice(0, 3).map((player, pIdx) => (
                  <div
                    key={player.id || pIdx}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-navy-900">{player.name}</p>
                        <span className="text-[10px] font-black text-amber-600">#{player.jerseyNumber}</span>
                      </div>
                      <p className="text-[10px] text-slate-500">{player.position}</p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs font-black text-amber-600 justify-end">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        <span>{player.rating}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold">{player.defendersEliminated} Outs &bull; {player.successfulDefenses} Defs</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Honors & Badges */}
            <div className="bg-gradient-to-br from-navy-950 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-editorial text-lg font-bold flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Championship Honors</span>
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  Active Season
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {achievements.map((ach, aIdx) => (
                  <div key={aIdx} className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
                    <p className="text-xs font-bold text-amber-300">{ach.title}</p>
                    <p className="text-[11px] text-slate-300 mt-1 leading-snug">{ach.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Video Modal */}
      <AnimatePresence>
        {activeVideoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-editorial text-base font-bold text-navy-900 truncate">
                  {activeVideoModal.title}
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveVideoModal(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-navy-900 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="relative aspect-video bg-black w-full">
                <iframe
                  src={`${activeVideoModal.videoUrl}?autoplay=1`}
                  title={activeVideoModal.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>

              <div className="p-5">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {activeVideoModal.description}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
