import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Trophy, Calendar, MapPin, Search, ChevronRight, X,
  Clock, Award, Users, Star, Flame, Sparkles, Filter
} from 'lucide-react';
import { api } from '../../services/api';

export default function MatchHighlightsSection() {
  const [highlights, setHighlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDivision, setSelectedDivision] = useState('ALL'); // ALL | BOYS | GIRLS | COMBINED
  const [selectedTournament, setSelectedTournament] = useState('ALL');
  const [playerSearch, setPlayerSearch] = useState('');
  const [activeHighlightModal, setActiveHighlightModal] = useState(null);

  const tournaments = [
    { id: 'ALL', label: 'All Tournaments' },
    { id: 'State', label: 'State Championship' },
    { id: 'National', label: 'National Trophy' },
    { id: 'Super League', label: 'Super League' },
    { id: 'Inter-Collegiate', label: 'Inter-Collegiate' },
  ];

  const fetchHighlights = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedDivision !== 'ALL') params.division = selectedDivision;
      if (selectedTournament !== 'ALL') params.tournament = selectedTournament;
      if (playerSearch.trim()) params.player = playerSearch.trim();

      const res = await api.matchHighlights.getAll(params);
      if (res && res.data) {
        setHighlights(res.data);
      }
    } catch (err) {
      console.error('Error fetching match highlights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHighlights();
  }, [selectedDivision, selectedTournament]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHighlights();
  };

  const featuredMatch = highlights[0];

  return (
    <section id="match-highlights" className="py-20 bg-white border-b border-slate-200/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="space-y-3 max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-50 border border-saffron-200 text-saffron-700 text-xs font-bold uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-saffron-600" />
            <span>Championship Video Highlights</span>
          </div>
          <h2 className="font-editorial text-3xl sm:text-5xl font-black text-navy-900 tracking-tight">
            Match <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-600 to-amber-500">Highlights</span> &amp; Game Analysis
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Relive defining championship clashes, match-winning pole dives, 5-minute defensive dream runs, and individual MVP performances.
          </p>
        </div>

        {/* Featured Showcase Match Banner */}
        {featuredMatch && (
          <div className="mb-14 rounded-3xl overflow-hidden border border-slate-200 bg-gradient-to-br from-navy-950 via-slate-900 to-navy-900 text-white shadow-xl relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
              {/* Left Video Thumbnail / Quick Play */}
              <div
                onClick={() => setActiveHighlightModal(featuredMatch)}
                className="lg:col-span-7 relative aspect-video bg-black overflow-hidden cursor-pointer group"
              >
                <img
                  src={featuredMatch.thumbnailUrl || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80'}
                  alt={featuredMatch.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Big Center Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-saffron-500 text-white flex items-center justify-center shadow-2xl group-hover:scale-115 transition-transform duration-200">
                    <Play className="w-7 h-7 fill-current ml-1" />
                  </div>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-bold">
                  <span className="px-3 py-1 rounded-full bg-saffron-600 text-white uppercase text-[10px] tracking-wider">
                    Featured Match of the Season
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-xs text-white">
                    {featuredMatch.duration}
                  </span>
                </div>
              </div>

              {/* Right Match Details & Scoreline */}
              <div className="lg:col-span-5 p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(featuredMatch.matchDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>&bull;</span>
                  <span className="text-slate-300">{featuredMatch.tournament}</span>
                </div>

                <h3 className="font-editorial text-2xl sm:text-3xl font-black text-white leading-tight">
                  {featuredMatch.title}
                </h3>

                {/* Scoreline Banner */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex items-center justify-between text-center">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-300 truncate">{featuredMatch.team1}</p>
                    <p className="font-editorial text-3xl font-black text-amber-400 mt-0.5">{featuredMatch.score1}</p>
                  </div>
                  <div className="px-3 text-xs font-black text-slate-400">VS</div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-300 truncate">{featuredMatch.team2}</p>
                    <p className="font-editorial text-3xl font-black text-white mt-0.5">{featuredMatch.score2}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs">
                    <p className="text-slate-400 uppercase text-[10px] font-bold">Player of the Match</p>
                    <p className="font-bold text-amber-400 mt-0.5 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{featuredMatch.mvpPlayer || 'Dhyanesh S.E (#1)'}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveHighlightModal(featuredMatch)}
                    className="btn-primary py-2.5 px-5 text-xs font-bold shadow-lg shadow-saffron-500/30 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Watch Highlights</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Controls Row */}
        <div className="space-y-4 mb-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-1">Division:</span>
            {[
              { id: 'ALL', label: 'All Divisions' },
              { id: 'BOYS', label: 'Boys Squad' },
              { id: 'GIRLS', label: 'Girls Squad' },
              { id: 'COMBINED', label: 'Championship' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDivision(d.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedDivision === d.id
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 mr-1">Tournament:</span>
              {tournaments.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedTournament(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    selectedTournament === t.id
                      ? 'bg-saffron-50 border-saffron-400 text-saffron-800'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearchSubmit} className="relative min-w-[260px]">
              <input
                type="text"
                placeholder="Search by player or team..."
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-saffron-500/40"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>
          </div>
        </div>

        {/* Highlights Video Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-3 border-saffron-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-2 text-xs font-bold text-slate-500">Loading Match Videos...</p>
          </div>
        ) : highlights.length === 0 ? (
          <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <Trophy className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-navy-900">No match highlights match your filter</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the tournament or player search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {highlights.map((hl, idx) => (
              <motion.div
                key={hl.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                onClick={() => setActiveHighlightModal(hl)}
                className="group bg-white rounded-2xl border border-slate-200 hover:border-saffron-400 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
              >
                {/* Thumbnail Preview Area */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <img
                    src={hl.thumbnailUrl || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80'}
                    alt={hl.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-saffron-500 text-white flex items-center justify-center shadow-lg group-hover:scale-115 transition-transform duration-200">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Division Badge */}
                  <div className="absolute top-2 left-2">
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                        hl.division === 'BOYS'
                          ? 'bg-saffron-600 text-white'
                          : hl.division === 'GIRLS'
                          ? 'bg-rose-600 text-white'
                          : 'bg-purple-600 text-white'
                      }`}
                    >
                      {hl.division}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{hl.duration}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Scoreline */}
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1.5">
                      <span className="truncate">{hl.tournament}</span>
                      <span className="text-saffron-600 font-black">{hl.score1} - {hl.score2}</span>
                    </div>

                    <h4 className="font-editorial text-lg font-bold text-navy-900 group-hover:text-saffron-600 transition-colors line-clamp-2 leading-snug">
                      {hl.title}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {hl.description}
                    </p>
                  </div>

                  {/* MVP & Key Moments */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span className="truncate max-w-[130px]">{hl.mvpPlayer || 'Featured Match'}</span>
                    </div>

                    <span className="text-saffron-600 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      <span>Watch</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Match Video Playback Modal with Moments Scrubber */}
      <AnimatePresence>
        {activeHighlightModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-saffron-100 text-saffron-800">
                    {activeHighlightModal.tournament}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Result: <strong className="text-navy-900">{activeHighlightModal.team1} {activeHighlightModal.score1} - {activeHighlightModal.score2} {activeHighlightModal.team2}</strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveHighlightModal(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-navy-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Player */}
              <div className="relative aspect-video bg-black w-full">
                <iframe
                  src={`${activeHighlightModal.videoUrl}?autoplay=1`}
                  title={activeHighlightModal.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>

              {/* Details & Key Moments */}
              <div className="p-6 space-y-4 max-h-72 overflow-y-auto">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-editorial text-xl font-bold text-navy-900">
                      {activeHighlightModal.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-saffron-600" />
                      <span>{activeHighlightModal.venue}</span>
                      <span>&bull;</span>
                      <span>MVP: <strong className="text-amber-600">{activeHighlightModal.mvpPlayer}</strong></span>
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {activeHighlightModal.description}
                </p>

                {/* Key Moments Timeline */}
                {Array.isArray(activeHighlightModal.keyMoments) && activeHighlightModal.keyMoments.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Key Match Moments &amp; Highlights:</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeHighlightModal.keyMoments.map((km, kIdx) => (
                        <div
                          key={kIdx}
                          className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                        >
                          <span className="px-2 py-0.5 rounded-md bg-saffron-100 text-saffron-800 font-mono font-bold text-[10px]">
                            {km.time}
                          </span>
                          <span className="text-slate-700 font-medium leading-tight">
                            {km.description}
                          </span>
                        </div>
                      ))}
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
