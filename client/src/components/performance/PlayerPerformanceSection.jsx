import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Shield, Zap, Target, Award, Search, ChevronRight, X,
  TrendingUp, Users, Flame, Star, CheckCircle, BarChart3, Clock, Activity
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  CartesianGrid, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { api } from '../../services/api';

export default function PlayerPerformanceSection() {
  const [selectedDivision, setSelectedDivision] = useState('ALL'); // ALL | BOYS | GIRLS
  const [searchQuery, setSearchQuery] = useState('');
  const [players, setPlayers] = useState([]);
  const [teamStats, setTeamStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlayerModal, setSelectedPlayerModal] = useState(null);
  const [activeChartTab, setActiveChartTab] = useState('attack-defense'); // 'attack-defense' | 'match-trend'

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        sortBy: 'jerseyNumber',
        sortOrder: 'asc',
      };
      if (selectedDivision !== 'ALL') params.team = selectedDivision;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const [playerRes, teamRes] = await Promise.all([
        api.performance.getPlayers(params),
        api.performance.getTeams(),
      ]);

      if (playerRes && playerRes.data) {
        const sorted = [...playerRes.data].sort((a, b) => Number(a.jerseyNumber) - Number(b.jerseyNumber));
        setPlayers(sorted);
      }
      if (teamRes && teamRes.data) {
        setTeamStats(teamRes.data);
      }
    } catch (err) {
      console.error('Error fetching performance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDivision]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  // Prepare chart data for top performers (Outs vs Defenses)
  const chartData = players.slice(0, 6).map((p) => ({
    name: p.name.split(' ')[0],
    outs: p.defendersEliminated,
    defenses: p.successfulDefenses,
    rating: p.rating * 10,
  }));

  // Trend chart data (simulating championship progression)
  const matchTrendData = [
    { match: 'Match 1', boysScore: 42, girlsScore: 38, avgOuts: 14 },
    { match: 'Match 2', boysScore: 46, girlsScore: 40, avgOuts: 16 },
    { match: 'Match 3', boysScore: 39, girlsScore: 45, avgOuts: 13 },
    { match: 'Match 4', boysScore: 50, girlsScore: 42, avgOuts: 18 },
    { match: 'Match 5', boysScore: 48, girlsScore: 44, avgOuts: 17 },
  ];

  const boysOverview = teamStats?.teams?.find((t) => t.team === 'BOYS') || {
    matchesPlayed: 32,
    won: 28,
    winPercentage: 87.5,
    ranking: 1,
  };

  const girlsOverview = teamStats?.teams?.find((t) => t.team === 'GIRLS') || {
    matchesPlayed: 28,
    won: 25,
    winPercentage: 89.3,
    ranking: 1,
  };

  return (
    <section id="player-performance" className="py-20 bg-court-sand/40 border-b border-slate-200/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="space-y-3 max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-50 border border-saffron-200 text-saffron-700 text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-saffron-600" />
            <span>Athletic Analytics &amp; Records</span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-5xl font-black text-navy-900 tracking-tight">
            Player &amp; Team <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-600 to-amber-500">Performance</span>
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Verified performance metrics, defenders eliminated, successful defense minutes, dive success rates, and live team ranking statistics.
          </p>
        </div>

        {/* Team Overview Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {/* Boys Squad Stats Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-saffron-100 text-saffron-800">
                Boys Squad
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Rank #{boysOverview.ranking}</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-editorial text-3xl font-black text-navy-900">{boysOverview.winPercentage}%</span>
              <span className="text-xs font-bold text-slate-500">Win Rate</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              <strong>{boysOverview.won}</strong> wins in {boysOverview.matchesPlayed} competitive fixtures
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span>Points Scored: 1,420</span>
              <span className="text-emerald-600">Form: W W W W W</span>
            </div>
          </div>

          {/* Girls Squad Stats Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                Girls Squad
              </span>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Rank #{girlsOverview.ranking}</span>
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-editorial text-3xl font-black text-navy-900">{girlsOverview.winPercentage}%</span>
              <span className="text-xs font-bold text-slate-500">Win Rate</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              <strong>{girlsOverview.won}</strong> wins in {girlsOverview.matchesPlayed} competitive fixtures
            </p>
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span>Points Scored: 1,260</span>
              <span className="text-emerald-600">Form: W W W W W</span>
            </div>
          </div>

          {/* Total Defenders Dismissed */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-editorial text-3xl font-black text-navy-900">420+</span>
              <span className="text-xs font-bold text-slate-500">Total Outs</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Defenders eliminated across official state and national championships
            </p>
          </div>

          {/* Defensive Dream Run */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Shield className="w-5 h-5 fill-current" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-editorial text-3xl font-black text-navy-900">5m 12s</span>
              <span className="text-xs font-bold text-slate-500">Record Defense</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Unbroken single-batch defense record held by Girls Squad Batch 2
            </p>
          </div>
        </div>

        {/* Interactive Charts Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-editorial text-xl sm:text-2xl font-bold text-navy-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-saffron-600" />
                <span>Performance Visualizations &amp; Trends</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Visual analysis comparing attack impact (outs) vs defense stability (successful turns)
              </p>
            </div>

            {/* Chart Tab Toggles */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveChartTab('attack-defense')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeChartTab === 'attack-defense'
                    ? 'bg-white text-navy-900 shadow-xs'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                Attack vs Defense
              </button>
              <button
                type="button"
                onClick={() => setActiveChartTab('match-trend')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeChartTab === 'match-trend'
                    ? 'bg-white text-navy-900 shadow-xs'
                    : 'text-slate-600 hover:text-navy-900'
                }`}
              >
                Score Trendline
              </button>
            </div>
          </div>

          <div className="h-72 w-full">
            {activeChartTab === 'attack-defense' ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="outs" name="Defenders Eliminated (Outs)" fill="#ea580c" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="defenses" name="Successful Defenses" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={matchTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="boysGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="girlsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="match" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="boysScore" name="Boys Squad Points" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#boysGrad)" />
                  <Area type="monotone" dataKey="girlsScore" name="Girls Squad Points" stroke="#e11d48" strokeWidth={3} fillOpacity={1} fill="url(#girlsGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Division Selector & Player Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-1">Division:</span>
            {[
              { id: 'ALL', label: 'All Players' },
              { id: 'BOYS', label: 'Boys Squad' },
              { id: 'GIRLS', label: 'Girls Squad' },
            ].map((div) => (
              <button
                key={div.id}
                type="button"
                onClick={() => setSelectedDivision(div.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDivision === div.id
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {div.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSearchSubmit} className="relative min-w-[260px]">
            <input
              type="text"
              placeholder="Search by player name or jersey..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-saffron-500/40"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </form>
        </div>

        {/* Individual Player Cards Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-3 border-saffron-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-2 text-xs font-bold text-slate-500">Loading Athlete Performance Data...</p>
          </div>
        ) : players.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-navy-900">No athlete profiles found</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting your search query or division filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {players.map((p, idx) => (
              <motion.div
                key={p.id || p.playerId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                onClick={() => setSelectedPlayerModal(p)}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-saffron-400 p-5 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Top Header: Jersey + Verified + Team */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-navy-950 text-amber-400 font-editorial font-black text-sm flex items-center justify-center shadow-xs">
                        #{p.jerseyNumber}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          p.team === 'BOYS' ? 'bg-saffron-100 text-saffron-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {p.team}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-amber-800 text-[11px] font-bold">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{p.rating}</span>
                    </div>
                  </div>

                  {/* Player Identity */}
                  <div className="mb-4">
                    <h4 className="font-editorial text-base font-bold text-navy-900 group-hover:text-saffron-600 transition-colors">
                      {p.name}
                    </h4>
                    <p className="text-xs font-semibold text-slate-500">{p.position}</p>
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-0.5">
                      <CheckCircle className="w-3 h-3" />
                      <span>Verified Athlete</span>
                    </span>
                  </div>

                  {/* Key Performance Stats Grid */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Outs Inflicted</p>
                      <p className="text-base font-black text-saffron-600 font-editorial">{p.defendersEliminated}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Defenses</p>
                      <p className="text-base font-black text-emerald-600 font-editorial">{p.successfulDefenses}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dive Accuracy</p>
                      <p className="text-xs font-bold text-navy-900">{p.diveSuccessPct}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Turn Accuracy</p>
                      <p className="text-xs font-bold text-navy-900">{p.turnAccuracyPct}%</p>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Form Guide + CTA */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-slate-400 font-bold mr-1">Form:</span>
                    {Array.isArray(p.form) &&
                      p.form.slice(0, 5).map((f, fIdx) => (
                        <span
                          key={fIdx}
                          className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center ${
                            f === 'W' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {f}
                        </span>
                      ))}
                  </div>

                  <span className="text-saffron-600 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    <span>Full Card</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Individual Athlete Performance Modal */}
      <AnimatePresence>
        {selectedPlayerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200"
            >
              {/* Modal Header */}
              <div className="p-6 bg-gradient-to-r from-navy-950 via-slate-900 to-navy-900 text-white flex items-start justify-between relative">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950">
                      Jersey #{selectedPlayerModal.jerseyNumber}
                    </span>
                    <span className="text-xs font-bold text-slate-300">
                      {selectedPlayerModal.team} Squad
                    </span>
                  </div>
                  <h3 className="font-editorial text-2xl font-black">{selectedPlayerModal.name}</h3>
                  <p className="text-xs text-saffron-400 font-semibold">{selectedPlayerModal.position}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedPlayerModal(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body Stats */}
              <div className="p-6 space-y-6">
                {/* 4 Big Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Matches</p>
                    <p className="font-editorial text-2xl font-black text-navy-900 mt-0.5">
                      {selectedPlayerModal.matchesPlayed}
                    </p>
                  </div>
                  <div className="bg-saffron-50 p-3.5 rounded-2xl border border-saffron-100 text-center">
                    <p className="text-[10px] font-bold text-saffron-600 uppercase">Outs Inflicted</p>
                    <p className="font-editorial text-2xl font-black text-saffron-700 mt-0.5">
                      {selectedPlayerModal.defendersEliminated}
                    </p>
                  </div>
                  <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-100 text-center">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase">Defenses</p>
                    <p className="font-editorial text-2xl font-black text-emerald-700 mt-0.5">
                      {selectedPlayerModal.successfulDefenses}
                    </p>
                  </div>
                  <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-100 text-center">
                    <p className="text-[10px] font-bold text-amber-700 uppercase">Overall Rating</p>
                    <p className="font-editorial text-2xl font-black text-amber-800 mt-0.5">
                      {selectedPlayerModal.rating}
                    </p>
                  </div>
                </div>

                {/* Precision Ratios */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                    Precision Technical Ratings
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>Pole Dive Execution Accuracy</span>
                        <span>{selectedPlayerModal.diveSuccessPct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-saffron-500 h-2 rounded-full"
                          style={{ width: `${selectedPlayerModal.diveSuccessPct}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>Judgment Line Turning Accuracy</span>
                        <span>{selectedPlayerModal.turnAccuracyPct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-emerald-500 h-2 rounded-full"
                          style={{ width: `${selectedPlayerModal.turnAccuracyPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Match Performance Log */}
                {Array.isArray(selectedPlayerModal.recentMatchStats) && selectedPlayerModal.recentMatchStats.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2">
                      Recent Fixture Breakdown
                    </h4>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-100 text-slate-600 font-bold">
                          <tr>
                            <th className="p-2.5">Opponent</th>
                            <th className="p-2.5">Outs</th>
                            <th className="p-2.5">Defense Time</th>
                            <th className="p-2.5">Rating</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          {selectedPlayerModal.recentMatchStats.map((st, sIdx) => (
                            <tr key={sIdx} className="hover:bg-slate-50">
                              <td className="p-2.5 font-bold text-navy-900">{st.opponent}</td>
                              <td className="p-2.5 text-saffron-600 font-bold">{st.outs}</td>
                              <td className="p-2.5 text-emerald-600">{st.defenseMin}</td>
                              <td className="p-2.5 font-bold">★ {st.rating}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
