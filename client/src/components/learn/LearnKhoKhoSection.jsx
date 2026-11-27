import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, CheckCircle2, Clock, BookOpen, Award, Filter, Search, X,
  Sparkles, Video, ChevronRight, Zap, Target, Shield, Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';

export default function LearnKhoKhoSection() {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('ALL'); // ALL | BEGINNER | INTERMEDIATE | ADVANCED
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [completedIds, setCompletedIds] = useState(new Set());
  const [activeVideoModal, setActiveVideoModal] = useState(null);

  const categories = [
    { id: 'ALL', label: 'All Disciplines' },
    { id: 'RULES', label: 'Rules & Fundamentals', icon: BookOpen },
    { id: 'CHASING', label: 'Chasing Techniques', icon: Zap },
    { id: 'DEFENSE', label: 'Defensive Techniques', icon: Shield },
    { id: 'POLE_DIVING', label: 'Pole Diving', icon: Target },
    { id: 'CHAIN_KHO', label: 'Chain Kho-Kho (3-to-3)', icon: Award },
    { id: 'RUNNING', label: 'Running Skills', icon: Flame },
  ];

  const levels = [
    { id: 'ALL', label: 'All Levels' },
    { id: 'BEGINNER', label: 'Beginner', color: 'bg-emerald-100 text-emerald-800' },
    { id: 'INTERMEDIATE', label: 'Intermediate', color: 'bg-amber-100 text-amber-800' },
    { id: 'ADVANCED', label: 'Advanced', color: 'bg-purple-100 text-purple-800' },
  ];

  const fetchTutorials = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedLevel !== 'ALL') params.level = selectedLevel;
      if (selectedCategory !== 'ALL') params.category = selectedCategory;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.tutorials.getAll(params);
      if (res && res.data) {
        setTutorials(res.data);
      }
    } catch (err) {
      console.error('Failed to load tutorials:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await api.tutorials.getMyProgress();
      if (res && res.data && res.data.completedIds) {
        setCompletedIds(new Set(res.data.completedIds));
      }
    } catch (err) {
      console.warn('Could not fetch tutorial progress:', err);
    }
  };

  useEffect(() => {
    fetchTutorials();
  }, [selectedLevel, selectedCategory]);

  useEffect(() => {
    fetchProgress();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTutorials();
  };

  const handleToggleComplete = async (tutorialId, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await api.tutorials.toggleProgress(tutorialId);
      if (res && res.success) {
        setCompletedIds((prev) => {
          const next = new Set(prev);
          if (res.completed) {
            next.add(tutorialId);
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.8 },
            });
          } else {
            next.delete(tutorialId);
          }
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to toggle completion:', err);
    }
  };

  const completedCount = completedIds.size;
  const totalCount = tutorials.length || 8;
  const progressPercent = totalCount > 0 ? Math.min(100, Math.round((completedCount / totalCount) * 100)) : 0;

  return (
    <section id="learn-kho-kho" className="py-20 bg-white border-b border-slate-200/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-50 border border-saffron-200 text-saffron-700 text-xs font-bold uppercase tracking-wider">
              <Video className="w-3.5 h-3.5 text-saffron-600" />
              <span>Official Video Academy</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl font-black text-navy-900 tracking-tight">
              Learn <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-600 to-amber-500">Kho-Kho</span> Skills &amp; Rules
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Step-by-step masterclasses covering rules, 3-to-3 chain running, centrifugal pole dives, sudden judgment turns, and elite match evasion tactics.
            </p>
          </div>

          {/* Progress Indicator Card */}
          <div className="bg-court-sand/70 border border-amber-200/80 rounded-2xl p-4 sm:p-5 shadow-xs min-w-[280px]">
            <div className="flex items-center justify-between text-xs font-bold text-navy-900 mb-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Tutorial Learning Progress</span>
              </span>
              <span className="text-saffron-600 font-black">{progressPercent}%</span>
            </div>
            {/* Progress bar track */}
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-saffron-500 to-amber-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
            <p className="text-[11px] font-semibold text-slate-500 mt-2">
              {completedCount} of {totalCount} tutorials completed
            </p>
          </div>
        </div>

        {/* Filters & Search Row */}
        <div className="space-y-4 mb-10">
          {/* Level Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 mr-1">Level:</span>
            {levels.map((lvl) => (
              <button
                key={lvl.id}
                type="button"
                onClick={() => setSelectedLevel(lvl.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedLevel === lvl.id
                    ? 'bg-navy-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>

          {/* Category Filter Pills & Search Input */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-saffron-50 border-saffron-400 text-saffron-800 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {cat.icon && <cat.icon className="w-3.5 h-3.5 text-saffron-600" />}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSearchSubmit} className="relative min-w-[240px]">
              <input
                type="text"
                placeholder="Search tutorials, pole dive, chain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-saffron-500/40"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>
          </div>
        </div>

        {/* Video Tutorial Cards Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-3 border-saffron-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-2 text-xs font-bold text-slate-500">Loading Kho-Kho Tutorials...</p>
          </div>
        ) : tutorials.length === 0 ? (
          <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-navy-900">No tutorial videos match your filters</p>
            <p className="text-xs text-slate-500 mt-1">Try selecting "All Levels" or clearing your search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tutorials.map((tut, idx) => {
              const isCompleted = completedIds.has(tut.id);
              return (
                <motion.div
                  key={tut.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  onClick={() => setActiveVideoModal(tut)}
                  className="group bg-white rounded-2xl border border-slate-200/90 hover:border-saffron-400 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
                >
                  {/* Thumbnail / Video Preview Area */}
                  <div className="relative aspect-video bg-slate-900 overflow-hidden">
                    <img
                      src={tut.thumbnailUrl || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80'}
                      alt={tut.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&auto=format&fit=crop&q=80';
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    {/* Play Button Icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-11 h-11 rounded-full bg-saffron-500/90 text-white flex items-center justify-center shadow-lg group-hover:scale-115 transition-transform duration-200">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>

                    {/* Duration Badge */}
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{tut.duration}</span>
                    </div>

                    {/* Level Pill */}
                    <div className="absolute top-2 left-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          tut.level === 'ADVANCED'
                            ? 'bg-purple-600 text-white'
                            : tut.level === 'INTERMEDIATE'
                            ? 'bg-amber-500 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {tut.level}
                      </span>
                    </div>

                    {/* Completion Tag */}
                    {isCompleted && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Completed</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-saffron-600 mb-1 uppercase tracking-wider">
                        <span>{tut.category?.replace('_', ' ')}</span>
                      </div>
                      <h3 className="font-editorial text-base font-bold text-navy-900 group-hover:text-saffron-600 transition-colors line-clamp-2 leading-snug">
                        {tut.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                        {tut.description}
                      </p>
                    </div>

                    {/* Skills Tag Pills */}
                    {Array.isArray(tut.skills) && tut.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {tut.skills.slice(0, 2).map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                          >
                            {skill}
                          </span>
                        ))}
                        {tut.skills.length > 2 && (
                          <span className="text-[10px] font-bold text-slate-400 self-center">
                            +{tut.skills.length - 2}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={(e) => handleToggleComplete(tut.id, e)}
                        className={`flex items-center gap-1.5 font-bold cursor-pointer transition-colors ${
                          isCompleted
                            ? 'text-emerald-600 hover:text-emerald-700'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'fill-emerald-100' : ''}`} />
                        <span className="text-[11px]">{isCompleted ? 'Marked Complete' : 'Mark Complete'}</span>
                      </button>

                      <span className="text-saffron-600 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        <span>Watch</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Video Playback Modal */}
      <AnimatePresence>
        {activeVideoModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-saffron-100 text-saffron-800">
                    {activeVideoModal.category?.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    Duration: {activeVideoModal.duration}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveVideoModal(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-navy-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Video Player Embed */}
              <div className="relative aspect-video bg-black w-full">
                <iframe
                  src={activeVideoModal.videoUrl.includes('?') ? `${activeVideoModal.videoUrl}&autoplay=1` : `${activeVideoModal.videoUrl}?autoplay=1`}
                  title={activeVideoModal.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>

              {/* Video Details */}
              <div className="p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-editorial text-xl font-bold text-navy-900">
                      {activeVideoModal.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Instructor: <strong className="text-slate-700">{activeVideoModal.author || 'Coaching Staff'}</strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleComplete(activeVideoModal.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                      completedIds.has(activeVideoModal.id)
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-saffron-600 hover:bg-saffron-500 text-white shadow-sm'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{completedIds.has(activeVideoModal.id) ? 'Completed (Tap to undo)' : 'Mark Tutorial Complete'}</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {activeVideoModal.description}
                </p>

                {/* Key Learning Skills */}
                {Array.isArray(activeVideoModal.skills) && activeVideoModal.skills.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Key Competencies Developed:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeVideoModal.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-3 py-1 rounded-lg text-xs font-semibold bg-saffron-50 text-saffron-800 border border-saffron-200"
                        >
                          ✓ {skill}
                        </span>
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
