import React, { useState, useEffect } from 'react';
import {
  Flame, Plus, Trash2, CheckCircle2, Clock, Calendar, Shield, AlertCircle,
  Sparkles, Dumbbell, Tag, ArrowRight, UserCheck, Eye, Layers
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function DailyGroundLogManager({ team: currentTeam }) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // Form State
  const [selectedTeam, setSelectedTeam] = useState('BOTH'); // 'BOYS' | 'GIRLS' | 'BOTH'
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [title, setTitle] = useState('');
  const [focusArea, setFocusArea] = useState('Sprint Speed & Pole Turning');
  const [sessionTime, setSessionTime] = useState('MORNING');
  const [intensity, setIntensity] = useState('HIGH');
  const [coachNotes, setCoachNotes] = useState('');

  // Activities list and current activity input
  const [currentActivityInput, setCurrentActivityInput] = useState('');
  const [activitiesList, setActivitiesList] = useState([
    '15-minute dynamic warm-up & 40m acceleration sprints',
    'Pole turn diving & directional shift drills (4 sets of 6)',
    'Active chaser chain evasion practice with 3 defenders',
  ]);

  // Loading & logs state
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch past ground logs
  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.groundActivities.getAdmin({
        team: isSuperAdmin ? 'ALL' : currentTeam,
      });
      if (res && res.data) {
        setActivities(res.data);
      }
    } catch (err) {
      console.error('Failed to load daily ground logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentTeam]);

  // Handler for adding an activity via Enter key or button
  const handleAddActivity = (e) => {
    if (e) e.preventDefault();
    const trimmed = currentActivityInput.trim();
    if (!trimmed) return;

    setActivitiesList((prev) => [...prev, trimmed]);
    setCurrentActivityInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddActivity();
    }
  };

  const handleRemoveActivity = (indexToRemove) => {
    setActivitiesList((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Submit new Ground Activity
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!title.trim()) {
      setErrorMessage('Please provide a session title.');
      return;
    }

    if (activitiesList.length === 0) {
      setErrorMessage('Please add at least one ground activity or drill.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        team: isSuperAdmin ? selectedTeam : (selectedTeam === 'BOTH' ? 'BOTH' : currentTeam),
        date,
        title: title.trim(),
        focusArea: focusArea.trim(),
        activities: activitiesList,
        coachNotes: coachNotes.trim(),
        sessionTime,
        intensity,
      };

      const res = await api.groundActivities.create(payload);
      if (res && res.success) {
        setSuccessMessage(
          `Daily ground update published for ${payload.team} team! It is now unlocked for all members marked PRESENT or LATE on ${date}.`
        );
        // Reset form to defaults
        setTitle('');
        setCoachNotes('');
        setActivitiesList([]);
        setCurrentActivityInput('');
        fetchLogs();
        setTimeout(() => setSuccessMessage(''), 7000);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to publish daily ground log.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this daily ground activity?')) return;
    try {
      await api.groundActivities.delete(id);
      setActivities((prev) => prev.filter((a) => a._id !== id));
      setSuccessMessage('Ground activity deleted.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete ground activity.');
    }
  };

  const focusAreaPresets = [
    'Speed & Acceleration Sprints',
    'Pole Turn Diving & Tactics',
    'Chain Defense & Evasion',
    'Active Chaser Tapping & Calling',
    '9-Lane Match Simulation',
    'Core Conditioning & Agility',
    'Recovery & Tactical Review',
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-saffron-600 to-amber-500 text-white flex items-center justify-center shadow-md">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-editorial font-black text-navy-900 tracking-tight">
                Daily Ground Training Log
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Record daily ground work, drills, and performance focus for team members
              </p>
            </div>
          </div>
        </div>

        {/* Live Attendance Visibility Rule Badge */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold shadow-xs">
          <Shield className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Automated Rule: Visible only to members marked <strong>PRESENT</strong> or <strong>LATE</strong></span>
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 shadow-sm animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5 shadow-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Ground Activity Creator Form */}
      <form onSubmit={handleSubmit} className="card-premium p-6 sm:p-8 bg-white border border-slate-200 shadow-card space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-base font-editorial font-bold text-navy-900 flex items-center gap-2">
            <Flame className="w-4 h-4 text-saffron-600" />
            <span>Post Today's Ground Work &amp; Drills</span>
          </h3>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Admin Ground Dispatch
          </span>
        </div>

        {/* Team Selection Pill (Common Dispatch for Boys, Girls, or Both) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider">
            Target Squad
          </label>
          <div className="inline-flex p-1 rounded-2xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedTeam('BOTH')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedTeam === 'BOTH'
                  ? 'bg-gradient-to-r from-saffron-600 via-purple-600 to-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>⚡ Both Squads (Boys &amp; Girls)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTeam('BOYS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedTeam === 'BOYS'
                  ? 'bg-saffron-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              <span>👦 Boys Team Only</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTeam('GIRLS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedTeam === 'GIRLS'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              <span>👧 Girls Team Only</span>
            </button>
          </div>
        </div>

        {/* Date, Session Time & Intensity Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
              Ground Session Date *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-saffron-500 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
              Session Time
            </label>
            <select
              value={sessionTime}
              onChange={(e) => setSessionTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-saffron-500 bg-white"
            >
              <option value="MORNING">🌅 Morning Ground (6:00 AM - 8:00 AM)</option>
              <option value="EVENING">🌆 Evening Ground (4:30 PM - 6:30 PM)</option>
              <option value="AFTERNOON">☀️ Afternoon Tactical Session</option>
              <option value="FULL_DAY">⚡ Full-Day Training Camp</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
              Workout Intensity
            </label>
            <select
              value={intensity}
              onChange={(e) => setIntensity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-saffron-500 bg-white"
            >
              <option value="LOW">🟢 Low (Stretching &amp; Walkthrough)</option>
              <option value="MODERATE">🟡 Moderate (Fundamental Drills)</option>
              <option value="HIGH">🟠 High (Match Speed &amp; Diving)</option>
              <option value="INTENSE">🔴 Intense (Peak Match Scrimmage)</option>
            </select>
          </div>
        </div>

        {/* Title & Focus Area */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
              Session Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Pole Turn Diving, Zigzag Chases &amp; Sprints"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-saffron-500 bg-white placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
              Tactical Focus Area
            </label>
            <input
              type="text"
              placeholder="e.g. Speed Chasing, Diving, Defense Evasion"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-saffron-500 bg-white placeholder:text-slate-400"
            />
            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {focusAreaPresets.slice(0, 4).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setFocusArea(preset)}
                  className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-[10px] font-semibold text-slate-600 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Drills & What was done in the ground (Type and Press Enter) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider">
              Ground Drills &amp; Activities Done Today *
            </label>
            <span className="text-[11px] text-saffron-700 font-semibold">
              💡 Type task &amp; press <strong>Enter</strong> to add
            </span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type drill done in ground (e.g. '10 min ladder drills, 3-lane dive practice') and press Enter..."
              value={currentActivityInput}
              onChange={(e) => setCurrentActivityInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-saffron-500 bg-white"
            />
            <button
              type="button"
              onClick={handleAddActivity}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Drill</span>
            </button>
          </div>

          {/* Drills List Preview */}
          {activitiesList.length > 0 ? (
            <div className="space-y-2 mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Added Activities ({activitiesList.length} items to be logged):
              </span>
              <ul className="space-y-2 mt-1">
                {activitiesList.map((act, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-navy-900 shadow-2xs group"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-saffron-100 text-saffron-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span className="font-medium text-slate-800">{act}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveActivity(index)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Remove drill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              No drills added yet. Type what was done on the ground above and press Enter.
            </p>
          )}
        </div>

        {/* Coach Remarks / Notes */}
        <div>
          <label className="block text-xs font-bold text-navy-900 uppercase tracking-wider mb-1.5">
            Coach Observations &amp; Ground Notes (Optional)
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Great agility shown by chasers today. High attendance during morning session. Pole diving speed improved by 20%."
            value={coachNotes}
            onChange={(e) => setCoachNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-navy-900 focus:outline-none focus:ring-2 focus:ring-saffron-500 bg-white placeholder:text-slate-400"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
          <p className="text-xs text-slate-500 font-medium">
            This activity log will automatically appear in the player dashboard of members marked <strong>PRESENT</strong> or <strong>LATE</strong> on {date}.
          </p>

          <button
            type="submit"
            disabled={submitting || activitiesList.length === 0 || !title.trim()}
            className="btn-primary py-2.5 px-6 text-xs font-bold shadow-md disabled:opacity-50"
          >
            {submitting ? 'Publishing...' : 'Publish to Team Dashboard'}
          </button>
        </div>
      </form>

      {/* History of Past Ground Activities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-editorial font-bold text-navy-900">
            Recent Ground Activity History
          </h3>
          <span className="text-xs text-slate-500 font-semibold">
            {activities.length} total logged sessions
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading ground activity history...</div>
        ) : activities.length === 0 ? (
          <div className="card-premium p-8 text-center border-dashed border-2 border-slate-200 text-slate-400">
            <Dumbbell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-navy-900">No ground activities logged yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Use the form above to record what the squad performed on the ground today.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activities.map((act) => (
              <div
                key={act._id}
                className="card-premium p-5 bg-white border border-slate-200/90 shadow-card flex flex-col justify-between space-y-4 hover:border-saffron-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          act.team === 'BOYS'
                            ? 'bg-saffron-100 text-saffron-800'
                            : act.team === 'GIRLS'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {act.team === 'BOTH' ? 'Boys & Girls' : `${act.team} Team`}
                      </span>
                      <span className="text-xs font-bold text-slate-600">
                        {act.date}
                      </span>
                    </div>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 uppercase">
                      {act.sessionTime}
                    </span>
                  </div>

                  <h4 className="font-editorial font-bold text-base text-navy-900 mb-1">
                    {act.title}
                  </h4>
                  <p className="text-xs text-saffron-700 font-semibold mb-3 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>Focus: {act.focusArea}</span>
                  </p>

                  {/* Activities summary */}
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Ground Tasks ({act.activities?.length || 0}):
                    </span>
                    <ul className="space-y-1">
                      {act.activities?.map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-slate-700">
                          <span className="text-saffron-500 font-bold shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {act.coachNotes && (
                    <p className="mt-3 text-xs text-slate-600 bg-amber-50/60 border border-amber-100 p-2.5 rounded-xl italic">
                      "{act.coachNotes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-[11px] text-slate-400">
                    Logged by {act.createdByName || 'Admin'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(act._id)}
                    className="text-rose-600 hover:text-rose-800 font-bold text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
