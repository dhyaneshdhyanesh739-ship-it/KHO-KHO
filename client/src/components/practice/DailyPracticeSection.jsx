import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame, CheckCircle2, Clock, Calendar, Zap, Shield, Target,
  Award, Activity, ChevronRight, X, Sparkles, Filter, Play, Check
} from 'lucide-react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';

export default function DailyPracticeSection() {
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState('ALL'); // ALL | BEGINNER | INTERMEDIATE | ADVANCED
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [activeDrillModal, setActiveDrillModal] = useState(null);

  const trainingPlans = [
    { id: 'ALL', label: 'All Daily Drills', desc: 'Complete athletic curriculum' },
    { id: 'BEGINNER', label: 'Beginner Foundation', desc: 'Running footwork, shuttle sprints, and reaction drills' },
    { id: 'INTERMEDIATE', label: 'Intermediate Agility', desc: '3-to-3 chain sync, judgment turns, and dive basics' },
    { id: 'ADVANCED', label: 'Advanced Elite', desc: 'Ring game endurance, centrifugal dives, and match stress' },
  ];

  const categories = [
    { id: 'ALL', label: 'All Drills' },
    { id: 'RUNNING', label: 'Running Exercises', icon: Activity },
    { id: 'SPEED_AGILITY', label: 'Speed & Agility', icon: Flame },
    { id: 'DEFENSIVE', label: 'Defensive Skills', icon: Shield },
    { id: 'CHASING', label: 'Chasing Drills', icon: Zap },
    { id: 'POLE_DIVING', label: 'Pole Diving', icon: Target },
    { id: 'CHAIN_KHO', label: 'Chain Kho-Kho (3-3)', icon: Award },
    { id: 'REACTION_TIME', label: 'Reaction Reflex', icon: Sparkles },
    { id: 'TEAM_COORDINATION', label: 'Team Coordination', icon: Calendar },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedPlan !== 'ALL') params.difficulty = selectedPlan;
      if (selectedCategory !== 'ALL') params.category = selectedCategory;

      const [tasksRes, progRes] = await Promise.all([
        api.practice.getTasks(params),
        api.practice.getProgress(),
      ]);

      if (tasksRes && tasksRes.data) {
        setTasks(tasksRes.data);
      }
      if (progRes && progRes.data) {
        setProgress(progRes.data);
      }
    } catch (err) {
      console.error('Failed to load practice tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPlan, selectedCategory]);

  const handleToggleTask = async (taskId, e) => {
    if (e) e.stopPropagation();
    try {
      const res = await api.practice.toggleComplete(taskId);
      if (res && res.success) {
        if (res.completed) {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.8 },
          });
        }
        // Refresh progress
        const progRes = await api.practice.getProgress();
        if (progRes && progRes.data) {
          setProgress(progRes.data);
        }
      }
    } catch (err) {
      console.error('Failed to toggle drill completion:', err);
    }
  };

  const todayCompleted = new Set(progress?.todayCompleted || []);
  const streakDays = progress?.streakDays || 5;
  const completionRate = progress?.completionRatePct || 0;
  const skillMetrics = progress?.skillMetrics || [
    { skill: 'Speed & Agility', score: 88, fullMark: 100 },
    { skill: 'Chain Defense', score: 92, fullMark: 100 },
    { skill: 'Pole Diving', score: 84, fullMark: 100 },
    { skill: 'Chasing Tactics', score: 90, fullMark: 100 },
    { skill: 'Reaction Time', score: 86, fullMark: 100 },
    { skill: 'Team Sync', score: 94, fullMark: 100 },
  ];

  return (
    <section id="daily-practice" className="py-20 bg-court-sand/50 border-b border-slate-200/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-50 border border-saffron-200 text-saffron-700 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 text-saffron-600 fill-saffron-600" />
              <span>Daily Practice &amp; Athletic Conditioning</span>
            </div>
            <h2 className="font-editorial text-3xl sm:text-5xl font-black text-navy-900 tracking-tight">
              Daily <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron-600 to-amber-500">Kho-Kho Practice</span> &amp; Training
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Targeted daily exercises covering agility, 3-to-3 chain running, centrifugal pole dives, reaction time, and match stamina conditioning.
            </p>
          </div>

          {/* Practice Streak Card */}
          <div className="bg-white border border-amber-300 rounded-3xl p-5 shadow-sm min-w-[280px] flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-saffron-500 to-amber-400 text-white flex items-center justify-center font-black shadow-md shadow-saffron-500/30">
              <Flame className="w-8 h-8 fill-current animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-editorial text-2xl font-black text-navy-900">{streakDays} Day Streak!</span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Keep practicing daily to build muscle memory and peak agility.
              </p>
            </div>
          </div>
        </div>

        {/* Training Plan Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {trainingPlans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-navy-900 text-white border-navy-900 shadow-md scale-[1.02]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-editorial font-bold text-sm">{plan.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                </div>
                <p className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'} line-clamp-2`}>
                  {plan.desc}
                </p>
              </button>
            );
          })}
        </div>

        {/* Skill Radar & Weekly Report Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Left: Skill Improvement Radar Chart */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-editorial text-lg font-bold text-navy-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-saffron-600" />
                  <span>Skill Improvement Radar</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Real-time competencies based on completed daily practice drills</p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                Level: Elite
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillMetrics}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                  <Radar name="Athletic Score" dataKey="score" stroke="#ea580c" fill="#ea580c" fillOpacity={0.35} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right: Daily Checklist & Weekly Summary */}
          <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-editorial text-lg font-bold text-navy-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Today's Practice Checklist</span>
                </h3>
                <span className="text-xs font-bold text-saffron-600">
                  {todayCompleted.size} of {tasks.length} Done ({completionRate}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-4">
                <div
                  className="bg-gradient-to-r from-saffron-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>

              {/* Quick Daily Checklist Items */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {tasks.slice(0, 4).map((task) => {
                  const isDone = todayCompleted.has(task.id);
                  return (
                    <div
                      key={task.id}
                      onClick={(e) => handleToggleTask(task.id, e)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isDone
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                          : 'bg-slate-50 border-slate-100 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                            isDone ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'
                          }`}
                        >
                          {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <p className={`text-xs font-bold leading-tight ${isDone ? 'line-through text-slate-400' : ''}`}>
                            {task.name}
                          </p>
                          <p className="text-[10px] text-slate-400">{task.targetReps} &bull; {task.durationMinutes} mins</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">{task.difficulty}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly Progress Report Summary Row */}
            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-center">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Active Days</p>
                <p className="font-editorial text-xl font-black text-navy-900 mt-0.5">
                  {progress?.weeklyReport?.daysActiveThisWeek || 5} / 7
                </p>
              </div>
              <div className="bg-saffron-50 p-3 rounded-xl border border-saffron-100">
                <p className="text-[10px] font-bold text-saffron-600 uppercase">Total Practice</p>
                <p className="font-editorial text-xl font-black text-saffron-700 mt-0.5">
                  {progress?.totalMinutesPracticed || 140}m
                </p>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-600 uppercase">Calories Burned</p>
                <p className="font-editorial text-xl font-black text-emerald-700 mt-0.5">
                  {progress?.weeklyReport?.caloriesBurnedEst || 1650} kcal
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="flex flex-wrap items-center gap-2 mb-8 overflow-x-auto pb-1">
          {categories.map((c) => {
            const isSelected = selectedCategory === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-saffron-50 border-saffron-400 text-saffron-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {c.icon && <c.icon className="w-3.5 h-3.5 text-saffron-600" />}
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Drills Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-3 border-saffron-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-2 text-xs font-bold text-slate-500">Loading Practice Tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <Target className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-navy-900">No practice tasks found for this filter</p>
            <p className="text-xs text-slate-500 mt-1">Try switching to "All Drills" or another training plan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tasks.map((task, idx) => {
              const isCompleted = todayCompleted.has(task.id);
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  onClick={() => setActiveDrillModal(task)}
                  className={`group rounded-2xl border p-5 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer ${
                    isCompleted
                      ? 'bg-emerald-50/40 border-emerald-300'
                      : 'bg-white border-slate-200 hover:border-saffron-400'
                  }`}
                >
                  <div className="space-y-3">
                    {/* Header Badge Row */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          task.difficulty === 'ADVANCED'
                            ? 'bg-purple-100 text-purple-800'
                            : task.difficulty === 'INTERMEDIATE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {task.difficulty}
                      </span>

                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{task.durationMinutes} mins</span>
                      </div>
                    </div>

                    <h4 className="font-editorial text-base font-bold text-navy-900 group-hover:text-saffron-600 transition-colors line-clamp-2 leading-snug">
                      {task.name}
                    </h4>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>

                    {/* Drill Targets */}
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600">
                      <span>Target: {task.targetReps}</span>
                      <span className="text-saffron-600 uppercase text-[10px]">{task.intensity}</span>
                    </div>

                    {/* Skills Developed Tags */}
                    {Array.isArray(task.skillsDeveloped) && task.skillsDeveloped.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {task.skillsDeveloped.slice(0, 2).map((sk, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Toggle Completed Action */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={(e) => handleToggleTask(task.id, e)}
                      className={`flex items-center gap-1.5 font-bold cursor-pointer transition-colors ${
                        isCompleted
                          ? 'text-emerald-700'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'fill-emerald-600 text-white' : ''}`} />
                      <span className="text-[11px]">{isCompleted ? 'Done Today' : 'Mark Done'}</span>
                    </button>

                    <span className="text-saffron-600 font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      <span>View Steps</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Drill Step-by-Step Instructions Modal */}
      <AnimatePresence>
        {activeDrillModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-200"
            >
              <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-saffron-100 text-saffron-800">
                      {activeDrillModal.category?.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      Duration: {activeDrillModal.durationMinutes} mins
                    </span>
                  </div>
                  <h3 className="font-editorial text-xl font-black text-navy-900">
                    {activeDrillModal.name}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveDrillModal(null)}
                  className="p-1 rounded-xl text-slate-400 hover:text-navy-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {activeDrillModal.description}
                </p>

                {/* Reps & Rest Breakdown */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Target Sets</p>
                    <p className="font-bold text-navy-900 mt-0.5">{activeDrillModal.targetReps}</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Rest Interval</p>
                    <p className="font-bold text-navy-900 mt-0.5">{activeDrillModal.restPeriodSec || 45}s</p>
                  </div>
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Intensity</p>
                    <p className="font-bold text-saffron-600 mt-0.5 uppercase">{activeDrillModal.intensity}</p>
                  </div>
                </div>

                {/* Step-by-Step Instructions */}
                <div>
                  <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider mb-2.5">
                    Step-by-Step Execution Guide:
                  </h4>
                  <div className="space-y-2">
                    {Array.isArray(activeDrillModal.instructions) &&
                      activeDrillModal.instructions.map((inst, iIdx) => (
                        <div key={iIdx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                          <span className="w-5 h-5 rounded-full bg-saffron-100 text-saffron-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                            {iIdx + 1}
                          </span>
                          <span>{inst}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Action button in modal */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Ready to log today's practice?</span>
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleTask(activeDrillModal.id);
                      setActiveDrillModal(null);
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                      todayCompleted.has(activeDrillModal.id)
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'btn-primary shadow-sm'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{todayCompleted.has(activeDrillModal.id) ? 'Completed (Tap to undo)' : 'Mark Drill Complete'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
