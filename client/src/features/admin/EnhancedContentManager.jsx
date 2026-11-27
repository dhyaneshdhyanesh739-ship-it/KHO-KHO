import React, { useState, useEffect } from 'react';
import {
  Video, Trophy, Target, Flame, Users, Plus, Edit2, Trash2,
  CheckCircle, AlertCircle, Save, X, Search, Clock, Star, Activity
} from 'lucide-react';
import { api } from '../../services/api';

export default function EnhancedContentManager({ team = 'BOYS' }) {
  const [activeTab, setActiveTab] = useState('tutorials'); // 'tutorials' | 'highlights' | 'players' | 'drills' | 'analytics'
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });

  // Data states
  const [tutorials, setTutorials] = useState([]);
  const [highlights, setHighlights] = useState([]);
  const [players, setPlayers] = useState([]);
  const [drills, setDrills] = useState([]);
  const [progressSummary, setProgressSummary] = useState(null);

  // Modal states
  const [tutorialModal, setTutorialModal] = useState({ open: false, isEdit: false, data: {} });
  const [highlightModal, setHighlightModal] = useState({ open: false, isEdit: false, data: {} });
  const [playerModal, setPlayerModal] = useState({ open: false, isEdit: false, data: {} });
  const [drillModal, setDrillModal] = useState({ open: false, isEdit: false, data: {} });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: '', id: '', name: '' });

  const notify = (message, type = 'success') => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [tutRes, hlRes, plRes, drRes, progRes] = await Promise.all([
        api.tutorials.getAll(),
        api.matchHighlights.getAll(),
        api.performance.getPlayers(),
        api.practice.getTasks(),
        api.practice.getProgress(),
      ]);

      if (tutRes && tutRes.data) setTutorials(tutRes.data);
      if (hlRes && hlRes.data) setHighlights(hlRes.data);
      if (plRes && plRes.data) setPlayers(plRes.data);
      if (drRes && drRes.data) setDrills(drRes.data);
      if (progRes && progRes.data) setProgressSummary(progRes.data);
    } catch (err) {
      console.error('Error loading content:', err);
      notify('Failed to load some management records', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers for Tutorial
  const handleSaveTutorial = async (e) => {
    e.preventDefault();
    try {
      const { id, title, description, level, category, videoUrl, thumbnailUrl, duration, skills } = tutorialModal.data;
      if (!title || !videoUrl) return notify('Title and Video URL are required', 'error');

      const payload = {
        title,
        description,
        level: level || 'BEGINNER',
        category: category || 'RULES',
        videoUrl,
        thumbnailUrl,
        duration: duration || '05:00',
        skills: typeof skills === 'string' ? skills.split(',').map((s) => s.trim()) : skills,
      };

      if (tutorialModal.isEdit && id) {
        await api.tutorials.update(id, payload);
        notify('Tutorial video updated successfully');
      } else {
        await api.tutorials.create(payload);
        notify('New tutorial video created successfully');
      }
      setTutorialModal({ open: false, isEdit: false, data: {} });
      loadData();
    } catch (err) {
      notify('Failed to save tutorial video', 'error');
    }
  };

  // Handlers for Highlight
  const handleSaveHighlight = async (e) => {
    e.preventDefault();
    try {
      const { id, title, description, tournament, team1, team2, score1, score2, division, videoUrl, mvpPlayer } = highlightModal.data;
      if (!title || !videoUrl) return notify('Title and Video URL are required', 'error');

      const payload = {
        title,
        description,
        tournament,
        team1,
        team2,
        score1: Number(score1) || 0,
        score2: Number(score2) || 0,
        division: division || 'BOYS',
        videoUrl,
        mvpPlayer,
      };

      if (highlightModal.isEdit && id) {
        await api.matchHighlights.update(id, payload);
        notify('Match highlight updated successfully');
      } else {
        await api.matchHighlights.create(payload);
        notify('New match highlight published successfully');
      }
      setHighlightModal({ open: false, isEdit: false, data: {} });
      loadData();
    } catch (err) {
      notify('Failed to save match highlight', 'error');
    }
  };

  // Handlers for Player Stats
  const handleSavePlayer = async (e) => {
    e.preventDefault();
    try {
      const { id, name, jerseyNumber, team: pTeam, position, matchesPlayed, defendersEliminated, successfulDefenses, rating, diveSuccessPct } = playerModal.data;
      if (!name || !jerseyNumber) return notify('Name and Jersey number are required', 'error');

      const payload = {
        name,
        jerseyNumber: Number(jerseyNumber),
        team: pTeam || 'BOYS',
        position: position || 'All-Rounder',
        matchesPlayed: Number(matchesPlayed) || 0,
        defendersEliminated: Number(defendersEliminated) || 0,
        successfulDefenses: Number(successfulDefenses) || 0,
        rating: Number(rating) || 8.5,
        diveSuccessPct: Number(diveSuccessPct) || 85.0,
      };

      if (playerModal.isEdit && id) {
        await api.performance.updatePlayer(id, payload);
        notify('Player statistics updated successfully');
      } else {
        await api.performance.createPlayer(payload);
        notify('New athlete performance profile created');
      }
      setPlayerModal({ open: false, isEdit: false, data: {} });
      loadData();
    } catch (err) {
      notify('Failed to save player stats', 'error');
    }
  };

  // Handlers for Drill
  const handleSaveDrill = async (e) => {
    e.preventDefault();
    try {
      const { id, name, description, category, difficulty, durationMinutes, targetReps, intensity } = drillModal.data;
      if (!name) return notify('Drill name is required', 'error');

      const payload = {
        name,
        description: description || '',
        category: category || 'SPEED_AGILITY',
        difficulty: difficulty || 'BEGINNER',
        durationMinutes: Number(durationMinutes) || 15,
        targetReps: targetReps || '3 sets x 10 reps',
        intensity: intensity || 'HIGH',
      };

      if (drillModal.isEdit && id) {
        await api.practice.updateTask(id, payload);
        notify('Practice drill updated successfully');
      } else {
        await api.practice.createTask(payload);
        notify('New practice drill added to daily schedule');
      }
      setDrillModal({ open: false, isEdit: false, data: {} });
      loadData();
    } catch (err) {
      notify('Failed to save practice drill', 'error');
    }
  };

  // Delete Executor
  const handleExecuteDelete = async () => {
    try {
      const { type, id } = deleteConfirm;
      if (type === 'tutorial') await api.tutorials.delete(id);
      else if (type === 'highlight') await api.matchHighlights.delete(id);
      else if (type === 'player') await api.performance.deletePlayer(id);
      else if (type === 'drill') await api.practice.deleteTask(id);

      notify('Record deleted successfully');
      setDeleteConfirm({ open: false, type: '', id: '', name: '' });
      loadData();
    } catch (err) {
      notify('Failed to delete record', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Tab Navigation */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-editorial text-2xl font-black text-navy-900">
            Digital Academy &amp; Practice Administration
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage tutorials, match highlights, verified player statistics, and daily practice conditioning schedules.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          {[
            { id: 'tutorials', label: 'Tutorials', icon: Video, count: tutorials.length },
            { id: 'highlights', label: 'Match Highlights', icon: Trophy, count: highlights.length },
            { id: 'players', label: 'Player Stats', icon: Users, count: players.length },
            { id: 'drills', label: 'Daily Drills', icon: Target, count: drills.length },
            { id: 'analytics', label: 'Analytics', icon: Activity },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-white text-navy-900 shadow-xs'
                    : 'text-slate-600 hover:text-navy-900 hover:bg-slate-200/50'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5 text-saffron-600" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive ? 'bg-saffron-100 text-saffron-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notification Banner */}
      {notification.message && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-2 text-xs font-bold ${
            notification.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {notification.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle className="w-4 h-4 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. TUTORIAL VIDEOS MANAGEMENT TAB */}
      {/* ======================================================== */}
      {activeTab === 'tutorials' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-editorial text-lg font-bold text-navy-900">Official Tutorial Video Library</h3>
              <p className="text-xs text-slate-500">Add, revise, or organize tutorial masterclasses</p>
            </div>
            <button
              type="button"
              onClick={() => setTutorialModal({ open: true, isEdit: false, data: {} })}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Tutorial Video</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Video Title</th>
                  <th className="p-3">Level</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {tutorials.map((tut) => (
                  <tr key={tut.id} className="hover:bg-slate-50/70">
                    <td className="p-3">
                      <p className="font-bold text-navy-900">{tut.title}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{tut.description}</p>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-700">
                        {tut.level}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-saffron-600">{tut.category}</td>
                    <td className="p-3 text-slate-500">{tut.duration}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setTutorialModal({ open: true, isEdit: true, data: tut })}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm({ open: true, type: 'tutorial', id: tut.id, name: tut.title })}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. MATCH HIGHLIGHTS MANAGEMENT TAB */}
      {/* ======================================================== */}
      {activeTab === 'highlights' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-editorial text-lg font-bold text-navy-900">Match Highlight Replays</h3>
              <p className="text-xs text-slate-500">Publish match videos, scores, and tournament highlights</p>
            </div>
            <button
              type="button"
              onClick={() => setHighlightModal({ open: true, isEdit: false, data: {} })}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Match Highlight</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Match Fixture</th>
                  <th className="p-3">Tournament</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">MVP</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {highlights.map((hl) => (
                  <tr key={hl.id} className="hover:bg-slate-50/70">
                    <td className="p-3 font-bold text-navy-900">{hl.title}</td>
                    <td className="p-3 text-slate-600">{hl.tournament}</td>
                    <td className="p-3 font-black text-saffron-600">{hl.score1} - {hl.score2}</td>
                    <td className="p-3 text-amber-700 font-bold">{hl.mvpPlayer || '—'}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setHighlightModal({ open: true, isEdit: true, data: hl })}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm({ open: true, type: 'highlight', id: hl.id, name: hl.title })}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. PLAYER STATS MANAGEMENT TAB */}
      {/* ======================================================== */}
      {activeTab === 'players' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-editorial text-lg font-bold text-navy-900">Athlete Performance Ledger</h3>
              <p className="text-xs text-slate-500">Record defenders eliminated, defense minutes, ratings, and form</p>
            </div>
            <button
              type="button"
              onClick={() => setPlayerModal({ open: true, isEdit: false, data: {} })}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Player Stats</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Player</th>
                  <th className="p-3">Team</th>
                  <th className="p-3">Position</th>
                  <th className="p-3">Outs</th>
                  <th className="p-3">Defenses</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {players.map((pl) => (
                  <tr key={pl.id} className="hover:bg-slate-50/70">
                    <td className="p-3 flex items-center gap-2">
                      <span className="font-bold text-amber-600">#{pl.jerseyNumber}</span>
                      <span className="font-bold text-navy-900">{pl.name}</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        pl.team === 'BOYS' ? 'bg-saffron-100 text-saffron-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {pl.team}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{pl.position}</td>
                    <td className="p-3 font-bold text-saffron-600">{pl.defendersEliminated}</td>
                    <td className="p-3 font-bold text-emerald-600">{pl.successfulDefenses}</td>
                    <td className="p-3 font-bold text-amber-600">★ {pl.rating}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPlayerModal({ open: true, isEdit: true, data: pl })}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm({ open: true, type: 'player', id: pl.id, name: pl.name })}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. DAILY PRACTICE DRILLS TAB */}
      {/* ======================================================== */}
      {activeTab === 'drills' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-editorial text-lg font-bold text-navy-900">Daily Practice Curriculum</h3>
              <p className="text-xs text-slate-500">Configure exercises, sets, reps, and target skill development</p>
            </div>
            <button
              type="button"
              onClick={() => setDrillModal({ open: true, isEdit: false, data: {} })}
              className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Daily Drill</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3">Drill Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Difficulty</th>
                  <th className="p-3">Duration</th>
                  <th className="p-3">Target</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {drills.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/70">
                    <td className="p-3 font-bold text-navy-900">{d.name}</td>
                    <td className="p-3 text-slate-600">{d.category?.replace('_', ' ')}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {d.difficulty}
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{d.durationMinutes} mins</td>
                    <td className="p-3 text-slate-600 font-semibold">{d.targetReps}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDrillModal({ open: true, isEdit: true, data: d })}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-navy-900 hover:bg-slate-100"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm({ open: true, type: 'drill', id: d.id, name: d.name })}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. USER PARTICIPATION & ANALYTICS TAB */}
      {/* ======================================================== */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="font-editorial text-lg font-bold text-navy-900">User Practice &amp; Learning Analytics</h3>
            <p className="text-xs text-slate-500">Monitor practice completion streaks, active learners, and engagement</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-saffron-50/60 border border-saffron-200">
              <p className="text-xs font-bold text-saffron-800">Average Active Streak</p>
              <p className="font-editorial text-3xl font-black text-saffron-700 mt-1">
                {progressSummary?.streakDays || 5} Days
              </p>
              <p className="text-[11px] text-saffron-600 mt-1">Daily athlete retention rate: 89%</p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <p className="text-xs font-bold text-emerald-800">Weekly Drills Finished</p>
              <p className="font-editorial text-3xl font-black text-emerald-700 mt-1">
                {progressSummary?.weeklyReport?.drillsFinished || 18} Drills
              </p>
              <p className="text-[11px] text-emerald-600 mt-1">Total minutes practiced: {progressSummary?.totalMinutesPracticed || 140}m</p>
            </div>

            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200">
              <p className="text-xs font-bold text-amber-800">Tutorial Completion Rate</p>
              <p className="font-editorial text-3xl font-black text-amber-700 mt-1">
                74.2%
              </p>
              <p className="text-[11px] text-amber-600 mt-1">Based on student &amp; athlete views</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT TUTORIAL */}
      {tutorialModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-editorial text-lg font-bold text-navy-900">
                {tutorialModal.isEdit ? 'Edit Tutorial Video' : 'Add Tutorial Video'}
              </h3>
              <button type="button" onClick={() => setTutorialModal({ open: false, isEdit: false, data: {} })}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSaveTutorial} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600">Video Title *</label>
                <input
                  type="text"
                  required
                  value={tutorialModal.data.title || ''}
                  onChange={(e) => setTutorialModal((p) => ({ ...p, data: { ...p.data, title: e.target.value } }))}
                  className="w-full p-2.5 rounded-xl text-xs border border-slate-200 mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600">Level</label>
                  <select
                    value={tutorialModal.data.level || 'BEGINNER'}
                    onChange={(e) => setTutorialModal((p) => ({ ...p, data: { ...p.data, level: e.target.value } }))}
                    className="w-full p-2.5 rounded-xl text-xs border border-slate-200 mt-1"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Category</label>
                  <select
                    value={tutorialModal.data.category || 'RULES'}
                    onChange={(e) => setTutorialModal((p) => ({ ...p, data: { ...p.data, category: e.target.value } }))}
                    className="w-full p-2.5 rounded-xl text-xs border border-slate-200 mt-1"
                  >
                    <option value="RULES">Rules</option>
                    <option value="CHASING">Chasing</option>
                    <option value="DEFENSE">Defense</option>
                    <option value="POLE_DIVING">Pole Diving</option>
                    <option value="CHAIN_KHO">Chain Kho</option>
                    <option value="RUNNING">Running</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Video Embed URL (YouTube/Direct) *</label>
                <input
                  type="text"
                  required
                  placeholder="https://www.youtube.com/embed/..."
                  value={tutorialModal.data.videoUrl || ''}
                  onChange={(e) => setTutorialModal((p) => ({ ...p, data: { ...p.data, videoUrl: e.target.value } }))}
                  className="w-full p-2.5 rounded-xl text-xs border border-slate-200 mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Description</label>
                <textarea
                  rows={3}
                  value={tutorialModal.data.description || ''}
                  onChange={(e) => setTutorialModal((p) => ({ ...p, data: { ...p.data, description: e.target.value } }))}
                  className="w-full p-2.5 rounded-xl text-xs border border-slate-200 mt-1"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTutorialModal({ open: false, isEdit: false, data: {} })}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-5">
                  Save Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT HIGHLIGHT */}
      {highlightModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-editorial text-lg font-bold text-navy-900">
                {highlightModal.isEdit ? 'Edit Match Highlight' : 'Add Match Highlight'}
              </h3>
              <button type="button" onClick={() => setHighlightModal({ open: false, isEdit: false, data: {} })}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSaveHighlight} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600">Match Title *</label>
                <input
                  type="text"
                  required
                  value={highlightModal.data.title || ''}
                  onChange={(e) => setHighlightModal((p) => ({ ...p, data: { ...p.data, title: e.target.value } }))}
                  className="w-full p-2.5 rounded-xl text-xs border border-slate-200 mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600">Team 1 Score</label>
                  <input
                    type="number"
                    value={highlightModal.data.score1 || ''}
                    onChange={(e) => setHighlightModal((p) => ({ ...p, data: { ...p.data, score1: e.target.value } }))}
                    className="w-full p-2.5 rounded-xl text-xs border border-slate-200 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Team 2 Score</label>
                  <input
                    type="number"
                    value={highlightModal.data.score2 || ''}
                    onChange={(e) => setHighlightModal((p) => ({ ...p, data: { ...p.data, score2: e.target.value } }))}
                    className="w-full p-2.5 rounded-xl text-xs border border-slate-200 mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Video Embed URL *</label>
                <input
                  type="text"
                  required
                  placeholder="https://www.youtube.com/embed/..."
                  value={highlightModal.data.videoUrl || ''}
                  onChange={(e) => setHighlightModal((p) => ({ ...p, data: { ...p.data, videoUrl: e.target.value } }))}
                  className="w-full p-2.5 rounded-xl text-xs border border-slate-200 mt-1"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setHighlightModal({ open: false, isEdit: false, data: {} })}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-5">
                  Save Highlight
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT PLAYER STATS */}
      {playerModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-editorial text-lg font-bold text-navy-900">
                {playerModal.isEdit ? 'Update Player Performance' : 'Add Player Performance'}
              </h3>
              <button type="button" onClick={() => setPlayerModal({ open: false, isEdit: false, data: {} })}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSavePlayer} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600">Player Name *</label>
                  <input
                    type="text"
                    required
                    value={playerModal.data.name || ''}
                    onChange={(e) => setPlayerModal((p) => ({ ...p, data: { ...p.data, name: e.target.value } }))}
                    className="w-full p-2.5 rounded-xl text-xs border border-slate-200 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Jersey Number *</label>
                  <input
                    type="number"
                    required
                    value={playerModal.data.jerseyNumber || ''}
                    onChange={(e) => setPlayerModal((p) => ({ ...p, data: { ...p.data, jerseyNumber: e.target.value } }))}
                    className="w-full p-2.5 rounded-xl text-xs border border-slate-200 mt-1"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600">Team</label>
                  <select
                    value={playerModal.data.team || 'BOYS'}
                    onChange={(e) => setPlayerModal((p) => ({ ...p, data: { ...p.data, team: e.target.value } }))}
                    className="w-full p-2.5 rounded-xl text-xs border border-slate-200 mt-1"
                  >
                    <option value="BOYS">Boys</option>
                    <option value="GIRLS">Girls</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Defenders Out</label>
                  <input
                    type="number"
                    value={playerModal.data.defendersEliminated || ''}
                    onChange={(e) => setPlayerModal((p) => ({ ...p, data: { ...p.data, defendersEliminated: e.target.value } }))}
                    className="w-full p-2.5 rounded-xl text-xs border border-slate-200 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Rating (1-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={playerModal.data.rating || ''}
                    onChange={(e) => setPlayerModal((p) => ({ ...p, data: { ...p.data, rating: e.target.value } }))}
                    className="w-full p-2.5 rounded-xl text-xs border border-slate-200 mt-1"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPlayerModal({ open: false, isEdit: false, data: {} })}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-5">
                  Save Player Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD/EDIT DRILL */}
      {drillModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-editorial text-lg font-bold text-navy-900">
                {drillModal.isEdit ? 'Edit Practice Drill' : 'Add Practice Drill'}
              </h3>
              <button type="button" onClick={() => setDrillModal({ open: false, isEdit: false, data: {} })}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSaveDrill} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600">Drill Name *</label>
                <input
                  type="text"
                  required
                  value={drillModal.data.name || ''}
                  onChange={(e) => setDrillModal((p) => ({ ...p, data: { ...p.data, name: e.target.value } }))}
                  className="w-full p-2.5 rounded-xl text-xs border border-slate-200 mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600">Category</label>
                  <select
                    value={drillModal.data.category || 'SPEED_AGILITY'}
                    onChange={(e) => setDrillModal((p) => ({ ...p, data: { ...p.data, category: e.target.value } }))}
                    className="w-full p-2.5 rounded-xl text-xs border border-slate-200 mt-1"
                  >
                    <option value="RUNNING">Running</option>
                    <option value="SPEED_AGILITY">Speed & Agility</option>
                    <option value="DEFENSIVE">Defensive</option>
                    <option value="CHASING">Chasing</option>
                    <option value="POLE_DIVING">Pole Diving</option>
                    <option value="CHAIN_KHO">Chain Kho</option>
                    <option value="REACTION_TIME">Reaction Time</option>
                    <option value="TEAM_COORDINATION">Team Coordination</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Difficulty</label>
                  <select
                    value={drillModal.data.difficulty || 'BEGINNER'}
                    onChange={(e) => setDrillModal((p) => ({ ...p, data: { ...p.data, difficulty: e.target.value } }))}
                    className="w-full p-2.5 rounded-xl text-xs border border-slate-200 mt-1"
                  >
                    <option value="BEGINNER">Beginner</option>
                    <option value="INTERMEDIATE">Intermediate</option>
                    <option value="ADVANCED">Advanced</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={drillModal.data.durationMinutes || 15}
                    onChange={(e) => setDrillModal((p) => ({ ...p, data: { ...p.data, durationMinutes: e.target.value } }))}
                    className="w-full p-2.5 rounded-xl text-xs border border-slate-200 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Target Reps</label>
                  <input
                    type="text"
                    value={drillModal.data.targetReps || '3 sets x 10 reps'}
                    onChange={(e) => setDrillModal((p) => ({ ...p, data: { ...p.data, targetReps: e.target.value } }))}
                    className="w-full p-2.5 rounded-xl text-xs border border-slate-200 mt-1"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDrillModal({ open: false, isEdit: false, data: {} })}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs py-2 px-5">
                  Save Drill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-editorial text-lg font-bold text-navy-900">Confirm Deletion</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to permanently delete <strong>{deleteConfirm.name}</strong>?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ open: false, type: '', id: '', name: '' })}
                className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
